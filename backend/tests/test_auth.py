from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User, Profile

class AuthEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.refresh_url = '/api/v1/auth/refresh/'
        self.logout_url = '/api/v1/auth/logout/'
        self.me_url = '/api/v1/auth/me/'

        self.user_data = {
            'email': 'listener@vybe.fm',
            'username': 'vyber_one',
            'password': 'SecureVybePassword123!',
            'displayName': 'Vybe Pioneer',
            'avatarColor': '#FF5CA8',
        }

    def test_register_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('data', data)
        self.assertIn('user', data['data'])
        self.assertIn('tokens', data['data'])

        user_info = data['data']['user']
        self.assertEqual(user_info['email'], 'listener@vybe.fm')
        self.assertEqual(user_info['username'], 'vyber_one')
        self.assertEqual(user_info['displayName'], 'Vybe Pioneer')
        self.assertIn('profile', user_info)

        tokens = data['data']['tokens']
        self.assertIn('accessToken', tokens)
        self.assertIn('refreshToken', tokens)
        self.assertEqual(tokens['tokenType'], 'Bearer')

        # Check DB persistence
        self.assertTrue(User.objects.filter(email='listener@vybe.fm').exists())
        user = User.objects.get(email='listener@vybe.fm')
        self.assertTrue(Profile.objects.filter(user=user).exists())

    def test_register_duplicate_email(self):
        self.client.post(self.register_url, self.user_data, format='json')

        # Duplicate email registration
        duplicate_data = {**self.user_data, 'username': 'different_user'}
        response = self.client.post(self.register_url, duplicate_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error']['code'], 'VALIDATION_ERROR')

    def test_login_success(self):
        # Register first
        self.client.post(self.register_url, self.user_data, format='json')

        login_payload = {
            'email': self.user_data['email'],
            'password': self.user_data['password'],
        }
        response = self.client.post(self.login_url, login_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('tokens', data['data'])
        self.assertEqual(data['data']['user']['email'], self.user_data['email'])

    def test_login_invalid_password(self):
        self.client.post(self.register_url, self.user_data, format='json')

        login_payload = {
            'email': self.user_data['email'],
            'password': 'WrongPassword123!',
        }
        response = self.client.post(self.login_url, login_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error']['code'], 'AUTHENTICATION_FAILED')

    def test_refresh_token(self):
        reg_response = self.client.post(self.register_url, self.user_data, format='json')
        refresh_token = reg_response.json()['data']['tokens']['refreshToken']

        response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_token},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('accessToken', data['data'])

    def test_profile_unauthenticated(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error']['code'], 'AUTHENTICATION_REQUIRED')

    def test_profile_authenticated_get_and_patch(self):
        reg_response = self.client.post(self.register_url, self.user_data, format='json')
        access_token = reg_response.json()['data']['tokens']['accessToken']

        # GET Profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['email'], self.user_data['email'])

        # PATCH Profile
        patch_payload = {
            'displayName': 'Cyber Vybe Master',
            'bio': 'Obsessed with deep focus synthwave and 140 BPM.',
            'preferredMoods': ['lockin', 'unhinged'],
            'favoriteGenres': ['Synthwave', 'Hyperpop'],
        }
        patch_response = self.client.patch(self.me_url, patch_payload, format='json')

        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        patch_data = patch_response.json()['data']
        self.assertEqual(patch_data['displayName'], 'Cyber Vybe Master')
        self.assertEqual(patch_data['bio'], 'Obsessed with deep focus synthwave and 140 BPM.')
        self.assertEqual(patch_data['profile']['preferredMoods'], ['lockin', 'unhinged'])
        self.assertEqual(patch_data['profile']['favoriteGenres'], ['Synthwave', 'Hyperpop'])

    def test_logout_and_token_revocation(self):
        reg_response = self.client.post(self.register_url, self.user_data, format='json')
        tokens = reg_response.json()['data']['tokens']
        access_token = tokens['accessToken']
        refresh_token = tokens['refreshToken']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_response = self.client.post(
            self.logout_url,
            {'refresh': refresh_token},
            format='json',
        )
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        # Attempt to use blacklisted refresh token
        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_token},
            format='json',
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
