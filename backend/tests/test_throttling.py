from django.core.cache import cache
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.test import APITestCase
from rest_framework import status


class ThrottlingTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.original_rates = dict(ScopedRateThrottle.THROTTLE_RATES)

    def tearDown(self):
        cache.clear()
        ScopedRateThrottle.THROTTLE_RATES = self.original_rates

    def test_auth_throttling_exceeded(self):
        """Verify 429 Too Many Requests is returned when auth rate limit is exceeded."""
        ScopedRateThrottle.THROTTLE_RATES['auth'] = '3/minute'
        url = '/api/v1/auth/login/'
        payload = {'email': 'unknown@vybe.app', 'password': 'wrongpassword'}

        # First 3 requests permitted
        for _ in range(3):
            response = self.client.post(url, payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 4th request must be throttled with HTTP 429
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'RATE_LIMIT_EXCEEDED')

    def test_search_throttling_exceeded(self):
        """Verify 429 Too Many Requests is returned when search rate limit is exceeded."""
        ScopedRateThrottle.THROTTLE_RATES['search'] = '2/minute'
        url = '/api/v1/music/search/?q=synth'

        # First 2 requests within limit
        self.client.get(url)
        self.client.get(url)

        # 3rd request throttled with HTTP 429
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data['error']['code'], 'RATE_LIMIT_EXCEEDED')
