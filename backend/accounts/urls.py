# accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginView  # ← AJOUTE LoginView ICI
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),  # ← maintenant ça marche
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]