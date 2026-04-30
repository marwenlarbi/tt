# accounts/views.py
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import MeSerializer

User = get_user_model()


class RegisterView(APIView):
    """
    Inscription d'un utilisateur (propriétaire ou vétérinaire).
    Accessible sans authentification.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        # 1. Champs obligatoires
        required_fields = ['first_name', 'last_name', 'email', 'password', 'role']
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return Response(
                {"error": f"Champs obligatoires manquants : {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Confirmation du mot de passe
        if data['password'] != data.get('password_confirm'):
            return Response(
                {"error": "Les mots de passe ne correspondent pas"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Vérification unicité email
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {"error": "Cet email est déjà utilisé"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Validation du rôle
        # Compat héritage: ancien rôle "owner" -> nouveau rôle "user"
        if data.get('role') == 'owner':
            data['role'] = 'user'

        valid_roles = ['user', 'vet']  # Pas d'admin via inscription publique
        if data['role'] not in valid_roles:
            return Response(
                {"error": f"Rôle invalide. Valeurs autorisées : {', '.join(valid_roles)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Création de l'utilisateur
            user = User.objects.create_user(
                username=data['email'],           # email comme identifiant principal
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=data['role'],
                is_active=True,
                is_verified=False,                # Pour les vétos → validation admin plus tard
            )

            # Génération des tokens JWT
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Inscription réussie",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "is_verified": user.is_verified,
                },
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        except ValidationError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": f"Erreur serveur lors de la création : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Email et mot de passe requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Auth robuste : on cherche par email, puis check_password.
        # (Evitera un échec si `username` n'est pas exactement égal à `email` dans la DB.)
        # Important: dans ta DB l'email n'est pas forcément unique, donc on ne peut
        # pas utiliser `get()` (sinon 500 MultipleObjectsReturned).
        candidates = User.objects.filter(email=email).order_by("id")
        user = None
        for u in candidates:
            if u.check_password(password):
                user = u
                break

        if not user:
            return Response(
                {"detail": "Identifiants incorrects"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Robustesse admin :
        # Certains imports MySQL peuvent laisser `role` à une valeur legacy (ex: 'owner'),
        # mais l'utilisateur est admin via is_staff/is_superuser.
        effective_role = "admin" if (getattr(user, "is_superuser", False) or getattr(user, "is_staff", False)) else user.role

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Connexion réussie",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": effective_role,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class MeProfileView(APIView):
    """
    Profil de l'utilisateur connecté (JWT).
    GET /api/user/profile/ — lecture
    PATCH /api/user/profile/ — mise à jour partielle (JSON ou multipart pour avatar)
    """

    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def get(self, request):
        UserProfile.objects.get_or_create(user=request.user)
        return Response(
            MeSerializer(request.user, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        UserProfile.objects.get_or_create(user=request.user)
        profile = request.user.profile
        avatar = request.FILES.get("avatar")
        if avatar:
            profile.avatar = avatar
            profile.save()
        if request.data:
            serializer = MeSerializer(
                request.user,
                data=request.data,
                partial=True,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        if avatar or request.data:
            request.user.refresh_from_db()
        return Response(
            MeSerializer(request.user, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class VetScheduleView(APIView):
    """API pour sauvegarder les horaires du veterinario."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response({"schedule": profile.schedule or {}})

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        schedule = request.data.get("schedule", {})
        profile.schedule = schedule
        profile.save()
        return Response({"schedule": profile.schedule, "message": "Horaires enregistrés"})