import React, { useState } from "react";
import VetLayout from './VetLayout';


import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Bell,
  PawPrint,
  Star,
  FileText,
  MessageSquare,
  Activity
} from "lucide-react";

const VetDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const stats = {
    appointments: { total: 8, pending: 3, done: 5 },
    patients: { total: 124, new: 4 },
    consultations: { total: 394, thisMonth: 28 },
    rating: { average: 4.8, reviews: 124 },
  };

  const todayAppointments = [
    { id: 1, time: "09:00", owner: "Imen Slama", pet: "Max (Chien)", reason: "Vaccination", status: "done" },
    { id: 2, time: "10:30", owner: "Ahmed Ben Ali", pet: "Luna (Chat)", reason: "Consultation générale", status: "done" },
    { id: 3, time: "14:00", owner: "Sara Mejri", pet: "Rocky (Lapin)", reason: "Suivi post-op", status: "pending" },
    { id: 4, time: "15:30", owner: "Mohamed Trabelsi", pet: "Bella (Chien)", reason: "Examen annuel", status: "pending" },
    { id: 5, time: "17:00", owner: "Leila Chaabane", pet: "Minou (Chat)", reason: "Problème digestif", status: "pending" },
  ];

  const recentPatients = [
    { id: 1, name: "Max", species: "Chien", owner: "Imen Slama", lastVisit: "Aujourd'hui", status: "OK" },
    { id: 2, name: "Luna", species: "Chat", owner: "Ahmed Ben Ali", lastVisit: "Aujourd'hui", status: "Suivi" },
    { id: 3, name: "Caramel", species: "Lapin", owner: "Nour Khalil", lastVisit: "Hier", status: "OK" },
    { id: 4, name: "Rex", species: "Chien", owner: "Omar Belhaj", lastVisit: "Il y a 2 jours", status: "Critique" },
  ];

  const alerts = [
    { id: 1, type: "warning", title: "Rendez-vous non confirmés", message: "3 rendez-vous attendent confirmation", action: "Voir", link: "/vet/appointments" },
    { id: 2, type: "info", title: "Nouveaux messages", message: "2 messages de patients non lus", action: "Lire", link: "/vet/messages" },
    { id: 3, type: "error", title: "Suivi urgent", message: "Rex (Chien) nécessite un suivi critique", action: "Consulter", link: "/vet/patients" },
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ alert }) => {
    const styles = {
      warning: { border: "border-yellow-200 bg-yellow-50", icon: "text-yellow-600" },
      error: { border: "border-red-200 bg-red-50", icon: "text-red-600" },
      info: { border: "border-blue-200 bg-blue-50", icon: "text-blue-600" },
    };
    return (
      <div className={`p-4 border rounded-lg ${styles[alert.type].border}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <Bell className={`w-5 h-5 mr-3 mt-0.5 ${styles[alert.type].icon}`} />
            <div>
              <h4 className="font-medium text-gray-900">{alert.title}</h4>
              <p className="text-sm text-gray-600">{alert.message}</p>
            </div>
          </div>
          <a href={alert.link} className={`text-sm font-medium hover:underline ${styles[alert.type].icon}`}>
            {alert.action}
          </a>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const map = {
      done: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      OK: "bg-green-100 text-green-800",
      Suivi: "bg-blue-100 text-blue-800",
      Critique: "bg-red-100 text-red-800",
    };
    const labels = {
      done: "Terminé",
      pending: "En attente",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <VetLayout>
      <div className="p-10">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#0e9f6e]">Tableau de bord Vétérinaire</h1>
            <p className="text-gray-600">Bienvenue Dr. Mouna — voici votre journée</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>

        {/* Alertes */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Alertes</h2>
            <div className="space-y-3">
              {alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Rendez-vous aujourd'hui" value={stats.appointments.total} subtitle={`${stats.appointments.pending} en attente`} icon={Calendar} color="bg-blue-500" />
          <StatCard title="Patients total" value={stats.patients.total} subtitle={`+${stats.patients.new} nouveaux`} icon={PawPrint} color="bg-purple-500" />
          <StatCard title="Consultations" value={stats.consultations.total} subtitle={`+${stats.consultations.thisMonth} ce mois`} icon={Stethoscope} color="bg-green-500" />
          <StatCard
            title="Note moyenne"
            value={stats.rating.average}
            subtitle={`${stats.rating.reviews} avis`}
            icon={Star}
            color="bg-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rendez-vous du jour */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Rendez-vous du jour</h3>
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center min-w-[48px]">
                    <p className="text-sm font-bold text-[#0e9f6e]">{appt.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{appt.pet}</p>
                    <p className="text-xs text-gray-500">{appt.owner} — {appt.reason}</p>
                  </div>
                  {getStatusBadge(appt.status)}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <a href="/vet/appointments" className="text-[#0e9f6e] hover:text-green-700 font-medium text-sm">
                Gérer les rendez-vous →
              </a>
            </div>
          </div>

          {/* Patients récents */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Patients récents</h3>
            <div className="space-y-3">
              {recentPatients.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="bg-green-100 text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                    {p.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{p.name} <span className="text-gray-400">({p.species})</span></p>
                    <p className="text-xs text-gray-500">{p.owner} — {p.lastVisit}</p>
                  </div>
                  {getStatusBadge(p.status)}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <a href="/vet/patients" className="text-[#0e9f6e] hover:text-green-700 font-medium text-sm">
                Voir tous les patients →
              </a>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Actions Rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/vet/appointments", icon: Calendar, label: "Nouveau RDV" },
              { href: "/vet/consultations", icon: Stethoscope, label: "Consultation" },
              { href: "/vet/prescriptions", icon: FileText, label: "Ordonnance" },
              { href: "/vet/messages", icon: MessageSquare, label: "Messages" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <action.icon className="w-8 h-8 text-[#0e9f6e] mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </VetLayout>
  );
};

export default VetDashboard;