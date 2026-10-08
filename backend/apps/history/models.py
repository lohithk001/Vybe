from django.db import models

class ListeningHistory(models.Model):
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='history_entries'
    )
    song = models.ForeignKey(
        'music.Song',
        on_delete=models.CASCADE,
        related_name='history_plays'
    )
    duration_listened_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-played_at']
        verbose_name = 'Listening History Entry'
        verbose_name_plural = 'Listening History Entries'
        indexes = [
            models.Index(fields=['user', '-played_at']),
        ]

    def __str__(self):
        return f"{self.user.username} played {self.song.title} at {self.played_at}"
