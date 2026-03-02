import React, { useState } from "react";
import VetLayout from './VetLayout';
import { Search, Plus, Eye, Edit, Trash2, PawPrint, Phone, Mail, Download, Calendar } from "lucide-react";

const VetPatients = () => {
  const [patients, setPatients] = useState([
    { id: 1, name: "Max", species: "Chien", breed: "Labrador", age: 3, weight: "28 kg", owner: "Imen Slama", ownerPhone: "+216 98 111 222", ownerEmail: "imen@email.com", lastVisit: "2025-03-01", nextVisit: "2025-09-01", status: "OK", vaccinations: ["Rage", "Parvo"], notes: "Allergie au poulet", image: "" },
    { id: 2, name: "Luna", species: "Chat", breed: "Persan", age: 2, weight: "4 kg", owner: "Ahmed Ben Ali", ownerPhone: "+216 55 333 444", ownerEmail: "ahmed@email.com", lastVisit: "2025-03-01", nextVisit: "2025-06-01", status: "Suivi", vaccinations: ["Typhus", "Leucose"], notes: "", image: "" },
    { id: 3, name: "Rocky", species: "Lapin", breed: "Nain", age: 1, weight: "1.5 kg", owner: "Sara Mejri", ownerPhone: "+216 77 555 666", ownerEmail: "sara@email.com", lastVisit: "2025-02-28", nextVisit: "2025-03-15", status: "Suivi", vaccinations: [], notes: "Post-opératoire, surveiller cicatrice", image: "" },
    { id: 4, name: "Rex", species: "Chien", breed: "Berger Allemand", age: 7, weight: "35 kg", owner: "Omar Belhaj", ownerPhone: "+216 44 777 888", ownerEmail: "omar@email.com", lastVisit: "2025-02-27", nextVisit: "2025-03-05", status: "Critique", vaccinations: ["Rage"], notes: "Problème cardiaque détecté", image: "" },
    { id: 5, name: "Bella", species: "Chien", breed: "Golden Retriever", age: 5, weight: "30 kg", owner: "Mohamed Trabelsi", ownerPhone: "+216 99 777 888", ownerEmail: "mo@email.com", lastVisit: "2025-02-20", nextVisit: "2025-03-01", status: "OK", vaccinations: ["Rage", "Parvo", "Toux"], notes: "", image: "" },
    { id: 6, name: "Minou", species: "Chat", breed: "Européen", age: 4, weight: "3.8 kg", owner: "Leila Chaabane", ownerPhone: "+216 22 999 000", ownerEmail: "leila@email.com", lastVisit: "2025-01-15", nextVisit: "2025-03-02", status: "Suivi", vaccinations: ["Typhus"], notes: "Problèmes digestifs récurrents", image: "" },
  ]);

  const [search, setSearch] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: "", species: "Chien", breed: "", age: "", weight: "",
    owner: "", ownerPhone: "", ownerEmail: "", lastVisit: "", nextVisit: "",
    status: "OK", notes: ""
  });

  const filtered = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase()) ||
      p.breed.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = filterSpecies === "all" || p.species === filterSpecies;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchSpecies && matchStatus;
  });

  const statusBadge = (status) => {
    const map = { OK: "bg-green-100 text-green-800", Suivi: "bg-blue-100 text-blue-800", Critique: "bg-red-100 text-red-800" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
  };

  const speciesEmoji = { Chien: "🐶", Chat: "🐱", Lapin: "🐰", Oiseau: "🐦", Reptile: "🦎", Autre: "🐾" };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer ce patient ?")) setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const openForm = (patient = null) => {
    setEditingPatient(patient);
    setFormData(patient ? { ...patient } : { name: "", species: "Chien", breed: "", age: "", weight: "", owner: "", ownerPhone: "", ownerEmail: "", lastVisit: "", nextVisit: "", status: "OK", notes: "" });
    setShowFormModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      setPatients((prev) => prev.map((p) => p.id === editingPatient.id ? { ...p, ...formData } : p));
    } else {
      setPatients((prev) => [...prev, { ...formData, id: Math.max(...prev.map((p) => p.id)) + 1, vaccinations: [] }]);
    }
    setShowFormModal(false);
  };

  const exportCSV = () => {
    const rows = filtered.map((p) => `${p.name},${p.species},${p.breed},${p.age},${p.weight},${p.owner},${p.status}`);
    const csv = ["Nom,Espèce,Race,Âge,Poids,Propriétaire,Statut", ...rows].join("\n");
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
            <h1 className="text-3xl font-bold mb-2 text-[#0e9f6e]">Mes Patients</h1>
            <p className="text-gray-600">Gérez les dossiers de vos animaux patients</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => openForm()} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
              <Plus className="w-4 h-4" /> Ajouter patient
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-[#0e9f6e] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
              <Download className="w-4 h-4" /> Exporter
            </button>
          </div>
        </div>

        {/* Stats */}
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

        {/* Filtres */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Rechercher nom, propriétaire, race..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
            </div>
            <select value={filterSpecies} onChange={(e) => setFilterSpecies(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
              <option value="all">Toutes les espèces</option>
              {["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Autre"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
              <option value="all">Tous les statuts</option>
              <option value="OK">OK</option>
              <option value="Suivi">En suivi</option>
              <option value="Critique">Critique</option>
            </select>
          </div>
        </div>

        {/* Grille de patients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                    {speciesEmoji[p.species] || "🐾"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.breed} — {p.age} ans — {p.weight}</p>
                  </div>
                </div>
                {statusBadge(p.status)}
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2"><PawPrint className="w-4 h-4" /> {p.species}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {p.ownerPhone}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Dernier: {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString("fr-FR") : "—"}</div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3">
                <p className="text-xs text-gray-500 font-medium mb-1">Propriétaire</p>
                <p className="text-sm font-medium">{p.owner}</p>
              </div>

              {p.vaccinations.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.vaccinations.map((v) => (
                    <span key={v} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">{v}</span>
                  ))}
                </div>
              )}

              {p.notes && <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mb-3">⚠️ {p.notes}</p>}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => { setSelectedPatient(p); setShowModal(true); }} className="flex-1 text-center text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" /> Voir
                </button>
                <button onClick={() => openForm(p)} className="flex-1 text-center text-sm text-green-600 hover:text-green-800 flex items-center justify-center gap-1">
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 text-center text-sm text-red-600 hover:text-red-800 flex items-center justify-center gap-1">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Aucun patient trouvé.</div>}

        {/* Modal détail */}
        {showModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">{speciesEmoji[selectedPatient.species]}</div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                  <p className="text-gray-500">{selectedPatient.breed} • {selectedPatient.species}</p>
                  {statusBadge(selectedPatient.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Âge</p><p className="font-bold">{selectedPatient.age} ans</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Poids</p><p className="font-bold">{selectedPatient.weight}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Dernière visite</p><p className="font-bold">{selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString("fr-FR") : "—"}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Prochaine visite</p><p className="font-bold">{selectedPatient.nextVisit ? new Date(selectedPatient.nextVisit).toLocaleDateString("fr-FR") : "—"}</p></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Propriétaire</h4>
                <p>{selectedPatient.owner}</p>
                <p className="text-sm text-gray-500">{selectedPatient.ownerPhone}</p>
                <p className="text-sm text-gray-500">{selectedPatient.ownerEmail}</p>
              </div>
              {selectedPatient.vaccinations.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Vaccinations</h4>
                  <div className="flex flex-wrap gap-2">{selectedPatient.vaccinations.map((v) => <span key={v} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{v}</span>)}</div>
                </div>
              )}
              {selectedPatient.notes && <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg"><p className="text-sm text-orange-700">⚠️ {selectedPatient.notes}</p></div>}
            </div>
          </div>
        )}

        {/* Modal formulaire */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowFormModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <h3 className="text-xl font-semibold mb-4">{editingPatient ? "Modifier" : "Nouveau"} Patient</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", placeholder: "Nom de l'animal", span: 1 },
                  { key: "breed", placeholder: "Race", span: 1 },
                  { key: "age", placeholder: "Âge (ans)", type: "number", span: 1 },
                  { key: "weight", placeholder: "Poids (ex: 28 kg)", span: 1 },
                  { key: "owner", placeholder: "Nom du propriétaire", span: 2 },
                  { key: "ownerPhone", placeholder: "Téléphone propriétaire", span: 1 },
                  { key: "ownerEmail", placeholder: "Email propriétaire", type: "email", span: 1 },
                  { key: "lastVisit", placeholder: "Dernière visite", type: "date", span: 1 },
                  { key: "nextVisit", placeholder: "Prochaine visite", type: "date", span: 1 },
                  { key: "notes", placeholder: "Notes médicales", span: 2 },
                ].map(({ key, placeholder, type = "text", span }) => (
                  <input key={key} type={type} placeholder={placeholder} value={formData[key]}
                    required={["name", "owner", "ownerPhone"].includes(key)}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className={`col-span-${span} p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]`} />
                ))}
                <select value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                  {["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Autre"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                  <option value="OK">OK</option>
                  <option value="Suivi">En suivi</option>
                  <option value="Critique">Critique</option>
                </select>
                <div className="col-span-2 flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-[#0e9f6e] hover:bg-green-700 text-white py-2 rounded font-medium">{editingPatient ? "Modifier" : "Ajouter"}</button>
                  <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded font-medium">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </VetLayout>
  );
};

export default VetPatients;