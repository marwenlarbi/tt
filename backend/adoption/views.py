from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import AdoptionListing
from .serializers import AdoptionListingSerializer


class AdoptionListingListCreateView(generics.ListCreateAPIView):
    """
    Liste publique des annonces ; création réservée aux utilisateurs connectés.
    """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = AdoptionListingSerializer

    def get_queryset(self):
        return AdoptionListing.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AdoptionListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Récupère une annonce publique ; modification/suppression réservée
    au propriétaire connecté.
    """

    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = AdoptionListingSerializer

    def get_queryset(self):
        # Autorise tout le monde en lecture (GET), mais restreint PUT/PATCH/DELETE
        # aux objets dont `owner == request.user`.
        if self.request.method in permissions.SAFE_METHODS:
            return AdoptionListing.objects.all()
        return AdoptionListing.objects.filter(owner=self.request.user)

    def perform_update(self, serializer):
        """Lors d'une mise à jour, si le client envoie `clear_image`,
        on supprime le fichier image existant et on vide le champ.
        """
        instance = serializer.save()
        clear_flag = self.request.data.get("clear_image", "")
        if str(clear_flag).lower() in ("1", "true", "yes", "on"):
            try:
                if instance.image:
                    instance.image.delete(save=False)
            except Exception:
                pass
            instance.image = None
            instance.save()
