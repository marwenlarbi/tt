import React, { useState } from "react";
import VetLayout from './VetLayout';
import { Search, Plus, Eye, Edit, Trash2, Download, Stethoscope, PawPrint, Calendar } from "lucide-react";

const VetConsultations = () => {
  const [consultations, setConsultations] = useState([
    { id: 1, date: "2025-03-01", petName: "Max", species: "Chien", owner: "Imen Slama", diagnosis: "Vaccination annuelle effectuée", treatment: "Vaccin polyvalent + antiparasitaire", followUp: "Rappel dans 1 an", status: "closed", weight: "28 kg", temperature: "38.5°C", notes: "Animal en bonne santé générale" },
    { id: 2, date: "2025-03-01", petName: "Luna", species: "Chat", owner: "Ahmed Ben Ali", diagnosis: "Gastro-entérite légère", treatment: "Alimentation digestive + probiotiques 7 jours", followUp: "Contrôle dans 1 semaine", status: "open", weight: "4 kg", temperature: "38.8°C", notes: "Surveiller l'hydratation" },
    { id: 3, date: "2025-02-28", petName: "Rocky", species: "Lapin", owner: "Sara Mejri", diagnosis: "Contrôle post-opératoire J+14", treatment: "Retrait des fils — cicatrisation bonne", followUp: "Contrôle J+30", status: "open", weight: "1.5 kg", temperature: "38.2°C", notes: "Cicatrice propre, bien fermée" },
    { id: 4, date: "2025-02-27", petName: "Rex", species: "Chien", owner: "Omar Belhaj", diagnosis: "Insuffisance cardiaque débutante", treatment: "Enalapril 5mg x2/jour + régime pauvre en sel", followUp: "Echo cardiaque dans 3 semaines", status: "urgent", weight: "35 kg", temperature: "38.9°C", notes: "⚠️ Surveiller très attentivement — risque de décompensation" },
    { id: 5, date: "2025-02-20", petName: "Bella", species: "Chien", owner: "Mohamed Trabelsi", diagnosis: "Examen annuel — RAS", treatment: "Antiparasitaire interne + externe", followUp: "Rappel vaccin dans 6 mois", status: "closed", weight: "30 kg", temperature: "38.3°C", notes: "" },
  ]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedC, setSelectedC] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingC, setEditingC] = useState(null);
  const [formData, setFormData] = useState({
    date: "", petName: "", species: "Chien", owner: "", diagnosis: "",
    treatment: "", followUp: "", status: "open", weight: "", temperature: "", notes: ""
  });

  const filtered = consultations.filter((c) => {
    const matchSearch = c.petName.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status) => {
    const map = { open: "bg-blue-100 text-blue-800", closed: "bg-gray-100 text-gray-800", urgent: "bg-red-100 text-red-800" };
    const labels = { open: "En cours", closed: "Clôturée", urgent: "Urgente" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cette consultation ?")) setConsultations((prev) => prev.filter((c) => c.id !== id));
  };

  const openForm = (c = null) => {
    setEditingC(c);
    setFormData(c ? { ...c } : { date: "", petName: "", species: "Chien", owner: "", diagnosis: "", treatment: "", followUp: "", status: "open", weight: "", temperature: "", notes: "" });
    setShowFormModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingC) {
      setConsultations((prev) => prev.map((c) => c.id === editingC.id ? { ...c, ...formData } : c));
    } else {
      setConsultations((prev) => [...prev, { ...formData, id: Math.max(...prev.map((c) => c.id)) + 1 }]);
    }
    setShowFormModal(false);
  };

  const exportCSV = () => {
    const rows = filtered.map((c) => `${c.date},${c.petName},${c.species},${c.owner},"${c.diagnosis}","${c.treatment}",${c.status}`);
    const csv = ["Date,Animal,Espèce,Propriétaire,Diagnostic,Traitement,Statut", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "consultations.csv"; link.click();
  };

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#0e9f6e]">Consultations</h1>
            <p className="text-gray-600">Gérez vos fiches de consultation médicale</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => openForm()} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
              <Plus className="w-4 h-4" /> Nouvelle consultation
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-[#0e9f6e] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
              <Download className="w-4 h-4" /> Exporter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: consultations.length, color: "text-blue-600" },
            { label: "En cours", value: consultations.filter((c) => c.status === "open").length, color: "text-blue-600" },
            { label: "Clôturées", value: consultations.filter((c) => c.status === "closed").length, color: "text-gray-600" },
            { label: "Urgentes", value: consultations.filter((c) => c.status === "urgent").length, color: "text-red-600" },
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
              <input type="text" placeholder="Rechercher animal, propriétaire, diagnostic..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
              <option value="all">Tous les statuts</option>
              <option value="open">En cours</option>
              <option value="closed">Clôturées</option>
              <option value="urgent">Urgentes</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Animal</th>
                  <th className="text-left p-4 font-semibold">Diagnostic</th>
                  <th className="text-left p-4 font-semibold">Traitement</th>
                  <th className="text-left p-4 font-semibold">Suivi</th>
                  <th className="text-left p-4 font-semibold">Statut</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className={`border-t border-gray-200 hover:bg-gray-50 ${c.status === "urgent" ? "bg-red-50" : ""}`}>
                    <td className="p-4 text-sm">{new Date(c.date).toLocaleDateString("fr-FR")}</td>
                    <td className="p-4">
                      <div className="font-medium text-sm">{c.petName}</div>
                      <div className="text-xs text-gray-500">{c.species} — {c.owner}</div>
                    </td>
                    <td className="p-4 text-sm max-w-[180px]"><span className="line-clamp-2">{c.diagnosis}</span></td>
                    <td className="p-4 text-sm max-w-[180px]"><span className="line-clamp-2">{c.treatment}</span></td>
                    <td className="p-4 text-sm max-w-[140px]"><span className="line-clamp-2 text-gray-600">{c.followUp}</span></td>
                    <td className="p-4">{statusBadge(c.status)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedC(c); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 p-1"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openForm(c)} className="text-green-600 hover:text-green-800 p-1"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Aucune consultation trouvée.</div>}
          </div>
        </div>

        {/* Modal détail */}
        {showModal && selectedC && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Fiche de Consultation</h2>
                {statusBadge(selectedC.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><PawPrint className="w-4 h-4" />Animal</h4>
                  <p className="font-medium">{selectedC.petName} ({selectedC.species})</p>
                  <p className="text-sm text-gray-500">{selectedC.owner}</p>
                  <p className="text-sm text-gray-500">Poids: {selectedC.weight} | Temp: {selectedC.temperature}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" />Date</h4>
                  <p className="font-medium">{new Date(selectedC.date).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-semibold text-blue-800 mb-1">Diagnostic</h4><p className="text-gray-700">{selectedC.diagnosis}</p></div>
                <div className="bg-green-50 p-4 rounded-lg"><h4 className="font-semibold text-green-800 mb-1">Traitement prescrit</h4><p className="text-gray-700">{selectedC.treatment}</p></div>
                <div className="bg-yellow-50 p-4 rounded-lg"><h4 className="font-semibold text-yellow-800 mb-1">Suivi recommandé</h4><p className="text-gray-700">{selectedC.followUp}</p></div>
                {selectedC.notes && <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg"><h4 className="font-semibold text-orange-800 mb-1">Notes</h4><p className="text-gray-700">{selectedC.notes}</p></div>}
              </div>
            </div>
          </div>
        )}

        {/* Modal formulaire */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowFormModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <h3 className="text-xl font-semibold mb-4">{editingC ? "Modifier" : "Nouvelle"} Consultation</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <input type="date" value={formData.date} required onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                <select value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                  {["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Autre"].map((s) => <option key={s}>{s}</option>)}
                </select>
                {[
                  { key: "petName", placeholder: "Nom de l'animal", span: 1 },
                  { key: "owner", placeholder: "Propriétaire", span: 1 },
                  { key: "weight", placeholder: "Poids", span: 1 },
                  { key: "temperature", placeholder: "Température", span: 1 },
                ].map(({ key, placeholder, span }) => (
                  <input key={key} placeholder={placeholder} value={formData[key]} required={["petName", "owner"].includes(key)}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className={`col-span-${span} p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]`} />
                ))}
                <textarea placeholder="Diagnostic *" value={formData.diagnosis} required rows={2}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                <textarea placeholder="Traitement prescrit *" value={formData.treatment} required rows={2}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                <input placeholder="Suivi recommandé" value={formData.followUp}
                  onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                  className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                <textarea placeholder="Notes supplémentaires" value={formData.notes} rows={2}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                  <option value="open">En cours</option>
                  <option value="closed">Clôturée</option>
                  <option value="urgent">Urgente</option>
                </select>
                <div className="col-span-2 flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-[#0e9f6e] hover:bg-green-700 text-white py-2 rounded font-medium">{editingC ? "Modifier" : "Créer"}</button>
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

export default VetConsultations;