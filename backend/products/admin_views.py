import os
import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from products.models import Order, OrderItem, Product


def _store_product_image(uploaded_file):
    ext = os.path.splitext(uploaded_file.name or "")[1].lower() or ".jpg"
    filename = f"products/{uuid.uuid4().hex[:20]}{ext}"
    saved_path = default_storage.save(filename, uploaded_file)
    # DB column image is varchar(100); keep path short
    return str(saved_path)[:100]


class AdminProductsListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        status_filter = request.query_params.get("status")

        qs = Product.objects.all().order_by("-created_at")
        if q:
            qs = qs.filter(name__icontains=q) | qs.filter(description__icontains=q)
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)

        data = []
        for p in qs[:500]:
            image_url = "/products/default.jpg"
            if p.image:
                if str(p.image).startswith("http://") or str(p.image).startswith("https://"):
                    image_url = p.image
                elif str(p.image).startswith("data:"):
                    image_url = p.image
                elif str(p.image).startswith("/"):
                    image_url = request.build_absolute_uri(str(p.image))
                else:
                    # p.image stocke souvent une valeur du type `products/xxx.jpg`.
                    media_url = settings.MEDIA_URL or "/media/"
                    media_url = media_url if media_url.endswith("/") else f"{media_url}/"
                    image_url = request.build_absolute_uri(f"{media_url}{str(p.image).lstrip('/')}")

            data.append(
                {
                    "id": p.id,
                    "name": p.name,
                    "category": p.category,
                    "price": float(p.price),
                    "stock": int(p.stock),
                    "status": p.status,
                    "description": p.description,
                    "image": image_url,
                }
            )
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        payload = request.data
        image_value = payload.get("image")
        if "image_file" in request.FILES:
            image_value = _store_product_image(request.FILES["image_file"])
        elif image_value:
            image_value = str(image_value)[:100]

        p = Product(
            name=payload.get("name", ""),
            description=payload.get("description", ""),
            price=payload.get("price") or 0,
            old_price=payload.get("old_price"),
            category=payload.get("category", ""),
            brand=payload.get("brand", "N/A"),
            weight=payload.get("weight", "N/A"),
            stock=payload.get("stock") or 0,
            status=payload.get("status") or "active",
            image=image_value,
            rating=payload.get("rating") or 0,
            reviews_count=payload.get("reviews_count") or 0,
        )
        # created_at/updated_at : si la DB a default, ok; sinon on force
        from django.utils import timezone

        p.created_at = timezone.now()
        p.updated_at = timezone.now()
        p.save(force_insert=True)
        return Response({"id": p.id}, status=status.HTTP_201_CREATED)


class AdminProductDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, product_id: int):
        p = Product.objects.filter(id=product_id).first()
        if not p:
            return Response({"detail": "Produit introuvable"}, status=status.HTTP_404_NOT_FOUND)

        if "image_file" in request.FILES:
            p.image = _store_product_image(request.FILES["image_file"])

        for field in [
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
        ]:
            if field in request.data:
                value = request.data[field]
                if field == "image" and value is not None:
                    value = str(value)[:100]
                setattr(p, field, value)

        from django.utils import timezone

        p.updated_at = timezone.now()
        p.save()
        return Response({"detail": "OK"}, status=status.HTTP_200_OK)

    def delete(self, request, product_id: int):
        p = Product.objects.filter(id=product_id).first()
        if not p:
            return Response({"detail": "Produit introuvable"}, status=status.HTTP_404_NOT_FOUND)
        p.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminOrdersListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        status_filter = request.query_params.get("status")

        qs = Order.objects.all().select_related("customer").order_by("-created_at")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)
        if q:
            qs = qs.filter(customer__email__icontains=q) | qs.filter(id__icontains=q)

        out = []
        for o in qs[:500]:
            items = (
                OrderItem.objects.filter(order_id=o.id)
                .select_related("product")
                .values("product__name", "quantity", "price")
            )
            out.append(
                {
                    "id": f"CMD{o.id:03d}",
                    "orderId": o.id,
                    "customerName": (f"{o.customer.first_name} {o.customer.last_name}".strip() or o.customer.email),
                    "customerEmail": o.customer.email,
                    "customerPhone": o.phone,
                    "address": o.address,
                    "date": o.created_at.date().isoformat() if o.created_at else None,
                    "status": o.status,
                    "total": float(o.total),
                    "items": [
                        {"name": i["product__name"], "quantity": int(i["quantity"]), "price": float(i["price"])}
                        for i in items
                    ],
                }
            )
        return Response(out, status=status.HTTP_200_OK)


class AdminOrderStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, order_id: int):
        o = Order.objects.filter(id=order_id).first()
        if not o:
            return Response({"detail": "Commande introuvable"}, status=status.HTTP_404_NOT_FOUND)
        status_value = request.data.get("status")
        if status_value:
            o.status = status_value
        from django.utils import timezone

        o.updated_at = timezone.now()
        o.save()
        return Response({"detail": "OK"}, status=status.HTTP_200_OK)

