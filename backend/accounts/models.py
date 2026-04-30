from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'Propriétaire'),
        ('vet',   'Vétérinaire'),
        ('admin', 'Administrateur'),
    )
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='user'
    )
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)  # pour valider les vétos par ex.

    class Meta:
        db_table = "comptes_utilisateur"
        verbose_name = "utilisateur"
        verbose_name_plural = "utilisateurs"
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class UserProfile(models.Model):
    """Profil étendu pour les pages utilisateur (Profile.jsx, réglages)."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    bio = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    notifications_enabled = models.BooleanField(default=True)
    public_profile = models.BooleanField(default=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    schedule = models.JSONField(default=dict, blank=True)  # Horaires d'ouverture du veto

    class Meta:
        db_table = "comptes_profil_utilisateur"

    def __str__(self):
        return f"Profil {self.user_id}"


class ChatMessage(models.Model):
    """Messages privés entre deux utilisateurs (fil temps quasi réel côté client)."""

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages_sent",
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages_received",
    )
    body = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "comptes_chat_message"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["sender", "recipient", "-created_at"]),
            models.Index(fields=["recipient", "sender", "-created_at"]),
        ]

    def __str__(self):
        return f"ChatMessage {self.pk} {self.sender_id}->{self.recipient_id}"


class Follow(models.Model):
    """Relation de suivi entre utilisateurs."""

    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="following",
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="followers",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "comptes_follow"
        unique_together = ["follower", "following"]
        indexes = [
            models.Index(fields=["follower", "-created_at"]),
            models.Index(fields=["following", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.follower_id} follow {self.following_id}"


class UserBlock(models.Model):
    """`blocker` ne voit plus `blocked` et aucune interaction n'est permise entre les deux."""

    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocks_created",
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocks_received",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "comptes_user_block"
        constraints = [
            models.UniqueConstraint(fields=["blocker", "blocked"], name="comptes_user_block_blocker_blocked_uniq"),
        ]
        indexes = [
            models.Index(fields=["blocker", "-created_at"]),
            models.Index(fields=["blocked", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.blocker_id} blocked {self.blocked_id}"
