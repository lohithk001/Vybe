import time
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .responses import api_response, api_error

class HealthCheckView(APIView):
    """
    Health check endpoint for Render, load balancers, and monitoring.
    Verifies database and cache connectivity.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        summary="Health Check",
        description="Verify backend service, database, and cache health.",
        responses={
            200: OpenApiResponse(description="Service is healthy"),
            503: OpenApiResponse(description="Service is degraded or unhealthy"),
        }
    )
    def get(self, request):
        health_data = {
            'status': 'healthy',
            'service': 'vybe-backend',
            'version': 'v1',
            'environment': 'development' if settings.DEBUG else 'production',
            'checks': {
                'database': {'status': 'unknown'},
                'cache': {'status': 'unknown'},
            }
        }
        is_healthy = True

        # Database Check
        db_start = time.perf_counter()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
            db_latency_ms = round((time.perf_counter() - db_start) * 1000, 2)
            health_data['checks']['database'] = {
                'status': 'healthy',
                'latency_ms': db_latency_ms,
                'vendor': connection.vendor,
            }
        except Exception as e:
            is_healthy = False
            health_data['checks']['database'] = {
                'status': 'unhealthy',
                'error': str(e),
            }

        # Cache Check
        cache_start = time.perf_counter()
        try:
            cache_key = 'vybe:health:ping'
            cache.set(cache_key, 'pong', timeout=10)
            cached_val = cache.get(cache_key)
            if cached_val == 'pong':
                cache_latency_ms = round((time.perf_counter() - cache_start) * 1000, 2)
                health_data['checks']['cache'] = {
                    'status': 'healthy',
                    'latency_ms': cache_latency_ms,
                    'backend': settings.CACHES['default']['BACKEND'].split('.')[-1],
                }
            else:
                is_healthy = False
                health_data['checks']['cache'] = {
                    'status': 'degraded',
                    'error': 'Cache write succeeded but read did not match expected value.',
                }
        except Exception as e:
            # Cache failure marks degraded rather than fatal, depending on criticality
            health_data['checks']['cache'] = {
                'status': 'degraded',
                'error': str(e),
            }

        if not is_healthy:
            health_data['status'] = 'unhealthy'
            return api_error(
                code='SERVICE_UNHEALTHY',
                message='One or more core components are unhealthy',
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                details=health_data['checks']
            )

        return api_response(data=health_data, status_code=status.HTTP_200_OK)


def custom_404_view(request, exception=None):
    return api_error(
        code='NOT_FOUND',
        message='The requested endpoint or resource does not exist.',
        status_code=status.HTTP_404_NOT_FOUND,
    )


def custom_500_view(request):
    return api_error(
        code='INTERNAL_SERVER_ERROR',
        message='An unexpected internal error occurred.',
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
