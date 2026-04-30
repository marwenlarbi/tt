from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """Liste paginée (léger) des notifications de l’utilisateur connecté — JWT requis."""

    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return (
            Notification.objects.filter(user=self.request.user)
            .select_related("sender", "post", "comment")
            .order_by("-created_at")[:200]
        )

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        unread = Notification.objects.filter(user=request.user, is_read=False).count()
        serializer = self.get_serializer(qs, many=True)
        return Response({"results": serializer.data, "unread_count": unread})


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk: int):
        n = Notification.objects.filter(pk=pk, user=request.user).first()
        if not n:
            return Response({"detail": "Introuvable."}, status=status.HTTP_404_NOT_FOUND)
        n.is_read = True
        n.save(update_fields=["is_read"])
        return Response(NotificationSerializer(n).data)


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"ok": True, "marked": updated})
