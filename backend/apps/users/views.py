from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse

from apps.core.responses import api_response
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    UpdateProfileSerializer,
)
from .services.auth_service import AuthService

class RegisterAPIView(APIView):
    """Register a new VYBE listener account."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(
        summary="Register Account",
        description="Create a new listener account and return JWT credentials with profile.",
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description="User registered successfully"),
            400: OpenApiResponse(description="Validation error"),
        }
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, tokens = AuthService.register_user(serializer.validated_data)
        return api_response(
            data={
                'user': UserSerializer(user).data,
                'tokens': tokens,
            },
            message="Account registered successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    """Authenticate with email and password."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(
        summary="User Login",
        description="Authenticate listener with email and password to receive JWT credentials.",
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description="Authentication successful"),
            401: OpenApiResponse(description="Invalid credentials"),
        }
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, tokens = AuthService.authenticate_user(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        return api_response(
            data={
                'user': UserSerializer(user).data,
                'tokens': tokens,
            },
            message="Authenticated successfully.",
        )


class RefreshTokenAPIView(APIView):
    """Obtain a new access token using a valid refresh token."""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Refresh Access Token",
        description="Submit refresh token to obtain a fresh short-lived access token.",
        request=RefreshTokenSerializer,
        responses={
            200: OpenApiResponse(description="Token refreshed"),
            401: OpenApiResponse(description="Invalid or expired token"),
        }
    )
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = AuthService.refresh_access_token(serializer.validated_data['refresh'])
        return api_response(data=tokens)


class LogoutAPIView(APIView):
    """Logout listener and blacklist refresh token."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="User Logout",
        description="Revoke and blacklist current refresh token.",
        request=RefreshTokenSerializer,
        responses={
            200: OpenApiResponse(description="Logged out"),
            400: OpenApiResponse(description="Invalid token"),
        }
    )
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.logout_user(serializer.validated_data['refresh'])
        return api_response(message="Logged out successfully.")


class UserProfileAPIView(APIView):
    """Get or update current authenticated listener profile."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get Current Profile",
        description="Retrieve profile and preferences of the authenticated listener.",
        responses={200: UserSerializer}
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_response(data=serializer.data)

    @extend_schema(
        summary="Update Profile",
        description="Update display name, avatar, bio, or mood preferences.",
        request=UpdateProfileSerializer,
        responses={200: UserSerializer}
    )
    def patch(self, request):
        serializer = UpdateProfileSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = AuthService.update_profile(request.user, serializer.validated_data)
        return api_response(
            data=UserSerializer(user).data,
            message="Profile updated successfully."
        )
