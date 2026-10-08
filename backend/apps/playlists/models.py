import uuid
from django.db import models

class Playlist(models.Model):
    ILLUSTRATION_CHOICES = [
        ('chill', 'Chill'),
        ('lockin', 'Lock In'),
        ('mainchar', 'Main Character'),
        ('unhinged', 'Unhinged'),
        ('vinyl', 'Vinyl'),
        ('cassette', 'Cassette'),
        ('lofi', 'Lo-Fi'),
        ('retro', 'Retro'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='playlists'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    accent_color = models.CharField(max_length=20, default='#8E7CFF')
    illustration = models.CharField(max_length=50, choices=ILLUSTRATION_CHOICES, default='vinyl')
    is_public = models.BooleanField(default=True)
    is_curated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Playlist'
        verbose_name_plural = 'Playlists'
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['is_curated', '-updated_at']),
        ]

    def __str__(self):
        return f"{self.title} (by {self.user.username})"

    @property
    def track_count(self) -> int:
        return self.playlist_songs.count()

    @property
    def total_duration_seconds(self) -> int:
        return sum(ps.song.duration_seconds for ps in self.playlist_songs.select_related('song').all())

    @property
    def duration_formatted(self) -> str:
        sec = self.total_duration_seconds
        h = sec // 3600
        m = (sec % 3600) // 60
        if h > 0:
            return f"{h}h {m}m"
        return f"{m}m"


class PlaylistSong(models.Model):
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='playlist_songs'
    )
    song = models.ForeignKey(
        'music.Song',
        on_delete=models.CASCADE,
        related_name='playlist_entries'
    )
    position = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'added_at']
        verbose_name = 'Playlist Song'
        verbose_name_plural = 'Playlist Songs'
        unique_together = ('playlist', 'song')
        indexes = [
            models.Index(fields=['playlist', 'position']),
        ]

    def __str__(self):
        return f"{self.playlist.title} -> {self.song.title} (#{self.position})"
