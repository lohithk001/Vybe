import hashlib
import logging
import time
from typing import Any
from ytmusicapi import YTMusic

from .provider import MusicProvider, MusicProviderException

logger = logging.getLogger(__name__)

PALETTE = ['#FF5CA8', '#8E7CFF', '#55D6BE', '#FFE229', '#FF8A3D', '#6DB7FF']
ILLUSTRATIONS = ['vinyl', 'cassette', 'chill', 'mainchar', 'lockin', 'unhinged', 'lofi', 'retro']

def get_consistent_accent(key: str) -> str:
    """Generate consistent accent color from string seed."""
    idx = int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16) % len(PALETTE)
    return PALETTE[idx]

def get_consistent_illustration(key: str) -> str:
    """Generate consistent illustration identifier from string seed."""
    idx = int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16) % len(ILLUSTRATIONS)
    return ILLUSTRATIONS[idx]

def parse_duration_to_seconds(duration_str: str | None) -> int:
    """Parse '3:45' or '1:12:30' into total seconds."""
    if not duration_str:
        return 0
    try:
        parts = [int(p) for p in duration_str.split(':')]
        if len(parts) == 3:
            return parts[0] * 3600 + parts[1] * 60 + parts[2]
        elif len(parts) == 2:
            return parts[0] * 60 + parts[1]
        elif len(parts) == 1:
            return parts[0]
    except Exception:
        pass
    return 0


class YTMusicProvider(MusicProvider):
    """
    YouTube Music provider running in unauthenticated mode.
    Never stores or requests user cookies. Normalizes all responses.
    """

    def __init__(self, max_retries: int = 2, retry_delay: float = 0.5):
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self._client: YTMusic | None = None

    @property
    def client(self) -> YTMusic:
        """Lazy-initialize unauthenticated client."""
        if self._client is None:
            self._client = YTMusic()
        return self._client

    def _execute_with_retry(self, action_name: str, func, *args, **kwargs) -> Any:
        last_error = None
        for attempt in range(1, self.max_retries + 1):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_error = e
                logger.warning(
                    f"YTMusicProvider {action_name} attempt {attempt} failed: {e}"
                )
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay * attempt)

        logger.error(f"YTMusicProvider {action_name} failed after {self.max_retries} attempts: {last_error}")
        raise MusicProviderException(
            message=f"Music provider error during {action_name}. Please try again later.",
            code="UPSTREAM_PROVIDER_ERROR",
            original_exception=last_error,
        )

    def search(self, query: str, filter_type: str = 'songs', limit: int = 20) -> list[dict[str, Any]]:
        """Search tracks, artists, or albums and normalize response."""
        valid_filters = {'songs': 'songs', 'artists': 'artists', 'albums': 'albums'}
        filter_param = valid_filters.get(filter_type, 'songs')

        raw_results = self._execute_with_retry(
            f"search({query}, {filter_type})",
            self.client.search,
            query=query,
            filter=filter_param,
            limit=limit,
        )

        normalized = []
        for item in raw_results:
            try:
                if filter_param == 'songs':
                    parsed = self._normalize_song(item)
                    if parsed:
                        normalized.append(parsed)
                elif filter_param == 'artists':
                    parsed = self._normalize_artist_summary(item)
                    if parsed:
                        normalized.append(parsed)
                elif filter_param == 'albums':
                    parsed = self._normalize_album_summary(item)
                    if parsed:
                        normalized.append(parsed)
            except Exception as e:
                logger.debug(f"Failed to normalize search item {item}: {e}")
                continue

        return normalized

    def get_song(self, video_id: str) -> dict[str, Any] | None:
        """Fetch song details by YouTube video ID."""
        try:
            # Use get_song or get_watch_playlist
            data = self._execute_with_retry(
                f"get_song({video_id})",
                self.client.get_song,
                videoId=video_id,
            )
            video_details = data.get('videoDetails', {})
            title = video_details.get('title', 'Unknown Track')
            author = video_details.get('author', 'Unknown Artist')
            channel_id = video_details.get('channelId', '')
            duration_sec = int(video_details.get('lengthSeconds', 0))

            thumbnails = video_details.get('thumbnail', {}).get('thumbnails', [])
            thumb_url = thumbnails[-1]['url'] if thumbnails else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

            return {
                'id': video_id,
                'youtube_video_id': video_id,
                'youtubeVideoId': video_id,
                'title': title,
                'artist': {
                    'id': channel_id or 'unknown-artist',
                    'name': author,
                },
                'album': None,
                'thumbnail_url': thumb_url,
                'thumbnailUrl': thumb_url,
                'duration_seconds': duration_sec,
                'durationFormatted': f"{duration_sec // 60}:{duration_sec % 60:02d}",
                'accentColor': get_consistent_accent(video_id),
                'illustration': get_consistent_illustration(video_id),
            }
        except MusicProviderException:
            raise
        except Exception as e:
            logger.error(f"Failed to fetch song {video_id}: {e}")
            raise MusicProviderException(
                message=f"Could not retrieve track with ID {video_id}.",
                code="TRACK_NOT_FOUND",
                original_exception=e,
            )

    def get_artist(self, artist_id: str) -> dict[str, Any] | None:
        """Fetch artist profile and top tracks."""
        data = self._execute_with_retry(
            f"get_artist({artist_id})",
            self.client.get_artist,
            channelId=artist_id,
        )

        name = data.get('name', 'Unknown Artist')
        description = data.get('description', '')
        subscribers = data.get('subscribers', '')

        thumbnails = data.get('thumbnails', [])
        thumb_url = thumbnails[-1]['url'] if thumbnails else ''

        # Top Songs
        raw_songs = data.get('songs', {}).get('results', [])
        top_songs = []
        for s in raw_songs[:10]:
            normalized_s = self._normalize_song(s)
            if normalized_s:
                top_songs.append(normalized_s)

        # Albums
        raw_albums = data.get('albums', {}).get('results', [])
        albums = []
        for alb in raw_albums[:8]:
            albums.append(self._normalize_album_summary(alb))

        return {
            'id': artist_id,
            'providerId': artist_id,
            'name': name,
            'thumbnailUrl': thumb_url,
            'avatarColor': get_consistent_accent(artist_id),
            'monthlyListeners': subscribers or '1M',
            'bio': description,
            'topSongs': top_songs,
            'albums': albums,
        }

    def get_album(self, album_id: str) -> dict[str, Any] | None:
        """Fetch album details and track list."""
        data = self._execute_with_retry(
            f"get_album({album_id})",
            self.client.get_album,
            browseId=album_id,
        )

        title = data.get('title', 'Unknown Album')
        artists = data.get('artists', [])
        artist_obj = {
            'id': artists[0]['id'] if artists and 'id' in artists[0] else 'unknown',
            'name': artists[0]['name'] if artists else 'Unknown Artist',
        }
        year = data.get('year')
        try:
            year = int(year) if year else None
        except ValueError:
            year = None

        thumbnails = data.get('thumbnails', [])
        thumb_url = thumbnails[-1]['url'] if thumbnails else ''

        tracks = []
        for t in data.get('tracks', []):
            norm_track = self._normalize_song(t, default_album={'id': album_id, 'title': title})
            if norm_track:
                tracks.append(norm_track)

        return {
            'id': album_id,
            'providerId': album_id,
            'title': title,
            'artist': artist_obj,
            'thumbnailUrl': thumb_url,
            'year': year,
            'tracks': tracks,
        }

    def get_trending_songs(self, limit: int = 20) -> list[dict[str, Any]]:
        """Fetch trending tracks via top charts or popular trending search."""
        try:
            charts = self._execute_with_retry("get_charts()", self.client.get_charts, country='US')
            videos = charts.get('videos', [])
            if videos and isinstance(videos, list):
                first_pl_id = videos[0].get('playlistId')
                if first_pl_id:
                    pl = self._execute_with_retry(
                        f"get_playlist({first_pl_id})",
                        self.client.get_playlist,
                        playlistId=first_pl_id,
                        limit=limit,
                    )
                    raw_tracks = pl.get('tracks', [])
                    normalized = []
                    for t in raw_tracks[:limit]:
                        s = self._normalize_song(t)
                        if s:
                            normalized.append(s)
                    if normalized:
                        return normalized
        except Exception as e:
            logger.warning(f"get_charts failed or empty, falling back to search: {e}")

        return self.search(query="Top Hits 2025", filter_type='songs', limit=limit)

    def get_mood_songs(self, mood_slug: str, limit: int = 20) -> list[dict[str, Any]]:
        """Fetch songs matching a mood category query."""
        mood_query_map = {
            'chill': 'chill lofi beats relax',
            'lockin': 'synthwave cyberpunk focus electronic',
            'mainchar': 'upbeat euphoric pop anthem',
            'unhinged': 'hyperpop glitchcore high energy',
            'focus': 'ambient piano deep concentration',
            'party': 'party dance hits club bangers',
            'sad': 'sad slow acoustic late night songs',
            'workout': 'gym phonk high tempo hardstyle workout',
        }
        query = mood_query_map.get(mood_slug, f"{mood_slug} vibe songs")
        return self.search(query=query, filter_type='songs', limit=limit)

    def get_related_songs(self, video_id: str, limit: int = 20) -> list[dict[str, Any]]:
        """Fetch related songs (radio / up next) for a given video ID."""
        try:
            data = self._execute_with_retry(
                f"get_watch_playlist({video_id})",
                self.client.get_watch_playlist,
                videoId=video_id,
                limit=limit + 5,
            )
            raw_tracks = data.get('tracks', [])
            normalized = []
            for t in raw_tracks:
                # Exclude seed track itself
                if t.get('videoId') == video_id:
                    continue
                s = self._normalize_song(t)
                if s:
                    normalized.append(s)
                if len(normalized) >= limit:
                    break
            return normalized
        except Exception as e:
            logger.warning(f"Failed to fetch related songs for {video_id}: {e}")
            return []

    def _normalize_song(self, item: dict, default_album: dict | None = None) -> dict[str, Any] | None:
        video_id = item.get('videoId')
        if not video_id:
            return None

        title = item.get('title', 'Unknown Title')
        artists = item.get('artists', [])
        artist_data = {
            'id': artists[0].get('id', 'unknown') if artists else 'unknown',
            'name': artists[0].get('name', 'Unknown Artist') if artists else 'Unknown Artist',
        }

        raw_album = item.get('album')
        if raw_album and isinstance(raw_album, dict):
            album_data = {
                'id': raw_album.get('id', ''),
                'title': raw_album.get('name', ''),
            }
        elif default_album:
            album_data = default_album
        else:
            album_data = None

        duration_sec = item.get('duration_seconds')
        if not duration_sec:
            duration_sec = parse_duration_to_seconds(item.get('duration') or item.get('length'))

        thumbnails = item.get('thumbnails') or item.get('thumbnail') or []
        thumb_url = thumbnails[-1]['url'] if thumbnails else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

        return {
            'id': video_id,
            'youtube_video_id': video_id,
            'youtubeVideoId': video_id,
            'title': title,
            'artist': artist_data,
            'album': album_data,
            'thumbnail_url': thumb_url,
            'thumbnailUrl': thumb_url,
            'duration_seconds': duration_sec,
            'durationFormatted': f"{duration_sec // 60}:{duration_sec % 60:02d}",
            'accentColor': get_consistent_accent(video_id),
            'illustration': get_consistent_illustration(video_id),
        }

    def _normalize_artist_summary(self, item: dict) -> dict[str, Any]:
        artist_id = item.get('browseId') or item.get('id', '')
        name = item.get('artist') or item.get('name', 'Unknown Artist')
        thumbnails = item.get('thumbnails', [])
        thumb_url = thumbnails[-1]['url'] if thumbnails else ''

        return {
            'id': artist_id,
            'providerId': artist_id,
            'name': name,
            'thumbnailUrl': thumb_url,
            'avatarColor': get_consistent_accent(artist_id or name),
        }

    def _normalize_album_summary(self, item: dict) -> dict[str, Any]:
        album_id = item.get('browseId') or item.get('id', '')
        title = item.get('title', 'Unknown Album')
        thumbnails = item.get('thumbnails', [])
        thumb_url = thumbnails[-1]['url'] if thumbnails else ''
        year = item.get('year')
        try:
            year = int(year) if year else None
        except ValueError:
            year = None

        return {
            'id': album_id,
            'providerId': album_id,
            'title': title,
            'thumbnailUrl': thumb_url,
            'year': year,
        }


# Singleton shared instance
ytmusic_provider = YTMusicProvider()
