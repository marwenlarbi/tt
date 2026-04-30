from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Notification in-app (likes, réactions, commentaires, partages)."""

    TYPE_LIKE = "like"
    TYPE_LOVE = "love"
    TYPE_COMMENT = "comment"
    TYPE_REPLY = "reply"
    TYPE_SHARE = "share"

    TYPE_CHOICES = (
        (TYPE_LIKE, "like"),
        (TYPE_LOVE, "love"),
        (TYPE_COMMENT, "comment"),
        (TYPE_REPLY, "reply"),
        (TYPE_SHARE, "share"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        help_text="Destinataire",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications_sent",
    )
    notification_type = models.CharField(max_length=16, choices=TYPE_CHOICES)
    post = models.ForeignKey("posts.Post", on_delete=models.CASCADE, related_name="notifications")
    comment = models.ForeignKey(
        "posts.Comment",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "app_notifications"
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "is_read", "-created_at"]),
        ]
