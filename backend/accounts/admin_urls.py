from django.urls import path

from .admin_views import (
    AdminUserDetailView,
    AdminUserActivateView,
    AdminUserSuspendView,
    AdminUserCreateView,
    AdminUsersListView,
    AdminVetRejectView,
    AdminVetSuspendView,
    AdminVetVerifyView,
)
from .admin_dashboard_views import AdminDashboardView
from posts.admin_views import (
    AdminPostDetailView,
    AdminPostsListView,
    AdminReportDetailView,
    AdminReportsListView,
)
from products.admin_views import (
    AdminOrderStatusView,
    AdminOrdersListView,
    AdminProductDetailView,
    AdminProductsListCreateView,
)

urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("users/", AdminUsersListView.as_view(), name="admin-users-list"),
    path("users/create/", AdminUserCreateView.as_view(), name="admin-users-create"),
    path("users/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("users/<int:user_id>/activate/", AdminUserActivateView.as_view(), name="admin-user-activate"),
    path("users/<int:user_id>/suspend/", AdminUserSuspendView.as_view(), name="admin-user-suspend"),
    path("vets/<int:vet_id>/verify/", AdminVetVerifyView.as_view(), name="admin-vet-verify"),
    path("vets/<int:vet_id>/suspend/", AdminVetSuspendView.as_view(), name="admin-vet-suspend"),
    path("vets/<int:vet_id>/reject/", AdminVetRejectView.as_view(), name="admin-vet-reject"),
    path("posts/", AdminPostsListView.as_view(), name="admin-posts"),
    path("posts/<int:post_id>/", AdminPostDetailView.as_view(), name="admin-post-detail"),
    path("reports/", AdminReportsListView.as_view(), name="admin-reports"),
    path("reports/<int:report_id>/", AdminReportDetailView.as_view(), name="admin-report-detail"),
    path("products/", AdminProductsListCreateView.as_view(), name="admin-products"),
    path("products/<int:product_id>/", AdminProductDetailView.as_view(), name="admin-product-detail"),
    path("orders/", AdminOrdersListView.as_view(), name="admin-orders"),
    path("orders/<int:order_id>/status/", AdminOrderStatusView.as_view(), name="admin-order-status"),
]

