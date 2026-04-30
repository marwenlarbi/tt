from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/admin/", include("accounts.admin_urls")),
    path("api/user/", include("accounts.user_urls")),
    path("api/posts/", include("posts.urls")),
    path("api/products/", include("products.urls")),
    path("api/pets/", include("pets.urls")),
    path("api/adoption/", include("adoption.urls")),
    path("api/vet/", include("appointments.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)