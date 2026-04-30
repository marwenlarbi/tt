from django.conf import settings
from django.db import models


class AdoptionListing(models.Model):
    """Annonce d'adoption (page Adoption.jsx)."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="adoption_listings",
    )
    name = models.CharField(max_length=120)
    description = models.TextField()
    species = models.CharField(max_length=80, blank=True)
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    gender = models.CharField(max_length=40, blank=True)
    sterilized = models.CharField(max_length=40, blank=True)
    vaccinated = models.CharField(max_length=40, blank=True)
    availability = models.CharField(max_length=40, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    image = models.ImageField(upload_to="adoption/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "adoption_annonce"
        ordering = ("-created_at",)

    def __str__(self):
        return self.name
