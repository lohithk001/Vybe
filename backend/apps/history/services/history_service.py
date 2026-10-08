from django.db import transaction
from apps.music.services.persistence import SongPersistenceService
from apps.history.models import ListeningHistory

class HistoryService:
    """Manages event-based listening logs, play count tracking, and listener stats."""

    @classmethod
    def record_play_event(cls, user, validated_data: dict) -> ListeningHistory:
        youtube_video_id = validated_data['youtube_video_id']
        duration = validated_data.get('duration_listened_seconds', 0)
        completed = validated_data.get('completed', False)

        with transaction.atomic():
            # 1. Persist song to Postgres if not already present
            song = SongPersistenceService.get_or_create_song_by_video_id(youtube_video_id)

            # 2. Increment song play count
            song.play_count += 1
            song.save(update_fields=['play_count'])

            # 3. Increment listener profile minutes if listened for > 30s
            if duration >= 30 and hasattr(user, 'profile'):
                profile = user.profile
                added_mins = max(1, duration // 60)
                profile.listening_time_minutes += added_mins
                profile.save(update_fields=['listening_time_minutes'])

            # 4. Create event log
            entry = ListeningHistory.objects.create(
                user=user,
                song=song,
                duration_listened_seconds=duration,
                completed=completed,
            )

        return entry

    @staticmethod
    def clear_history(user) -> int:
        count, _ = ListeningHistory.objects.filter(user=user).delete()
        return count
