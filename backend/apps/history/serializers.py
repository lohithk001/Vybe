from rest_framework import serializers
from apps.music.serializers import SongSerializer
from .models import ListeningHistory

class ListeningHistorySerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)
    durationListenedSeconds = serializers.IntegerField(source='duration_listened_seconds', read_only=True)
    playedAt = serializers.DateTimeField(source='played_at', read_only=True)

    class Meta:
        model = ListeningHistory
        fields = [
            'id',
            'song',
            'durationListenedSeconds',
            'completed',
            'playedAt',
        ]


class RecordPlaySerializer(serializers.Serializer):
    youtubeVideoId = serializers.CharField(source='youtube_video_id', required=False)
    youtube_video_id = serializers.CharField(required=False)
    durationListenedSeconds = serializers.IntegerField(required=False)
    duration_listened_seconds = serializers.IntegerField(required=False)
    completed = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        vid = attrs.get('youtube_video_id')
        if not vid:
            raise serializers.ValidationError("Field 'youtube_video_id' or 'youtubeVideoId' is required.")

        dur = attrs.get('duration_listened_seconds')
        if dur is None:
            dur = attrs.get('durationListenedSeconds', 0)
        attrs['duration_listened_seconds'] = dur
        return attrs
