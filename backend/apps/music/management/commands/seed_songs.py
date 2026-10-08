import logging
from django.core.management.base import BaseCommand
from apps.music.models import Song, Mood
from apps.music.services.ytmusic import ytmusic_provider
from apps.music.services.persistence import SongPersistenceService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Seeds initial real songs from YouTube Music into the local database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=15,
            help='Number of songs per mood and trending category to seed',
        )

    def handle(self, *args, **options):
        limit = options['limit']
        self.stdout.write(self.style.NOTICE(f'Seeding real songs (limit: {limit} per category)...'))

        total_seeded = 0

        # 1. Seed Top Trending Songs
        self.stdout.write(self.style.NOTICE('Fetching live Trending songs from YouTube Music...'))
        try:
            trending = ytmusic_provider.get_trending_songs(limit=limit)
            for track in trending:
                vid = track.get('youtube_video_id') or track.get('id')
                if vid:
                    try:
                        song = SongPersistenceService.get_or_create_song_by_video_id(vid)
                        total_seeded += 1
                        self.stdout.write(self.style.SUCCESS(f"  [Trending] + {song.title} - {song.artist.name}"))
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"  Failed to persist {vid}: {e}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error fetching trending songs: {e}"))

        # 2. Seed songs for each mood
        moods = Mood.objects.all()
        for mood in moods:
            self.stdout.write(self.style.NOTICE(f"Fetching real songs for mood [{mood.slug}]..."))
            try:
                mood_tracks = ytmusic_provider.get_mood_songs(mood.slug, limit=5)
                for track in mood_tracks:
                    vid = track.get('youtube_video_id') or track.get('id')
                    if vid:
                        try:
                            song = SongPersistenceService.get_or_create_song_by_video_id(vid)
                            song.moods.add(mood)
                            total_seeded += 1
                            self.stdout.write(self.style.SUCCESS(f"  [{mood.slug}] + {song.title} - {song.artist.name}"))
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f"  Failed to persist {vid}: {e}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error fetching mood songs for {mood.slug}: {e}"))

        current_count = Song.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"\nFinished seeding! Total unique songs in database: {current_count}"
        ))
