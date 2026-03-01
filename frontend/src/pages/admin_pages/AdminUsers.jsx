import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Search, Edit, Trash2, Mail, Phone, MapPin, Calendar, User, Crown } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      address: 'Paris, France',
      joinDate: '2023-01-15',
      lastLogin: '2024-01-20',
      status: 'active',
      role: 'user',
      posts: 42,
      pets: 2,
      avatar: '/users/user_1.jpg'
    },
    {
      id: 2,
      name: 'Marie Lefèvre',
      email: 'marie.lefevre@email.com',
      phone: '+33 6 98 76 54 32',
      address: 'Lyon, France',
      joinDate: '2023-03-22',
      lastLogin: '2024-01-19',
      status: 'active',
      role: 'vet',
      posts: 78,
      pets: 1,
      avatar: '/users/user_2.jpg'
    },
    {
      id: 3,
      name: 'Thomas Martin',
      email: 'thomas.martin@email.com',
      phone: '+33 6 11 22 33 44',
      address: 'Marseille, France',
      joinDate: '2023-07-10',
      lastLogin: '2024-01-18',
      status: 'suspended',
      role: 'user',
      posts: 23,
      pets: 1,
      avatar: '/users/user_3.avif'
    },
    {
      id: 4,
      name: 'Sophie Dubois',
      email: 'sophie.dubois@email.com',
      phone: '+33 6 55 44 33 22',
      address: 'Toulouse, France',
      joinDate: '2023-05-08',
      lastLogin: '2024-01-21',
      status: 'active',
      role: 'admin',
      posts: 156,
      pets: 3,
      avatar: '/users/user_4.jpg'
    }
  ]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Modifier utilisateur existant
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Ajouter nouvel utilisateur
      const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
      const newUser = {
        id: maxId + 1,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: '-',
        posts: 0,
        pets: 0,
        avatar: '/users/default.jpg'
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    setShowModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    
    switch (action) {
      case 'activate':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) 
            ? { ...user, status: 'active' }
            : user
        ));
        break;
      case 'suspend':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) 
            ? { ...user, status: 'suspended' }
            : user
        ));
        break;
      case 'delete':
        if (window.confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
          setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
          setSelectedUsers([]);
        }
        break;
      default:
        break;
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
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                            }}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
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
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#8657ff] hover:bg-purple-700 text-white py-2 px-4 rounded font-medium transition-colors"
                  >
                    {editingUser ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded font-medium transition-colors"
                  >
                    Annuler
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