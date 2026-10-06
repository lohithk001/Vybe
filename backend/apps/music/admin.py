from django.contrib import admin
from .models import Genre, Mood, Artist, Album, Song

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Mood)
class MoodAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'subtitle', 'accent_color', 'illustration')
    search_fields = ('slug', 'title', 'description')


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider_id', 'monthly_listeners', 'created_at')
    search_fields = ('name', 'provider_id')
    filter_horizontal = ('genres',)


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'year', 'provider_id')
    search_fields = ('title', 'artist__name', 'provider_id')
    list_filter = ('year',)


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'artist',
        'album',
        'youtube_video_id',
        'duration_formatted',
        'play_count',
        'is_active',
        'created_at',
    )
    list_filter = ('is_active', 'illustration', 'moods')
    search_fields = ('title', 'artist__name', 'youtube_video_id')
    filter_horizontal = ('genres', 'moods')
