from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db import IntegrityError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdminRole

User = get_user_model()


def _user_full_name(user: User) -> str:
    name = " ".join([user.first_name or "", user.last_name or ""]).strip()
    return name or user.email or user.username


def _computed_status(user: User) -> str:
    """
    Harmonise l'état backend vers ce que l'UI admin utilise.
    On n'a pas un champ "status" dédié, donc on le déduit :
    - vets : pending/verified/suspended
    - users/admin : active/suspended
    """
    if user.role == "vet":
        # Pour les vétos, on distingue suspended vs rejected via (is_active, is_verified)
        if not user.is_active:
            return "rejected" if not user.is_verified else "suspended"
        return "verified" if user.is_verified else "pending"

    # "owner" est une valeur legacy ; on la considère comme "user"
    if user.role in ("user", "owner"):
        if not user.is_active:
            return "suspended"
        # Pour l'UI admin: pending = actif mais pas "vérifié"
        return "active" if user.is_verified else "pending"

    if user.role == "admin":
        # Un admin est actif tant que is_active=True (on ignore is_verified pour l'UI)
        return "active" if user.is_active else "suspended"

    # fallback
    return "active" if user.is_active else "suspended"


class AdminUsersListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        role = request.query_params.get("role")  # user|vet|admin
        status_filter = request.query_params.get("status")  # active|pending|verified|suspended
        q = request.query_params.get("q", "").strip()

        users = User.objects.all().order_by("-date_joined")

        if role:
            if role == "user":
                users = users.filter(role__in=["user", "owner"])  # legacy compat
            else:
                users = users.filter(role=role)

        if q:
            users = users.filter(
                Q(email__icontains=q)
                | Q(username__icontains=q)
                | Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(phone__icontains=q)
            )

        # filtrage "status" calculé (car pas stocké en DB)
        result = []
        for u in users:
            computed = _computed_status(u)
            if status_filter and computed != status_filter:
                continue
            # Note: le frontend admin utilise beaucoup de champs "UI".
            # Comme on n'a pas (encore) de tables de profil séparées côté backend,
            # on renvoie des valeurs par défaut pour éviter des crashs côté React.
            is_vet = u.role == "vet"
            specialty = getattr(u, "specialty", "") or "Non spécifié"
            result.append(
                {
                    "id": u.id,
                    "name": _user_full_name(u),
                    "email": u.email,
                    "phone": u.phone or "",
                    "address": getattr(u, "address", "") or "Adresse non spécifiée",
                    "city": getattr(u, "city", "") or "Non spécifié",
                    "role": u.role,
                    "status": computed,
                    "is_active": u.is_active,
                    "is_verified": u.is_verified,
                    "joinDate": u.date_joined.date().isoformat() if u.date_joined else None,
                    "lastLogin": u.last_login.date().isoformat() if getattr(u, "last_login", None) else "-",
                    # champs attendus par AdminUsers.jsx
                    "posts": 0,
                    "pets": 0,
                    "avatar": "/users/default.jpg",
                    # champs attendus par AdminVets.jsx
                    "specialty": specialty,
                    "specialties": [] if specialty == "Non spécifié" else [specialty],
                    "licenseNumber": getattr(u, "licenseNumber", "") or "",
                    "experience": getattr(u, "experience", "") or 0,
                    "education": getattr(u, "education", "") or "",
                    "rating": 0,
                    "reviews": 0,
                    "consultations": 0,
                    "image": "/api/placeholder/150/150",
                    "languages": ["Français"],
                    "schedule": {},
                    # on conserve des champs "vétérinaire" explicites si le frontend en a besoin
                    "isVet": is_vet,
                }
            )

        return Response(result, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def _apply_status_to_user(self, user: User, data: dict):
        """
        Le frontend admin envoie souvent `status` (active/suspended/pending ou vet verified/pending/suspended/rejected).
        On convertit ces statuts vers `is_active` + `is_verified`.
        """
        status_value = data.get("status")
        if not status_value:
            return

        target_role = data.get("role") or user.role

        if target_role == "vet":
            mapping = {
                # Compat front: AdminUsers utilise parfois "active" au lieu de "verified"
                "active": {"is_verified": True, "is_active": True},
                "verified": {"is_verified": True, "is_active": True},
                "pending": {"is_verified": False, "is_active": True},
                "suspended": {"is_verified": True, "is_active": False},
                "rejected": {"is_verified": False, "is_active": False},
            }
            mapped = mapping.get(status_value)
            if mapped:
                user.is_verified = mapped["is_verified"]
                user.is_active = mapped["is_active"]
            return

        # user/admin
        # - pending = actif mais pas "vérifié" (is_verified=False)
        mapping = {
            "active": {"is_active": True, "is_verified": True},
            "suspended": {"is_active": False, "is_verified": False},
            "pending": {"is_active": True, "is_verified": False},
        }
        mapped = mapping.get(status_value)
        if mapped:
            user.is_active = mapped["is_active"]
            if "is_verified" in mapped:
                user.is_verified = mapped["is_verified"]

    def patch(self, request, user_id: int):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data

        # Compat legacy
        if data.get("role") == "owner":
            data["role"] = "user"

        # Convertit `status` si fourni
        self._apply_status_to_user(user, data)

        allowed_fields = {
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
            "is_verified",
            "email",
        }
        for key in list(data.keys()):
            if key not in allowed_fields:
                data.pop(key, None)

        # Ne pas laisser le PATCH écraser `is_active/is_verified` si status fourni a déjà mappé :
        # on applique les champs autorisés ci-dessus, donc on peut continuer.

        # email doit rester unique
        if "email" in data and data["email"] and data["email"] != user.email:
            if User.objects.filter(email=data["email"]).exclude(id=user.id).exists():
                return Response({"detail": "Cet email est déjà utilisé"}, status=status.HTTP_400_BAD_REQUEST)

        for field, value in data.items():
            setattr(user, field, value)

        try:
            user.save()
        except IntegrityError:
            return Response({"detail": "Erreur d'intégrité"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "id": user.id,
                "name": _user_full_name(user),
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "status": _computed_status(user),
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, user_id: int):
        if user_id == request.user.id:
            return Response(
                {"detail": "Action refusée : impossible de supprimer ton propre compte"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminUserActivateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, user_id: int):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = True
        # Pour l'UI admin: actif = is_verified=True (pour les roles user/admin)
        if user.role in ("user", "owner", "admin"):
            user.is_verified = True
        user.save()
        return Response({"detail": "Utilisateur activé"}, status=status.HTTP_200_OK)


class AdminUserSuspendView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, user_id: int):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"detail": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = False
        if user.role in ("user", "owner", "admin"):
            user.is_verified = False
        user.save()
        return Response({"detail": "Utilisateur suspendu"}, status=status.HTTP_200_OK)


class AdminUserCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        data = request.data

        email = (data.get("email") or "").strip()
        phone = (data.get("phone") or "").strip()
        role = data.get("role")
        status_value = data.get("status")  # optionnel (frontend)

        if not email:
            return Response({"detail": "Email requis"}, status=status.HTTP_400_BAD_REQUEST)
        if not role:
            return Response({"detail": "role requis"}, status=status.HTTP_400_BAD_REQUEST)

        # Compat legacy
        if role == "owner":
            role = "user"

        if role not in ("user", "vet", "admin"):
            return Response({"detail": "role invalide"}, status=status.HTTP_400_BAD_REQUEST)

        first_name = (data.get("first_name") or "").strip()
        last_name = (data.get("last_name") or "").strip()
        name = (data.get("name") or "").strip()
        if name and (not first_name or not last_name):
            parts = [p for p in name.split(" ") if p]
            if parts:
                first_name = first_name or parts[0]
                last_name = last_name or " ".join(parts[1:]) if len(parts) > 1 else ""

        if User.objects.filter(email=email).exists():
            return Response({"detail": "Cet email est déjà utilisé"}, status=status.HTTP_400_BAD_REQUEST)

        # Crée un mot de passe aléatoire (les comptes admin peuvent ensuite changer)
        # Pour un vrai projet, on ajoutera un système d'envoi d'email/activation.
        user = User.objects.create_user(
            username=email,
            email=email,
            password="ChangeMe123!@#",
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_active=True,
            is_verified=False,
        )

        # Mappage status -> is_active/is_verified
        if status_value:
            status_mapper = AdminUserDetailView()
            status_mapper._apply_status_to_user(user, {"role": role, "status": status_value})

        if phone:
            user.phone = phone
            user.save()

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "status": _computed_status(user),
            },
            status=status.HTTP_201_CREATED,
        )


class AdminVetVerifyView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, vet_id: int):
        vet = User.objects.filter(id=vet_id, role="vet").first()
        if not vet:
            return Response({"detail": "Vétérinaire introuvable"}, status=status.HTTP_404_NOT_FOUND)

        vet.is_verified = True
        vet.is_active = True
        vet.save()
        return Response({"detail": "Vétérinaire vérifié"}, status=status.HTTP_200_OK)


class AdminVetSuspendView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, vet_id: int):
        vet = User.objects.filter(id=vet_id, role="vet").first()
        if not vet:
            return Response({"detail": "Vétérinaire introuvable"}, status=status.HTTP_404_NOT_FOUND)

        vet.is_active = False
        vet.save()
        return Response({"detail": "Vétérinaire suspendu"}, status=status.HTTP_200_OK)


class AdminVetRejectView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, vet_id: int):
        vet = User.objects.filter(id=vet_id, role="vet").first()
        if not vet:
            return Response({"detail": "Vétérinaire introuvable"}, status=status.HTTP_404_NOT_FOUND)

        vet.is_verified = False
        vet.is_active = False
        vet.save()
        return Response({"detail": "Demande rejetée"}, status=status.HTTP_200_OK)

