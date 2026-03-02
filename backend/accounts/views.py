# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError

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

        # Changement ici : utilise username = email
        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {"detail": "Identifiants incorrects"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Connexion réussie",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)