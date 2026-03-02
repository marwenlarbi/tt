# accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginView  # ← AJOUTE LoginView ICI

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),  # ← maintenant ça marche
]