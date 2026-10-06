import re
from rest_framework import serializers
from django.contrib.auth import password_validation
from .models import User, Profile

class ProfileSerializer(serializers.ModelSerializer):
    preferredMoods = serializers.ListField(
        source='preferred_moods',
        child=serializers.CharField(),
        required=False,
    )
    favoriteGenres = serializers.ListField(
        source='favorite_genres',
        child=serializers.CharField(),
        required=False,
    )
    listeningTimeMinutes = serializers.IntegerField(
        source='listening_time_minutes',
        read_only=True,
    )

    class Meta:
        model = Profile
        fields = [
            'preferredMoods',
            'favoriteGenres',
            'listeningTimeMinutes',
        ]


class UserSerializer(serializers.ModelSerializer):
    displayName = serializers.CharField(source='display_name', read_only=True)
    avatarColor = serializers.CharField(source='avatar_color', read_only=True)
    avatarUrl = serializers.URLField(source='avatar_url', read_only=True)
    profile = ProfileSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'displayName',
            'avatarColor',
            'avatarUrl',
            'bio',
            'profile',
            'createdAt',
        ]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, min_length=8)
    displayName = serializers.CharField(
        source='display_name',
        max_length=100,
        required=False,
        allow_blank=True,
    )
    avatarColor = serializers.CharField(
        source='avatar_color',
        max_length=20,
        required=False,
        default='#FF5CA8',
    )

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate_username(self, value):
        cleaned = value.strip().lower()
        if not re.match(r'^[a-zA-Z0-9_]{3,30}$', cleaned):
            raise serializers.ValidationError(
                "Username must be 3-30 characters containing only letters, numbers, and underscores."
            )
        if User.objects.filter(username=cleaned).exists():
            raise serializers.ValidationError("This username is already taken.")
        return cleaned

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.strip().lower()


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class UpdateProfileSerializer(serializers.Serializer):
    displayName = serializers.CharField(
        source='display_name',
        max_length=100,
        required=False,
        allow_blank=True,
    )
    avatarColor = serializers.CharField(
        source='avatar_color',
        max_length=20,
        required=False,
    )
    avatarUrl = serializers.URLField(
        source='avatar_url',
        max_length=500,
        required=False,
        allow_blank=True,
    )
    bio = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
    )
    preferredMoods = serializers.ListField(
        source='preferred_moods',
        child=serializers.CharField(),
        required=False,
    )
    favoriteGenres = serializers.ListField(
        source='favorite_genres',
        child=serializers.CharField(),
        required=False,
    )
