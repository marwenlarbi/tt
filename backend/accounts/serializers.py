from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import UserProfile

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "bio",
            "address",
            "city",
            "postal_code",
            "country",
            "avatar",
            "notifications_enabled",
            "public_profile",
            "schedule",
        )
        extra_kwargs = {
            "avatar": {"required": False, "allow_null": True},
            "bio": {"required": False, "allow_blank": True},
            "address": {"required": False, "allow_blank": True},
            "city": {"required": False, "allow_blank": True},
            "postal_code": {"required": False, "allow_blank": True},
            "country": {"required": False, "allow_blank": True},
            "schedule": {"required": False, "default": dict},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        av = data.get("avatar")
        if av and request and isinstance(av, str) and av.startswith("/"):
            data["avatar"] = request.build_absolute_uri(av)
        return data


class MeSerializer(serializers.ModelSerializer):
    """Lecture / mise à jour du compte + profil (aligné usage users_pages)."""

    profile = UserProfileSerializer(required=False, allow_null=True)
    name = serializers.SerializerMethodField(read_only=True)
    join_date = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "join_date",
            "profile",
        )
        read_only_fields = ("id", "email", "role", "join_date", "name")

    def get_name(self, obj):
        full = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        if full:
            return full
        return obj.email or obj.username

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        instance = super().update(instance, validated_data)
        if profile_data is not None:
            prof, _ = UserProfile.objects.get_or_create(user=instance)
            prof_ser = UserProfileSerializer(
                prof,
                data=profile_data,
                partial=True,
                context=self.context,
            )
            prof_ser.is_valid(raise_exception=True)
            prof_ser.save()
        return instance
