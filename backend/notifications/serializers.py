from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Champs API alignés sur la spec (type, post_id, comment_id, sender)."""

    type = serializers.CharField(source="notification_type", read_only=True)
    sender_name = serializers.SerializerMethodField()
    message = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            "id",
            "type",
            "is_read",
            "created_at",
            "post_id",
            "comment_id",
            "sender_id",
            "sender_name",
            "message",
        )
        read_only_fields = fields

    def get_sender_name(self, obj):
        s = obj.sender
        if not s:
            return ""
        full = f"{s.first_name or ''} {s.last_name or ''}".strip()
        return full or (s.email or "Utilisateur")

    def get_message(self, obj):
        name = self.get_sender_name(obj)
        t = obj.notification_type
        if t == Notification.TYPE_LOVE:
            return f"{name} a adoré votre commentaire."
        if t == Notification.TYPE_LIKE and obj.comment_id:
            return f"{name} a aimé votre commentaire."
        if t == Notification.TYPE_LIKE:
            return f"{name} a aimé votre publication."
        if t == Notification.TYPE_COMMENT:
            return f"{name} a commenté votre publication."
        if t == Notification.TYPE_REPLY:
            return f"{name} a répondu à votre commentaire."
        if t == Notification.TYPE_SHARE:
            return f"{name} a partagé votre publication."
        return "Nouvelle notification."
