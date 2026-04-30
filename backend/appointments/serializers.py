from rest_framework import serializers
from .models import Appointment, Consultation, Prescription


class AppointmentSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source="pet.name", read_only=True)
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    owner_first_name = serializers.CharField(source="owner.first_name", read_only=True)
    owner_last_name = serializers.CharField(source="owner.last_name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id", "vet", "pet", "pet_name", "owner", "owner_name",
            "owner_first_name", "owner_last_name", "date", "time",
            "reason", "notes", "status", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "vet", "created_at", "updated_at"]


class ConsultationSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source="pet.name", read_only=True)
    pet_species = serializers.CharField(source="pet.species", read_only=True)
    owner_name = serializers.CharField(source="pet.owner.get_full_name", read_only=True)
    owner_first_name = serializers.CharField(source="pet.owner.first_name", read_only=True)
    owner_last_name = serializers.CharField(source="pet.owner.last_name", read_only=True)

    class Meta:
        model = Consultation
        fields = [
            "id", "vet", "pet", "pet_name", "pet_species",
            "appointment", "diagnosis", "symptoms", "treatment",
            "notes", "status", "created_at", "updated_at",
            "owner_name", "owner_first_name", "owner_last_name"
        ]
        read_only_fields = ["id", "vet", "created_at", "updated_at"]


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = [
            "id", "consultation", "medication", "dosage",
            "frequency", "duration", "notes", "created_at"
        ]
        read_only_fields = ["id", "created_at"]