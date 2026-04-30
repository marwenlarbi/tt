from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Autorise uniquement les utilisateurs dont `role == "admin"`.
    """

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return getattr(user, "role", None) == "admin" or getattr(user, "is_superuser", False)

