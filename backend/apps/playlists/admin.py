from django.contrib import admin
from .models import Playlist, PlaylistSong

class PlaylistSongInline(admin.TabularInline):
    model = PlaylistSong
    extra = 1
    raw_id_fields = ('song',)

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'track_count', 'is_public', 'is_curated', 'created_at')
    list_filter = ('is_public', 'is_curated', 'illustration')
    search_fields = ('title', 'user__username', 'user__email')
    inlines = [PlaylistSongInline]
