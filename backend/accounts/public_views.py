"""Vues publiques (sans rôle admin) pour l'app utilisateur : annuaire vétos, profil public."""

from django.contrib.auth import get_user_model
from django.db.models import Exists, OuterRef, Q
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .blocking import are_users_blocked, get_blocked_user_ids
from .models import Follow, UserBlock, UserProfile

User = get_user_model()


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


class FollowView(APIView):
    """Follow/Unfollow a user. POST /api/user/follow/ {user_id}"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "user_id requis"}, status=status.HTTP_400_BAD_REQUEST)
        
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        
        if target == request.user:
            return Response({"error": "Vous ne pouvez pas vous suivre vous-même"}, status=status.HTTP_400_BAD_REQUEST)

        if are_users_blocked(request.user.id, target.id):
            return Response(
                {"error": "Impossible de suivre cet utilisateur (blocage)."},
                status=status.HTTP_403_FORBIDDEN,
            )

        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target
        )
        
        if not created:
            follow.delete()
            return Response({"following": False})
        
        return Response({"following": True})


class FollowersView(APIView):
    """Get followers of a user. GET /api/user/followers/<user_id>/"""
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        
        follows = Follow.objects.filter(following=user).select_related("follower", "follower__profile")
        if request.user.is_authenticated:
            hid = get_blocked_user_ids(request.user)
            follows = follows.exclude(follower_id__in=hid)
        followers = []
        for f in follows:
            avatar = _avatar_url(request, f.follower)
            followers.append({
                "id": f.follower.id,
                "name": _full_name(f.follower),
                "avatar": avatar or f"https://ui-avatars.com/api/?name={_full_name(f.follower)}&background=8657ff&color=fff&size=128",
            })
        return Response(followers)


class FollowingView(APIView):
    """Get users that a user follows. GET /api/user/following/<user_id>/"""
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        
        follows = Follow.objects.filter(follower=user).select_related("following", "following__profile")
        if request.user.is_authenticated:
            hid = get_blocked_user_ids(request.user)
            follows = follows.exclude(following_id__in=hid)
        following = []
        for f in follows:
            avatar = _avatar_url(request, f.following)
            following.append({
                "id": f.following.id,
                "name": _full_name(f.following),
                "avatar": avatar or f"https://ui-avatars.com/api/?name={_full_name(f.following)}&background=8657ff&color=fff&size=128",
            })
        return Response(following)


class IsFollowingView(APIView):
    """Check if current user follows target. GET /api/user/is-following/<user_id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        
        is_following = Follow.objects.filter(follower=request.user, following=target).exists()
        followers_count = Follow.objects.filter(following=target).count()
        following_count = Follow.objects.filter(follower=target).count()
        blocked = are_users_blocked(request.user.id, target.id)
        i_blocked = UserBlock.objects.filter(blocker=request.user, blocked=target).exists()
        blocked_me = UserBlock.objects.filter(blocker=target, blocked=request.user).exists()

        return Response({
            "is_following": is_following,
            "followers_count": followers_count,
            "following_count": following_count,
            "can_follow": not blocked and target.id != request.user.id,
            "i_blocked": i_blocked,
            "blocked_me": blocked_me,
        })


class PublicVetDirectoryView(APIView):
    """
    Liste des vétérinaires vérifiés et actifs (annuaire public).
    GET /api/user/vets/?q=
    """

    permission_classes = [AllowAny]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        private = UserProfile.objects.filter(user_id=OuterRef("pk"), public_profile=False)
        qs = (
            User.objects.filter(role="vet", is_active=True, is_verified=True)
            .annotate(_priv=Exists(private))
            .filter(_priv=False)
            .order_by("last_name", "first_name", "id")
        )
        if q:
            qs = qs.filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(email__icontains=q)
                | Q(phone__icontains=q)
                | Q(profile__city__icontains=q)
                | Q(profile__bio__icontains=q)
            )
        out = []
        for u in qs:
            try:
                prof = u.profile
            except UserProfile.DoesNotExist:
                prof = None
            avatar = ""
            if prof and prof.avatar:
                avatar = request.build_absolute_uri(prof.avatar.url) if request else str(prof.avatar)
            
            is_following = False
            if request.user.is_authenticated:
                is_following = Follow.objects.filter(follower=request.user, following=u).exists()
            followers_count = Follow.objects.filter(following=u).count()
            
            out.append({
                "id": str(u.id),
                "name": _full_name(u),
                "city": (prof.city if prof else "") or "—",
                "phone": u.phone or "",
                "bio": (prof.bio if prof else "") or "",
                "specialty": "Médecine vétérinaire",
                "specialties": ["Médecine vétérinaire"],
                "rating": 0,
                "reviews": 0,
                "image": avatar or f"https://ui-avatars.com/api/?name={_full_name(u)}&background=8657ff&color=fff&size=256",
                "schedule": (prof.schedule if prof else {}) or {},
                "is_following": is_following,
                "followers_count": followers_count,
            })
        return Response(out)


class PublicUserProfileView(APIView):
    """
    Profil limité d'un utilisateur (fil social / modale).
    GET /api/user/profiles/<id>/
    """

    permission_classes = [AllowAny]

    def get(self, request, user_id: int):
        u = User.objects.filter(id=user_id).first()
        if not u or not u.is_active:
            return Response({"detail": "Utilisateur introuvable."}, status=404)
        try:
            prof = u.profile
        except UserProfile.DoesNotExist:
            prof = None
        if prof is not None and not prof.public_profile:
            return Response({"detail": "Profil privé."}, status=404)
        avatar = ""
        if prof and prof.avatar:
            avatar = request.build_absolute_uri(prof.avatar.url)
        
        followers_count = Follow.objects.filter(following=u).count()
        following_count = Follow.objects.filter(follower=u).count()
        
        is_following = False
        i_blocked = False
        blocked_me = False
        if request.user.is_authenticated:
            is_following = Follow.objects.filter(follower=request.user, following=u).exists()
            i_blocked = UserBlock.objects.filter(blocker=request.user, blocked=u).exists()
            blocked_me = UserBlock.objects.filter(blocker=u, blocked=request.user).exists()

        return Response({
            "id": u.id,
            "name": _full_name(u),
            "image": avatar or f"https://ui-avatars.com/api/?name={_full_name(u)}&background=8657ff&color=fff&size=256",
            "bio": (prof.bio if prof else "") or "",
            "location": ", ".join(
                x for x in [(prof.city if prof else ""), (prof.country if prof else "")] if (x or "").strip()
            )
            or "—",
            "pets": [],
            "followers": followers_count,
            "following": following_count,
            "is_following": is_following,
            "posts": 0,
            "joinDate": u.date_joined.strftime("%Y-%m-%d") if u.date_joined else "",
            "i_blocked": i_blocked,
            "blocked_me": blocked_me,
            "can_follow": request.user.is_authenticated
            and request.user.id != u.id
            and not (i_blocked or blocked_me),
        })