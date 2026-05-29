import React, { useState, useEffect } from "react";
import VetLayout from './VetLayout';
import PageSpinner from '../../components/PageSpinner';
import api, { mediaUrl } from '../../services/api';
import { Search, Eye, PawPrint, Download, Calendar } from "lucide-react";

const VetPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vet/patients/');
      setPatients(response.data.map(pet => ({
        id: pet.id,
        name: pet.name,
        species: pet.species || '',
        breed: '',
        age: pet.birth_date ? new Date().getFullYear() - new Date(pet.birth_date).getFullYear() : '',
        weight: '',
        owner: pet.owner?.first_name && pet.owner?.last_name 
          ? `${pet.owner.first_name} ${pet.owner.last_name}` 
          : '',
        ownerId: pet.owner?.id,
        ownerPhone: '',
        ownerEmail: '',
        lastVisit: pet.lastVisit || '',
        nextVisit: '',
        status: pet.status || 'OK',
        vaccinations: [],
        notes: '',
        photo: pet.photo,
      })));
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const norm = (v) => (v == null ? "" : String(v)).trim().toLowerCase();
  const filtered = patients.filter((p) => {
    const q = search.trim();
    const terms = q ? q.split(/\s+/).map((t) => norm(t)).filter(Boolean) : [];
    const matchSearch =
      terms.length === 0 ||
      terms.every(
        (term) =>
          norm(p.name).includes(term) ||
          norm(p.owner).includes(term) ||
          norm(p.species).includes(term) ||
          norm(p.breed).includes(term)
      );
    const matchSpecies =
      filterSpecies === "all" || norm(p.species) === norm(filterSpecies);
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchSpecies && matchStatus;
  });

  const statusBadge = (status) => {
    const map = { OK: "bg-green-100 text-green-800", Suivi: "bg-blue-100 text-blue-800", Critique: "bg-red-100 text-red-800" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
  };

  const speciesEmoji = { Chien: "🐶", Chat: "🐱", Lapin: "🐰", Oiseau: "🐦", Reptile: "🦎", Autre: "🐾" };

  const exportCSV = () => {
    const rows = filtered.map((p) => `${p.name},${p.species},${p.age},${p.owner},${p.status}`);
    const csv = ["Nom,Espèce,Âge,Propriétaire,Statut", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "patients.csv"; link.click();
  };

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Mes Patients</h1>
            <p className="text-gray-600">Gérez les dossiers de vos animaux patients</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
            <Download className="w-4 h-4" /> Exporter
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: patients.length, color: "text-blue-600" },
            { label: "En bonne santé", value: patients.filter((p) => p.status === "OK").length, color: "text-green-600" },
            { label: "En suivi", value: patients.filter((p) => p.status === "Suivi").length, color: "text-blue-600" },
            { label: "Critiques", value: patients.filter((p) => p.status === "Critique").length, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg p-4 shadow-md">
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Rechercher nom, propriétaire, espèce…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
            </div>
            <select value={filterSpecies} onChange={(e) => setFilterSpecies(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]">
              <option value="all">Toutes les espèces</option>
              {["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Autre"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]">
              <option value="all">Tous les statuts</option>
              <option value="OK">OK</option>
              <option value="Suivi">En suivi</option>
              <option value="Critique">Critique</option>
            </select>
          </div>
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {p.photo ? (
                      <img src={mediaUrl(p.photo)} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                        {speciesEmoji[p.species] || "🐾"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{p.name}</h3>
                      <p className="text-sm text-gray-500">{p.species} — {p.age} ans</p>
                    </div>
                  </div>
                  {statusBadge(p.status)}
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2"><PawPrint className="w-4 h-4" /> {p.species}</div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Dernier: {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString("fr-FR") : "—"}</div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Propriétaire</p>
                  <p className="text-sm font-medium">{p.owner}</p>
                </div>

                {p.notes && <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mb-3">⚠️ {p.notes}</p>}

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => { setSelectedPatient(p); setShowModal(true); }} className="flex-1 text-center text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" /> Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && <div className="text-center py-12 text-gray-500">Aucun patient trouvé.</div>}

        {showModal && selectedPatient && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
            role="presentation"
          >
            <div
              className="bg-white rounded-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-xl leading-none text-gray-500 hover:text-gray-700"
                aria-label="Fermer"
              >
                ×
              </button>
              <div className="flex items-center gap-4 mb-4">
                {selectedPatient.photo ? (
                  <img
                    src={mediaUrl(selectedPatient.photo)}
                    alt={selectedPatient.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                    {speciesEmoji[selectedPatient.species] || "🐾"}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                  <p className="text-gray-500">{selectedPatient.species}</p>
                  {statusBadge(selectedPatient.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Âge</p><p className="font-bold">{selectedPatient.age} ans</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Dernière visite</p><p className="font-bold">{selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString("fr-FR") : "—"}</p></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Propriétaire</h4>
                <p>{selectedPatient.owner}</p>
              </div>
              {selectedPatient.notes && <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg"><p className="text-sm text-orange-700">⚠️ {selectedPatient.notes}</p></div>}
            </div>
          </div>
        )}
      </div>
    </VetLayout>
  );
};

export default VetPatients;