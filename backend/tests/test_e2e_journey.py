from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management import call_command
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class EndToEndListenerJourneyTests(APITestCase):
    """
    Comprehensive integration test validating the entire listener lifecycle:
    Registration -> Profile Customization -> Home Dashboard -> Mood Browsing ->
    Song Liking -> Play Recording -> Playlist Management -> Recommendations ->
    AI DJ Session -> Secure Logout.
    """

    def setUp(self):
        cache.clear()
        call_command('seed_moods')

        self.mock_tracks = [
            {
                'id': 'vid_cyber_1',
                'youtube_video_id': 'vid_cyber_1',
                'youtubeVideoId': 'vid_cyber_1',
                'title': 'Neon Velocity',
                'artist': {'id': 'art-cyber', 'name': 'Cyber Wave'},
                'album': {'id': 'alb-1', 'title': 'Grid Runner'},
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_cyber_1/hqdefault.jpg',
                'thumbnailUrl': 'https://i.ytimg.com/vi/vid_cyber_1/hqdefault.jpg',
                'duration_seconds': 210,
                'durationFormatted': '3:30',
                'accentColor': '#FFE229',
                'illustration': 'lockin',
                'isLiked': False,
            },
            {
                'id': 'vid_cyber_2',
                'youtube_video_id': 'vid_cyber_2',
                'youtubeVideoId': 'vid_cyber_2',
                'title': 'Tokyo Drift Lo-Fi',
                'artist': {'id': 'art-lofi', 'name': 'Rainy Beats'},
                'album': None,
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_cyber_2/hqdefault.jpg',
                'thumbnailUrl': 'https://i.ytimg.com/vi/vid_cyber_2/hqdefault.jpg',
                'duration_seconds': 180,
                'durationFormatted': '3:00',
                'accentColor': '#55D6BE',
                'illustration': 'chill',
                'isLiked': False,
            },
        ]

    def tearDown(self):
        cache.clear()

    @patch('apps.music.services.ytmusic.ytmusic_provider.get_related_songs')
    @patch('apps.music.services.ytmusic.ytmusic_provider.get_trending_songs')
    @patch('apps.music.services.ytmusic.ytmusic_provider.get_mood_songs')
    @patch('apps.music.services.ytmusic.ytmusic_provider.get_song')
    @patch('apps.music.services.ytmusic.ytmusic_provider.search')
    def test_complete_listener_journey(self, mock_search, mock_get_song, mock_mood_songs, mock_trending, mock_related):
        mock_trending.return_value = self.mock_tracks
        mock_mood_songs.return_value = self.mock_tracks
        mock_get_song.return_value = self.mock_tracks[0]
        mock_search.return_value = self.mock_tracks
        mock_related.return_value = self.mock_tracks

        # 1. Register Account
        reg_payload = {
            'email': 'maya@vybe.app',
            'username': 'mayavibe',
            'password': 'SecurePassword987!',
            'displayName': 'Maya Star',
            'avatarColor': '#8E7CFF',
        }
        reg_res = self.client.post('/api/v1/auth/register/', reg_payload, format='json')
        self.assertEqual(reg_res.status_code, status.HTTP_201_CREATED)
        tokens = reg_res.data['data']['tokens']
        access_token = tokens['access']
        refresh_token = tokens['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # 2. Update Profile Preferences
        prof_payload = {
            'preferredMoods': ['lockin', 'chill'],
            'favoriteGenres': ['Synth-pop', 'Cyberpunk'],
            'bio': 'Code by day, synth by night.',
        }
        patch_res = self.client.patch('/api/v1/auth/me/', prof_payload, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['data']['profile']['preferredMoods'], ['lockin', 'chill'])

        # 3. Explore Home Dashboard
        home_res = self.client.get('/api/v1/home/')
        self.assertEqual(home_res.status_code, status.HTTP_200_OK)
        self.assertIn('MAYA STAR', home_res.data['data']['greeting'])
        self.assertEqual(len(home_res.data['data']['moods']), 8)

        # 4. Browse Specific Mood Crate
        mood_res = self.client.get('/api/v1/music/moods/lockin/songs/')
        self.assertEqual(mood_res.status_code, status.HTTP_200_OK)
        self.assertEqual(mood_res.data['data']['mood']['slug'], 'lockin')

        # 5. Like a Song
        like_res = self.client.post('/api/v1/music/songs/vid_cyber_1/like/')
        self.assertEqual(like_res.status_code, status.HTTP_200_OK)
        self.assertTrue(like_res.data['data']['isLiked'])

        # 6. Verify Song in Liked Library
        liked_lib_res = self.client.get('/api/v1/me/liked-songs/')
        self.assertEqual(liked_lib_res.status_code, status.HTTP_200_OK)
        self.assertEqual(liked_lib_res.data['data']['pagination']['count'], 1)
        self.assertEqual(liked_lib_res.data['data']['results'][0]['youtube_video_id'], 'vid_cyber_1')

        # 7. Record a Completed Play Event
        play_payload = {
            'youtubeVideoId': 'vid_cyber_1',
            'durationListenedSeconds': 210,
            'completed': True,
        }
        play_res = self.client.post('/api/v1/history/', play_payload, format='json')
        self.assertEqual(play_res.status_code, status.HTTP_201_CREATED)

        # 8. Create a Playlist Crate
        pl_payload = {
            'title': 'Midnight Cyberpunk Flow',
            'description': 'Driving synthesizer rhythms',
            'accentColor': '#FFE229',
            'illustration': 'lockin',
        }
        pl_res = self.client.post('/api/v1/playlists/', pl_payload, format='json')
        self.assertEqual(pl_res.status_code, status.HTTP_201_CREATED)
        playlist_id = pl_res.data['data']['id']

        # 9. Add Song to Playlist
        add_song_res = self.client.post(
            f'/api/v1/playlists/{playlist_id}/songs/',
            {'youtubeVideoId': 'vid_cyber_1'},
            format='json'
        )
        self.assertEqual(add_song_res.status_code, status.HTTP_200_OK)
        self.assertEqual(add_song_res.data['data']['trackCount'], 1)

        # 10. Fetch Personalized Recommendations
        rec_res = self.client.get('/api/v1/music/recommendations/')
        self.assertEqual(rec_res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(rec_res.data['data']), 0)

        # 11. Request an AI DJ Session
        dj_payload = {
            'prompt': 'midnight coding session in neo tokyo with heavy synthwave',
            'limit': 5,
        }
        dj_res = self.client.post('/api/v1/ai/dj/', dj_payload, format='json')
        self.assertEqual(dj_res.status_code, status.HTTP_200_OK)
        self.assertIn('sessionTitle', dj_res.data['data'])
        self.assertIn('djCommentary', dj_res.data['data'])

        # 12. Secure Logout
        logout_res = self.client.post('/api/v1/auth/logout/', {'refresh': refresh_token}, format='json')
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

        # Attempting to reuse blacklisted refresh token returns 401
        reuse_res = self.client.post('/api/v1/auth/refresh/', {'refresh': refresh_token}, format='json')
        self.assertEqual(reuse_res.status_code, status.HTTP_401_UNAUTHORIZED)
