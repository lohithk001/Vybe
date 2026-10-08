import logging
from apps.music.models import Artist, Album, Song
from .music_service import MusicService

logger = logging.getLogger(__name__)

class SongPersistenceService:
    """
    Persists upstream YouTube Music tracks and artists into PostgreSQL
    ONLY when a user interacts with them (plays, likes, adds to playlist).
    """

    @classmethod
    def get_or_create_song_by_video_id(cls, video_id: str) -> Song:
        video_id = video_id.strip()

        # 1. Check if already persisted
        existing_song = Song.objects.filter(youtube_video_id=video_id).select_related('artist', 'album').first()
        if existing_song:
            return existing_song

        # 2. Fetch normalized metadata via MusicService
        song_data = MusicService.get_song(video_id)

        # 3. Find or create Artist
        artist_meta = song_data.get('artist') or {}
        artist_provider_id = artist_meta.get('id') or f"unknown-{video_id[:8]}"
        artist_name = artist_meta.get('name', 'Unknown Artist')

        artist, _ = Artist.objects.get_or_create(
            provider_id=artist_provider_id,
            defaults={
                'name': artist_name,
                'avatar_color': song_data.get('accentColor', '#FF5CA8'),
            }
        )

        # 4. Optional Album
        album_obj = None
        album_meta = song_data.get('album')
        if album_meta and album_meta.get('id'):
            album_obj, _ = Album.objects.get_or_create(
                provider_id=album_meta['id'],
                defaults={
                    'title': album_meta.get('title', 'Unknown Album'),
                    'artist': artist,
                    'thumbnail_url': song_data.get('thumbnail_url', ''),
                }
            )

        # 5. Create and persist Song
        song = Song.objects.create(
            youtube_video_id=video_id,
            title=song_data.get('title', 'Unknown Title'),
            artist=artist,
            album=album_obj,
            thumbnail_url=song_data.get('thumbnail_url', ''),
            duration_seconds=song_data.get('duration_seconds', 0),
            accent_color=song_data.get('accentColor', '#FF5CA8'),
            illustration=song_data.get('illustration', 'vinyl'),
            bpm=song_data.get('bpm'),
        )

        logger.info(f"Persisted new song to PostgreSQL: {song.title} ({song.youtube_video_id})")
        return song
