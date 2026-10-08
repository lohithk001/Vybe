from django.urls import path
from .views import (
    MusicSearchAPIView,
    SongDetailAPIView,
    SongLikeAPIView,
    ArtistDetailAPIView,
    AlbumDetailAPIView,
    MusicTrendingAPIView,
    MoodListAPIView,
    MoodSongsAPIView,
    MusicRecommendationsAPIView,
    SongSimilarAPIView,
)

app_name = 'music'

urlpatterns = [
    path('search/', MusicSearchAPIView.as_view(), name='music-search'),
    path('trending/', MusicTrendingAPIView.as_view(), name='music-trending'),
    path('recommendations/', MusicRecommendationsAPIView.as_view(), name='music-recommendations'),
    path('moods/', MoodListAPIView.as_view(), name='mood-list'),
    path('moods/<str:slug>/songs/', MoodSongsAPIView.as_view(), name='mood-songs'),
    path('songs/<str:pk>/', SongDetailAPIView.as_view(), name='song-detail'),
    path('songs/<str:pk>/similar/', SongSimilarAPIView.as_view(), name='song-similar'),
    path('songs/<str:pk>/like/', SongLikeAPIView.as_view(), name='song-like'),
    path('artists/<str:pk>/', ArtistDetailAPIView.as_view(), name='artist-detail'),
    path('albums/<str:pk>/', AlbumDetailAPIView.as_view(), name='album-detail'),
]
