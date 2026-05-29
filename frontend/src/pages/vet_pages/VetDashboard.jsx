import React, { useState, useEffect } from "react";
import VetLayout from './VetLayout';
import PageSpinner from '../../components/PageSpinner';
import api from '../../services/api';

import {
  Calendar,
  Stethoscope,
  Bell,
  PawPrint,
  Star,
  FileText,
  MessageSquare
} from "lucide-react";

const VetDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointments: { total: 0, pending: 0, done: 0 },
    patients: { total: 0, new: 0 },
    consultations: { total: 0, thisMonth: 0 },
    reviews: { averageRating: null, count: 0 },
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);

      const [statsRes, appointmentsRes, patientsRes] = await Promise.all([
        api.get('/vet/dashboard/stats/'),
        api.get('/vet/appointments/today/'),
        api.get('/vet/patients/'),
      ]);

      setStats(statsRes.data);

      const formattedAppointments = appointmentsRes.data.map(appt => ({
        id: appt.id,
        time: appt.time?.substring(0, 5) || '',
        owner: appt.owner_first_name && appt.owner_last_name 
          ? `${appt.owner_first_name} ${appt.owner_last_name}` 
          : appt.owner_name || '',
        pet: appt.pet_name || '',
        reason: appt.reason || '',
        status: appt.status,
      }));
      setTodayAppointments(formattedAppointments);

      const petsData = patientsRes.data.slice(0, 4).map(pet => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        owner: pet.owner?.first_name && pet.owner?.last_name
          ? `${pet.owner.first_name} ${pet.owner.last_name}`
          : '',
        lastVisit: pet.lastVisit || '',
        status: pet.status || 'OK',
      }));
      setRecentPatients(petsData);

      const newAlerts = [];
      if (statsRes.data.appointments?.pending > 0) {
        newAlerts.push({
          id: 1,
          type: "warning",
          title: "Rendez-vous non confirmés",
          message: `${statsRes.data.appointments.pending} rendez-vous attendent confirmation`,
          action: "Voir",
          link: "/vet/appointments"
        });
      }
      setAlerts(newAlerts);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      completed: "bg-green-100 text-green-800",
      confirmed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      OK: "bg-green-100 text-green-800",
      Suivi: "bg-blue-100 text-blue-800",
      Critique: "bg-red-100 text-red-800",
    };
    const labels = {
      done: "Terminé",
      pending: "En attente",
      completed: "Terminé",
      confirmed: "Confirmé",
      cancelled: "Annulé",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <VetLayout>
        <div className="p-10 flex items-center justify-center min-h-[400px]">
          <PageSpinner compact />
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="p-10">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Tableau de bord Vétérinaire</h1>
            <p className="text-gray-600">Bienvenue {user?.first_name ? `Dr. ${user.first_name}` : 'Docteur'} — voici votre journée</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
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
          <StatCard title="Rendez-vous aujourd'hui" value={stats.appointments?.total || 0} subtitle={`${stats.appointments?.pending || 0} en attente`} icon={Calendar} color="bg-blue-500" />
          <StatCard title="Patients total" value={stats.patients?.total || 0} subtitle={`+${stats.patients?.new || 0} nouveaux`} icon={PawPrint} color="bg-purple-500" />
          <StatCard title="Consultations" value={stats.consultations?.total || 0} subtitle={`+${stats.consultations?.thisMonth || 0} ce mois`} icon={Stethoscope} color="bg-green-500" />
          <StatCard
            title="Note moyenne"
            value={
              (stats.reviews?.count ?? 0) > 0 && stats.reviews?.averageRating != null
                ? Number(stats.reviews.averageRating).toLocaleString("fr-FR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })
                : "—"
            }
            subtitle={
              (stats.reviews?.count ?? 0) > 0
                ? `${stats.reviews.count} avis`
                : "Aucun avis pour l’instant"
            }
            icon={Star}
            color="bg-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rendez-vous du jour */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Rendez-vous du jour</h3>
            {todayAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun rendez-vous aujourd'hui</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center min-w-[48px]">
                      <p className="text-sm font-bold text-[#8657ff]">{appt.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{appt.pet}</p>
                      <p className="text-xs text-gray-500">{appt.owner} — {appt.reason}</p>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <a href="/vet/appointments" className="text-[#8657ff] hover:text-green-700 font-medium text-sm">
                Gérer les rendez-vous →
              </a>
            </div>
          </div>

          {/* Patients récents */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Patients récents</h3>
            {recentPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun patient pour le moment</p>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="bg-green-100 text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                      {p.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{p.name} <span className="text-gray-400">({p.species})</span></p>
                      <p className="text-xs text-gray-500">{p.owner} — {p.lastVisit || 'Première visite'}</p>
                    </div>
                    {getStatusBadge(p.status)}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <a href="/vet/patients" className="text-[#8657ff] hover:text-green-700 font-medium text-sm">
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
                <action.icon className="w-8 h-8 text-[#8657ff] mb-2" />
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