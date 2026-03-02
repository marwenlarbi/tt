  import React, { useState } from "react";
  import VetLayout from './VetLayout';
  import {
    Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Clock,
    Calendar, User, Phone, Mail, PawPrint, Download
  } from "lucide-react";

  const VetAppointments = () => {
    const [appointments, setAppointments] = useState([
      { id: 1, date: "2025-03-01", time: "09:00", owner: "Imen Slama", ownerPhone: "+216 98 111 222", ownerEmail: "imen@email.com", petName: "Max", petSpecies: "Chien", petAge: 3, reason: "Vaccination annuelle", status: "confirmed", notes: "" },
      { id: 2, date: "2025-03-01", time: "10:30", owner: "Ahmed Ben Ali", ownerPhone: "+216 55 333 444", ownerEmail: "ahmed@email.com", petName: "Luna", petSpecies: "Chat", petAge: 2, reason: "Consultation générale", status: "confirmed", notes: "" },
      { id: 3, date: "2025-03-01", time: "14:00", owner: "Sara Mejri", ownerPhone: "+216 77 555 666", ownerEmail: "sara@email.com", petName: "Rocky", petSpecies: "Lapin", petAge: 1, reason: "Suivi post-opératoire", status: "pending", notes: "Opération 15 jours avant" },
      { id: 4, date: "2025-03-01", time: "15:30", owner: "Mohamed Trabelsi", ownerPhone: "+216 99 777 888", ownerEmail: "mo@email.com", petName: "Bella", petSpecies: "Chien", petAge: 5, reason: "Examen annuel", status: "pending", notes: "" },
      { id: 5, date: "2025-03-02", time: "09:00", owner: "Leila Chaabane", ownerPhone: "+216 22 999 000", ownerEmail: "leila@email.com", petName: "Minou", petSpecies: "Chat", petAge: 4, reason: "Problème digestif", status: "pending", notes: "" },
      { id: 6, date: "2025-03-02", time: "11:00", owner: "Rami Jebali", ownerPhone: "+216 44 123 456", ownerEmail: "rami@email.com", petName: "Zeus", petSpecies: "Chien", petAge: 7, reason: "Contrôle cardiaque", status: "cancelled", notes: "Annulé par le propriétaire" },
    ]);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("");
    const [selectedAppts, setSelectedAppts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingAppt, setEditingAppt] = useState(null);
    const [formData, setFormData] = useState({
      date: "", time: "", owner: "", ownerPhone: "", ownerEmail: "",
      petName: "", petSpecies: "Chien", petAge: "", reason: "", status: "pending", notes: ""
    });

    const filtered = appointments.filter((a) => {
      const matchSearch = a.owner.toLowerCase().includes(search.toLowerCase()) ||
        a.petName.toLowerCase().includes(search.toLowerCase()) ||
        a.reason.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || a.status === filterStatus;
      const matchDate = !filterDate || a.date === filterDate;
      return matchSearch && matchStatus && matchDate;
    });

    const statusBadge = (status) => {
      const map = {
        confirmed: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        cancelled: "bg-red-100 text-red-800",
        done: "bg-blue-100 text-blue-800",
      };
      const labels = { confirmed: "Confirmé", pending: "En attente", cancelled: "Annulé", done: "Terminé" };
      return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
    };

    const handleAction = (id, action) => {
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: action } : a));
    };

    const handleDelete = (id) => {
      if (window.confirm("Supprimer ce rendez-vous ?")) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
      }
    };

    const handleSelectAll = () => {
      setSelectedAppts(selectedAppts.length === filtered.length ? [] : filtered.map((a) => a.id));
    };

    const openForm = (appt = null) => {
      setEditingAppt(appt);
      setFormData(appt ? { ...appt } : {
        date: "", time: "", owner: "", ownerPhone: "", ownerEmail: "",
        petName: "", petSpecies: "Chien", petAge: "", reason: "", status: "pending", notes: ""
      });
      setShowFormModal(true);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingAppt) {
        setAppointments((prev) => prev.map((a) => a.id === editingAppt.id ? { ...a, ...formData } : a));
      } else {
        setAppointments((prev) => [...prev, { ...formData, id: Math.max(...prev.map((a) => a.id)) + 1 }]);
      }
      setShowFormModal(false);
    };

    const exportCSV = () => {
      const rows = filtered.map((a) => `${a.date},${a.time},${a.owner},${a.petName},${a.petSpecies},${a.reason},${a.status}`);
      const csv = ["Date,Heure,Propriétaire,Animal,Espèce,Motif,Statut", ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rendez-vous-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    };

    return (
      <VetLayout>
        <div className="p-10">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-[#0e9f6e]">Gestion des Rendez-vous</h1>
              <p className="text-gray-600">Gérez vos consultations et planifiez vos rendez-vous</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openForm()} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" /> Nouveau RDV
              </button>
              <button onClick={exportCSV} className="flex items-center gap-2 bg-[#0e9f6e] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                <Download className="w-4 h-4" /> Exporter
              </button>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total", value: appointments.length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Confirmés", value: appointments.filter((a) => a.status === "confirmed").length, color: "text-green-600", bg: "bg-green-50" },
              { label: "En attente", value: appointments.filter((a) => a.status === "pending").length, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Annulés", value: appointments.filter((a) => a.status === "cancelled").length, color: "text-red-600", bg: "bg-red-50" },
            ].map((s) => (
              <div key={s.label} className={`rounded-lg p-4 shadow-md ${s.bg}`}>
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
                <input
                  type="text" placeholder="Rechercher propriétaire, animal, motif..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]"
                />
              </div>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                <option value="all">Tous les statuts</option>
                <option value="confirmed">Confirmés</option>
                <option value="pending">En attente</option>
                <option value="done">Terminés</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>

            {selectedAppts.length > 0 && (
              <div className="flex gap-2 p-4 bg-gray-50 rounded-lg mt-4">
                <span className="text-sm text-gray-600 self-center">{selectedAppts.length} sélectionné(s)</span>
                <button onClick={() => { selectedAppts.forEach((id) => handleAction(id, "confirmed")); setSelectedAppts([]); }} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Confirmer</button>
                <button onClick={() => { selectedAppts.forEach((id) => handleAction(id, "cancelled")); setSelectedAppts([]); }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Annuler</button>
              </div>
            )}
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4"><input type="checkbox" checked={selectedAppts.length === filtered.length && filtered.length > 0} onChange={handleSelectAll} /></th>
                    <th className="text-left p-4 font-semibold">Date & Heure</th>
                    <th className="text-left p-4 font-semibold">Propriétaire</th>
                    <th className="text-left p-4 font-semibold">Animal</th>
                    <th className="text-left p-4 font-semibold">Motif</th>
                    <th className="text-left p-4 font-semibold">Statut</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((appt) => (
                    <tr key={appt.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <input type="checkbox" checked={selectedAppts.includes(appt.id)}
                          onChange={() => setSelectedAppts((prev) => prev.includes(appt.id) ? prev.filter((id) => id !== appt.id) : [...prev, appt.id])} />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-sm">{new Date(appt.date).toLocaleDateString("fr-FR")}</div>
                        <div className="text-xs text-gray-500">{appt.time}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-sm">{appt.owner}</div>
                        <div className="text-xs text-gray-500">{appt.ownerPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-sm">{appt.petName}</div>
                        <div className="text-xs text-gray-500">{appt.petSpecies} — {appt.petAge} ans</div>
                      </td>
                      <td className="p-4 text-sm max-w-[160px]">
                        <span className="truncate block">{appt.reason}</span>
                      </td>
                      <td className="p-4">{statusBadge(appt.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedAppt(appt); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 p-1" title="Voir"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openForm(appt)} className="text-green-600 hover:text-green-800 p-1" title="Modifier"><Edit className="w-4 h-4" /></button>
                          {appt.status === "pending" && (
                            <button onClick={() => handleAction(appt.id, "confirmed")} className="text-green-600 hover:text-green-800 p-1" title="Confirmer"><CheckCircle className="w-4 h-4" /></button>
                          )}
                          {appt.status !== "cancelled" && (
                            <button onClick={() => handleAction(appt.id, "cancelled")} className="text-orange-600 hover:text-orange-800 p-1" title="Annuler"><XCircle className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDelete(appt.id)} className="text-red-600 hover:text-red-800 p-1" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">Aucun rendez-vous trouvé.</div>
              )}
            </div>
          </div>

          {/* Modal détail */}
          {showModal && selectedAppt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
                <h3 className="text-xl font-semibold mb-4">Détail du Rendez-vous</h3>
                <div className="space-y-3">
                  <div className="flex gap-2"><Calendar className="w-4 h-4 text-gray-500 mt-0.5" /><span><strong>Date :</strong> {new Date(selectedAppt.date).toLocaleDateString("fr-FR")} à {selectedAppt.time}</span></div>
                  <div className="flex gap-2"><User className="w-4 h-4 text-gray-500 mt-0.5" /><span><strong>Propriétaire :</strong> {selectedAppt.owner}</span></div>
                  <div className="flex gap-2"><Phone className="w-4 h-4 text-gray-500 mt-0.5" /><span>{selectedAppt.ownerPhone}</span></div>
                  <div className="flex gap-2"><Mail className="w-4 h-4 text-gray-500 mt-0.5" /><span>{selectedAppt.ownerEmail}</span></div>
                  <div className="flex gap-2"><PawPrint className="w-4 h-4 text-gray-500 mt-0.5" /><span><strong>Animal :</strong> {selectedAppt.petName} ({selectedAppt.petSpecies}, {selectedAppt.petAge} ans)</span></div>
                  <div><strong>Motif :</strong> {selectedAppt.reason}</div>
                  {selectedAppt.notes && <div><strong>Notes :</strong> {selectedAppt.notes}</div>}
                  <div><strong>Statut :</strong> {statusBadge(selectedAppt.status)}</div>
                </div>
                <div className="mt-6 flex gap-3">
                  {selectedAppt.status === "pending" && (
                    <button onClick={() => { handleAction(selectedAppt.id, "confirmed"); setShowModal(false); }} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">Confirmer</button>
                  )}
                  <button onClick={() => { handleAction(selectedAppt.id, "done"); setShowModal(false); }} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">Marquer terminé</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal formulaire */}
          {showFormModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setShowFormModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
                <h3 className="text-xl font-semibold mb-4">{editingAppt ? "Modifier" : "Nouveau"} Rendez-vous</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  {[
                    { key: "owner", placeholder: "Nom du propriétaire", type: "text", span: 1 },
                    { key: "ownerPhone", placeholder: "Téléphone", type: "tel", span: 1 },
                    { key: "ownerEmail", placeholder: "Email", type: "email", span: 2 },
                    { key: "petName", placeholder: "Nom de l'animal", type: "text", span: 1 },
                    { key: "petAge", placeholder: "Âge de l'animal", type: "number", span: 1 },
                    { key: "date", placeholder: "Date", type: "date", span: 1 },
                    { key: "time", placeholder: "Heure", type: "time", span: 1 },
                    { key: "reason", placeholder: "Motif de la consultation", type: "text", span: 2 },
                    { key: "notes", placeholder: "Notes (optionnel)", type: "text", span: 2 },
                  ].map(({ key, placeholder, type, span }) => (
                    <input key={key} type={type} placeholder={placeholder} value={formData[key]} required={["owner", "petName", "date", "time", "reason"].includes(key)}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className={`col-span-${span} p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]`} />
                  ))}
                  <select value={formData.petSpecies} onChange={(e) => setFormData({ ...formData, petSpecies: e.target.value })}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                    {["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Autre"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]">
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="done">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                  <div className="col-span-2 flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-[#0e9f6e] hover:bg-green-700 text-white py-2 rounded font-medium">
                      {editingAppt ? "Modifier" : "Ajouter"}
                    </button>
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

  export default VetAppointments;