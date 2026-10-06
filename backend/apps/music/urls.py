from django.urls import path
from .views import (
    MusicSearchAPIView,
    SongDetailAPIView,
    ArtistDetailAPIView,
    AlbumDetailAPIView,
)

app_name = 'music'

urlpatterns = [
    path('search/', MusicSearchAPIView.as_view(), name='music-search'),
    path('songs/<str:pk>/', SongDetailAPIView.as_view(), name='song-detail'),
    path('artists/<str:pk>/', ArtistDetailAPIView.as_view(), name='artist-detail'),
    path('albums/<str:pk>/', AlbumDetailAPIView.as_view(), name='album-detail'),
]
