from django.conf import settings
from django.db import models


class Pet(models.Model):
    """Animal de compagnie du propriétaire (page pets / profil)."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_pets",
    )
    uid = models.CharField(max_length=64, blank=True)
    name = models.CharField(max_length=120)
    address = models.CharField(max_length=255, blank=True)
    species = models.CharField(max_length=80, blank=True)
    gender = models.CharField(max_length=40, blank=True)
    sterilized = models.CharField(max_length=40, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    vaccines = models.TextField(blank=True)
    photo = models.ImageField(upload_to="pets/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pets_animal"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.name} ({self.owner_id})"
