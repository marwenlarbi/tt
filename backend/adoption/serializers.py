from rest_framework import serializers

from .models import AdoptionListing


class AdoptionListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdoptionListing
        fields = (
            "id",
            "owner",
            "name",
            "description",
            "species",
            "address",
            "phone",
            "gender",
            "sterilized",
            "vaccinated",
            "availability",
            "birth_date",
            "image",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "created_at", "updated_at")
