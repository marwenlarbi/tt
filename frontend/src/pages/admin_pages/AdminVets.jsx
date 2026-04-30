import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';

import { 
  Search, 
  Eye, 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Star,
  Shield,
  Download,
  Plus,
  User,
  X,
} from 'lucide-react';

function VetAvatar({ src, alt, className, iconClassName }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200 text-gray-500 shrink-0`}>
        <User className={iconClassName} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

const AdminVets = () => {
  const [vets, setVets] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [selectedVets, setSelectedVets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVet, setEditingVet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    specialty: '',
    licenseNumber: '',
    experience: '',
    education: '',
    status: 'pending'
  });

  const [loading, setLoading] = useState(false);

  const splitName = (fullName) => {
    const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    return {
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' '),
    };
  };

  const fetchVets = async () => {
    setLoading(true);
    try {
      const params = { role: 'vet' };
      if (searchTerm) params.q = searchTerm;
      if (filterStatus !== 'all') params.status = filterStatus;
      const res = await api.get('/admin/users/', { params });
      setVets(res.data);
    } catch (err) {
      console.error('Erreur chargement vets:', err);
      // Optionnel: on garde l'ancien état si déjà rempli
      setVets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus]);

  // Filtrage des vétérinaires
  const filteredVets = vets.filter(vet => {
    const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vet.status === filterStatus;
    const matchesCity = filterCity === 'all' || vet.city === filterCity;
    const matchesSpecialty = filterSpecialty === 'all' || vet.specialty === filterSpecialty;
    
    return matchesSearch && matchesStatus && matchesCity && matchesSpecialty;
  });

  const statuses = ['all', 'verified', 'pending', 'suspended', 'rejected'];
  const cities = ['all', ...new Set(vets.map(v => v.city))];
  const specialties = ['all', ...new Set(vets.map(v => v.specialty).filter(s => s !== 'Non spécifié'))];

  const handleSelectVet = (vetId) => {
    setSelectedVets(prev => 
      prev.includes(vetId) 
        ? prev.filter(id => id !== vetId)
        : [...prev, vetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVets.length === filteredVets.length) {
      setSelectedVets([]);
    } else {
      setSelectedVets(filteredVets.map(vet => vet.id));
    }
  };

  const handleVetAction = async (vetId, action) => {
    try {
      if (action === 'verify') await api.post(`/admin/vets/${vetId}/verify/`);
      if (action === 'suspend') await api.post(`/admin/vets/${vetId}/suspend/`);
      if (action === 'reject') await api.post(`/admin/vets/${vetId}/reject/`);
      await fetchVets();
    } catch (err) {
      console.error('Erreur action vet:', err);
      alert("Impossible d'effectuer l'action sur le vétérinaire.");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedVets.length === 0) return;

    try {
      if (action === 'verify') {
        await Promise.all(
          selectedVets.map((id) => api.post(`/admin/vets/${id}/verify/`))
        );
      } else if (action === 'suspend') {
        await Promise.all(
          selectedVets.map((id) => api.post(`/admin/vets/${id}/suspend/`))
        );
      } else if (action === 'delete') {
        if (!window.confirm(`Supprimer ${selectedVets.length} vétérinaire(s) ?`)) return;
        await Promise.all(selectedVets.map((id) => api.delete(`/admin/users/${id}/`)));
      } else {
        console.warn(`Unhandled bulk action: ${action}`);
        return;
      }

      setSelectedVets([]);
      await fetchVets();
    } catch (err) {
      console.error('Erreur bulk action vets:', err);
      alert("Erreur lors de l'action en lot.");
    }
  };

  const openModal = (vet) => {
    setSelectedVet(vet);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVet(null);
  };

  const handleEditVet = (vet) => {
    setEditingVet(vet);
    setFormData({
      name: vet.name,
      email: vet.email,
      phone: vet.phone,
      city: vet.city,
      address: vet.address,
      specialty: vet.specialty,
      licenseNumber: vet.licenseNumber,
      experience: vet.experience,
      education: vet.education,
      status: vet.status
    });
    setShowAddModal(true);
  };

  const handleAddVet = () => {
    setEditingVet(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      address: '',
      specialty: '',
      licenseNumber: '',
      experience: '',
      education: '',
      status: 'pending'
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { first_name, last_name } = splitName(formData.name);
    const payload = {
      role: 'vet',
      email: formData.email,
      phone: formData.phone,
      first_name,
      last_name,
      status: formData.status,
    };

    try {
      if (editingVet) {
        await api.patch(`/admin/users/${editingVet.id}/`, payload);
      } else {
        await api.post('/admin/users/create/', payload);
      }

      setShowAddModal(false);
      setEditingVet(null);
      await fetchVets();
    } catch (err) {
      console.error('Erreur submit vet:', err);
      alert("Impossible d'enregistrer le vétérinaire.");
    }
  };

  const handleDeleteVet = async (vetId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce vétérinaire ?')) return;
    try {
      await api.delete(`/admin/users/${vetId}/`);
      setSelectedVets(prev => prev.filter(id => id !== vetId));
      await fetchVets();
    } catch (err) {
      console.error('Erreur delete vet:', err);
      alert("Impossible de supprimer le vétérinaire.");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      verified: 'Vérifié',
      pending: 'En attente',
      suspended: 'Suspendu',
      rejected: 'Rejeté'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const exportVets = () => {
    const data = filteredVets.map(vet => ({
      ID: vet.id,
      Nom: vet.name,
      Email: vet.email,
      Téléphone: vet.phone,
      Ville: vet.city,
      Spécialité: vet.specialty,
      'Numéro de licence': vet.licenseNumber,
      Statut: vet.status,
      Note: vet.rating,
      'Nombre d\'avis': vet.reviews,
      Consultations: vet.consultations,
      'Date d\'inscription': formatDate(vet.joinDate)
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veterinaires-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderVetModal = () => {
    if (!selectedVet) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div>
              <div className="flex items-center mb-4">
                <VetAvatar
                  src={selectedVet.image}
                  alt={selectedVet.name}
                  className="w-20 h-20 rounded-full mr-4 object-cover"
                  iconClassName="w-10 h-10"
                />
                <div>
                  <h2 className="text-2xl font-bold">{selectedVet.name}</h2>
                  <p className="text-gray-600">{selectedVet.specialty}</p>
                  {getStatusBadge(selectedVet.status)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Informations de contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedVet.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{selectedVet.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{selectedVet.address}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Informations professionnelles</h3>
                <div className="space-y-2">
                  <p><strong>Licence:</strong> {selectedVet.licenseNumber}</p>
                  <p><strong>Expérience:</strong> {selectedVet.experience} ans</p>
                  <p><strong>Formation:</strong> {selectedVet.education}</p>
                  <p><strong>Langues:</strong> {selectedVet.languages.join(', ')}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Spécialités</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedVet.specialties.map((spec, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistiques et actions */}
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-lg">{selectedVet.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">Note moyenne</p>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-lg">{selectedVet.reviews}</span>
                    <p className="text-xs text-gray-600">Avis</p>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-lg">{selectedVet.consultations}</span>
                    <p className="text-xs text-gray-600">Consultations</p>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-lg">{formatDate(selectedVet.joinDate)}</span>
                    <p className="text-xs text-gray-600">Membre depuis</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Horaires</h3>
                <div className="space-y-2">
                  {Object.entries(selectedVet.schedule).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span>{day}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Actions</h3>
                
                {selectedVet.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleVetAction(selectedVet.id, 'verify');
                        closeModal();
                      }}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Vérifier et approuver
                    </button>
                    <button
                      onClick={() => {
                        handleVetAction(selectedVet.id, 'reject');
                        closeModal();
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter la demande
                    </button>
                  </>
                )}
                
                {selectedVet.status === 'verified' && (
                  <button
                    onClick={() => {
                      handleVetAction(selectedVet.id, 'suspend');
                      closeModal();
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg"
                  >
                    Suspendre temporairement
                  </button>
                )}
                
                {selectedVet.status === 'suspended' && (
                  <button
                    onClick={() => {
                      handleVetAction(selectedVet.id, 'verify');
                      closeModal();
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                  >
                    Réactiver le compte
                  </button>
                )}

                <button
                  onClick={() => {
                    closeModal();
                    handleEditVet(selectedVet);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier les informations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAddVetModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowAddModal(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          
          <h3 className="text-xl font-semibold mb-4">
            {editingVet ? 'Modifier vétérinaire' : 'Ajouter vétérinaire'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom complet"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
              required
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            />
            <input
              type="text"
              placeholder="Ville"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            />
            <input
              type="text"
              placeholder="Spécialité"
              value={formData.specialty}
              onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            />
            <input
              type="text"
              placeholder="Adresse complète"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            />
            <input
              type="text"
              placeholder="Numéro de licence"
              value={formData.licenseNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            />
            <input
              type="number"
              placeholder="Années d'expérience"
              value={formData.experience}
              onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            />
            <input
              type="text"
              placeholder="Formation/Éducation"
              value={formData.education}
              onChange={(e) => setFormData((prev) => ({ ...prev, education: e.target.value }))}
              className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="pending">En attente</option>
              <option value="verified">Vérifié</option>
              <option value="suspended">Suspendu</option>
              <option value="rejected">Rejeté</option>
            </select>
            
            <div className="col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#8657ff] hover:bg-purple-700 text-white py-2 px-4 rounded font-medium"
              >
                {editingVet ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Gestion des Vétérinaires</h1>
            <p className="text-gray-600">Gérez les comptes vétérinaires de la plateforme</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddVet}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter vétérinaire
            </button>
            <button
              onClick={exportVets}
              className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {loading && <div className="mb-4 text-gray-600">Chargement...</div>}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, ville ou spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
              />
            </div>

            {/* Filtres */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="all">Tous les statuts</option>
              {statuses.slice(1).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="all">Toutes les villes</option>
              {cities.slice(1).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="all">Toutes les spécialités</option>
              {specialties.slice(1).map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          {/* Actions en lot */}
          {selectedVets.length > 0 && (
            <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 self-center">
                {selectedVets.length} vétérinaire(s) sélectionné(s)
              </span>
              <button
                onClick={() => handleBulkAction('verify')}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Vérifier
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
              >
                Suspendre
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vétérinaires</p>
                <p className="text-2xl font-bold text-blue-600">{vets.length}</p>
              </div>
              <Stethoscope className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vérifiés</p>
                <p className="text-2xl font-bold text-green-600">
                  {vets.filter(v => v.status === 'verified').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {vets.filter(v => v.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-purple-600">
                  {vets.length ? (vets.reduce((sum, v) => sum + (Number(v.rating) || 0), 0) / vets.length).toFixed(1) : '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tableau des vétérinaires */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedVets.length === filteredVets.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold">Vétérinaire</th>
                  <th className="text-left p-4 font-semibold">Contact</th>
                  <th className="text-left p-4 font-semibold">Localisation</th>
                  <th className="text-left p-4 font-semibold">Spécialité</th>
                  <th className="text-left p-4 font-semibold">Statut</th>
                  <th className="text-left p-4 font-semibold">Performance</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVets.map((vet) => (
                  <tr key={vet.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedVets.includes(vet.id)}
                        onChange={() => handleSelectVet(vet.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <VetAvatar
                          src={vet.image}
                          alt={vet.name}
                          className="w-10 h-10 rounded-full object-cover"
                          iconClassName="w-6 h-6"
                        />
                        <div>
                          <div className="font-medium">{vet.name}</div>
                          <div className="text-sm text-gray-500">{vet.licenseNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-sm">{vet.email}</div>
                        <div className="text-sm text-gray-500">{vet.phone}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{vet.city}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {vet.specialty}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(vet.status)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{vet.rating}</span>
                          <span className="text-gray-500">({vet.reviews})</span>
                        </div>
                        <div className="text-gray-500">{vet.consultations} consultations</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(vet)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditVet(vet)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVet(vet.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {showModal && renderVetModal()}
        {showAddModal && renderAddVetModal()}
      </div>
    </AdminLayout>
  );
};

export default AdminVets;