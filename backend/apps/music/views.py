from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from apps.core.responses import api_response, api_error
from .services.provider import MusicProviderException
from .services.music_service import MusicService

class MusicSearchAPIView(APIView):
    """
    Search tracks, artists, or albums via upstream provider with Redis caching.
    Playback is client-side only via YouTube iframe player.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'search'

    @extend_schema(
        summary="Search Music",
        description="Search for songs, artists, or albums. Results are cached in Redis.",
        parameters=[
            OpenApiParameter(
                name='q',
                description='Search query term',
                required=True,
                type=str,
            ),
            OpenApiParameter(
                name='filter',
                description='Filter results by type',
                required=False,
                type=str,
                enum=['songs', 'artists', 'albums'],
                default='songs',
            ),
        ],
        responses={
            200: OpenApiResponse(description="Search results retrieved"),
            400: OpenApiResponse(description="Query term missing or too short"),
        }
    )
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        filter_type = request.query_params.get('filter', 'songs').strip().lower()

        if len(query) < 2:
            return api_error(
                code="INVALID_QUERY",
                message="Search query parameter 'q' must be at least 2 characters.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            results = MusicService.search(query=query, filter_type=filter_type)
            return api_response(data={
                'query': query,
                'filter': filter_type,
                'count': len(results),
                'results': results,
            })
        except MusicProviderException as e:
            return api_error(
                code=e.code,
                message=e.message,
                status_code=status.HTTP_502_BAD_GATEWAY,
            )


class SongDetailAPIView(APIView):
    """
    Retrieve song metadata by YouTube video ID.
    Looks up local database first, falls back to Redis cache and upstream provider.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Get Song Details",
        description="Retrieve normalized metadata for a song by YouTube video ID.",
        responses={
            200: OpenApiResponse(description="Song metadata found"),
            404: OpenApiResponse(description="Song not found"),
        }
    )
    def get(self, request, pk):
        try:
            song_data = MusicService.get_song(video_id=pk)
            return api_response(data=song_data)
        except MusicProviderException as e:
            status_code = status.HTTP_404_NOT_FOUND if e.code == "TRACK_NOT_FOUND" else status.HTTP_502_BAD_GATEWAY
            return api_error(
                code=e.code,
                message=e.message,
                status_code=status_code,
            )


class ArtistDetailAPIView(APIView):
    """
    Retrieve artist profile, bio, and top tracks by provider ID.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Get Artist Profile",
        description="Retrieve artist profile, bio, top tracks, and albums by provider ID.",
        responses={
            200: OpenApiResponse(description="Artist details found"),
            404: OpenApiResponse(description="Artist not found"),
        }
    )
    def get(self, request, pk):
        try:
            artist_data = MusicService.get_artist(artist_id=pk)
            return api_response(data=artist_data)
        except MusicProviderException as e:
            status_code = status.HTTP_404_NOT_FOUND if e.code == "ARTIST_NOT_FOUND" else status.HTTP_502_BAD_GATEWAY
            return api_error(
                code=e.code,
                message=e.message,
                status_code=status_code,
            )


class AlbumDetailAPIView(APIView):
    """
    Retrieve album metadata and track list by provider ID.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Get Album Details",
        description="Retrieve album metadata and track list by provider ID.",
        responses={
            200: OpenApiResponse(description="Album details found"),
            404: OpenApiResponse(description="Album not found"),
        }
    )
    def get(self, request, pk):
        try:
            album_data = MusicService.get_album(album_id=pk)
            return api_response(data=album_data)
        except MusicProviderException as e:
            status_code = status.HTTP_404_NOT_FOUND if e.code == "ALBUM_NOT_FOUND" else status.HTTP_502_BAD_GATEWAY
            return api_error(
                code=e.code,
                message=e.message,
                status_code=status_code,
            )
