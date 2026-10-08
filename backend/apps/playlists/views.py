from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiResponse

from apps.core.responses import api_response
from apps.core.pagination import StandardResultsSetPagination
from .models import Playlist
from .permissions import IsPlaylistOwnerOrReadOnly
from .serializers import (
    PlaylistSummarySerializer,
    PlaylistDetailSerializer,
    CreatePlaylistSerializer,
    AddSongToPlaylistSerializer,
    ReorderPlaylistSongsSerializer,
)
from .services.playlist_service import PlaylistService

class PlaylistListCreateAPIView(APIView):
    """List public/user playlists and create new personalized crates."""

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    @extend_schema(
        summary="List Playlists",
        description="List public curated playlists and user crates.",
        responses={200: PlaylistSummarySerializer(many=True)}
    )
    def get(self, request):
        user_only = request.query_params.get('user_only', '').lower() in ('true', '1')

        if user_only and request.user.is_authenticated:
            queryset = Playlist.objects.filter(user=request.user)
        elif request.user.is_authenticated:
            queryset = Playlist.objects.filter(Q(is_public=True) | Q(user=request.user))
        else:
            queryset = Playlist.objects.filter(is_public=True)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = PlaylistSummarySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        summary="Create Playlist",
        description="Create a new custom crate for the authenticated listener.",
        request=CreatePlaylistSerializer,
        responses={201: PlaylistSummarySerializer}
    )
    def post(self, request):
        serializer = CreatePlaylistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        playlist = PlaylistService.create_playlist(request.user, serializer.validated_data)
        return api_response(
            data=PlaylistSummarySerializer(playlist).data,
            message="Playlist created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class PlaylistDetailAPIView(APIView):
    """Retrieve, update, or delete a specific playlist."""
    permission_classes = [IsPlaylistOwnerOrReadOnly]

    def get_object(self, pk):
        playlist = get_object_or_404(Playlist, id=pk)
        self.check_object_permissions(self.request, playlist)
        return playlist

    @extend_schema(
        summary="Get Playlist Details",
        description="Retrieve playlist metadata with ordered track list.",
        responses={200: PlaylistDetailSerializer}
    )
    def get(self, request, pk):
        playlist = self.get_object(pk)
        serializer = PlaylistDetailSerializer(playlist)
        return api_response(data=serializer.data)

    @extend_schema(
        summary="Update Playlist",
        description="Update playlist title, description, accent color, or cover illustration.",
        request=CreatePlaylistSerializer,
        responses={200: PlaylistSummarySerializer}
    )
    def patch(self, request, pk):
        playlist = self.get_object(pk)
        serializer = CreatePlaylistSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = PlaylistService.update_playlist(playlist, serializer.validated_data)
        return api_response(
            data=PlaylistSummarySerializer(updated).data,
            message="Playlist updated successfully."
        )

    @extend_schema(
        summary="Delete Playlist",
        description="Delete a user-owned playlist crate.",
        responses={204: OpenApiResponse(description="Deleted")}
    )
    def delete(self, request, pk):
        playlist = self.get_object(pk)
        PlaylistService.delete_playlist(playlist)
        return api_response(message="Playlist deleted successfully.", status_code=status.HTTP_204_NO_CONTENT)


class PlaylistSongAddAPIView(APIView):
    """Add songs to a playlist."""
    permission_classes = [IsPlaylistOwnerOrReadOnly]

    def get_playlist(self, pk):
        playlist = get_object_or_404(Playlist, id=pk)
        self.check_object_permissions(self.request, playlist)
        return playlist

    @extend_schema(
        operation_id="playlist_add_song",
        summary="Add Song to Playlist",
        description="Add a track to playlist crate. Persists track if needed.",
        request=AddSongToPlaylistSerializer,
        responses={200: PlaylistDetailSerializer}
    )
    def post(self, request, pk):
        playlist = self.get_playlist(pk)
        serializer = AddSongToPlaylistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        PlaylistService.add_song(
            playlist=playlist,
            youtube_video_id=serializer.validated_data['youtube_video_id'],
        )
        return api_response(
            data=PlaylistDetailSerializer(playlist).data,
            message="Song added to playlist."
        )


class PlaylistSongRemoveAPIView(APIView):
    """Remove a song from a playlist."""
    permission_classes = [IsPlaylistOwnerOrReadOnly]

    def get_playlist(self, pk):
        playlist = get_object_or_404(Playlist, id=pk)
        self.check_object_permissions(self.request, playlist)
        return playlist

    @extend_schema(
        operation_id="playlist_remove_song",
        summary="Remove Song from Playlist",
        description="Remove a track entry from the playlist.",
        responses={200: PlaylistDetailSerializer}
    )
    def delete(self, request, pk, song_id):
        playlist = self.get_playlist(pk)
        PlaylistService.remove_song(playlist=playlist, song_id=song_id)
        return api_response(
            data=PlaylistDetailSerializer(playlist).data,
            message="Song removed from playlist."
        )


class PlaylistReorderAPIView(APIView):
    """Reorder sequence of songs inside a playlist crate."""
    permission_classes = [IsPlaylistOwnerOrReadOnly]

    @extend_schema(
        summary="Reorder Playlist Songs",
        description="Reorder songs inside playlist crate by supplying ordered array of IDs.",
        request=ReorderPlaylistSongsSerializer,
        responses={200: PlaylistDetailSerializer}
    )
    def post(self, request, pk):
        playlist = get_object_or_404(Playlist, id=pk)
        self.check_object_permissions(request, playlist)

        serializer = ReorderPlaylistSongsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reordered = PlaylistService.reorder_songs(
            playlist=playlist,
            ordered_song_ids=serializer.validated_data['song_ids'],
        )
        return api_response(
            data=PlaylistDetailSerializer(reordered).data,
            message="Playlist songs reordered successfully."
        )
