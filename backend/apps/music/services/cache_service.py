import hashlib
from typing import Any
from django.core.cache import cache

SEARCH_TTL = 3600       # 1 hour
SONG_TTL = 86400        # 24 hours
ARTIST_TTL = 86400      # 24 hours
ALBUM_TTL = 86400       # 24 hours
TRENDING_TTL = 7200     # 2 hours
MOOD_TTL = 86400        # 24 hours
MOOD_SONGS_TTL = 14400  # 4 hours
HOME_TTL = 900          # 15 minutes
RECOMMENDATIONS_TTL = 1800  # 30 minutes
SIMILAR_TTL = 3600          # 1 hour

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

    @staticmethod
    def get_trending() -> list[dict[str, Any]] | None:
        return cache.get("vybe:music:trending")

    @staticmethod
    def set_trending(data: list[dict[str, Any]]) -> None:
        cache.set("vybe:music:trending", data, timeout=TRENDING_TTL)

    @staticmethod
    def get_moods() -> list[dict[str, Any]] | None:
        return cache.get("vybe:music:moods")

    @staticmethod
    def set_moods(data: list[dict[str, Any]]) -> None:
        cache.set("vybe:music:moods", data, timeout=MOOD_TTL)

    @staticmethod
    def get_mood_songs(slug: str) -> list[dict[str, Any]] | None:
        return cache.get(f"vybe:music:mood:{slug.strip().lower()}")

    @staticmethod
    def set_mood_songs(slug: str, data: list[dict[str, Any]]) -> None:
        cache.set(f"vybe:music:mood:{slug.strip().lower()}", data, timeout=MOOD_SONGS_TTL)

    @staticmethod
    def get_home(key: str = "public") -> dict[str, Any] | None:
        return cache.get(f"vybe:home:{key}")

    @staticmethod
    def set_home(key: str, data: dict[str, Any], timeout: int = HOME_TTL) -> None:
        cache.set(f"vybe:home:{key}", data, timeout=timeout)

    @staticmethod
    def get_recommendations(cache_key: str) -> list[dict[str, Any]] | None:
        return cache.get(f"vybe:music:recs:{cache_key}")

    @staticmethod
    def set_recommendations(cache_key: str, data: list[dict[str, Any]]) -> None:
        cache.set(f"vybe:music:recs:{cache_key}", data, timeout=RECOMMENDATIONS_TTL)

    @staticmethod
    def get_similar_tracks(video_id: str) -> list[dict[str, Any]] | None:
        return cache.get(f"vybe:music:similar:{video_id.strip()}")

    @staticmethod
    def set_similar_tracks(video_id: str, data: list[dict[str, Any]]) -> None:
        cache.set(f"vybe:music:similar:{video_id.strip()}", data, timeout=SIMILAR_TTL)
