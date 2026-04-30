import React, { useState, useEffect } from "react";
import VetLayout from './VetLayout';
import api from '../../services/api';
import { Search, Plus, Eye, Edit, Trash2, FileText, Printer} from "lucide-react";

const VetPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedP, setSelectedP] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingP, setEditingP] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [formData, setFormData] = useState({
    consultation: "", medication: "", dosage: "", frequency: "", duration: "", notes: ""
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchConsultations();
  }, [filterStatus]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vet/prescriptions/');
      setPrescriptions(response.data.map(p => ({
        id: p.id,
        date: p.created_at,
        consultationId: p.consultation,
        petName: p.consultation?.pet_name || '',
        petSpecies: p.consultation?.pet_species || '',
        owner: p.consultation?.owner_name || '',
        medication: p.medication || '',
        dosage: p.dosage || '',
        frequency: p.frequency || '',
        duration: p.duration || '',
        notes: p.notes || '',
        status: "active",
      })));
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/vet/consultations/');
      setConsultations(response.data);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    }
  };

  const filtered = prescriptions.filter((p) => {
    const matchSearch = p.petName.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase()) ||
      p.medication.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const statusBadge = (status) => {
    const map = { active: "bg-green-100 text-green-800", expired: "bg-gray-100 text-gray-800", cancelled: "bg-red-100 text-red-800" };
    const labels = { active: "Active", expired: "Expirée", cancelled: "Annulée" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}>{labels[status] || status}</span>;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette ordonnance ?")) {
      try {
        await api.delete(`/vet/prescriptions/${id}/`);
        setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting prescription:", error);
      }
    }
  };

  const openForm = (p = null) => {
    setEditingP(p);
    setFormData(p ? { 
      consultation: p.consultationId, 
      medication: p.medication, 
      dosage: p.dosage,
      frequency: p.frequency, 
      duration: p.duration, 
      notes: p.notes 
    } : {
      consultation: "", medication: "", dosage: "", frequency: "", duration: "", notes: ""
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingP) {
        await api.patch(`/vet/prescriptions/${editingP.id}/`, formData);
      } else {
        await api.post('/vet/prescriptions/', formData);
      }
      setShowFormModal(false);
      fetchPrescriptions();
    } catch (error) {
      console.error("Error saving prescription:", error);
    }
  };

  const handlePrint = (p) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Ordonnance</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}
      h1{color:#8657ff}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#f0fdf4}.footer{margin-top:40px;text-align:right}</style>
      </head><body>
      <h1>🩺 Ordonnance Vétérinaire</h1>
      <p><strong>Date :</strong> ${new Date(p.date).toLocaleDateString("fr-FR")}</p>
      <p><strong>Animal :</strong> ${p.petName} (${p.petSpecies})</p>
      <p><strong>Propriétaire :</strong> ${p.owner}</p>
      <h3>Médicaments prescrits</h3>
      <table><tr><th>Médicament</th><th>Dosage</th><th>Fréquence</th><th>Durée</th></tr>
      <tr><td>${p.medication}</td><td>${p.dosage}</td><td>${p.frequency}</td><td>${p.duration}</td></tr>
      </table>
      <p><strong>Instructions :</strong> ${p.notes || "Aucune"}</p>
      <div class="footer"><p>Dr. — Vétérinaire</p></div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Ordonnances</h1>
            <p className="text-gray-600">Gérez et imprimez vos ordonnances médicales</p>
          </div>
          <button onClick={() => openForm()} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
            <Plus className="w-4 h-4" /> Nouvelle ordonnance
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold text-blue-600">{prescriptions.length}</p></div>
          <div className="bg-white rounded-lg p-4 shadow-md"><p className="text-sm text-gray-600">Actives</p><p className="text-2xl font-bold text-green-600">{prescriptions.filter((p) => p.status === "active").length}</p></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8657ff]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full"><FileText className="w-6 h-6 text-green-600" /></div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">{p.petName} ({p.petSpecies})</h3>
                        {statusBadge(p.status)}
                      </div>
                      <p className="text-sm text-gray-500">{p.owner} • {new Date(p.date).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedP(p); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 p-2" title="Voir"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handlePrint(p)} className="text-green-600 hover:text-purple-800 p-2" title="Imprimer"><Printer className="w-4 h-4" /></button>
                    <button onClick={() => openForm(p)} className="text-orange-600 hover:text-orange-800 p-2" title="Modifier"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 p-2" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                    💊 {p.medication} — {p.dosage}
                  </span>
                  {p.frequency && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">{p.frequency}</span>}
                  {p.duration && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">{p.duration}</span>}
                </div>
                {p.notes && <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded italic">{p.notes}</p>}
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Aucune ordonnance trouvée.</div>}
          </div>
        )}

        {showModal && selectedP && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#8657ff]">Ordonnance</h2>
                  <p className="text-gray-500">{new Date(selectedP.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <button onClick={() => handlePrint(selectedP)} className="flex items-center gap-2 bg-[#8657ff] text-white px-4 py-2 rounded-lg">
                  <Printer className="w-4 h-4" /> Imprimer
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 mb-1">Animal</p><p className="font-bold">{selectedP.petName}</p><p className="text-sm text-gray-600">{selectedP.petSpecies}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 mb-1">Propriétaire</p><p className="font-bold">{selectedP.owner}</p></div>
              </div>
              <h4 className="font-semibold mb-3">Médicaments prescrits</h4>
              <table className="w-full border-collapse mb-4">
                <thead><tr className="bg-green-50"><th className="text-left p-2 border border-gray-200 text-sm">Médicament</th><th className="text-left p-2 border border-gray-200 text-sm">Dosage</th><th className="text-left p-2 border border-gray-200 text-sm">Fréquence</th><th className="text-left p-2 border border-gray-200 text-sm">Durée</th></tr></thead>
                <tbody><tr><td className="p-2 border border-gray-200 text-sm">{selectedP.medication}</td><td className="p-2 border border-gray-200 text-sm">{selectedP.dosage}</td><td className="p-2 border border-gray-200 text-sm">{selectedP.frequency}</td><td className="p-2 border border-gray-200 text-sm">{selectedP.duration}</td></tr></tbody>
              </table>
              {selectedP.notes && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"><p className="font-semibold text-yellow-800 mb-1">Instructions</p><p className="text-sm">{selectedP.notes}</p></div>}
            </div>
          </div>
        )}

        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowFormModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <h3 className="text-xl font-semibold mb-4">{editingP ? "Modifier" : "Nouvelle"} Ordonnance</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select value={formData.consultation} required onChange={(e) => setFormData({ ...formData, consultation: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]">
                  <option value="">Sélectionner une consultation</option>
                  {consultations.map((c) => (
                    <option key={c.id} value={c.id}>{c.pet_name} - {new Date(c.created_at).toLocaleDateString("fr-FR")}</option>
                  ))}
                </select>
                <input placeholder="Médicament *" value={formData.medication} required onChange={(e) => setFormData({ ...formData, medication: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                <div className="grid grid-cols-3 gap-4">
                  <input placeholder="Dosage" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                  <input placeholder="Fréquence" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                  <input placeholder="Durée" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                </div>
                <textarea placeholder="Instructions pour le propriétaire" value={formData.notes} rows={3}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-[#8657ff] hover:bg-purple-700 text-white py-2 rounded font-medium">{editingP ? "Modifier" : "Créer"}</button>
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

export default VetPrescriptions;