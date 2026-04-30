import os
import uuid

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.utils import timezone
from rest_framework import serializers

from accounts.models import Follow, UserProfile
from .models import Comment, Post, SavedPost

User = get_user_model()


class PostAuthorSerializer(serializers.ModelSerializer):
    """Auteur de post/commentaire : initiales côté front si `avatar` est null."""

    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "avatar")

    def get_avatar(self, obj):
        request = self.context.get("request")
        try:
            prof = obj.profile
        except UserProfile.DoesNotExist:
            prof = None
        if not prof or not prof.avatar:
            return None
        try:
            url = prof.avatar.url
        except ValueError:
            return None
        if url and request and url.startswith("/"):
            return request.build_absolute_uri(url)
        return url


class PostEmbedSerializer(serializers.ModelSerializer):
    """Publication citée dans un partage : pas de compteurs ni d’états sociaux."""

    author = PostAuthorSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ("id", "content", "type", "image", "video", "created_at", "updated_at", "author")
        read_only_fields = fields


class CommentSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "text", "created_at", "author")
        read_only_fields = fields


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    shared_post = PostEmbedSerializer(read_only=True)
    is_share = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()
    saved_by_me = serializers.SerializerMethodField()
    is_following_author = serializers.SerializerMethodField()
    interaction_blocked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "content",
            "type",
            "image",
            "video",
            "created_at",
            "updated_at",
            "author",
            "shared_post",
            "is_share",
            "like_count",
            "comment_count",
            "liked_by_me",
            "saved_by_me",
            "is_following_author",
            "interaction_blocked",
        )
        read_only_fields = fields

    def get_is_share(self, obj):
        return bool(getattr(obj, "shared_post_id", None))

    def get_like_count(self, obj):
        if hasattr(obj, "like_count"):
            return int(obj.like_count)
        return obj.likes.count()

    def get_comment_count(self, obj):
        if hasattr(obj, "comment_count"):
            return int(obj.comment_count)
        return obj.comments.count()

    def get_liked_by_me(self, obj):
        v = getattr(obj, "liked_by_me", None)
        if v is not None:
            return bool(v)
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not user or not user.is_authenticated:
            return False
        from .models import Like

        return Like.objects.filter(post_id=obj.pk, user_id=user.id).exists()

    def get_saved_by_me(self, obj):
        v = getattr(obj, "saved_by_me", None)
        if v is not None:
            return bool(v)
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not user or not user.is_authenticated:
            return False
        return SavedPost.objects.filter(post_id=obj.pk, user_id=user.id).exists()

    def get_is_following_author(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not user or not user.is_authenticated or not obj.author_id or obj.author_id == user.id:
            return False
        v = getattr(obj, "following_author", None)
        if v is not None:
            return bool(v)
        return Follow.objects.filter(follower_id=user.id, following_id=obj.author_id).exists()

    def get_interaction_blocked(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not user or not user.is_authenticated or not obj.author_id:
            return False
        v = getattr(obj, "interaction_blocked", None)
        if v is not None:
            return bool(v)
        from accounts.blocking import are_users_blocked

        return are_users_blocked(user.id, obj.author_id)


class PostCreateSerializer(serializers.Serializer):
    content = serializers.CharField(allow_blank=True, max_length=5000, required=False, default="")
    type = serializers.ChoiceField(choices=("text", "image", "video", "share"))
    image = serializers.ImageField(required=False, allow_null=True)
    video = serializers.FileField(required=False, allow_null=True)
    shared_post_id = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, attrs):
        t = attrs.get("type")
        shared_post_id = attrs.get("shared_post_id")
        if t == "share" or shared_post_id:
            if not shared_post_id:
                raise serializers.ValidationError(
                    {"shared_post_id": "Indiquez la publication à partager."}
                )
            orig = Post.objects.filter(pk=shared_post_id).first()
            if not orig:
                raise serializers.ValidationError({"shared_post_id": "Publication introuvable."})
            if getattr(orig, "shared_post_id", None):
                raise serializers.ValidationError(
                    {"shared_post_id": "Impossible de repartager un partage."}
                )
            attrs["type"] = "share"
            attrs["shared_post_id"] = shared_post_id
            return attrs
        if t == "image" and not attrs.get("image"):
            raise serializers.ValidationError(
                {"image": "Une image est requise pour ce type de publication."}
            )
        if t == "video" and not attrs.get("video"):
            raise serializers.ValidationError(
                {"video": "Une vidéo est requise pour ce type de publication."}
            )
        if t == "text" and not (attrs.get("content") or "").strip():
            raise serializers.ValidationError({"content": "Le texte ne peut pas être vide."})
        return attrs

    def create(self, validated_data):
        from notifications.services import notify_post_shared

        request = self.context["request"]
        user = request.user
        now = timezone.now()
        image_file = validated_data.pop("image", None)
        video_file = validated_data.pop("video", None)
        shared_post_id = validated_data.pop("shared_post_id", None)
        img_path = None
        vid_path = None
        if image_file:
            ext = os.path.splitext(image_file.name or "")[1].lower()[:8] or ".jpg"
            key = f"posts/i{uuid.uuid4().hex[:10]}{ext}"
            img_path = str(default_storage.save(key, image_file))[:100]
        if video_file:
            ext = os.path.splitext(video_file.name or "")[1].lower()[:8] or ".mp4"
            key = f"posts/v{uuid.uuid4().hex[:10]}{ext}"
            vid_path = str(default_storage.save(key, video_file))[:100]

        if shared_post_id:
            orig = Post.objects.filter(pk=shared_post_id).first()
            post = Post.objects.create(
                content=(validated_data.get("content") or "").strip(),
                type="share",
                image=None,
                video=None,
                author=user,
                shared_post=orig,
                created_at=now,
                updated_at=now,
            )
            if orig:
                notify_post_shared(original_post=orig, sender=user)
            return post

        post = Post.objects.create(
            content=(validated_data.get("content") or "").strip(),
            type=validated_data["type"],
            image=img_path,
            video=vid_path,
            author=user,
            created_at=now,
            updated_at=now,
        )
        return post
