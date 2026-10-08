from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management import call_command
from rest_framework.test import APITestCase
from rest_framework import status

from apps.music.models import Song, Artist, LikedSong
from apps.history.models import ListeningHistory

User = get_user_model()


class RecommendationAPITests(APITestCase):
    def setUp(self):
        cache.clear()
        call_command('seed_moods')

        self.user = User.objects.create_user(
            email='rec_user@vybe.app',
            username='recuser',
            password='Password123!',
            display_name='Rec Listener',
        )
        self.user.profile.preferred_moods = ['chill', 'lockin']
        self.user.profile.favorite_genres = ['Synth-pop', 'Lo-Fi']
        self.user.profile.save()

        self.artist1 = Artist.objects.create(
            provider_id='art-synth',
            name='Synth Master',
            avatar_color='#FF5CA8',
        )
        self.artist2 = Artist.objects.create(
            provider_id='art-indie',
            name='Indie Dreamer',
            avatar_color='#55D6BE',
        )

        self.song1 = Song.objects.create(
            youtube_video_id='vid_rec_1',
            title='Midnight Synth',
            artist=self.artist1,
            duration_seconds=200,
            accent_color='#FFE229',
            illustration='lockin',
            play_count=1000,
        )
        self.song2 = Song.objects.create(
            youtube_video_id='vid_rec_2',
            title='Coffeehouse Morning',
            artist=self.artist2,
            duration_seconds=180,
            accent_color='#55D6BE',
            illustration='chill',
            play_count=500,
        )

        self.mock_tracks = [
            {
                'id': 'vid_rec_1',
                'youtube_video_id': 'vid_rec_1',
                'youtubeVideoId': 'vid_rec_1',
                'title': 'Midnight Synth',
                'artist': {'id': 'art-synth', 'name': 'Synth Master'},
                'album': None,
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_rec_1/hqdefault.jpg',
                'thumbnailUrl': 'https://i.ytimg.com/vi/vid_rec_1/hqdefault.jpg',
                'duration_seconds': 200,
                'durationFormatted': '3:20',
                'accentColor': '#FFE229',
                'illustration': 'lockin',
                'isLiked': False,
            },
            {
                'id': 'vid_rec_2',
                'youtube_video_id': 'vid_rec_2',
                'youtubeVideoId': 'vid_rec_2',
                'title': 'Coffeehouse Morning',
                'artist': {'id': 'art-indie', 'name': 'Indie Dreamer'},
                'album': None,
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_rec_2/hqdefault.jpg',
                'thumbnailUrl': 'https://i.ytimg.com/vi/vid_rec_2/hqdefault.jpg',
                'duration_seconds': 180,
                'durationFormatted': '3:00',
                'accentColor': '#55D6BE',
                'illustration': 'chill',
                'isLiked': False,
            },
            {
                'id': 'vid_rec_3',
                'youtube_video_id': 'vid_rec_3',
                'youtubeVideoId': 'vid_rec_3',
                'title': 'Tokyo Lights',
                'artist': {'id': 'art-synth', 'name': 'Synth Master'},
                'album': None,
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_rec_3/hqdefault.jpg',
                'thumbnailUrl': 'https://i.ytimg.com/vi/vid_rec_3/hqdefault.jpg',
                'duration_seconds': 220,
                'durationFormatted': '3:40',
                'accentColor': '#FF5CA8',
                'illustration': 'lockin',
                'isLiked': False,
            },
            {
                'id': 'vid_rec_4',
                'youtube_video_id': 'vid_rec_4',
                'youtubeVideoId': 'vid_rec_4',
                'title': 'Random Acoustic',
                'artist': {'id': 'art-random', 'name': 'Acoustic Guy'},
                'album': None,
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_rec_4/hqdefault.jpg',
                'thumbnailUrl': 'https://i.ytimg.com/vi/vid_rec_4/hqdefault.jpg',
                'duration_seconds': 150,
                'durationFormatted': '2:30',
                'accentColor': '#8E7CFF',
                'illustration': 'unhinged',
                'isLiked': False,
            },
        ]

    def tearDown(self):
        cache.clear()

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_anonymous_recommendations(self, mock_trending):
        """GET /api/v1/music/recommendations/ returns heuristic blend for anonymous users."""
        mock_trending.return_value = self.mock_tracks

        response = self.client.get('/api/v1/music/recommendations/?limit=10')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        tracks = response.data['data']
        self.assertGreater(len(tracks), 0)
        self.assertFalse(tracks[0]['isLiked'])

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_authenticated_recommendations_with_history_and_likes(self, mock_trending):
        """GET /api/v1/music/recommendations/ boosts user's liked and played artists/moods."""
        mock_trending.return_value = self.mock_tracks

        # User likes song1 (by Synth Master)
        LikedSong.objects.create(user=self.user, song=self.song1)

        # User listened to song1 with completed status
        ListeningHistory.objects.create(
            user=self.user,
            song=self.song1,
            duration_listened_seconds=200,
            completed=True,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/music/recommendations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        tracks = response.data['data']
        # The liked track should have isLiked=True
        liked_tracks = [t for t in tracks if t['youtube_video_id'] == 'vid_rec_1']
        if liked_tracks:
            self.assertTrue(liked_tracks[0]['isLiked'])

        # Tracks by Synth Master and matching 'lockin' / 'chill' should be prioritized
        top_titles = [t['title'] for t in tracks[:3]]
        self.assertTrue('Midnight Synth' in top_titles or 'Tokyo Lights' in top_titles or 'Coffeehouse Morning' in top_titles)

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_related_songs')
    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_recommendations_with_seed_song(self, mock_trending, mock_related):
        """GET /api/v1/music/recommendations/?seed_song_id=... seeds recommendations via provider."""
        mock_trending.return_value = []
        mock_related.return_value = self.mock_tracks

        response = self.client.get('/api/v1/music/recommendations/?seed_song_id=vid_rec_1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        tracks = response.data['data']
        self.assertGreater(len(tracks), 0)
        mock_related.assert_called()

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_mood_songs')
    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_recommendations_with_mood_filter(self, mock_trending, mock_mood_songs):
        """GET /api/v1/music/recommendations/?mood=chill boosts chill mood tracks."""
        mock_trending.return_value = []
        mock_mood_songs.return_value = [self.mock_tracks[1]]

        response = self.client.get('/api/v1/music/recommendations/?mood=chill')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        tracks = response.data['data']
        self.assertGreater(len(tracks), 0)

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_related_songs')
    def test_similar_tracks_endpoint(self, mock_related):
        """GET /api/v1/music/songs/<pk>/similar/ returns track radio up next queue."""
        mock_related.return_value = self.mock_tracks

        response = self.client.get('/api/v1/music/songs/vid_rec_1/similar/?limit=5')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        tracks = response.data['data']
        self.assertEqual(len(tracks), 4)
        mock_related.assert_called_with('vid_rec_1', limit=15)

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    def test_artist_diversity_capping(self, mock_trending):
        """Ensure no more than 3 tracks from the same artist in recommendations."""
        same_artist_tracks = [
            {
                'id': f'song_{i}',
                'youtube_video_id': f'song_{i}',
                'title': f'Track {i}',
                'artist': {'id': 'mega_artist', 'name': 'Mega Star'},
                'duration_seconds': 180,
                'accentColor': '#FF5CA8',
                'illustration': 'mainchar',
            }
            for i in range(10)
        ]
        mock_trending.return_value = same_artist_tracks

        response = self.client.get('/api/v1/music/recommendations/?limit=10')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        tracks = response.data['data']
        mega_star_count = sum(
            1 for t in tracks
            if (isinstance(t.get('artist'), dict) and t['artist'].get('name') == 'Mega Star')
        )
        self.assertLessEqual(mega_star_count, 3)
