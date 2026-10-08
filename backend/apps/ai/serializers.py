from rest_framework import serializers
from apps.music.serializers import SongSerializer

class AIDJRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        required=True,
        min_length=2,
        max_length=500,
        help_text="Describe the vibe, feeling, activity, or scenario for DJ VYBE to curate."
    )
    mood = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        default=None,
        help_text="Optional mood category override (e.g. chill, lockin, mainchar, unhinged)."
    )
    limit = serializers.IntegerField(
        required=False,
        default=10,
        min_value=1,
        max_value=25,
        help_text="Number of tracks to assemble (default: 10, max: 25)."
    )


class AIDJResponseSerializer(serializers.Serializer):
    sessionTitle = serializers.CharField()
    djCommentary = serializers.CharField()
    detectedMood = serializers.CharField()
    accentColor = serializers.CharField()
    illustration = serializers.CharField()
    suggestedArtists = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    tracks = SongSerializer(many=True)
