from django.urls import path
from .views import AIDJAPIView

app_name = 'ai'

urlpatterns = [
    path('dj/', AIDJAPIView.as_view(), name='ai-dj'),
]
