from rest_framework import serializers
from apps.music.serializers import SongSerializer
from .models import Playlist, PlaylistSong

class PlaylistSongSerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)
    addedAt = serializers.DateTimeField(source='added_at', read_only=True)

    class Meta:
        model = PlaylistSong
        fields = ['id', 'song', 'position', 'addedAt']


class PlaylistSummarySerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    trackCount = serializers.IntegerField(source='track_count', read_only=True)
    duration = serializers.CharField(source='duration_formatted', read_only=True)
    accentColor = serializers.CharField(source='accent_color')
    isCurated = serializers.BooleanField(source='is_curated', read_only=True)
    isPublic = serializers.BooleanField(source='is_public')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Playlist
        fields = [
            'id',
            'title',
            'description',
            'author',
            'accentColor',
            'illustration',
            'trackCount',
            'duration',
            'isCurated',
            'isPublic',
            'createdAt',
            'updatedAt',
        ]

    def get_author(self, obj) -> dict:
        return {
            'id': str(obj.user.id),
            'username': obj.user.username,
            'displayName': obj.user.display_name or obj.user.username,
            'avatarColor': obj.user.avatar_color,
        }


class PlaylistDetailSerializer(PlaylistSummarySerializer):
    tracks = serializers.SerializerMethodField()

    class Meta(PlaylistSummarySerializer.Meta):
        fields = PlaylistSummarySerializer.Meta.fields + ['tracks']

    def get_tracks(self, obj) -> list:
        playlist_songs = obj.playlist_songs.select_related('song', 'song__artist', 'song__album').order_by('position')
        return [SongSerializer(ps.song).data for ps in playlist_songs]


class CreatePlaylistSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    accentColor = serializers.CharField(source='accent_color', required=False, default='#8E7CFF')
    illustration = serializers.CharField(required=False, default='vinyl')
    isPublic = serializers.BooleanField(source='is_public', required=False, default=True)


class AddSongToPlaylistSerializer(serializers.Serializer):
    youtubeVideoId = serializers.CharField(source='youtube_video_id', required=False)
    youtube_video_id = serializers.CharField(required=False)

    def validate(self, attrs):
        vid = attrs.get('youtube_video_id')
        if not vid:
            raise serializers.ValidationError("Field 'youtube_video_id' or 'youtubeVideoId' is required.")
        return attrs


class ReorderPlaylistSongsSerializer(serializers.Serializer):
    songIds = serializers.ListField(
        source='song_ids',
        child=serializers.CharField(),
        min_length=1,
    )
