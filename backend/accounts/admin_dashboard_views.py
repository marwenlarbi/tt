from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from posts.models import Post, Report
from products.models import Order, Product

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        vets_total = User.objects.filter(role="vet").count()
        vets_pending = User.objects.filter(role="vet", is_verified=False, is_active=True).count()

        posts_total = Post.objects.count()
        reports_pending = Report.objects.filter(status__in=["pending", "investigating"]).count()

        products_total = Product.objects.count()
        products_out = Product.objects.filter(status="out_of_stock").count()
        products_low = Product.objects.filter(status="low_stock").count()

        orders_total = Order.objects.count()
        orders_pending = Order.objects.filter(status__in=["processing"]).count()
        revenue = (
            Order.objects.exclude(status="cancelled")
            .aggregate(s=Sum("total"))
            .get("s")
            or 0
        )

        return Response(
            {
                "users": {
                    "total": total_users,
                    "active": active_users,
                    "vets_total": vets_total,
                    "vets_pending": vets_pending,
                },
                "posts": {"total": posts_total, "reports_pending": reports_pending},
                "products": {
                    "total": products_total,
                    "outOfStock": products_out,
                    "lowStock": products_low,
                },
                "orders": {"total": orders_total, "pending": orders_pending, "revenue": float(revenue)},
            },
            status=status.HTTP_200_OK,
        )

