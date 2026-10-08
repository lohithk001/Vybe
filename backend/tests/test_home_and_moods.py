import uuid
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management import call_command
from rest_framework.test import APITestCase
from rest_framework import status

from apps.music.models import Mood, Song, Artist, LikedSong
from apps.playlists.models import Playlist
from apps.history.models import ListeningHistory

User = get_user_model()


class HomeAndMoodsAPITests(APITestCase):
    def setUp(self):
        cache.clear()
        call_command('seed_moods')

        self.user = User.objects.create_user(
            email='alice@vybe.app',
            username='alice',
            password='StrongPassword123!',
            display_name='Alice Wonderland',
            avatar_color='#FF5CA8',
        )

        self.artist = Artist.objects.create(
            provider_id='art-test-1',
            name='Test Wave',
            avatar_color='#FF5CA8',
        )

        self.sample_song = Song.objects.create(
            youtube_video_id='vid_sample_123',
            title='Midnight City',
            artist=self.artist,
            duration_seconds=243,
            accent_color='#55D6BE',
            illustration='chill',
            play_count=5000,
        )

        self.mock_tracks = [
            {
                'id': 'mock_vid_1',
                'youtube_video_id': 'mock_vid_1',
                'youtubeVideoId': 'mock_vid_1',
                'title': 'Neon Nights',
                'artist': {'id': 'art-1', 'name': 'Synth Master'},
                'album': {'id': 'alb-1', 'title': 'Retrograde'},
                'thumbnail_url': 'https://i.ytimg.com/vi/mock_vid_1/hqdefault.jpg',
                'thumbnailUrl': 'https://i.ytimg.com/vi/mock_vid_1/hqdefault.jpg',
                'duration_seconds': 180,
                'durationFormatted': '3:00',
                'accentColor': '#FFE229',
                'illustration': 'lockin',
                'isLiked': False,
            },
            {
                'id': 'vid_sample_123',
                'youtube_video_id': 'vid_sample_123',
                'youtubeVideoId': 'vid_sample_123',
                'title': 'Midnight City',
                'artist': {'id': 'art-test-1', 'name': 'Test Wave'},
                'album': None,
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_sample_123/hqdefault.jpg',
                'thumbnailUrl': 'https://i.ytimg.com/vi/vid_sample_123/hqdefault.jpg',
                'duration_seconds': 243,
                'durationFormatted': '4:03',
                'accentColor': '#55D6BE',
                'illustration': 'chill',
                'isLiked': False,
            },
        ]

    def tearcache(self):
        cache.clear()

    # ==================== MOODS TESTS ====================

    def test_get_moods_list_success(self):
        """GET /api/v1/music/moods/ returns seeded Gen-Z mood crates."""
        response = self.client.get('/api/v1/music/moods/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        moods = response.data['data']
        self.assertGreaterEqual(len(moods), 8)

        slugs = [m['slug'] for m in moods]
        self.assertIn('chill', slugs)
        self.assertIn('lockin', slugs)
        self.assertIn('mainchar', slugs)
        self.assertIn('unhinged', slugs)

        first = moods[0]
        self.assertIn('title', first)
        self.assertIn('accentColor', first)
        self.assertIn('bgClass', first)
        self.assertIn('illustration', first)

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_mood_songs')
    def test_get_mood_songs_valid_slug(self, mock_get_mood_songs):
        """GET /api/v1/music/moods/{slug}/songs/ returns mood detail and tracks."""
        mock_get_mood_songs.return_value = self.mock_tracks

        response = self.client.get('/api/v1/music/moods/chill/songs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        data = response.data['data']
        self.assertEqual(data['mood']['slug'], 'chill')
        self.assertEqual(len(data['tracks']), 2)
        self.assertEqual(data['tracks'][0]['title'], 'Neon Nights')

    def test_get_mood_songs_invalid_slug_returns_404(self):
        """GET /api/v1/music/moods/{invalid_slug}/songs/ returns 404."""
        response = self.client.get('/api/v1/music/moods/non-existent-mood/songs/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'MOOD_NOT_FOUND')

    # ==================== TRENDING TESTS ====================

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_get_trending_songs_anonymous(self, mock_trending):
        """GET /api/v1/music/trending/ returns top trending songs."""
        mock_trending.return_value = self.mock_tracks

        response = self.client.get('/api/v1/music/trending/?limit=10')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        tracks = response.data['data']
        self.assertEqual(len(tracks), 2)
        self.assertFalse(tracks[0]['isLiked'])

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_get_trending_songs_authenticated_with_liked_flag(self, mock_trending):
        """GET /api/v1/music/trending/ correctly flags tracks liked by current user."""
        mock_trending.return_value = self.mock_tracks
        # Alice likes the sample song
        LikedSong.objects.create(user=self.user, song=self.sample_song)

        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/music/trending/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        tracks = response.data['data']
        track_map = {t['youtube_video_id']: t['isLiked'] for t in tracks}
        self.assertFalse(track_map['mock_vid_1'])
        self.assertTrue(track_map['vid_sample_123'])

    # ==================== HOME API TESTS ====================

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_get_home_anonymous(self, mock_trending):
        """GET /api/v1/home/ returns composed public dashboard for unauthenticated listeners."""
        mock_trending.return_value = self.mock_tracks

        response = self.client.get('/api/v1/home/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        data = response.data['data']
        self.assertIn('greeting', data)
        self.assertIsNone(data['user'])
        self.assertIn('banner', data)
        self.assertIn('title', data['banner'])
        self.assertIn('trending', data)
        self.assertIn('moods', data)
        self.assertEqual(data['recentlyPlayed'], [])
        self.assertIn('quickPicks', data)
        self.assertIn('playlists', data)

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_get_home_authenticated(self, mock_trending):
        """GET /api/v1/home/ returns personalized dashboard with user history & greeting."""
        mock_trending.return_value = self.mock_tracks

        # Record a play for Alice
        ListeningHistory.objects.create(
            user=self.user,
            song=self.sample_song,
            duration_listened_seconds=200,
            completed=True,
        )

        # Create a playlist for Alice
        playlist = Playlist.objects.create(
            title='Late Night Drive',
            user=self.user,
            accent_color='#55D6BE',
            illustration='chill',
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/home/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        data = response.data['data']
        self.assertIn('ALICE', data['greeting'])
        self.assertIsNotNone(data['user'])
        self.assertEqual(data['user']['username'], 'alice')
        self.assertEqual(data['user']['displayName'], 'Alice Wonderland')

        # Recently played should contain Midnight City
        self.assertEqual(len(data['recentlyPlayed']), 1)
        self.assertEqual(data['recentlyPlayed'][0]['title'], 'Midnight City')

        # Playlists should contain Late Night Drive
        self.assertEqual(len(data['playlists']), 1)
        self.assertEqual(data['playlists'][0]['title'], 'Late Night Drive')
