import React, { useState, useEffect, useCallback } from "react";
import VetLayout from "./VetLayout";
import PageSpinner from "../../components/PageSpinner";
import api from "../../services/api";
import { Calendar, Stethoscope, Star, PawPrint } from "lucide-react";

const SPECIES_BAR_COLORS = [
  "bg-blue-400",
  "bg-purple-400",
  "bg-green-400",
  "bg-amber-400",
  "bg-pink-400",
  "bg-gray-400",
];

const VetStats = () => {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointments: { total: 0, pending: 0, done: 0 },
    patients: { total: 0, new: 0 },
    consultations: {
      total: 0,
      thisMonth: 0,
      recordsInPeriod: 0,
      appointmentsWithoutConsultRecord: 0,
    },
    analytics: {
      monthlyActivity: [],
      patientsBySpecies: [],
      topDiagnoses: [],
      recentReviews: [],
    },
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/vet/dashboard/stats/", { params: { period } });
      const data = response.data || {};
      setStats({
        ...data,
        analytics: {
          monthlyActivity: data.analytics?.monthlyActivity ?? [],
          patientsBySpecies: data.analytics?.patientsBySpecies ?? [],
          topDiagnoses: data.analytics?.topDiagnoses ?? [],
          recentReviews: data.analytics?.recentReviews ?? [],
        },
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statsData = [
    {
      label: "Consultations",
      value: stats.consultations?.inPeriod ?? stats.consultations?.thisMonth ?? 0,
      icon: Stethoscope,
      color: "bg-blue-500",
      hint: "Fiches + RDV sans fiche (période)",
    },
    {
      label: "Nouveaux patients",
      value: stats.patients?.newInPeriod ?? stats.patients?.new ?? 0,
      icon: PawPrint,
      color: "bg-purple-500",
      hint: "Animaux nouveaux sur vos RDV",
    },
    {
      label: "Rendez-vous",
      value: stats.appointments?.inPeriod ?? stats.appointments?.total ?? 0,
      icon: Calendar,
      color: "bg-green-500",
      hint: "RDV planifiés sur la période (tous statuts sauf annulé)",
    },
    {
      label: "Patients total",
      value: stats.patients?.total || 0,
      icon: Star,
      color: "bg-yellow-500",
      hint: "Animaux distincts avec au moins un RDV chez vous",
    },
  ];

  const monthly = stats.analytics?.monthlyActivity ?? [];
  const maxBar = Math.max(...monthly.map((m) => Number(m.value) || 0), 1);

  const species = stats.analytics?.patientsBySpecies ?? [];
  const diagnoses = stats.analytics?.topDiagnoses ?? [];
  const reviews = stats.analytics?.recentReviews ?? [];

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Statistiques</h1>
            <p className="text-gray-600">Aperçu de vos performances et activités</p>
            {stats.period && (
              <p className="text-sm text-gray-500 mt-1">
                Période sélectionnée :{" "}
                {period === "week"
                  ? "7 derniers jours"
                  : period === "month"
                    ? "mois en cours"
                    : period === "quarter"
                      ? "trimestre en cours"
                      : "année en cours"}
              </p>
            )}
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <>
            {(stats.consultations?.appointmentsWithoutConsultRecord > 0 ||
              stats.consultations?.recordsInPeriod > 0) && (
              <p className="text-sm text-gray-500 mb-4 max-w-3xl">
                La carte « Consultations » additionne les{" "}
                <strong>fiches consultation</strong> créées sur la période et les{" "}
                <strong>rendez-vous</strong> (hors annulés) sans fiche liée — ainsi les RDV
                apparaissent même sans ouvrir une consultation dans l’app.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-gray-600 text-sm font-medium">{s.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400 mt-2 leading-snug">{s.hint}</p>
                    </div>
                    <div className={`p-3 rounded-full shrink-0 ${s.color}`}>
                      <s.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800">Consultations par mois</h3>
                <p className="text-xs text-gray-500 mb-6">
                  7 derniers mois — même calcul que la carte « Consultations » (fiches + RDV sans fiche).
                </p>
                {monthly.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-10">Aucune donnée</p>
                ) : (
                  <div className="flex items-end gap-2 h-44">
                    {monthly.map((m) => (
                      <div
                        key={m.yearMonth || m.label}
                        className="flex-1 flex flex-col items-center gap-1 min-w-0"
                        title={m.yearMonth ? `${m.yearMonth}` : undefined}
                      >
                        <span className="text-xs text-gray-500 font-medium">{m.value}</span>
                        <div
                          className="w-full rounded-t-md bg-[#8657ff] transition-all hover:opacity-80"
                          style={{
                            height: `${((Number(m.value) || 0) / maxBar) * 100}%`,
                            minHeight: "6px",
                          }}
                        />
                        <span className="text-xs text-gray-500 truncate w-full text-center">
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800">Patients par espèce</h3>
                <p className="text-xs text-gray-500 mb-6">
                  Répartition des animaux ayant eu au moins un RDV avec vous.
                </p>
                {species.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-10">Aucun patient enregistré</p>
                ) : (
                  <div className="space-y-4">
                    {species.map((row, idx) => (
                      <div key={row.species}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium truncate pr-2">{row.species}</span>
                          <span className="text-gray-500 shrink-0">
                            {row.count} ({row.percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className={`${
                              SPECIES_BAR_COLORS[idx % SPECIES_BAR_COLORS.length]
                            } h-3 rounded-full transition-all`}
                            style={{ width: `${Math.min(row.percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-1 text-gray-800">Motifs / diagnostics (texte saisi)</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Basé sur le champ « diagnostic » de vos fiches consultation (textes identiques regroupés).
                </p>
                {diagnoses.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-10">
                    Aucun diagnostic renseigné pour l’instant
                  </p>
                ) : (
                  <div className="space-y-3">
                    {diagnoses.map((d, i) => (
                      <div key={`${d.label}-${i}`} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-sm mb-1 gap-2">
                            <span className="truncate" title={d.label}>
                              {d.label}
                            </span>
                            <span className="text-gray-500 shrink-0">{d.count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-[#8657ff] h-2 rounded-full"
                              style={{ width: `${Math.min(d.percent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-1 text-gray-800">Avis récents</h3>
                <p className="text-xs text-gray-500 mb-4">Avis clients sur votre profil vétérinaire.</p>
                {reviews.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <p className="text-sm">Aucun avis pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="border border-gray-100 rounded-lg p-3 bg-gray-50/80"
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {r.authorName}
                          </span>
                          <span className="text-xs text-amber-600 font-semibold shrink-0">
                            {"★".repeat(r.rating)}
                            <span className="text-gray-400 ml-1">({r.rating}/5)</span>
                          </span>
                        </div>
                        {r.comment ? (
                          <p className="text-sm text-gray-600 line-clamp-4">{r.comment}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Sans commentaire</p>
                        )}
                        {r.createdAt && (
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(r.createdAt).toLocaleString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </VetLayout>
  );
};

export default VetStats;
