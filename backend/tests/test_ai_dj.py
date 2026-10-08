import json
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class AIDJAPITests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            email='dj_listener@vybe.app',
            username='djlistener',
            password='Password123!',
        )
        self.mock_tracks = [
            {
                'id': 'vid_dj_1',
                'youtube_video_id': 'vid_dj_1',
                'title': 'Neon Pulse',
                'artist': {'id': 'art-1', 'name': 'Cyber Wave'},
                'album': None,
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_dj_1/hqdefault.jpg',
                'duration_seconds': 210,
                'durationFormatted': '3:30',
                'accentColor': '#FFE229',
                'illustration': 'lockin',
                'isLiked': False,
            },
            {
                'id': 'vid_dj_2',
                'youtube_video_id': 'vid_dj_2',
                'title': 'Overclocked',
                'artist': {'id': 'art-2', 'name': 'Synth Grid'},
                'album': None,
                'thumbnail_url': 'https://i.ytimg.com/vi/vid_dj_2/hqdefault.jpg',
                'duration_seconds': 195,
                'durationFormatted': '3:15',
                'accentColor': '#FFE229',
                'illustration': 'lockin',
                'isLiked': False,
            },
        ]

    def tearDown(self):
        cache.clear()

    @patch('apps.music.services.ytmusic.ytmusic_provider.search')
    def test_generate_dj_session_heuristic(self, mock_search):
        """POST /api/v1/ai/dj/ generates full session via heuristic engine when no Gemini key is set."""
        mock_search.return_value = self.mock_tracks

        payload = {
            'prompt': 'late night coding session in tokyo with deep focus',
            'limit': 5,
        }
        response = self.client.post('/api/v1/ai/dj/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        data = response.data['data']
        self.assertIn('sessionTitle', data)
        self.assertIn('djCommentary', data)
        self.assertEqual(data['detectedMood'], 'lockin')
        self.assertEqual(data['accentColor'], '#FFE229')
        self.assertEqual(data['illustration'], 'lockin')
        self.assertGreater(len(data['tracks']), 0)

    @patch('apps.music.services.ytmusic.ytmusic_provider.search')
    def test_generate_dj_session_with_mood_override(self, mock_search):
        """POST /api/v1/ai/dj/ respects explicit mood override."""
        mock_search.return_value = self.mock_tracks

        payload = {
            'prompt': 'give me songs for my morning routine',
            'mood': 'chill',
            'limit': 5,
        }
        response = self.client.post('/api/v1/ai/dj/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data['data']
        self.assertEqual(data['detectedMood'], 'chill')
        self.assertEqual(data['accentColor'], '#55D6BE')
        self.assertEqual(data['illustration'], 'chill')

    @patch('google.genai.Client')
    @patch('apps.music.services.ytmusic.ytmusic_provider.search')
    def test_generate_dj_session_gemini_mocked(self, mock_search, mock_genai_client):
        """POST /api/v1/ai/dj/ correctly parses structured output from Gemini model."""
        mock_search.return_value = self.mock_tracks

        # Setup mock Gemini response
        mock_instance = MagicMock()
        mock_genai_client.return_value = mock_instance
        gemini_response = MagicMock()
        gemini_response.text = json.dumps({
            'sessionTitle': 'EUPHORIC RUNWAY',
            'djCommentary': 'Main character vibes only. Strut down the sidewalk like the cameras are rolling.',
            'detectedMood': 'mainchar',
            'accentColor': '#FF5CA8',
            'illustration': 'mainchar',
            'searchQueries': ['runway hyperpop', 'confident dance pop'],
            'suggestedArtists': ['Charli XCX', 'Dua Lipa'],
        })
        mock_instance.models.generate_content.return_value = gemini_response

        with self.settings(GEMINI_API_KEY='fake-test-key-12345'):
            payload = {
                'prompt': 'walking to class feeling like the main character',
                'limit': 5,
            }
            response = self.client.post('/api/v1/ai/dj/', payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.data['success'])

            data = response.data['data']
            self.assertEqual(data['sessionTitle'], 'EUPHORIC RUNWAY')
            self.assertIn('Main character vibes only', data['djCommentary'])
            self.assertEqual(data['detectedMood'], 'mainchar')
            self.assertEqual(data['accentColor'], '#FF5CA8')
            self.assertEqual(data['illustration'], 'mainchar')
            self.assertEqual(data['suggestedArtists'], ['Charli XCX', 'Dua Lipa'])

    def test_generate_dj_session_validation_error(self):
        """POST /api/v1/ai/dj/ returns 400 when prompt is empty or too short."""
        response = self.client.post('/api/v1/ai/dj/', {'prompt': 'x'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
