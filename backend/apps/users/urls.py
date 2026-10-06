from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    RefreshTokenAPIView,
    LogoutAPIView,
    UserProfileAPIView,
)

app_name = 'users'

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='auth-register'),
    path('login/', LoginAPIView.as_view(), name='auth-login'),
    path('refresh/', RefreshTokenAPIView.as_view(), name='auth-refresh'),
    path('logout/', LogoutAPIView.as_view(), name='auth-logout'),
    path('me/', UserProfileAPIView.as_view(), name='auth-me'),
]
