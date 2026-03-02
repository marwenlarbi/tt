import React, { useState } from "react";

import { TrendingUp, TrendingDown, Calendar, Users, Stethoscope, Star, PawPrint } from "lucide-react";
import VetLayout from './VetLayout';
const VetStats = () => {
  const [period, setPeriod] = useState("month");

  const stats = [
    { label: "Consultations", value: 28, change: +12, unit: "", icon: Stethoscope, color: "bg-blue-500" },
    { label: "Nouveaux patients", value: 8, change: +3, unit: "", icon: PawPrint, color: "bg-purple-500" },
    { label: "Rendez-vous", value: 34, change: +5, unit: "", icon: Calendar, color: "bg-green-500" },
    { label: "Note moyenne", value: 4.8, change: +0.1, unit: "/5", icon: Star, color: "bg-yellow-500" },
  ];

  const consultationsBySpecies = [
    { species: "Chien", count: 45, percent: 58, color: "bg-blue-400" },
    { species: "Chat", count: 22, percent: 28, color: "bg-purple-400" },
    { species: "Lapin", count: 6, percent: 8, color: "bg-green-400" },
    { species: "Autres", count: 5, percent: 6, color: "bg-gray-400" },
  ];

  const consultationsByMonth = [
    { month: "Sep", value: 22 },
    { month: "Oct", value: 27 },
    { month: "Nov", value: 18 },
    { month: "Déc", value: 15 },
    { month: "Jan", value: 25 },
    { month: "Fév", value: 24 },
    { month: "Mar", value: 28 },
  ];

  const topDiagnoses = [
    { name: "Vaccination annuelle", count: 18, percent: 23 },
    { name: "Consultation générale", count: 15, percent: 19 },
    { name: "Suivi post-opératoire", count: 9, percent: 12 },
    { name: "Dermatologie", count: 8, percent: 10 },
    { name: "Problèmes digestifs", count: 7, percent: 9 },
    { name: "Cardiologie", count: 5, percent: 6 },
  ];

  const recentReviews = [
    { owner: "Imen Slama", pet: "Max", rating: 5, comment: "Excellent vétérinaire, très professionnel et à l'écoute.", date: "01/03/2025" },
    { owner: "Sara Mejri", pet: "Rocky", rating: 5, comment: "Opération réussie, suivi parfait. Merci !", date: "28/02/2025" },
    { owner: "Ahmed Ben Ali", pet: "Luna", rating: 4, comment: "Très bien, Luna va mieux. Conseils utiles.", date: "27/02/2025" },
  ];

  const maxBar = Math.max(...consultationsByMonth.map((m) => m.value));

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#0e9f6e]">Statistiques</h1>
            <p className="text-gray-600">Aperçu de vos performances et activités</p>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{s.value}{s.unit}</p>
                  <div className="flex items-center mt-2 gap-1">
                    {s.change >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span className={`text-sm font-medium ${s.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {s.change >= 0 ? "+" : ""}{s.change}{s.unit}
                    </span>
                    <span className="text-gray-400 text-xs">vs période préc.</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${s.color}`}><s.icon className="w-8 h-8 text-white" /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique mensuel */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Consultations par mois</h3>
            <div className="flex items-end gap-3 h-40">
              {consultationsByMonth.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">{m.value}</span>
                  <div
                    className="w-full rounded-t-md bg-[#0e9f6e] transition-all hover:opacity-80"
                    style={{ height: `${(m.value / maxBar) * 100}%`, minHeight: "8px" }}
                  />
                  <span className="text-xs text-gray-500">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par espèce */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Patients par espèce</h3>
            <div className="space-y-4">
              {consultationsBySpecies.map((s) => (
                <div key={s.species}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{s.species}</span>
                    <span className="text-gray-500">{s.count} ({s.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`${s.color} h-3 rounded-full transition-all`} style={{ width: `${s.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top diagnostics */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Diagnostics fréquents</h3>
            <div className="space-y-3">
              {topDiagnoses.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{d.name}</span>
                      <span className="text-gray-500">{d.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-[#0e9f6e] h-2 rounded-full" style={{ width: `${d.percent}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avis récents */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Avis récents</h3>
            <div className="space-y-4">
              {recentReviews.map((r, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium text-sm">{r.owner}</span>
                      <span className="text-gray-400 text-xs ml-2">— {r.pet}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className={j < r.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VetLayout>
  );
};

export default VetStats;