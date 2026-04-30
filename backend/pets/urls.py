from django.urls import path

from .views import PetDetailView, PetListCreateView

urlpatterns = [
    path("", PetListCreateView.as_view(), name="pet-list-create"),
    path("<int:pk>/", PetDetailView.as_view(), name="pet-detail"),
]
