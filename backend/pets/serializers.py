from rest_framework import serializers

from .models import Pet


class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = (
            "id",
            "uid",
            "name",
            "address",
            "species",
            "gender",
            "sterilized",
            "birth_date",
            "vaccines",
            "photo",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
