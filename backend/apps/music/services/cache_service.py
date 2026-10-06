import hashlib
from typing import Any
from django.core.cache import cache

SEARCH_TTL = 3600       # 1 hour
SONG_TTL = 86400        # 24 hours
ARTIST_TTL = 86400      # 24 hours
ALBUM_TTL = 86400       # 24 hours

class MusicCacheService:
    """Manages Redis cache keys, namespacing, and TTLs for music catalog data."""

    @staticmethod
    def _hash_query(query: str, filter_type: str) -> str:
        raw = f"{query.strip().lower()}:{filter_type.strip().lower()}"
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()

    @classmethod
    def get_search(cls, query: str, filter_type: str) -> list[dict[str, Any]] | None:
        key = f"vybe:music:search:{cls._hash_query(query, filter_type)}"
        return cache.get(key)

    @classmethod
    def set_search(cls, query: str, filter_type: str, data: list[dict[str, Any]]) -> None:
        key = f"vybe:music:search:{cls._hash_query(query, filter_type)}"
        cache.set(key, data, timeout=SEARCH_TTL)

    @staticmethod
    def get_song(video_id: str) -> dict[str, Any] | None:
        key = f"vybe:music:song:{video_id.strip()}"
        return cache.get(key)

    @staticmethod
    def set_song(video_id: str, data: dict[str, Any]) -> None:
        key = f"vybe:music:song:{video_id.strip()}"
        cache.set(key, data, timeout=SONG_TTL)

    @staticmethod
    def get_artist(artist_id: str) -> dict[str, Any] | None:
        key = f"vybe:music:artist:{artist_id.strip()}"
        return cache.get(key)

    @staticmethod
    def set_artist(artist_id: str, data: dict[str, Any]) -> None:
        key = f"vybe:music:artist:{artist_id.strip()}"
        cache.set(key, data, timeout=ARTIST_TTL)

    @staticmethod
    def get_album(album_id: str) -> dict[str, Any] | None:
        key = f"vybe:music:album:{album_id.strip()}"
        return cache.get(key)

    @staticmethod
    def set_album(album_id: str, data: dict[str, Any]) -> None:
        key = f"vybe:music:album:{album_id.strip()}"
        cache.set(key, data, timeout=ALBUM_TTL)
