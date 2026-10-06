from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status

from apps.music.models import Artist, Song
from apps.music.services.provider import MusicProviderException
from apps.music.services.ytmusic import YTMusicProvider
from apps.music.services.music_service import MusicService

MOCK_RAW_SEARCH_SONGS = [
    {
        'videoId': 'dQw4w9WgXcQ',
        'title': 'Never Gonna Give You Up',
        'artists': [{'name': 'Rick Astley', 'id': 'UCuAXFkgsw1L7xaCfnd5JJOw'}],
        'album': {'name': 'Whenever You Need Somebody', 'id': 'MPREb_album_id'},
        'duration': '3:32',
        'duration_seconds': 212,
        'thumbnails': [{'url': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'width': 480, 'height': 360}],
    }
]

MOCK_RAW_SONG_DETAILS = {
    'videoDetails': {
        'videoId': 'dQw4w9WgXcQ',
        'title': 'Never Gonna Give You Up',
        'author': 'Rick Astley',
        'channelId': 'UCuAXFkgsw1L7xaCfnd5JJOw',
        'lengthSeconds': '212',
        'thumbnail': {
            'thumbnails': [{'url': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'}]
        }
    }
}

MOCK_RAW_ARTIST_DETAILS = {
    'name': 'Rick Astley',
    'description': 'English singer and songwriter.',
    'subscribers': '3.2M',
    'thumbnails': [{'url': 'https://example.com/rick.jpg'}],
    'songs': {
        'results': MOCK_RAW_SEARCH_SONGS,
    },
    'albums': {
        'results': [
            {
                'browseId': 'MPREb_album_id',
                'title': 'Whenever You Need Somebody',
                'thumbnails': [{'url': 'https://example.com/album.jpg'}],
                'year': '1987',
            }
        ]
    }
}

MOCK_RAW_ALBUM_DETAILS = {
    'title': 'Whenever You Need Somebody',
    'artists': [{'name': 'Rick Astley', 'id': 'UCuAXFkgsw1L7xaCfnd5JJOw'}],
    'year': '1987',
    'thumbnails': [{'url': 'https://example.com/album.jpg'}],
    'tracks': MOCK_RAW_SEARCH_SONGS,
}


class MusicProviderAndServiceTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    @patch('ytmusicapi.YTMusic.search')
    def test_provider_search_normalization(self, mock_search):
        mock_search.return_value = MOCK_RAW_SEARCH_SONGS
        provider = YTMusicProvider(max_retries=1)

        results = provider.search(query='Rick Astley', filter_type='songs')
        self.assertEqual(len(results), 1)

        song = results[0]
        # Verify strict normalized schema
        self.assertEqual(song['youtube_video_id'], 'dQw4w9WgXcQ')
        self.assertEqual(song['youtubeVideoId'], 'dQw4w9WgXcQ')
        self.assertEqual(song['title'], 'Never Gonna Give You Up')
        self.assertEqual(song['artist']['name'], 'Rick Astley')
        self.assertEqual(song['album']['title'], 'Whenever You Need Somebody')
        self.assertEqual(song['duration_seconds'], 212)
        self.assertEqual(song['durationFormatted'], '3:32')
        self.assertIn('accentColor', song)
        self.assertIn('illustration', song)

    @patch('ytmusicapi.YTMusic.get_song')
    def test_provider_get_song_normalization(self, mock_get_song):
        mock_get_song.return_value = MOCK_RAW_SONG_DETAILS
        provider = YTMusicProvider(max_retries=1)

        song = provider.get_song('dQw4w9WgXcQ')
        self.assertIsNotNone(song)
        self.assertEqual(song['title'], 'Never Gonna Give You Up')
        self.assertEqual(song['artist']['name'], 'Rick Astley')
        self.assertEqual(song['duration_seconds'], 212)

    @patch('ytmusicapi.YTMusic.search')
    def test_provider_error_handling_and_no_exception_leak(self, mock_search):
        mock_search.side_effect = Exception("Upstream connection timeout")
        provider = YTMusicProvider(max_retries=1, retry_delay=0.01)

        with self.assertRaises(MusicProviderException) as ctx:
            provider.search('test')

        self.assertEqual(ctx.exception.code, "UPSTREAM_PROVIDER_ERROR")

    @patch('apps.music.services.ytmusic.YTMusicProvider.search')
    def test_music_service_redis_caching(self, mock_provider_search):
        mock_provider_search.return_value = [
            {
                'id': 'dQw4w9WgXcQ',
                'youtube_video_id': 'dQw4w9WgXcQ',
                'youtubeVideoId': 'dQw4w9WgXcQ',
                'title': 'Never Gonna Give You Up',
                'artist': {'id': 'rick', 'name': 'Rick Astley'},
                'album': None,
                'thumbnail_url': 'https://example.com/thumb.jpg',
                'duration_seconds': 212,
            }
        ]

        # First call -> hits provider
        first_call = MusicService.search('rick astley', 'songs')
        self.assertEqual(len(first_call), 1)
        self.assertEqual(mock_provider_search.call_count, 1)

        # Second call -> must return from Redis cache without calling provider again
        second_call = MusicService.search('rick astley', 'songs')
        self.assertEqual(len(second_call), 1)
        self.assertEqual(mock_provider_search.call_count, 1)

    @patch('apps.music.services.ytmusic.YTMusicProvider.search')
    def test_search_api_endpoint_success(self, mock_search):
        mock_search.return_value = [
            {
                'id': 'dQw4w9WgXcQ',
                'youtube_video_id': 'dQw4w9WgXcQ',
                'title': 'Never Gonna Give You Up',
            }
        ]

        response = self.client.get('/api/v1/music/search/?q=rick')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['query'], 'rick')
        self.assertEqual(data['data']['count'], 1)
        self.assertEqual(len(data['data']['results']), 1)

    def test_search_api_endpoint_validation_error(self):
        # Query too short (less than 2 characters)
        response = self.client.get('/api/v1/music/search/?q=a')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error']['code'], 'INVALID_QUERY')

    @patch('apps.music.services.ytmusic.YTMusicProvider.get_song')
    def test_song_detail_api_endpoint(self, mock_get_song):
        mock_get_song.return_value = {
            'id': 'dQw4w9WgXcQ',
            'youtube_video_id': 'dQw4w9WgXcQ',
            'title': 'Never Gonna Give You Up',
            'artist': {'id': 'rick', 'name': 'Rick Astley'},
            'thumbnail_url': 'https://example.com/thumb.jpg',
            'duration_seconds': 212,
        }

        response = self.client.get('/api/v1/music/songs/dQw4w9WgXcQ/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['title'], 'Never Gonna Give You Up')

    @patch('apps.music.services.ytmusic.YTMusicProvider.get_artist')
    def test_artist_detail_api_endpoint(self, mock_get_artist):
        mock_get_artist.return_value = {
            'id': 'UCuAXFkgsw1L7xaCfnd5JJOw',
            'name': 'Rick Astley',
            'bio': 'English singer.',
            'topSongs': [],
        }

        response = self.client.get('/api/v1/music/artists/UCuAXFkgsw1L7xaCfnd5JJOw/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['name'], 'Rick Astley')

    @patch('apps.music.services.ytmusic.YTMusicProvider.get_album')
    def test_album_detail_api_endpoint(self, mock_get_album):
        mock_get_album.return_value = {
            'id': 'MPREb_album_id',
            'title': 'Whenever You Need Somebody',
            'tracks': [],
        }

        response = self.client.get('/api/v1/music/albums/MPREb_album_id/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['title'], 'Whenever You Need Somebody')
