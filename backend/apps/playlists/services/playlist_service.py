from django.db import transaction, models
from rest_framework.exceptions import ValidationError, NotFound
from apps.music.models import Song
from apps.music.services.persistence import SongPersistenceService
from apps.playlists.models import Playlist, PlaylistSong

class PlaylistService:
    """Encapsulates all playlist curation, track sequencing, and authorization logic."""

    @staticmethod
    def create_playlist(user, validated_data: dict) -> Playlist:
        return Playlist.objects.create(
            user=user,
            title=validated_data['title'],
            description=validated_data.get('description', ''),
            accent_color=validated_data.get('accent_color', '#8E7CFF'),
            illustration=validated_data.get('illustration', 'vinyl'),
            is_public=validated_data.get('is_public', True),
        )

    @staticmethod
    def add_song(playlist: Playlist, youtube_video_id: str) -> PlaylistSong:
        # 1. Persist song into Postgres if needed
        song = SongPersistenceService.get_or_create_song_by_video_id(youtube_video_id)

        # 2. Check duplicate constraint
        if PlaylistSong.objects.filter(playlist=playlist, song=song).exists():
            raise ValidationError("This track is already present in the playlist.")

        # 3. Determine next position
        max_pos = playlist.playlist_songs.aggregate(models.Max('position'))['position__max']
        next_pos = (max_pos + 1) if max_pos is not None else 0

        # 4. Create entry
        entry = PlaylistSong.objects.create(
            playlist=playlist,
            song=song,
            position=next_pos,
        )

        playlist.save()  # update updated_at timestamp
        return entry

    @staticmethod
    def remove_song(playlist: Playlist, song_id: str) -> None:
        import uuid
        entry = None
        try:
            val = uuid.UUID(str(song_id))
            entry = playlist.playlist_songs.filter(song__id=val).first()
        except (ValueError, AttributeError):
            pass

        if not entry:
            entry = playlist.playlist_songs.filter(song__youtube_video_id=song_id).first()

        if not entry:
            raise NotFound("Track not found in this playlist.")
        entry.delete()

        # Re-index remaining positions
        remaining = playlist.playlist_songs.order_by('position', 'added_at')
        for idx, item in enumerate(remaining):
            if item.position != idx:
                item.position = idx
                item.save(update_fields=['position'])

        playlist.save()

    @staticmethod
    def reorder_songs(playlist: Playlist, ordered_song_ids: list[str]) -> Playlist:
        with transaction.atomic():
            playlist_songs = {
                str(ps.song.id): ps
                for ps in playlist.playlist_songs.select_related('song').all()
            }
            # Also support matching by youtube_video_id
            for ps in playlist.playlist_songs.all():
                playlist_songs[ps.song.youtube_video_id] = ps

            for new_position, target_id in enumerate(ordered_song_ids):
                if target_id in playlist_songs:
                    entry = playlist_songs[target_id]
                    if entry.position != new_position:
                        entry.position = new_position
                        entry.save(update_fields=['position'])

            playlist.save()
            return playlist

    @staticmethod
    def update_playlist(playlist: Playlist, validated_data: dict) -> Playlist:
        for field, value in validated_data.items():
            setattr(playlist, field, value)
        playlist.save()
        return playlist

    @staticmethod
    def delete_playlist(playlist: Playlist) -> None:
        playlist.delete()
