from django.db.models import Count, Exists, OuterRef, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from accounts.blocking import are_users_blocked, get_blocked_user_ids
from accounts.models import Follow, UserBlock
from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.services import notify_new_comment, notify_post_liked

from .comment_api import build_comment_tree_response, single_comment_payload
from .models import Comment, CommentReaction, Like, Post, SavedPost
from .serializers import PostCreateSerializer, PostSerializer


def annotate_post_social(qs, user):
    qs = qs.annotate(
        like_count=Count("likes", distinct=True),
        comment_count=Count("comments", distinct=True),
    )
    if user is not None and user.is_authenticated:
        qs = qs.annotate(
            liked_by_me=Exists(Like.objects.filter(post_id=OuterRef("pk"), user_id=user.id)),
            saved_by_me=Exists(SavedPost.objects.filter(post_id=OuterRef("pk"), user_id=user.id)),
            following_author=Exists(
                Follow.objects.filter(follower_id=user.id, following_id=OuterRef("author_id"))
            ),
            interaction_blocked=Exists(
                UserBlock.objects.filter(
                    Q(blocker_id=user.id, blocked_id=OuterRef("author_id"))
                    | Q(blocker_id=OuterRef("author_id"), blocked_id=user.id)
                )
            ),
        )
    return qs


def _feed_queryset(request):
    user = request.user
    blocked = get_blocked_user_ids(user) if getattr(user, "is_authenticated", False) else frozenset()
    return (
        Post.objects.exclude(author_id__in=blocked)
        .exclude(shared_post__author_id__in=blocked)
        .select_related(
            "author",
            "author__profile",
            "shared_post",
            "shared_post__author",
            "shared_post__author__profile",
        )
        .order_by("-created_at")
    )


class PostCreateView(APIView):
    """Création d'une publication (utilisateur connecté, multipart ou JSON)."""

    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def post(self, request):
        serializer = PostCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        post = serializer.save()
        post = (
            annotate_post_social(
                Post.objects.filter(pk=post.pk).select_related(
                    "author",
                    "author__profile",
                    "shared_post",
                    "shared_post__author",
                    "shared_post__author__profile",
                ),
                request.user,
            ).first()
        )
        return Response(
            PostSerializer(post, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PostFeedView(generics.ListAPIView):
    """Fil public : publications et partages (même modèle Post, `shared_post` optionnel)."""

    permission_classes = [AllowAny]
    serializer_class = PostSerializer

    def get_queryset(self):
        return annotate_post_social(_feed_queryset(self.request), self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class PostShareCreateView(APIView):
    """POST — crée une publication de type partage (`shared_post` → publication cible)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, post_id: int):
        original = get_object_or_404(Post, pk=post_id)
        if getattr(original, "shared_post_id", None):
            return Response(
                {"detail": "Impossible de repartager un partage."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if are_users_blocked(request.user.id, original.author_id):
            return Response({"detail": "Partage impossible (blocage)."}, status=status.HTTP_403_FORBIDDEN)
        from notifications.services import notify_post_shared

        now = timezone.now()
        msg = (request.data.get("content") or request.data.get("message") or "").strip()[:5000]
        share = Post.objects.create(
            content=msg,
            type="share",
            image=None,
            video=None,
            author=request.user,
            shared_post=original,
            created_at=now,
            updated_at=now,
        )
        notify_post_shared(original_post=original, sender=request.user)
        refreshed = (
            annotate_post_social(
                Post.objects.filter(pk=share.pk).select_related(
                    "author",
                    "author__profile",
                    "shared_post",
                    "shared_post__author",
                    "shared_post__author__profile",
                ),
                request.user,
            ).first()
        )
        return Response(
            PostSerializer(refreshed, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class UserPostsListView(generics.ListAPIView):
    """Publications d’un utilisateur (profil public), masquées si blocage."""

    permission_classes = [AllowAny]
    serializer_class = PostSerializer

    def get_queryset(self):
        uid = int(self.kwargs["user_id"])
        user = self.request.user
        blocked = get_blocked_user_ids(user) if getattr(user, "is_authenticated", False) else frozenset()
        if uid in blocked:
            return Post.objects.none()
        qs = (
            Post.objects.filter(author_id=uid)
            .select_related(
                "author",
                "author__profile",
                "shared_post",
                "shared_post__author",
                "shared_post__author__profile",
            )
            .order_by("-created_at")
        )
        return annotate_post_social(qs, user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class MyPostsView(generics.ListAPIView):
    """Publications de l'utilisateur connecté."""

    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        qs = (
            Post.objects.filter(author=self.request.user)
            .select_related(
                "author",
                "author__profile",
                "shared_post",
                "shared_post__author",
                "shared_post__author__profile",
            )
            .order_by("-created_at")
        )
        return annotate_post_social(qs, self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class SavedPostsView(generics.ListAPIView):
    """Publications enregistrées par l'utilisateur connecté."""

    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        blocked = get_blocked_user_ids(self.request.user)
        qs = (
            Post.objects.filter(saved_entries__user=self.request.user)
            .exclude(author_id__in=blocked)
            .select_related(
                "author",
                "author__profile",
                "shared_post",
                "shared_post__author",
                "shared_post__author__profile",
            )
            .order_by("-created_at")
        )
        return annotate_post_social(qs, self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class PostCommentListCreateView(APIView):
    """Liste (arbre) / création de commentaires pour une publication."""

    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return super().get_permissions()

    def get(self, request, post_id: int):
        post = get_object_or_404(Post, pk=post_id)
        user = request.user
        if user.is_authenticated and are_users_blocked(user.id, post.author_id):
            return Response({"detail": "Publication indisponible."}, status=status.HTTP_403_FORBIDDEN)
        ctx = {"request": request}
        return Response(build_comment_tree_response(post_id, request.user, ctx))

    def post(self, request, post_id: int):
        post = get_object_or_404(Post, pk=post_id)
        if are_users_blocked(request.user.id, post.author_id):
            return Response({"detail": "Commentaire impossible (blocage)."}, status=status.HTTP_403_FORBIDDEN)
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "Le commentaire ne peut pas être vide."}, status=status.HTTP_400_BAD_REQUEST)
        parent_obj = None
        raw_parent = request.data.get("parent_id")
        if raw_parent is not None and raw_parent != "":
            try:
                pid = int(raw_parent)
            except (TypeError, ValueError):
                return Response({"detail": "parent_id invalide."}, status=status.HTTP_400_BAD_REQUEST)
            parent_obj = Comment.objects.filter(pk=pid, post_id=post_id).first()
            if not parent_obj:
                return Response({"detail": "Commentaire parent introuvable."}, status=status.HTTP_404_NOT_FOUND)
            if are_users_blocked(request.user.id, parent_obj.author_id):
                return Response({"detail": "Réponse impossible (blocage)."}, status=status.HTTP_403_FORBIDDEN)
            if parent_obj.parent_id is not None:
                return Response(
                    {"detail": "Un seul niveau de réponses est autorisé."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        now = timezone.now()
        c = Comment.objects.create(
            post=post,
            author=request.user,
            text=text[:5000],
            created_at=now,
            parent=parent_obj,
        )
        notify_new_comment(comment=c, post=post, sender=request.user)
        ctx = {"request": request}
        return Response(
            single_comment_payload(c, request.user, ctx),
            status=status.HTTP_201_CREATED,
        )


class PostLikeToggleView(APIView):
    """Ajoute ou retire un j'aime (authentifié)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, post_id: int):
        post = get_object_or_404(Post, pk=post_id)
        if are_users_blocked(request.user.id, post.author_id):
            return Response({"detail": "Action impossible (blocage)."}, status=status.HTTP_403_FORBIDDEN)
        now = timezone.now()
        existing = Like.objects.filter(user=request.user, post=post).first()
        if existing:
            existing.delete()
            liked = False
        else:
            Like.objects.create(user=request.user, post=post, created_at=now)
            liked = True
            notify_post_liked(post=post, sender=request.user)
        like_count = post.likes.count()
        return Response({"liked": liked, "like_count": like_count})


class PostSaveToggleView(APIView):
    """Ajoute ou retire une publication des enregistrements (authentifié)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, post_id: int):
        post = get_object_or_404(Post, pk=post_id)
        if are_users_blocked(request.user.id, post.author_id):
            return Response({"detail": "Action impossible (blocage)."}, status=status.HTTP_403_FORBIDDEN)
        existing = SavedPost.objects.filter(user=request.user, post=post).first()
        if existing:
            existing.delete()
            saved = False
        else:
            SavedPost.objects.create(user=request.user, post=post)
            saved = True
        return Response({"saved": saved})

    def delete(self, request, post_id: int):
        post = get_object_or_404(Post, pk=post_id)
        SavedPost.objects.filter(user=request.user, post=post).delete()
        return Response({"saved": False}, status=status.HTTP_204_NO_CONTENT)


class PostDetailView(APIView):
    """GET — détail public. PATCH / DELETE — auteur uniquement (texte / métadonnées)."""

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, post_id: int):
        qs = annotate_post_social(
            Post.objects.filter(pk=post_id).select_related(
                "author",
                "author__profile",
                "shared_post",
                "shared_post__author",
                "shared_post__author__profile",
            ),
            request.user,
        )
        post = qs.first()
        if not post:
            return Response({"detail": "Publication introuvable."}, status=status.HTTP_404_NOT_FOUND)
        u = request.user
        if u.is_authenticated and are_users_blocked(u.id, post.author_id):
            return Response({"detail": "Publication indisponible."}, status=status.HTTP_403_FORBIDDEN)
        return Response(PostSerializer(post, context={"request": request}).data)

    def patch(self, request, post_id: int):
        post = get_object_or_404(Post, pk=post_id)
        if post.author_id != request.user.id:
            return Response(
                {"detail": "Seul l’auteur peut modifier cette publication."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if "content" not in request.data:
            return Response({"detail": "Indiquez le champ « content »."}, status=status.HTTP_400_BAD_REQUEST)
        text = (request.data.get("content") or "").strip()[:5000]
        post_type = (post.type or "").lower()
        if not text and post_type == "text":
            return Response({"detail": "Le texte ne peut pas être vide."}, status=status.HTTP_400_BAD_REQUEST)
        post.content = text
        post.updated_at = timezone.now()
        post.save(update_fields=["content", "updated_at"])
        refreshed = (
            annotate_post_social(
                Post.objects.filter(pk=post.pk).select_related(
                    "author",
                    "author__profile",
                    "shared_post",
                    "shared_post__author",
                    "shared_post__author__profile",
                ),
                request.user,
            ).first()
        )
        return Response(PostSerializer(refreshed, context={"request": request}).data)

    def delete(self, request, post_id: int):
        post = get_object_or_404(Post, pk=post_id)
        if post.author_id != request.user.id:
            return Response(
                {"detail": "Seul l’auteur peut supprimer cette publication."},
                status=status.HTTP_403_FORBIDDEN,
            )
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentDetailView(APIView):
    """PATCH / DELETE — modifier ou supprimer un commentaire (auteur seulement)."""

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def patch(self, request, post_id: int, comment_id: int):
        c = get_object_or_404(Comment, pk=comment_id, post_id=post_id)
        if c.author_id != request.user.id:
            return Response({"detail": "Seul l’auteur peut modifier ce commentaire."}, status=status.HTTP_403_FORBIDDEN)
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "Le commentaire ne peut pas être vide."}, status=status.HTTP_400_BAD_REQUEST)
        c.text = text[:5000]
        c.save(update_fields=["text"])
        ctx = {"request": request}
        return Response(single_comment_payload(c, request.user, ctx))

    def delete(self, request, post_id: int, comment_id: int):
        c = get_object_or_404(Comment, pk=comment_id, post_id=post_id)
        if c.author_id != request.user.id:
            return Response({"detail": "Seul l’auteur peut supprimer ce commentaire."}, status=status.HTTP_403_FORBIDDEN)
        c.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentReactionToggleView(APIView):
    """
    POST — ajoute ou change la réaction (like | love) ; renvoyer le même type retire la réaction.
    DELETE — supprime la réaction de l’utilisateur connecté.
    Authentification JWT requise.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, post_id: int, comment_id: int):
        from notifications.services import notify_comment_reacted

        get_object_or_404(Post, pk=post_id)
        comment = get_object_or_404(Comment, pk=comment_id, post_id=post_id)
        if are_users_blocked(request.user.id, comment.author_id):
            return Response({"detail": "Action impossible (blocage)."}, status=status.HTTP_403_FORBIDDEN)
        rtype = (request.data.get("type") or "").strip().lower()
        if rtype not in (CommentReaction.TYPE_LIKE, CommentReaction.TYPE_LOVE):
            return Response(
                {"detail": "Indiquez « type » : « like » ou « love »."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        existing = CommentReaction.objects.filter(user=request.user, comment=comment).first()
        if existing:
            if existing.type == rtype:
                existing.delete()
            else:
                existing.type = rtype
                existing.save(update_fields=["type"])
                notify_comment_reacted(comment=comment, sender=request.user, reaction_type=rtype)
        else:
            CommentReaction.objects.create(user=request.user, comment=comment, type=rtype)
            notify_comment_reacted(comment=comment, sender=request.user, reaction_type=rtype)
        like_count = CommentReaction.objects.filter(comment=comment, type=CommentReaction.TYPE_LIKE).count()
        love_count = CommentReaction.objects.filter(comment=comment, type=CommentReaction.TYPE_LOVE).count()
        mine = (
            CommentReaction.objects.filter(user=request.user, comment=comment)
            .values_list("type", flat=True)
            .first()
        )
        return Response({"like_count": like_count, "love_count": love_count, "my_reaction": mine})

    def delete(self, request, post_id: int, comment_id: int):
        get_object_or_404(Post, pk=post_id)
        comment = get_object_or_404(Comment, pk=comment_id, post_id=post_id)
        if are_users_blocked(request.user.id, comment.author_id):
            return Response({"detail": "Action impossible (blocage)."}, status=status.HTTP_403_FORBIDDEN)
        CommentReaction.objects.filter(user=request.user, comment=comment).delete()
        like_count = CommentReaction.objects.filter(comment=comment, type=CommentReaction.TYPE_LIKE).count()
        love_count = CommentReaction.objects.filter(comment=comment, type=CommentReaction.TYPE_LOVE).count()
        return Response({"like_count": like_count, "love_count": love_count, "my_reaction": None})
