from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

class HealthCheckEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_returns_200_and_envelope(self):
        url = '/api/v1/health/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        # Check standard envelope structure
        self.assertIn('success', data)
        self.assertTrue(data['success'])
        self.assertIn('data', data)

        payload = data['data']
        self.assertEqual(payload['status'], 'healthy')
        self.assertEqual(payload['service'], 'vybe-backend')
        self.assertEqual(payload['version'], 'v1')

        # Check internal health checks
        self.assertIn('checks', payload)
        self.assertEqual(payload['checks']['database']['status'], 'healthy')
        self.assertIn(payload['checks']['cache']['status'], ['healthy', 'degraded'])

    def test_openapi_schema_endpoint(self):
        url = '/api/v1/schema/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_docs_endpoint(self):
        url = '/api/v1/docs/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
