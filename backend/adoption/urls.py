from django.urls import path

from .views import AdoptionListingDetailView, AdoptionListingListCreateView

urlpatterns = [
    path("listings/", AdoptionListingListCreateView.as_view(), name="adoption-listings"),
    path("listings/<int:pk>/", AdoptionListingDetailView.as_view(), name="adoption-listing-detail"),
]
