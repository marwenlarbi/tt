"""API blocage utilisateur."""

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .blocking import are_users_blocked, get_blocked_user_ids
from .chat_views import ONLINE_THRESHOLD_SEC, _avatar_url, _full_name
from .models import Follow, UserBlock, UserProfile

User = get_user_model()


class UserBlockView(APIView):
    """
    POST { "user_id": <int> } — bloquer.
    DELETE /api/user/block/<user_id>/ — débloquer (voir urls).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw = request.data.get("user_id")
        try:
            target_id = int(raw)
        except (TypeError, ValueError):
            return Response({"detail": "user_id invalide."}, status=status.HTTP_400_BAD_REQUEST)
        if target_id == request.user.id:
            return Response({"detail": "Vous ne pouvez pas vous bloquer vous-même."}, status=status.HTTP_400_BAD_REQUEST)
        target = User.objects.filter(pk=target_id, is_active=True).first()
        if not target:
            return Response({"detail": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND)
        obj, created = UserBlock.objects.get_or_create(blocker=request.user, blocked=target)
        Follow.objects.filter(
            Q(follower=request.user, following=target) | Q(follower=target, following=request.user)
        ).delete()
        return Response(
            {"blocked": True, "user_id": target_id, "created": created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    # Alias endpoint DELETE /unblock/ with body { user_id }
    def delete(self, request):
        raw = request.data.get("user_id")
        try:
            target_id = int(raw)
        except (TypeError, ValueError):
            return Response({"detail": "user_id invalide."}, status=status.HTTP_400_BAD_REQUEST)
        if target_id == request.user.id:
            return Response({"detail": "Action impossible."}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = UserBlock.objects.filter(blocker=request.user, blocked_id=target_id).delete()
        return Response({"blocked": False, "deleted": bool(deleted)}, status=status.HTTP_200_OK)


class UserUnblockView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id: int):
        if user_id == request.user.id:
            return Response({"detail": "Action impossible."}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = UserBlock.objects.filter(blocker=request.user, blocked_id=user_id).delete()
        return Response({"blocked": False, "deleted": bool(deleted)}, status=status.HTTP_200_OK)


class UserBlockStatusView(APIView):
    """GET — savoir si je bloque / suis bloqué par user_id (pour l’UI profil)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, user_id: int):
        if user_id == request.user.id:
            return Response({"i_blocked": False, "blocked_me": False, "any_block": False})
        i_blocked = UserBlock.objects.filter(blocker=request.user, blocked_id=user_id).exists()
        blocked_me = UserBlock.objects.filter(blocker_id=user_id, blocked=request.user).exists()
        return Response(
            {
                "i_blocked": i_blocked,
                "blocked_me": blocked_me,
                "any_block": i_blocked or blocked_me or are_users_blocked(request.user.id, user_id),
            }
        )


class BlockedUserIdsView(APIView):
    """GET — ensemble d’IDs bloqués (symétrique), utile cache client optionnel."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"ids": list(get_blocked_user_ids(request.user))})


class BlockedUsersView(APIView):
    """GET /blocked-users/ — utilisateurs bloqués par le user connecté."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        threshold = now - timezone.timedelta(seconds=ONLINE_THRESHOLD_SEC)
        qs = (
            UserBlock.objects.filter(blocker=request.user)
            .select_related("blocked", "blocked__profile")
            .order_by("-created_at")
        )
        out = []
        for b in qs:
            u = b.blocked
            if u.is_staff or u.is_superuser:
                continue
            try:
                ls = u.profile.last_seen_at
            except UserProfile.DoesNotExist:
                ls = None
            name = _full_name(u)
            out.append(
                {
                    "id": u.id,
                    "name": name,
                    "avatar": _avatar_url(request, u)
                    or f"https://ui-avatars.com/api/?name={name}&background=8657ff&color=fff&size=128",
                    "blocked_at": b.created_at.isoformat(),
                    "last_seen_at": ls.isoformat() if ls else None,
                    "is_online": bool(ls and ls >= threshold),
                    "is_staff": bool(u.is_staff),
                    "is_superuser": bool(u.is_superuser),
                }
            )
        return Response(out)
