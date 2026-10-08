from django.contrib import admin
from .models import ListeningHistory

@admin.register(ListeningHistory)
class ListeningHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'song', 'duration_listened_seconds', 'completed', 'played_at')
    list_filter = ('completed', 'played_at')
    search_fields = ('user__username', 'song__title', 'song__youtube_video_id')
