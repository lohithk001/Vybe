from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from apps.core.responses import api_response, api_error
from .models import Mood
from .serializers import (
    SongSerializer,
    MoodSerializer,
    MoodDetailResponseSerializer,
    HomeFeedResponseSerializer,
)
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


class SongLikeAPIView(APIView):
    """Like or unlike a song. Persists the song to Postgres on like."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="music_like_song",
        summary="Like Song",
        description="Like a song by YouTube video ID or database UUID.",
        request=None,
        responses={200: OpenApiResponse(description="Song liked")}
    )
    def post(self, request, pk):
        from apps.music.services.persistence import SongPersistenceService
        from apps.music.models import LikedSong

        song = SongPersistenceService.get_or_create_song_by_video_id(pk)
        liked_entry, created = LikedSong.objects.get_or_create(user=request.user, song=song)

        return api_response(
            data={
                'songId': str(song.id),
                'youtubeVideoId': song.youtube_video_id,
                'isLiked': True,
            },
            message="Song added to liked songs."
        )

    @extend_schema(
        operation_id="music_unlike_song",
        summary="Unlike Song",
        description="Remove song from listener's liked songs.",
        request=None,
        responses={200: OpenApiResponse(description="Song unliked")}
    )
    def delete(self, request, pk):
        import uuid
        from apps.music.models import Song, LikedSong

        song = None
        try:
            val = uuid.UUID(str(pk))
            song = Song.objects.filter(id=val).first()
        except (ValueError, AttributeError):
            pass

        if not song:
            song = Song.objects.filter(youtube_video_id=pk).first()

        if song:
            LikedSong.objects.filter(user=request.user, song=song).delete()

        return api_response(
            data={'isLiked': False},
            message="Song removed from liked songs."
        )


class UserLikedSongsAPIView(APIView):
    """Retrieve paginated collection of liked songs for current user."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get Liked Songs",
        description="Retrieve paginated list of songs saved to listener library.",
        responses={200: OpenApiResponse(description="Liked songs list")}
    )
    def get(self, request):
        from apps.music.models import LikedSong
        from apps.music.serializers import SongSerializer
        from apps.core.pagination import StandardResultsSetPagination

        queryset = LikedSong.objects.filter(user=request.user).select_related(
            'song', 'song__artist', 'song__album'
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        songs = [entry.song for entry in page]
        serializer = SongSerializer(songs, many=True)
        return paginator.get_paginated_response(serializer.data)


class MusicTrendingAPIView(APIView):
    """Retrieve top trending songs across global and genre charts."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'trending'

    @extend_schema(
        operation_id="music_trending_list",
        summary="Get Trending Tracks",
        description="Retrieve curated and top trending tracks with Redis caching.",
        parameters=[
            OpenApiParameter(
                name='limit',
                description='Maximum number of tracks to return (default: 20)',
                required=False,
                type=int,
                default=20,
            ),
        ],
        responses={200: SongSerializer(many=True)}
    )
    def get(self, request):
        limit = int(request.query_params.get('limit', 20))
        limit = max(1, min(limit, 50))
        tracks = MusicService.get_trending_songs(user=request.user, limit=limit)
        return api_response(data=tracks)


class MoodListAPIView(APIView):
    """Retrieve list of all Gen-Z moods and emotional vibes."""
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="music_moods_list",
        summary="Get Moods",
        description="Retrieve all available Gen-Z mood categories with illustrations and accent colors.",
        responses={200: MoodSerializer(many=True)}
    )
    def get(self, request):
        moods = MusicService.get_moods()
        return api_response(data=moods)


class MoodSongsAPIView(APIView):
    """Retrieve curated tracks for a specific mood crate."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'search'

    @extend_schema(
        operation_id="music_mood_songs",
        summary="Get Mood Tracks",
        description="Retrieve curated tracks belonging to a specific mood category.",
        parameters=[
            OpenApiParameter(
                name='limit',
                description='Maximum number of tracks to return (default: 20)',
                required=False,
                type=int,
                default=20,
            ),
        ],
        responses={
            200: MoodDetailResponseSerializer,
            404: OpenApiResponse(description="Mood not found"),
        }
    )
    def get(self, request, slug):
        limit = int(request.query_params.get('limit', 20))
        limit = max(1, min(limit, 50))
        try:
            data = MusicService.get_mood_songs(slug=slug, user=request.user, limit=limit)
            return api_response(data=data)
        except Mood.DoesNotExist:
            return api_error(
                code="MOOD_NOT_FOUND",
                message=f"Mood crate '{slug}' was not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )


class HomeAPIView(APIView):
    """Retrieve composed home dashboard screen for listener discovery."""
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="home_feed",
        summary="Get Home Dashboard Feed",
        description="Composed home payload containing greeting, hero banner, trending tracks, mood crates, recently played history, quick picks, and playlists.",
        responses={200: HomeFeedResponseSerializer}
    )
    def get(self, request):
        from apps.music.services.home_service import HomeService
        data = HomeService.get_home_feed(user=request.user)
        return api_response(data=data)


class MusicRecommendationsAPIView(APIView):
    """Retrieve personalized track recommendations based on user affinity, history, and taste."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'search'

    @extend_schema(
        operation_id="music_recommendations_list",
        summary="Get Personalized Recommendations",
        description="Generates heuristic-scored music recommendations based on user history, liked songs, preferred moods, or seed track/mood.",
        parameters=[
            OpenApiParameter(
                name='limit',
                description='Maximum number of recommendations (default: 20)',
                required=False,
                type=int,
                default=20,
            ),
            OpenApiParameter(
                name='seed_song_id',
                description='Optional seed YouTube video ID to base recommendations around',
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name='mood',
                description='Optional mood filter/boost (e.g. chill, lockin, mainchar)',
                required=False,
                type=str,
            ),
        ],
        responses={200: SongSerializer(many=True)}
    )
    def get(self, request):
        from apps.music.services.recommendation_service import RecommendationService
        limit = int(request.query_params.get('limit', 20))
        seed_song_id = request.query_params.get('seed_song_id')
        mood_slug = request.query_params.get('mood')

        recs = RecommendationService.get_recommendations(
            user=request.user,
            seed_song_id=seed_song_id,
            mood_slug=mood_slug,
            limit=limit,
        )
        return api_response(data=recs)


class SongSimilarAPIView(APIView):
    """Retrieve similar tracks / track radio for a specific song."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'search'

    @extend_schema(
        operation_id="music_song_similar",
        summary="Get Similar Tracks (Track Radio)",
        description="Retrieve similar tracks and up next queue for a given YouTube video ID.",
        parameters=[
            OpenApiParameter(
                name='limit',
                description='Maximum number of similar tracks (default: 20)',
                required=False,
                type=int,
                default=20,
            ),
        ],
        responses={200: SongSerializer(many=True)}
    )
    def get(self, request, pk):
        from apps.music.services.recommendation_service import RecommendationService
        limit = int(request.query_params.get('limit', 20))
        similar = RecommendationService.get_similar_tracks(
            video_id=pk,
            user=request.user,
            limit=limit,
        )
        return api_response(data=similar)
