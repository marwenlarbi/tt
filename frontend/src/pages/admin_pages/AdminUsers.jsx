import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import PageSpinner from '../../components/PageSpinner';
import api from '../../services/api';
import { Search, Edit, Trash2, Mail, Phone, MapPin, Calendar, User, Crown } from 'lucide-react';

function UserAvatar({ src, alt, className, iconClassName }) {
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

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'user',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);

  const splitName = (fullName) => {
    const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    return {
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' '),
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (searchTerm) params.q = searchTerm;
      const res = await api.get('/admin/users/', { params });
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur chargement users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterRole]);

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'user',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { first_name, last_name } = splitName(formData.name);
    const payload = {
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      first_name,
      last_name,
      status: formData.status,
    };

    try {
      if (editingUser) {
        await api.patch(`/admin/users/${editingUser.id}/`, payload);
      } else {
        await api.post('/admin/users/create/', payload);
      }

      setShowModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Erreur submit user:', err);
      alert("Impossible d'enregistrer l'utilisateur.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${userId}/`);
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      await fetchUsers();
    } catch (err) {
      console.error('Erreur delete user:', err);
      alert("Impossible de supprimer l'utilisateur.");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      if (action === 'activate') {
        await Promise.all(selectedUsers.map((id) => api.post(`/admin/users/${id}/activate/`)));
      } else if (action === 'suspend') {
        await Promise.all(selectedUsers.map((id) => api.post(`/admin/users/${id}/suspend/`)));
      } else if (action === 'delete') {
        if (!window.confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`)) return;
        await Promise.all(selectedUsers.map((id) => api.delete(`/admin/users/${id}/`)));
      } else {
        return;
      }
      setSelectedUsers([]);
      await fetchUsers();
    } catch (err) {
      console.error('Erreur bulk action users:', err);
      alert("Erreur lors de l'action en lot.");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    
    const labels = {
      active: 'Actif',
      suspended: 'Suspendu',
      pending: 'En attente'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      vet: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    const icons = {
      admin: <Crown className="w-3 h-3 mr-1" />,
      vet: <User className="w-3 h-3 mr-1" />,
      user: <User className="w-3 h-3 mr-1" />
    };
    
    const labels = {
      admin: 'Admin',
      vet: 'Vétérinaire',
      user: 'Utilisateur'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[role]}`}>
        {icons[role]}
        {labels[role]}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Gérez les comptes utilisateurs de la plateforme</p>
        </div>

        {loading && (
          <div className="mb-4 flex justify-start">
            <PageSpinner compact size="md" />
          </div>
        )}

        {/* Filtres et actions */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
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
              <option value="active">Actifs</option>
              <option value="suspended">Suspendus</option>
              <option value="pending">En attente</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="vet">Vétérinaires</option>
              <option value="user">Utilisateurs</option>
            </select>

            <button
              onClick={handleAddUser}
              className="bg-[#8657ff] hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Ajouter utilisateur
            </button>
          </div>

          {/* Actions en lot */}
          {selectedUsers.length > 0 && (
            <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 self-center">
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Activer
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Suspendre
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 focus:ring-[#8657ff]"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">Utilisateur</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Contact</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Rôle</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Statut</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Activité</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Inscription</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 focus:ring-[#8657ff]"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            iconClassName="w-6 h-6"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {user.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {user.address}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          <div>{user.posts} posts</div>
                          <div>{user.pets} animaux</div>
                          <div className="text-gray-500">
                            Dernière connexion: {user.lastLogin}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal d'édition/ajout */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
            role="presentation"
          >
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-xl leading-none text-gray-500 hover:text-gray-700"
                aria-label="Fermer"
              >
                ×
              </button>
              
              <h3 className="text-xl font-semibold mb-4">
                {editingUser ? 'Modifier utilisateur' : 'Ajouter utilisateur'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    placeholder="Adresse"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="vet">Vétérinaire</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                  >
                    <option value="active">Actif</option>
                    <option value="suspended">Suspendu</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#8657ff] hover:bg-purple-700 text-white py-2 px-4 rounded font-medium transition-colors"
                  >
                    {editingUser ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;