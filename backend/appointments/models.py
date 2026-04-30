from django.conf import settings
from django.db import models


class Appointment(models.Model):
    """Rendez-vous entre un vétériné et un animal/propriétaire."""

    STATUS_CHOICES = (
        ("pending", "En attente"),
        ("confirmed", "Confirmé"),
        ("completed", "Terminé"),
        ("cancelled", "Annulé"),
    )

    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vet_appointments",
    )
    pet = models.ForeignKey(
        "pets.Pet",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owner_appointments",
    )
    date = models.DateField()
    time = models.TimeField()
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments_appointment"
        ordering = ("date", "time")

    def __str__(self):
        return f"RDV {self.pet.name} - {self.date} à {self.time}"


class Consultation(models.Model):
    """Consultation médicale pour un animal."""

    STATUS_CHOICES = (
        ("in_progress", "En cours"),
        ("completed", "Terminée"),
    )

    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vet_consultations",
    )
    pet = models.ForeignKey(
        "pets.Pet",
        on_delete=models.CASCADE,
        related_name="consultations",
    )
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="consultations",
    )
    diagnosis = models.TextField(blank=True)
    symptoms = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="in_progress",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments_consultation"
        ordering = ("-created_at",)

    def __str__(self):
        return f"Consultation {self.pet.name} - {self.created_at.date()}"


class Prescription(models.Model):
    """Ordonnance associée à une consultation."""

    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name="prescriptions",
    )
    medication = models.CharField(max_length=255)
    dosage = models.CharField(max_length=255)
    frequency = models.CharField(max_length=255, blank=True)
    duration = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "appointments_prescription"
        ordering = ("-created_at",)

    def __str__(self):
        return f"Ordonnance - {self.medication}"