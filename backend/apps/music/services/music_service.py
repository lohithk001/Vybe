import logging
from typing import Any
from apps.music.models import Song, Artist, Album
from apps.music.serializers import SongSerializer, ArtistDetailSerializer
from .provider import MusicProviderException
from .ytmusic import ytmusic_provider
from .cache_service import MusicCacheService

logger = logging.getLogger(__name__)

class MusicService:
    """
    High-level orchestrator for music search and metadata retrieval.
    Coordinates Redis caching, local database lookups, and upstream provider queries.
    """

    @classmethod
    def search(cls, query: str, filter_type: str = 'songs', limit: int = 20) -> list[dict[str, Any]]:
        query = query.strip()
        if not query:
            return []

        # 1. Check Redis cache
        cached = MusicCacheService.get_search(query, filter_type)
        if cached is not None:
            return cached

        # 2. Query upstream provider
        try:
            results = ytmusic_provider.search(query, filter_type=filter_type, limit=limit)
        except MusicProviderException:
            # On failure, return empty or fallback
            raise

        # 3. Augment with local database IDs if any songs/artists are already persisted
        if filter_type == 'songs' and results:
            video_ids = [r['youtube_video_id'] for r in results if 'youtube_video_id' in r]
            persisted_songs = {
                s.youtube_video_id: s
                for s in Song.objects.filter(youtube_video_id__in=video_ids).select_related('artist', 'album')
            }
            for item in results:
                vid = item.get('youtube_video_id')
                if vid in persisted_songs:
                    item['localId'] = str(persisted_songs[vid].id)
                    item['isPersisted'] = True

        # 4. Save to Redis cache
        MusicCacheService.set_search(query, filter_type, results)
        return results

    @classmethod
    def get_song(cls, video_id: str) -> dict[str, Any]:
        video_id = video_id.strip()

        # 1. Check local Postgres database first
        local_song = Song.objects.filter(youtube_video_id=video_id).select_related('artist', 'album').first()
        if local_song:
            data = SongSerializer(local_song).data
            data['isPersisted'] = True
            return data

        # 2. Check Redis cache
        cached = MusicCacheService.get_song(video_id)
        if cached:
            return cached

        # 3. Query upstream provider
        song_data = ytmusic_provider.get_song(video_id)
        if not song_data:
            raise MusicProviderException(
                message=f"Track '{video_id}' could not be located.",
                code="TRACK_NOT_FOUND"
            )

        # 4. Store in Redis cache
        MusicCacheService.set_song(video_id, song_data)
        return song_data

    @classmethod
    def get_artist(cls, artist_id: str) -> dict[str, Any]:
        artist_id = artist_id.strip()

        # 1. Check local Postgres database
        local_artist = Artist.objects.filter(provider_id=artist_id).prefetch_related('genres', 'songs').first()
        if local_artist:
            data = ArtistDetailSerializer(local_artist).data
            data['isPersisted'] = True
            return data

        # 2. Check Redis cache
        cached = MusicCacheService.get_artist(artist_id)
        if cached:
            return cached

        # 3. Query upstream provider
        artist_data = ytmusic_provider.get_artist(artist_id)
        if not artist_data:
            raise MusicProviderException(
                message=f"Artist '{artist_id}' could not be located.",
                code="ARTIST_NOT_FOUND"
            )

        # 4. Store in Redis cache
        MusicCacheService.set_artist(artist_id, artist_data)
        return artist_data

    @classmethod
    def get_album(cls, album_id: str) -> dict[str, Any]:
        album_id = album_id.strip()

        # 1. Check Redis cache
        cached = MusicCacheService.get_album(album_id)
        if cached:
            return cached

        # 2. Query upstream provider
        album_data = ytmusic_provider.get_album(album_id)
        if not album_data:
            raise MusicProviderException(
                message=f"Album '{album_id}' could not be located.",
                code="ALBUM_NOT_FOUND"
            )

        # 3. Store in Redis cache
        MusicCacheService.set_album(album_id, album_data)
        return album_data
