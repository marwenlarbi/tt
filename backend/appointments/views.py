from datetime import date
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment, Consultation, Prescription
from .serializers import (
    AppointmentSerializer,
    ConsultationSerializer,
    PrescriptionSerializer,
)
from pets.models import Pet


class VetDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()

        appointments_today = Appointment.objects.filter(
            vet=user,
            date=today
        ).count()
        appointments_pending = Appointment.objects.filter(
            vet=user,
            status="pending"
        ).count()
        appointments_done = Appointment.objects.filter(
            vet=user,
            date=today,
            status="completed"
        ).count()

        pet_ids = Appointment.objects.filter(vet=user).values_list("pet_id", flat=True).distinct()
        patients_total = Pet.objects.filter(id__in=pet_ids).count()
        patients_new = Pet.objects.filter(
            id__in=pet_ids,
            created_at__month=today.month,
            created_at__year=today.year
        ).count()

        consultations_total = Consultation.objects.filter(vet=user).count()
        consultations_month = Consultation.objects.filter(
            vet=user,
            created_at__month=today.month,
            created_at__year=today.year
        ).count()

        return Response({
            "appointments": {
                "total": appointments_today,
                "pending": appointments_pending,
                "done": appointments_done,
            },
            "patients": {
                "total": patients_total,
                "new": patients_new,
            },
            "consultations": {
                "total": consultations_total,
                "thisMonth": consultations_month,
            },
        })


class VetTodayAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        appointments = Appointment.objects.filter(
            vet=request.user,
            date=today
        ).order_by("time")
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class VetAllAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get("status")
        queryset = Appointment.objects.filter(vet=request.user)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        appointments = queryset.order_by("-date", "-time")
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        data["vet"] = request.user.id
        serializer = AppointmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        appointment_id = request.query_params.get("id")
        try:
            appointment = Appointment.objects.get(
                id=appointment_id,
                vet=request.user
            )
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Rendez-vous non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = AppointmentSerializer(
            appointment,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VetPatientsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pet_ids = list(Appointment.objects.filter(
            vet=request.user
        ).values_list("pet_id", flat=True).distinct())
        
        if not pet_ids:
            return Response([])
        
        pets = Pet.objects.filter(id__in=pet_ids).select_related("owner")
        
        patients_data = []
        for pet in pets:
            last_appointment = Appointment.objects.filter(
                pet=pet,
                vet=request.user
            ).order_by("-date", "-time").first()
            
            patients_data.append({
                "id": pet.id,
                "name": pet.name,
                "species": pet.species,
                "gender": pet.gender,
                "sterilized": pet.sterilized,
                "birth_date": pet.birth_date,
                "photo": pet.photo.url if pet.photo else None,
                "owner": {
                    "id": pet.owner.id,
                    "first_name": pet.owner.first_name,
                    "last_name": pet.owner.last_name,
                },
                "lastVisit": last_appointment.date if last_appointment else None,
                "status": "OK",  # You can add logic here
            })
        
        return Response(patients_data)


class VetConsultationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get("status")
        queryset = Consultation.objects.filter(vet=request.user)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        consultations = queryset.order_by("-created_at")
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        data["vet"] = request.user.id
        serializer = ConsultationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VetPrescriptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        consultation_id = request.query_params.get("consultation")
        queryset = Prescription.objects.all()
        if consultation_id:
            queryset = queryset.filter(consultation_id=consultation_id)
        else:
            consultation_ids = Consultation.objects.filter(
                vet=request.user
            ).values_list("id", flat=True)
            queryset = queryset.filter(consultation_id__in=consultation_ids)
        
        prescriptions = queryset.order_by("-created_at")
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PrescriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)