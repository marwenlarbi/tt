import React, { useState, useEffect, useCallback } from "react";
import VetLayout from './VetLayout';
import PageSpinner from '../../components/PageSpinner';
import api from '../../services/api';
import { Search, Plus, Eye, Edit, Trash2, Download, PawPrint, Calendar } from "lucide-react";

function formatApiError(err, fallback) {
  const d = err?.response?.data;
  if (d?.detail != null) {
    if (typeof d.detail === "string") return d.detail;
    if (Array.isArray(d.detail)) return d.detail.map(String).join(" ");
    return String(d.detail);
  }
  if (typeof d === "string") return d;
  const flat = [];
  if (d && typeof d === "object") {
    Object.entries(d).forEach(([k, v]) => {
      if (Array.isArray(v)) flat.push(`${k}: ${v.join(", ")}`);
      else if (v != null) flat.push(`${k}: ${v}`);
    });
  }
  if (flat.length) return flat.join(" ");
  return fallback;
}

const VetConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedC, setSelectedC] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingC, setEditingC] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    pet: "", diagnosis: "", symptoms: "", treatment: "", notes: "", status: "in_progress"
  });
  const [availablePets, setAvailablePets] = useState([]);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      const query = params.toString();
      const response = await api.get(`/vet/consultations/${query ? `?${query}` : ''}`);
      setConsultations(response.data.map(c => ({
        id: c.id,
        date: c.created_at,
        petId: c.pet,
        petName: c.pet_name || '',
        species: c.pet_species || '',
        owner: c.owner_first_name && c.owner_last_name
          ? `${c.owner_first_name} ${c.owner_last_name}`
          : c.owner_name || '',
        diagnosis: c.diagnosis || '',
        symptoms: c.symptoms || '',
        treatment: c.treatment || '',
        notes: c.notes || '',
        status: c.status,
        weight: '',
        temperature: '',
      })));
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchPets = useCallback(async () => {
    try {
      const response = await api.get('/vet/patients/');
      setAvailablePets(response.data);
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  }, []);

  useEffect(() => {
    fetchConsultations();
    fetchPets();
  }, [fetchConsultations, fetchPets]);

  // FIX 1 : le filtre côté client est conservé uniquement pour la recherche textuelle.
  // Le filtre par statut est déjà géré côté serveur via fetchConsultations.
  const filtered = consultations.filter((c) => {
    return (
      c.petName.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(search.toLowerCase())
    );
  });

  const statusBadge = (status) => {
    const map = {
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
    };
    const labels = {
      in_progress: "En cours",
      completed: "Terminée",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette consultation ?")) {
      try {
        await api.delete(`/vet/consultations/${id}/`);
        setConsultations((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error("Error deleting consultation:", error);
      }
    }
  };

  const openForm = (c = null) => {
    setEditingC(c);
    setFormError("");
    setFormData(c ? {
      pet: c.petId,
      diagnosis: c.diagnosis,
      symptoms: c.symptoms,
      treatment: c.treatment,
      notes: c.notes,
      status: c.status
    } : {
      pet: "", diagnosis: "", symptoms: "", treatment: "", notes: "", status: "in_progress"
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const payload = {
      ...formData,
      pet: formData.pet === "" ? "" : Number(formData.pet),
    };
    try {
      if (editingC) {
        await api.patch(`/vet/consultations/${editingC.id}/`, payload);
      } else {
        await api.post("/vet/consultations/", payload);
      }
      setShowFormModal(false);
      fetchConsultations();
    } catch (error) {
      console.error("Error saving consultation:", error);
      setFormError(formatApiError(error, "Une erreur est survenue. Vérifiez les champs et réessayez."));
    }
  };

  // FIX 3 : le champ owner est entouré de guillemets pour éviter les problèmes CSV
  const exportCSV = () => {
    const rows = filtered.map((c) =>
      `${c.date},"${c.petName}","${c.species}","${c.owner}","${c.diagnosis}","${c.treatment}",${c.status}`
    );
    const csv = ["Date,Animal,Espèce,Propriétaire,Diagnostic,Traitement,Statut", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "consultations.csv";
    link.click();
  };

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Consultations</h1>
            <p className="text-gray-600">Gérez vos fiches de consultation médicale</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => openForm()} className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
              <Plus className="w-4 h-4" /> Nouvelle consultation
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
              <Download className="w-4 h-4" /> Exporter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: consultations.length, color: "text-blue-600" },
            { label: "En cours", value: consultations.filter((c) => c.status === "in_progress").length, color: "text-blue-600" },
            { label: "Terminées", value: consultations.filter((c) => c.status === "completed").length, color: "text-gray-600" },
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
              <input type="text" placeholder="Rechercher animal, propriétaire, diagnostic..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]">
              <option value="all">Tous les statuts</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Animal</th>
                    <th className="text-left p-4 font-semibold">Diagnostic</th>
                    <th className="text-left p-4 font-semibold">Traitement</th>
                    <th className="text-left p-4 font-semibold">Statut</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-4 text-sm">{new Date(c.date).toLocaleDateString("fr-FR")}</td>
                      <td className="p-4">
                        <div className="font-medium text-sm">{c.petName}</div>
                        <div className="text-xs text-gray-500">{c.species} — {c.owner}</div>
                      </td>
                      <td className="p-4 text-sm max-w-[180px]"><span className="line-clamp-2">{c.diagnosis || "—"}</span></td>
                      <td className="p-4 text-sm max-w-[180px]"><span className="line-clamp-2">{c.treatment || "—"}</span></td>
                      <td className="p-4">{statusBadge(c.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedC(c); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 p-1"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openForm(c)} className="text-green-600 hover:text-purple-800 p-1"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">Aucune consultation trouvée.</div>
              )}
            </div>
          </div>
        )}

        {/* FIX 4 : suppression du `}` parasite après le bloc Diagnostic */}
        {showModal && selectedC && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
            role="presentation"
          >
            <div
              className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Fiche de Consultation</h2>
                {statusBadge(selectedC.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><PawPrint className="w-4 h-4" />Animal</h4>
                  <p className="font-medium">{selectedC.petName} ({selectedC.species})</p>
                  <p className="text-sm text-gray-500">{selectedC.owner}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" />Date</h4>
                  <p className="font-medium">{new Date(selectedC.date).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <div className="space-y-4">
                {selectedC.symptoms && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1">Symptômes</h4>
                    <p className="text-gray-700">{selectedC.symptoms}</p>
                  </div>
                )}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1">Diagnostic</h4>
                  <p className="text-gray-700">{selectedC.diagnosis || "—"}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1">Traitement prescrit</h4>
                  <p className="text-gray-700">{selectedC.treatment || "—"}</p>
                </div>
                {selectedC.notes && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-1">Notes</h4>
                    <p className="text-gray-700">{selectedC.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showFormModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowFormModal(false)}
            role="presentation"
          >
            <div
              className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="absolute top-3 right-3 text-xl leading-none text-gray-500 hover:text-gray-700"
                aria-label="Fermer"
              >
                ×
              </button>
              <h3 className="text-xl font-semibold mb-4">{editingC ? "Modifier" : "Nouvelle"} Consultation</h3>
              {/* FIX 2 : message d'erreur visible dans le modal */}
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <select value={formData.pet} required onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]">
                  <option value="">Sélectionner un animal</option>
                  {availablePets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species}) - {p.owner?.first_name} {p.owner?.last_name}</option>
                  ))}
                </select>
                <textarea placeholder="Symptômes *" value={formData.symptoms} required rows={2}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                <textarea placeholder="Diagnostic *" value={formData.diagnosis} required rows={2}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                <textarea placeholder="Traitement *" value={formData.treatment} required rows={2}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                <textarea placeholder="Notes supplémentaires" value={formData.notes} rows={2}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]">
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminée</option>
                </select>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-[#8657ff] hover:bg-purple-700 text-white py-2 rounded font-medium">
                    {editingC ? "Modifier" : "Créer"}
                  </button>
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