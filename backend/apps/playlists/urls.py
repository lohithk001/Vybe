from django.urls import path
from .views import (
    PlaylistListCreateAPIView,
    PlaylistDetailAPIView,
    PlaylistSongAddAPIView,
    PlaylistSongRemoveAPIView,
    PlaylistReorderAPIView,
)

app_name = 'playlists'

urlpatterns = [
    path('', PlaylistListCreateAPIView.as_view(), name='playlist-list-create'),
    path('<uuid:pk>/', PlaylistDetailAPIView.as_view(), name='playlist-detail'),
    path('<uuid:pk>/songs/', PlaylistSongAddAPIView.as_view(), name='playlist-add-song'),
    path('<uuid:pk>/songs/<str:song_id>/', PlaylistSongRemoveAPIView.as_view(), name='playlist-remove-song'),
    path('<uuid:pk>/reorder/', PlaylistReorderAPIView.as_view(), name='playlist-reorder'),
]
