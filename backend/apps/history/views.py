from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse

from apps.core.responses import api_response
from apps.core.pagination import StandardResultsSetPagination
from .models import ListeningHistory
from .serializers import ListeningHistorySerializer, RecordPlaySerializer
from .services.history_service import HistoryService

class HistoryListCreateAPIView(APIView):
    """
    Event-based listening history log.
    POST records a play event. GET lists history. DELETE clears user history.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'history'

    @extend_schema(
        summary="List Listening History",
        description="Retrieve paginated listening history for current user.",
        responses={200: ListeningHistorySerializer(many=True)}
    )
    def get(self, request):
        queryset = ListeningHistory.objects.filter(user=request.user).select_related(
            'song', 'song__artist', 'song__album'
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ListeningHistorySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        summary="Record Play Event",
        description="Log an event-based song play. Increments track play count and listener minutes.",
        request=RecordPlaySerializer,
        responses={201: ListeningHistorySerializer}
    )
    def post(self, request):
        serializer = RecordPlaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entry = HistoryService.record_play_event(
            user=request.user,
            validated_data=serializer.validated_data,
        )
        return api_response(
            data=ListeningHistorySerializer(entry).data,
            message="Listening event recorded.",
            status_code=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Clear Listening History",
        description="Clear all listening history entries for current user.",
        responses={200: OpenApiResponse(description="History cleared")}
    )
    def delete(self, request):
        deleted_count = HistoryService.clear_history(request.user)
        return api_response(
            data={'clearedCount': deleted_count},
            message="Listening history cleared successfully."
        )
