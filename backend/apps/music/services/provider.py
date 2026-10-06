from abc import ABC, abstractmethod
from typing import Any

class MusicProviderException(Exception):
    """Base exception for all music provider errors."""
    def __init__(self, message: str, code: str = "PROVIDER_ERROR", original_exception: Exception | None = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.original_exception = original_exception


class MusicProvider(ABC):
    """
    Abstract Base Class for external music metadata providers.
    Ensures provider can be swapped (e.g. YTMusicProvider -> YouTubeDataAPIProvider)
    without modifying service or view layers.
    """

    @abstractmethod
    def search(self, query: str, filter_type: str = 'songs', limit: int = 20) -> list[dict[str, Any]]:
        """Search tracks, artists, or albums."""
        pass

    @abstractmethod
    def get_song(self, video_id: str) -> dict[str, Any] | None:
        """Fetch normalized metadata for a single song by YouTube video ID."""
        pass

    @abstractmethod
    def get_artist(self, artist_id: str) -> dict[str, Any] | None:
        """Fetch normalized artist profile, bio, and top tracks."""
        pass

    @abstractmethod
    def get_album(self, album_id: str) -> dict[str, Any] | None:
        """Fetch normalized album details and track list."""
        pass
