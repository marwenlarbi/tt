from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')), 
    path('/admin_pages/AdminDashboard/', admin.site.urls),
      # ← c'est cette ligne qui importe accounts.urls
    # Plus tard tu ajouteras :
    # path('api/pets/', include('pets.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)