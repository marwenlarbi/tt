from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem, Product


class UserOrderCreateView(APIView):
    """Créer une commande à partir du panier (client connecté)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        items = request.data.get("items")
        address = (request.data.get("address") or "").strip()
        phone = (request.data.get("phone") or "").strip()
        if not isinstance(items, list) or not items:
            return Response({"detail": "Le panier est vide."}, status=status.HTTP_400_BAD_REQUEST)
        if len(address) < 3:
            return Response({"detail": "Adresse de livraison requise."}, status=status.HTTP_400_BAD_REQUEST)
        if len(phone) < 6:
            return Response({"detail": "Numéro de téléphone requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                total = Decimal("0.00")
                lines = []
                for it in items:
                    pid = it.get("product_id")
                    qty = int(it.get("quantity") or 0)
                    if qty < 1:
                        continue
                    product = Product.objects.select_for_update().filter(id=pid).first()
                    if not product:
                        return Response(
                            {"detail": f"Produit introuvable (id {pid})."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    if product.stock < qty:
                        return Response(
                            {"detail": f"Stock insuffisant pour « {product.name} »."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    line_price = Decimal(str(product.price))
                    total += line_price * qty
                    lines.append((product, qty, line_price))

                if not lines:
                    return Response({"detail": "Aucune ligne valide."}, status=status.HTTP_400_BAD_REQUEST)

                now = timezone.now()
                order = Order.objects.create(
                    customer=request.user,
                    address=address,
                    phone=phone,
                    total=total,
                    status="processing",
                    created_at=now,
                    updated_at=now,
                )
                for product, qty, line_price in lines:
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=qty,
                        price=line_price,
                    )
                    product.stock -= qty
                    product.updated_at = now
                    product.save(update_fields=["stock", "updated_at"])

        except ValueError:
            return Response({"detail": "Quantités invalides."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"id": order.id, "total": float(order.total), "status": order.status},
            status=status.HTTP_201_CREATED,
        )


class UserOrdersListView(APIView):
    """Historique des commandes de l'utilisateur connecté."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Order.objects.filter(customer=request.user).order_by("-created_at")[:100]
        out = []
        for o in qs:
            items = OrderItem.objects.filter(order_id=o.id).select_related("product")
            out.append(
                {
                    "id": o.id,
                    "status": o.status,
                    "total": float(o.total),
                    "address": o.address,
                    "phone": o.phone,
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                    "items": [
                        {
                            "product_id": i.product_id,
                            "name": i.product.name,
                            "quantity": i.quantity,
                            "price": float(i.price),
                        }
                        for i in items
                    ],
                }
            )
        return Response(out, status=status.HTTP_200_OK)
