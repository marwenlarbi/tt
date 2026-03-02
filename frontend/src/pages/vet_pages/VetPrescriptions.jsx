import React, { useState } from "react";
import VetLayout from './VetLayout';
import { Search, Plus, Eye, Edit, Trash2, Download, FileText, Printer } from "lucide-react";

const VetPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1, date: "2025-03-01", petName: "Max", species: "Chien", owner: "Imen Slama", ownerPhone: "+216 98 111 222",
      medications: [
        { name: "Vaccin polyvalent DHLPP", dosage: "1 dose", frequency: "1 fois", duration: "Annuel" },
        { name: "Milbemax", dosage: "2 comprimés", frequency: "1 fois", duration: "Dose unique" }
      ],
      instructions: "Administrer le déparasitaire à jeun. Rappel vaccin dans 1 an.", status: "active"
    },
    {
      id: 2, date: "2025-03-01", petName: "Luna", species: "Chat", owner: "Ahmed Ben Ali", ownerPhone: "+216 55 333 444",
      medications: [
        { name: "Royal Canin Gastro Intestinal", dosage: "50g", frequency: "2x/jour", duration: "10 jours" },
        { name: "Fortiflora (probiotiques)", dosage: "1 sachet", frequency: "1x/jour", duration: "7 jours" }
      ],
      instructions: "Alimentation exclusive. Si pas d'amélioration en 3 jours, rappeler.", status: "active"
    },
    {
      id: 3, date: "2025-02-27", petName: "Rex", species: "Chien", owner: "Omar Belhaj", ownerPhone: "+216 44 777 888",
      medications: [
        { name: "Enalapril 5mg", dosage: "1 comprimé", frequency: "2x/jour", duration: "À vie" },
        { name: "Furosémide 20mg", dosage: "1/2 comprimé", frequency: "1x/jour", duration: "30 jours" }
      ],
      instructions: "⚠️ Régime hyposodé obligatoire. Ne jamais arrêter le traitement sans avis vétérinaire. Contrôle dans 3 semaines.", status: "active"
    },
    {
      id: 4, date: "2025-02-20", petName: "Bella", species: "Chien", owner: "Mohamed Trabelsi", ownerPhone: "+216 99 777 888",
      medications: [
        { name: "Advocate (antiparasitaire)", dosage: "1 pipette", frequency: "1 fois", duration: "Mensuel" }
      ],
      instructions: "Application cutanée. Renouveler chaque mois.", status: "expired"
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedP, setSelectedP] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingP, setEditingP] = useState(null);
  const [formData, setFormData] = useState({
    date: "", petName: "", species: "Chien", owner: "", ownerPhone: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
    instructions: "", status: "active"
  });

  const filtered = prescriptions.filter((p) => {
    const matchSearch = p.petName.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status) => {
    const map = { active: "bg-green-100 text-green-800", expired: "bg-gray-100 text-gray-800", cancelled: "bg-red-100 text-red-800" };
    const labels = { active: "Active", expired: "Expirée", cancelled: "Annulée" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cette ordonnance ?")) setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const addMedication = () => setFormData({ ...formData, medications: [...formData.medications, { name: "", dosage: "", frequency: "", duration: "" }] });
  const removeMedication = (idx) => setFormData({ ...formData, medications: formData.medications.filter((_, i) => i !== idx) });
  const updateMedication = (idx, field, value) => {
    const meds = [...formData.medications];
    meds[idx][field] = value;
    setFormData({ ...formData, medications: meds });
  };

  const openForm = (p = null) => {
    setEditingP(p);
    setFormData(p ? { ...p } : { date: "", petName: "", species: "Chien", owner: "", ownerPhone: "", medications: [{ name: "", dosage: "", frequency: "", duration: "" }], instructions: "", status: "active" });
    setShowFormModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingP) {
      setPrescriptions((prev) => prev.map((p) => p.id === editingP.id ? { ...p, ...formData } : p));
    } else {
      setPrescriptions((prev) => [...prev, { ...formData, id: Math.max(...prev.map((p) => p.id)) + 1 }]);
    }
    setShowFormModal(false);
  };

  const handlePrint = (p) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Ordonnance</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}
      h1{color:#0e9f6e}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#f0fdf4}.footer{margin-top:40px;text-align:right}</style>
      </head><body>
      <h1>🩺 Ordonnance Vétérinaire</h1>
      <p><strong>Date :</strong> ${new Date(p.date).toLocaleDateString("fr-FR")}</p>
      <p><strong>Animal :</strong> ${p.petName} (${p.species})</p>
      <p><strong>Propriétaire :</strong> ${p.owner} — ${p.ownerPhone}</p>
      <h3>Médicaments prescrits</h3>
      <table><tr><th>Médicament</th><th>Dosage</th><th>Fréquence</th><th>Durée</th></tr>
      ${p.medications.map((m) => `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.duration}</td></tr>`).join("")}
      </table>
      <p><strong>Instructions :</strong> ${p.instructions}</p>
      <div class="footer"><p>Dr. Mouna Boukadi — Vétérinaire</p><p>VET-TN-2020-001</p></div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#0e9f6e]">Ordonnances</h1>
            <p className="text-gray-600">Gérez et imprimez vos ordonnances médicales</p>
          </div>
          <button onClick={() => openForm()} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
            <Plus className="w-4 h-4" /> Nouvelle ordonnance
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold text-blue-600">{prescriptions.length}</p></div>
          <div className="bg-white rounded-lg p-4 shadow-md"><p className="text-sm text-gray-600">Actives</p><p className="text-2xl font-bold text-green-600">{prescriptions.filter((p) => p.status === "active").length}</p></div>
          <div className="bg-white rounded-lg p-4 shadow-md"><p className="text-sm text-gray-600">Expirées</p><p className="text-2xl font-bold text-gray-600">{prescriptions.filter((p) => p.status === "expired").length}</p></div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="expired">Expirées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>

        {/* Liste ordonnances */}
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full"><FileText className="w-6 h-6 text-green-600" /></div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">{p.petName} ({p.species})</h3>
                      {statusBadge(p.status)}
                    </div>
                    <p className="text-sm text-gray-500">{p.owner} • {new Date(p.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedP(p); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 p-2" title="Voir"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handlePrint(p)} className="text-green-600 hover:text-green-800 p-2" title="Imprimer"><Printer className="w-4 h-4" /></button>
                  <button onClick={() => openForm(p)} className="text-orange-600 hover:text-orange-800 p-2" title="Modifier"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 p-2" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.medications.map((m, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                    💊 {m.name} — {m.dosage}
                  </span>
                ))}
              </div>
              {p.instructions && <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded italic">{p.instructions}</p>}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Aucune ordonnance trouvée.</div>}
        </div>

        {/* Modal détail */}
        {showModal && selectedP && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#0e9f6e]">Ordonnance</h2>
                  <p className="text-gray-500">{new Date(selectedP.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <button onClick={() => handlePrint(selectedP)} className="flex items-center gap-2 bg-[#0e9f6e] text-white px-4 py-2 rounded-lg">
                  <Printer className="w-4 h-4" /> Imprimer
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 mb-1">Animal</p><p className="font-bold">{selectedP.petName}</p><p className="text-sm text-gray-600">{selectedP.species}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 mb-1">Propriétaire</p><p className="font-bold">{selectedP.owner}</p><p className="text-sm text-gray-600">{selectedP.ownerPhone}</p></div>
              </div>
              <h4 className="font-semibold mb-3">Médicaments prescrits</h4>
              <table className="w-full border-collapse mb-4">
                <thead><tr className="bg-green-50"><th className="text-left p-2 border border-gray-200 text-sm">Médicament</th><th className="text-left p-2 border border-gray-200 text-sm">Dosage</th><th className="text-left p-2 border border-gray-200 text-sm">Fréquence</th><th className="text-left p-2 border border-gray-200 text-sm">Durée</th></tr></thead>
                <tbody>{selectedP.medications.map((m, i) => <tr key={i}><td className="p-2 border border-gray-200 text-sm">{m.name}</td><td className="p-2 border border-gray-200 text-sm">{m.dosage}</td><td className="p-2 border border-gray-200 text-sm">{m.frequency}</td><td className="p-2 border border-gray-200 text-sm">{m.duration}</td></tr>)}</tbody>
              </table>
              {selectedP.instructions && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"><p className="font-semibold text-yellow-800 mb-1">Instructions</p><p className="text-sm">{selectedP.instructions}</p></div>}
            </div>
          </div>
        )}

        {/* Modal formulaire */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowFormModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <h3 className="text-xl font-semibold mb-4">{editingP ? "Modifier" : "Nouvelle"} Ordonnance</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={formData.date} required onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                  <select value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                    {["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Autre"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <input placeholder="Nom de l'animal *" value={formData.petName} required onChange={(e) => setFormData({ ...formData, petName: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                  <input placeholder="Propriétaire *" value={formData.owner} required onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                  <input placeholder="Téléphone" value={formData.ownerPhone} onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })} className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Médicaments</h4>
                    <button type="button" onClick={addMedication} className="text-sm text-[#0e9f6e] hover:underline">+ Ajouter</button>
                  </div>
                  {formData.medications.map((m, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                      <input placeholder="Médicament" value={m.name} required onChange={(e) => updateMedication(i, "name", e.target.value)} className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e] text-sm" />
                      <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedication(i, "dosage", e.target.value)} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e] text-sm" />
                      <div className="flex gap-1">
                        <input placeholder="Fréquence" value={m.frequency} onChange={(e) => updateMedication(i, "frequency", e.target.value)} className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e] text-sm" />
                        {formData.medications.length > 1 && <button type="button" onClick={() => removeMedication(i)} className="text-red-500 px-1">✕</button>}
                      </div>
                      <input placeholder="Durée" value={m.duration} onChange={(e) => updateMedication(i, "duration", e.target.value)} className="col-span-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e] text-sm" />
                    </div>
                  ))}
                </div>
                <textarea placeholder="Instructions pour le propriétaire" value={formData.instructions} rows={3}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                  <option value="active">Active</option>
                  <option value="expired">Expirée</option>
                  <option value="cancelled">Annulée</option>
                </select>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-[#0e9f6e] hover:bg-green-700 text-white py-2 rounded font-medium">{editingP ? "Modifier" : "Créer"}</button>
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