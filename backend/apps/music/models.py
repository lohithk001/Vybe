import uuid
from django.db import models
from django.utils.text import slugify

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Genre'
        verbose_name_plural = 'Genres'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Mood(models.Model):
    slug = models.SlugField(max_length=50, primary_key=True)
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200, blank=True)
    accent_color = models.CharField(max_length=20, default='#55D6BE')
    bg_class = models.CharField(max_length=50, default='bg-[#55D6BE]')
    rotation = models.CharField(max_length=50, default='rotate-0')
    description = models.TextField(blank=True)
    illustration = models.CharField(max_length=50, default='chill')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['slug']
        verbose_name = 'Mood'
        verbose_name_plural = 'Moods'

    def __str__(self):
        return self.title


class Artist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider_id = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    thumbnail_url = models.URLField(max_length=1000, blank=True)
    avatar_color = models.CharField(max_length=20, default='#FF5CA8')
    monthly_listeners = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    genres = models.ManyToManyField(Genre, blank=True, related_name='artists')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Artist'
        verbose_name_plural = 'Artists'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.name


class Album(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider_id = models.CharField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=255, db_index=True)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='albums')
    thumbnail_url = models.URLField(max_length=1000, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', 'title']
        verbose_name = 'Album'
        verbose_name_plural = 'Albums'
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['artist', 'title']),
        ]

    def __str__(self):
        return f"{self.title} - {self.artist.name}"


class Song(models.Model):
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
    # Store ONLY youtube_video_id for client-side iframe playback; never proxy/download audio.
    youtube_video_id = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=255, db_index=True)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='songs')
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True, related_name='songs')
    thumbnail_url = models.URLField(max_length=1000, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    accent_color = models.CharField(max_length=20, default='#FF5CA8')
    illustration = models.CharField(max_length=50, choices=ILLUSTRATION_CHOICES, default='vinyl')
    bpm = models.PositiveIntegerField(null=True, blank=True)
    play_count = models.PositiveBigIntegerField(default=0)
    genres = models.ManyToManyField(Genre, blank=True, related_name='songs')
    moods = models.ManyToManyField(Mood, blank=True, related_name='songs')
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-play_count', '-created_at']
        verbose_name = 'Song'
        verbose_name_plural = 'Songs'
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['youtube_video_id']),
            models.Index(fields=['play_count']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.artist.name}"

    @property
    def duration_formatted(self) -> str:
        minutes = self.duration_seconds // 60
        seconds = self.duration_seconds % 60
        return f"{minutes}:{seconds:02d}"

    @property
    def play_count_formatted(self) -> str:
        count = self.play_count
        if count >= 1_000_000_000:
            return f"{count / 1_000_000_000:.1f}B"
        elif count >= 1_000_000:
            return f"{count / 1_000_000:.1f}M"
        elif count >= 1_000:
            return f"{count / 1_000:.1f}K"
        return str(count)
