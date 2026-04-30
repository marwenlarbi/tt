from django.urls import path

from .user_views import UserOrderCreateView, UserOrdersListView
from .views import ProductDetailView, ProductListView

urlpatterns = [
    path("", ProductListView.as_view(), name="product-list"),
    path("orders/mine/", UserOrdersListView.as_view(), name="user-orders-mine"),
    path("orders/", UserOrderCreateView.as_view(), name="user-order-create"),
    path("<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
]
