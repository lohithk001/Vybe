from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from apps.users.models import User, Profile

class AuthService:
    """Encapsulates all authentication, token generation, and profile business logic."""

    @staticmethod
    def get_tokens_for_user(user: User) -> dict:
        """Generate JWT access and refresh token pair with custom claims."""
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username
        refresh['email'] = user.email

        return {
            'accessToken': str(refresh.access_token),
            'refreshToken': str(refresh),
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'tokenType': 'Bearer',
        }

    @classmethod
    def register_user(cls, validated_data: dict) -> tuple[User, dict]:
        """Create new user account and listener profile, returning user and JWT tokens."""
        email = validated_data['email']
        username = validated_data['username']
        password = validated_data['password']
        display_name = validated_data.get('display_name', '')
        avatar_color = validated_data.get('avatar_color', '#FF5CA8')

        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            display_name=display_name,
            avatar_color=avatar_color,
        )

        tokens = cls.get_tokens_for_user(user)
        return user, tokens

    @classmethod
    def authenticate_user(cls, email: str, password: str) -> tuple[User, dict]:
        """Validate user credentials and return user and JWT tokens."""
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid email or password.")

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationFailed("This account has been deactivated.")

        tokens = cls.get_tokens_for_user(user)
        return user, tokens

    @staticmethod
    def refresh_access_token(refresh_token_str: str) -> dict:
        """Generate a new access token from an active refresh token."""
        try:
            refresh = RefreshToken(refresh_token_str)
            return {
                'accessToken': str(refresh.access_token),
                'tokenType': 'Bearer',
            }
        except TokenError as e:
            raise AuthenticationFailed(f"Invalid or expired refresh token: {str(e)}")

    @staticmethod
    def logout_user(refresh_token_str: str) -> bool:
        """Blacklist refresh token upon logout."""
        try:
            token = RefreshToken(refresh_token_str)
            token.blacklist()
            return True
        except TokenError as e:
            raise ValidationError(f"Invalid refresh token: {str(e)}")

    @staticmethod
    def update_profile(user: User, validated_data: dict) -> User:
        """Update user display properties and listener profile metadata."""
        user_fields = ['display_name', 'avatar_color', 'avatar_url', 'bio']
        user_updated = False
        for field in user_fields:
            if field in validated_data:
                setattr(user, field, validated_data[field])
                user_updated = True

        if user_updated:
            user.save()

        profile, _ = Profile.objects.get_or_create(user=user)
        profile_fields = ['preferred_moods', 'favorite_genres']
        profile_updated = False
        for field in profile_fields:
            if field in validated_data:
                setattr(profile, field, validated_data[field])
                profile_updated = True

        if profile_updated:
            profile.save()

        return user
