from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse

from apps.core.responses import api_response, api_error
from .serializers import AIDJRequestSerializer, AIDJResponseSerializer
from .services.gemini_service import GeminiService


class AIDJAPIView(APIView):
    """
    AI DJ endpoint powered by Google Gemini and YouTube Music catalog.
    Takes a natural language vibe/scenario prompt, generates Gen-Z DJ commentary,
    detects mood, and curates a personalized set of playable tracks.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai_dj'

    @extend_schema(
        operation_id="ai_dj_generate_session",
        summary="Generate AI DJ Session",
        description="Generates an AI DJ session with commentary, mood styling, and a playable track list matching the listener's prompt.",
        request=AIDJRequestSerializer,
        responses={
            200: AIDJResponseSerializer,
            400: OpenApiResponse(description="Invalid prompt"),
        }
    )
    def post(self, request):
        serializer = AIDJRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data['prompt']
        mood_override = serializer.validated_data.get('mood')
        limit = serializer.validated_data.get('limit', 10)

        session = GeminiService.generate_dj_session(
            prompt=prompt,
            mood_override=mood_override,
            limit=limit,
            user=request.user,
        )

        return api_response(
            data=session,
            message="AI DJ session generated successfully."
        )
