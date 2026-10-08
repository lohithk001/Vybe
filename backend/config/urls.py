from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from apps.music.views import UserLikedSongsAPIView, HomeAPIView

urlpatterns = [
    path('', RedirectView.as_view(url='/api/v1/docs/', permanent=False), name='api-root-docs'),
    path('admin/', admin.site.urls),
    
    # API v1 endpoints
    path('api/v1/', include([
        path('', include('apps.core.urls')),
        path('home/', HomeAPIView.as_view(), name='home'),
        path('auth/', include('apps.users.urls')),
        path('music/', include('apps.music.urls')),
        path('playlists/', include('apps.playlists.urls')),
        path('history/', include('apps.history.urls')),
        path('ai/', include('apps.ai.urls')),
        path('me/liked-songs/', UserLikedSongsAPIView.as_view(), name='me-liked-songs'),
        
        # OpenAPI Schema & Interactive Docs
        path('schema/', SpectacularAPIView.as_view(), name='schema'),
        path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ])),
]

handler404 = 'apps.core.views.custom_404_view'
handler500 = 'apps.core.views.custom_500_view'
