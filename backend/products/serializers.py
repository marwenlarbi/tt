from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "price",
            "old_price",
            "category",
            "brand",
            "weight",
            "stock",
            "status",
            "image",
            "rating",
            "reviews_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
