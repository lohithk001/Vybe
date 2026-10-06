from rest_framework import serializers
from .models import Genre, Mood, Artist, Album, Song

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug']


class MoodSerializer(serializers.ModelSerializer):
    accentColor = serializers.CharField(source='accent_color')
    bgClass = serializers.CharField(source='bg_class')

    class Meta:
        model = Mood
        fields = [
            'slug',
            'title',
            'subtitle',
            'accentColor',
            'bgClass',
            'rotation',
            'description',
            'illustration',
        ]


class ArtistSummarySerializer(serializers.ModelSerializer):
    providerId = serializers.CharField(source='provider_id')
    thumbnailUrl = serializers.URLField(source='thumbnail_url')
    avatarColor = serializers.CharField(source='avatar_color')

    class Meta:
        model = Artist
        fields = [
            'id',
            'providerId',
            'name',
            'thumbnailUrl',
            'avatarColor',
        ]


class AlbumSummarySerializer(serializers.ModelSerializer):
    providerId = serializers.CharField(source='provider_id')
    thumbnailUrl = serializers.URLField(source='thumbnail_url')

    class Meta:
        model = Album
        fields = [
            'id',
            'providerId',
            'title',
            'thumbnailUrl',
            'year',
        ]


class SongSerializer(serializers.ModelSerializer):
    """
    Normalized Song contract:
    {
        "id": "...",
        "youtube_video_id": "...",
        "title": "...",
        "artist": { "id": "...", "name": "..." },
        "album": { "id": "...", "name": "..." },
        "thumbnail_url": "...",
        "duration_seconds": 210,
        ...
    }
    """
    youtube_video_id = serializers.CharField()
    youtubeVideoId = serializers.CharField(source='youtube_video_id')
    artist = ArtistSummarySerializer(read_only=True)
    album = AlbumSummarySerializer(read_only=True)
    thumbnail_url = serializers.URLField()
    thumbnailUrl = serializers.URLField(source='thumbnail_url')
    duration_seconds = serializers.IntegerField()
    durationSeconds = serializers.IntegerField(source='duration_seconds')
    durationFormatted = serializers.CharField(source='duration_formatted', read_only=True)
    accentColor = serializers.CharField(source='accent_color')
    playCount = serializers.IntegerField(source='play_count', read_only=True)
    playCountFormatted = serializers.CharField(source='play_count_formatted', read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    moods = MoodSerializer(many=True, read_only=True)

    class Meta:
        model = Song
        fields = [
            'id',
            'youtube_video_id',
            'youtubeVideoId',
            'title',
            'artist',
            'album',
            'thumbnail_url',
            'thumbnailUrl',
            'duration_seconds',
            'durationSeconds',
            'durationFormatted',
            'accentColor',
            'illustration',
            'bpm',
            'playCount',
            'playCountFormatted',
            'genres',
            'moods',
        ]


class ArtistDetailSerializer(serializers.ModelSerializer):
    providerId = serializers.CharField(source='provider_id')
    thumbnailUrl = serializers.URLField(source='thumbnail_url')
    avatarColor = serializers.CharField(source='avatar_color')
    monthlyListeners = serializers.CharField(source='monthly_listeners')
    genres = GenreSerializer(many=True, read_only=True)
    topSongs = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = [
            'id',
            'providerId',
            'name',
            'thumbnailUrl',
            'avatarColor',
            'monthlyListeners',
            'bio',
            'genres',
            'topSongs',
        ]

    def get_topSongs(self, obj):
        songs = obj.songs.filter(is_active=True).select_related('artist', 'album')[:10]
        return SongSerializer(songs, many=True).data
