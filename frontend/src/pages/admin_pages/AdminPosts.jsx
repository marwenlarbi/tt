import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import { 
  Search, 
  Eye, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Flag,
  Download,
  
  Calendar
} from 'lucide-react';

const AdminPosts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.q = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/admin/posts/', { params });
      // Normaliser id -> "POST###"
      setPosts(
        (res.data || []).map((p) => ({
          ...p,
          id: `POST${String(p.id).padStart(3, '0')}`,
          authorAvatar: '👤',
        }))
      );
    } catch (e) {
      console.error('Erreur posts admin:', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800', icon: XCircle },
    flagged: { label: 'Signalé', color: 'bg-orange-100 text-orange-800', icon: Flag }
  };

  const typeConfig = {
    text: { label: 'Texte', icon: MessageSquare },
    image: { label: 'Image', icon: ImageIcon },
    video: { label: 'Vidéo', icon: Video }
  };

  const filteredPosts = posts;

  const updatePostStatus = async (postId, newStatus) => {
    // postId ici est "POST###" => on extrait l'id numérique
    const numericId = parseInt(String(postId).replace('POST', ''), 10);
    try {
      await api.patch(`/admin/posts/${numericId}/`, { status: newStatus });
      await fetchPosts();
    } catch (e) {
      console.error('Erreur update post status:', e);
      alert("Impossible de mettre à jour le statut du post.");
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      const numericId = parseInt(String(postId).replace('POST', ''), 10);
      try {
        await api.delete(`/admin/posts/${numericId}/`);
        await fetchPosts();
      } catch (e) {
        console.error('Erreur delete post:', e);
        alert("Impossible de supprimer le post.");
      }
    }
  };

  const viewPostDetails = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const exportPosts = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Auteur,Type,Date,Statut,Likes,Commentaires,Signalements\n" +
      posts.map(post => 
        `${post.id},"${post.author}",${typeConfig[post.type].label},${post.date},${statusConfig[post.status].label},${post.likes},${post.comments},${post.reports}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "posts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Gestion des Posts</h1>
            <p className="text-gray-600">Modérez et gérez toutes les publications de la communauté</p>
          </div>
          
          <button
            onClick={exportPosts}
            className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>

        {loading && <div className="mb-4 text-gray-600">Chargement...</div>}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-[#8657ff]" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {posts.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signalés</p>
                <p className="text-2xl font-bold text-orange-600">
                  {posts.filter(p => p.status === 'flagged').length}
                </p>
              </div>
              <Flag className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold text-green-600">
                  {posts.reduce((sum, post) => sum + post.likes + post.comments, 0)}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par ID, auteur ou contenu..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="flagged">Signalé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>

        {/* Liste des posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => {
                  const StatusIcon = statusConfig[post.status].icon;
                  const TypeIcon = typeConfig[post.type].icon;
                  return (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{post.id}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {post.content}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{post.authorAvatar}</span>
                          <div>
                            <div className="font-medium text-gray-900">{post.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <TypeIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {typeConfig[post.type].label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(post.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[post.status].color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[post.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {post.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comments}
                          </div>
                          {post.reports > 0 && (
                            <div className="flex items-center text-red-500">
                              <Flag className="w-4 h-4 mr-1" />
                              {post.reports}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewPostDetails(post)}
                            className="text-[#8657ff] hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={post.status}
                            onChange={(e) => updatePostStatus(post.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                          >
                            <option value="pending">En attente</option>
                            <option value="approved">Approuver</option>
                            <option value="flagged">Signaler</option>
                            <option value="rejected">Rejeter</option>
                          </select>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal détails post */}
        {showModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Détails du post {selectedPost.id}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations auteur */}
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{selectedPost.authorAvatar}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedPost.author}</h3>
                    <p className="text-sm text-gray-500">Publié le {formatDate(selectedPost.date)}</p>
                  </div>
                </div>

                {/* Contenu du post */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Contenu</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>

                {/* Tags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Média */}
                {selectedPost.image && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Média</h4>
                    <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                      {selectedPost.type === 'image' ? (
                        <div className="flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 mr-2" />
                          Image jointe
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Video className="w-8 h-8 mr-2" />
                          Vidéo jointe
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Heart className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{selectedPost.likes}</p>
                    <p className="text-sm text-gray-600">J'aime</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{selectedPost.comments}</p>
                    <p className="text-sm text-gray-600">Commentaires</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <Flag className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">{selectedPost.reports}</p>
                    <p className="text-sm text-gray-600">Signalements</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      updatePostStatus(selectedPost.id, 'approved');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => {
                      updatePostStatus(selectedPost.id, 'rejected');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => {
                      deletePost(selectedPost.id);
                      setShowModal(false);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPosts;