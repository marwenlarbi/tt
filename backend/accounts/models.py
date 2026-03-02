

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('owner', 'Propriétaire'),
        ('vet',   'Vétérinaire'),
        ('admin', 'Administrateur'),
    )
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='owner'
    )
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)  # pour valider les vétos par ex.
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
