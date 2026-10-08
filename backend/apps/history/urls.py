from django.urls import path
from .views import HistoryListCreateAPIView

app_name = 'history'

urlpatterns = [
    path('', HistoryListCreateAPIView.as_view(), name='history-list-create'),
]
