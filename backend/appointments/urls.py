from django.urls import path
from .views import (
    VetDashboardStatsView,
    VetTodayAppointmentsView,
    VetAllAppointmentsView,
    VetPatientsView,
    VetConsultationsView,
    VetPrescriptionsView,
)

urlpatterns = [
    path("dashboard/stats/", VetDashboardStatsView.as_view(), name="vet-dashboard-stats"),
    path("appointments/today/", VetTodayAppointmentsView.as_view(), name="vet-today-appointments"),
    path("appointments/", VetAllAppointmentsView.as_view(), name="vet-appointments"),
    path("patients/", VetPatientsView.as_view(), name="vet-patients"),
    path("consultations/", VetConsultationsView.as_view(), name="vet-consultations"),
    path("prescriptions/", VetPrescriptionsView.as_view(), name="vet-prescriptions"),
]