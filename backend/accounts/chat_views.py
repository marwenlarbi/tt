"""Présence (last seen) et messagerie privée entre utilisateurs."""

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .blocking import are_users_blocked, get_blocked_user_ids
from .models import ChatMessage, Follow, UserProfile

User = get_user_model()

# Considéré « en ligne » si activité dans les N dernières secondes (style Facebook)
ONLINE_THRESHOLD_SEC = 120


def _visible_users_queryset(for_user):
    hidden_ids = get_blocked_user_ids(for_user)
    return (
        User.objects.filter(is_active=True, is_staff=False, is_superuser=False)
        .exclude(pk=for_user.pk)
        .exclude(pk__in=hidden_ids)
    )


def _full_name(user):
    n = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return n or user.email or user.username


def _avatar_url(request, user):
    try:
        prof = user.profile
    except UserProfile.DoesNotExist:
        prof = None
    if prof and prof.avatar:
        try:
            u = prof.avatar.url
        except ValueError:
            return ""
        if request and u.startswith("/"):
            return request.build_absolute_uri(u)
        return u
    return ""


class PresencePingView(APIView):
    """POST — met à jour last_seen pour l’utilisateur connecté (heartbeat)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        prof, _ = UserProfile.objects.get_or_create(user=request.user)
        prof.last_seen_at = timezone.now()
        prof.save(update_fields=["last_seen_at"])
        return Response({"ok": True})


class PresenceDirectoryView(APIView):
    """
    GET — liste d’utilisateurs avec statut en ligne / dernière activité.
    Tri : en ligne en premier, puis plus récemment actifs.
    ?q= filtre optionnel sur le nom ou l’email.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip().lower()
        now = timezone.now()
        threshold = now - timezone.timedelta(seconds=ONLINE_THRESHOLD_SEC)

        qs = (
            _visible_users_queryset(request.user)
            .select_related("profile")
            .order_by("id")[:300]
        )
        rows = []
        for u in qs:
            name = _full_name(u)
            if q and q not in name.lower() and q not in (u.email or "").lower():
                continue
            try:
                prof = u.profile
                ls = prof.last_seen_at
            except UserProfile.DoesNotExist:
                ls = None
            is_online = bool(ls and ls >= threshold)
            rows.append(
                {
                    "id": u.id,
                    "name": name,
                    "avatar": _avatar_url(request, u)
                        or f"https://ui-avatars.com/api/?name={name}&background=8657ff&color=fff&size=128",
                    "last_seen_at": ls.isoformat() if ls else None,
                    "is_online": is_online,
                }
            )

        # En ligne en haut ; hors ligne triés par dernière activité (plus récent en haut du bloc gris)
        online = [r for r in rows if r["is_online"]]
        offline = [r for r in rows if not r["is_online"]]
        offline.sort(key=lambda r: r["last_seen_at"] or "", reverse=True)
        return Response(online + offline)


class FollowedPresenceSplitView(APIView):
    """
    Utilisateurs que vous suivez, scindés en propriétaires d’animaux et vétérinaires,
    avec statut en ligne (même logique que l’annuaire présence).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        followed_ids = list(
            Follow.objects.filter(follower=me).values_list("following_id", flat=True)
        )
        if not followed_ids:
            return Response({"owners": [], "vets": []})

        now = timezone.now()
        threshold = now - timezone.timedelta(seconds=ONLINE_THRESHOLD_SEC)

        qs = (
            _visible_users_queryset(me)
            .filter(id__in=followed_ids)
            .select_related("profile")
            .order_by("id")
        )
        owners = []
        vets = []

        for u in qs:
            try:
                prof = u.profile
                ls = prof.last_seen_at
            except UserProfile.DoesNotExist:
                ls = None
            is_online = bool(ls and ls >= threshold)
            name = _full_name(u)
            row = {
                "id": u.id,
                "name": name,
                "avatar": _avatar_url(request, u)
                or f"https://ui-avatars.com/api/?name={name}&background=8657ff&color=fff&size=128",
                "last_seen_at": ls.isoformat() if ls else None,
                "is_online": is_online,
                "role": u.role,
            }
            if u.role == "vet":
                vets.append(row)
            else:
                owners.append(row)

        def presence_sort(rows):
            on = [r for r in rows if r["is_online"]]
            off = [r for r in rows if not r["is_online"]]
            off.sort(key=lambda r: r["last_seen_at"] or "", reverse=True)
            return on + off

        return Response({"owners": presence_sort(owners), "vets": presence_sort(vets)})


class ChatPartnersView(APIView):
    """GET — conversations (un entrée par interlocuteur), dernière activité en premier."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        hid = get_blocked_user_ids(me)
        hidden_admin_ids = set(
            User.objects.filter(is_staff=True).values_list("id", flat=True)
        ) | set(User.objects.filter(is_superuser=True).values_list("id", flat=True))
        msgs = (
            ChatMessage.objects.filter(Q(sender=me) | Q(recipient=me))
            .select_related("sender", "recipient", "sender__profile", "recipient__profile")
            .order_by("-created_at")[:800]
        )
        seen = set()
        out = []
        for m in msgs:
            other = m.recipient if m.sender_id == me.id else m.sender
            oid = other.id
            if oid in hid:
                continue
            if oid in hidden_admin_ids:
                continue
            if oid in seen:
                continue
            seen.add(oid)
            unread = ChatMessage.objects.filter(sender=other, recipient=me, read_at__isnull=True).count()
            out.append(
                {
                    "user_id": oid,
                    "name": _full_name(other),
                    "avatar": _avatar_url(request, other)
                    or f"https://ui-avatars.com/api/?name={_full_name(other)}&background=8657ff&color=fff&size=128",
                    "last_message": (m.body or "")[:200],
                    "last_message_at": m.created_at.isoformat(),
                    "unread": unread,
                }
            )
        return Response(out)


def _serialize_msg(m):
    return {
        "id": m.id,
        "sender_id": m.sender_id,
        "text": m.body,
        "created_at": m.created_at.isoformat(),
    }


class ChatThreadView(APIView):
    """
    GET — messages avec user_id (marque comme lus ceux reçus).
    POST — envoyer { "text": "..." }.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, user_id: int):
        me = request.user
        other = get_object_or_404(User, pk=user_id, is_active=True, is_staff=False, is_superuser=False)
        if other.id == me.id:
            return Response({"detail": "Action impossible."}, status=400)
        if are_users_blocked(me.id, other.id):
            return Response({"detail": "Conversation indisponible."}, status=status.HTTP_403_FORBIDDEN)
        ChatMessage.objects.filter(sender=other, recipient=me, read_at__isnull=True).update(
            read_at=timezone.now()
        )
        qs = (
            ChatMessage.objects.filter(Q(sender=me, recipient=other) | Q(sender=other, recipient=me))
            .order_by("created_at")[:500]
        )
        return Response([_serialize_msg(m) for m in qs])

    def post(self, request, user_id: int):
        me = request.user
        other = get_object_or_404(User, pk=user_id, is_active=True, is_staff=False, is_superuser=False)
        if other.id == me.id:
            return Response({"detail": "Action impossible."}, status=400)
        if are_users_blocked(me.id, other.id):
            return Response({"detail": "Message impossible (blocage)."}, status=status.HTTP_403_FORBIDDEN)
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "Message vide."}, status=400)
        m = ChatMessage.objects.create(sender=me, recipient=other, body=text[:5000])
        return Response(_serialize_msg(m), status=201)

    def delete(self, request, user_id: int):
        me = request.user
        other = get_object_or_404(User, pk=user_id, is_active=True, is_staff=False, is_superuser=False)
        if other.id == me.id:
            return Response({"detail": "Action impossible."}, status=400)
        deleted, _ = ChatMessage.objects.filter(
            Q(sender=me, recipient=other) | Q(sender=other, recipient=me)
        ).delete()
        return Response({"deleted_messages": deleted}, status=status.HTTP_200_OK)


class ChatMessageDetailView(APIView):
    """
    PATCH /chat/message/<id>/ — modifier son propre message.
    DELETE /chat/message/<id>/ — supprimer son propre message.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, message_id: int):
        msg = get_object_or_404(ChatMessage, pk=message_id)
        if msg.sender_id != request.user.id:
            return Response({"detail": "Action non autorisée."}, status=status.HTTP_403_FORBIDDEN)
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "Message vide."}, status=status.HTTP_400_BAD_REQUEST)
        msg.body = text[:5000]
        msg.save(update_fields=["body"])
        return Response(_serialize_msg(msg), status=status.HTTP_200_OK)

    def delete(self, request, message_id: int):
        msg = get_object_or_404(ChatMessage, pk=message_id)
        if msg.sender_id != request.user.id:
            return Response({"detail": "Action non autorisée."}, status=status.HTTP_403_FORBIDDEN)
        msg.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserSearchView(APIView):
    """GET /users/search?q=... — recherche d'utilisateurs visibles par nom."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        if not q:
            return Response([])

        q_lower = q.lower()
        now = timezone.now()
        threshold = now - timezone.timedelta(seconds=ONLINE_THRESHOLD_SEC)
        users = (
            _visible_users_queryset(request.user)
            .filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(username__icontains=q)
                | Q(email__icontains=q)
            )
            .select_related("profile")
            .order_by("first_name", "last_name", "username")[:40]
        )

        out = []
        for u in users:
            name = _full_name(u)
            if q_lower not in name.lower():
                continue
            try:
                ls = u.profile.last_seen_at
            except UserProfile.DoesNotExist:
                ls = None
            out.append(
                {
                    "id": u.id,
                    "name": name,
                    "avatar": _avatar_url(request, u)
                    or f"https://ui-avatars.com/api/?name={name}&background=8657ff&color=fff&size=128",
                    "last_seen_at": ls.isoformat() if ls else None,
                    "is_online": bool(ls and ls >= threshold),
                    "is_staff": bool(u.is_staff),
                    "is_superuser": bool(u.is_superuser),
                }
            )
        return Response(out)
