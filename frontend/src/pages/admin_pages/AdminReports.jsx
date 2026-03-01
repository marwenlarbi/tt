import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  MessageSquare,
  FileText,
  Shield,
  Download,
  Calendar,
  Flag,
  Ban,
  Trash2
} from 'lucide-react';

const AdminReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Données d'exemple des signalements
  const [reports, setReports] = useState([
    {
      id: 'RPT001',
      type: 'post',
      contentId: 'POST123',
      reportedBy: 'Marie Dupont',
      reporterEmail: 'marie.dupont@email.com',
      reportedUser: 'Jean Martin',
      reportedUserEmail: 'jean.martin@email.com',
      reason: 'Contenu inapproprié',
      description: 'Ce post contient des images choquantes qui ne respectent pas les règles de la communauté.',
      content: 'Regardez cette vidéo de combat d\'animaux...',
      date: '2024-03-15T10:30:00',
      status: 'pending',
      priority: 'high',
      category: 'inappropriate_content'
    },
    {
      id: 'RPT002',
      type: 'user',
      contentId: 'USER456',
      reportedBy: 'Sophie Legrand',
      reporterEmail: 'sophie.legrand@email.com',
      reportedUser: 'Pierre Blanc',
      reportedUserEmail: 'pierre.blanc@email.com',
      reason: 'Harcèlement',
      description: 'Cet utilisateur m\'envoie des messages inappropriés en privé depuis plusieurs jours.',
      content: 'Profil utilisateur suspect',
      date: '2024-03-14T14:20:00',
      status: 'investigating',
      priority: 'high',
      category: 'harassment'
    },
    {
      id: 'RPT003',
      type: 'comment',
      contentId: 'CMT789',
      reportedBy: 'Lucas Bernard',
      reporterEmail: 'lucas.bernard@email.com',
      reportedUser: 'Anna Moreau',
      reportedUserEmail: 'anna.moreau@email.com',
      reason: 'Spam',
      description: 'Ce commentaire est clairement du spam publicitaire.',
      content: 'Achetez nos produits miracle pour animaux sur...',
      date: '2024-03-13T09:15:00',
      status: 'resolved',
      priority: 'medium',
      category: 'spam'
    },
    {
      id: 'RPT004',
      type: 'post',
      contentId: 'POST456',
      reportedBy: 'Emma Rousseau',
      reporterEmail: 'emma.rousseau@email.com',
      reportedUser: 'Thomas Petit',
      reportedUserEmail: 'thomas.petit@email.com',
      reason: 'Fausses informations',
      description: 'Ce post diffuse de fausses informations médicales dangereuses pour les animaux.',
      content: 'Donnez du chocolat à votre chien, c\'est bon pour lui...',
      date: '2024-03-12T16:45:00',
      status: 'rejected',
      priority: 'high',
      category: 'misinformation'
    }
  ]);

  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    investigating: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: AlertTriangle },
    resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const typeConfig = {
    post: { label: 'Post', icon: FileText },
    comment: { label: 'Commentaire', icon: MessageSquare },
    user: { label: 'Utilisateur', icon: User }
  };

  const priorityConfig = {
    low: { label: 'Faible', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Élevée', color: 'bg-red-100 text-red-800' }
  };

  const categoryConfig = {
    inappropriate_content: 'Contenu inapproprié',
    harassment: 'Harcèlement',
    spam: 'Spam',
    misinformation: 'Fausses informations',
    copyright: 'Violation de copyright',
    violence: 'Violence',
    other: 'Autre'
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const updateReportStatus = (reportId, newStatus) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
  };

  const deleteReport = (reportId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      setReports(reports.filter(report => report.id !== reportId));
    }
  };

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const exportReports = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Type,Signalé par,Utilisateur signalé,Raison,Date,Statut,Priorité\n" +
      reports.map(report => 
        `${report.id},${typeConfig[report.type].label},"${report.reportedBy}","${report.reportedUser}","${report.reason}",${report.date},${statusConfig[report.status].label},${priorityConfig[report.priority].label}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "signalements.csv");
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

  const takeAction = (action, reportId) => {
    switch (action) {
      case 'approve':
        updateReportStatus(reportId, 'resolved');
        break;
      case 'reject':
        updateReportStatus(reportId, 'rejected');
        break;
      case 'investigate':
        updateReportStatus(reportId, 'investigating');
        break;
      default:
        break;
    }
    setShowModal(false);
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Gestion des Signalements</h1>
            <p className="text-gray-600">Modérez et traitez tous les signalements de la communauté</p>
          </div>
          
          <button
            onClick={exportReports}
            className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Signalements</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-[#8657ff]" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'investigating').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Priorité élevée</p>
                <p className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.priority === 'high').length}
                </p>
              </div>
              <Flag className="h-8 w-8 text-red-600" />
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
                placeholder="Rechercher par ID, utilisateur ou raison..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="investigating">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="rejected">Rejeté</option>
              </select>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="post">Posts</option>
                <option value="comment">Commentaires</option>
                <option value="user">Utilisateurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des signalements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signalement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signalé par
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur signalé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => {
                  const StatusIcon = statusConfig[report.status].icon;
                  const TypeIcon = typeConfig[report.type].icon;
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{report.id}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {report.reason}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{report.reportedBy}</div>
                          <div className="text-sm text-gray-500">{report.reporterEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{report.reportedUser}</div>
                          <div className="text-sm text-gray-500">{report.reportedUserEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <TypeIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {typeConfig[report.type].label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(report.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[report.priority].color}`}>
                          {priorityConfig[report.priority].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[report.status].color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[report.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewReportDetails(report)}
                            className="text-[#8657ff] hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={report.status}
                            onChange={(e) => updateReportStatus(report.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                          >
                            <option value="pending">En attente</option>
                            <option value="investigating">En cours</option>
                            <option value="resolved">Résolu</option>
                            <option value="rejected">Rejeté</option>
                          </select>
                          <button
                            onClick={() => deleteReport(report.id)}
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

        {/* Modal détails signalement */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Détails du signalement {selectedReport.id}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations du signalement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-red-600" />
                      Signalé par
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nom:</strong> {selectedReport.reportedBy}</div>
                      <div><strong>Email:</strong> {selectedReport.reporterEmail}</div>
                      <div><strong>Date:</strong> {formatDate(selectedReport.date)}</div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                      Utilisateur signalé
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nom:</strong> {selectedReport.reportedUser}</div>
                      <div><strong>Email:</strong> {selectedReport.reportedUserEmail}</div>
                      <div><strong>Type:</strong> {typeConfig[selectedReport.type].label}</div>
                    </div>
                  </div>
                </div>

                {/* Détails du signalement */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Raison du signalement</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Motif:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {selectedReport.reason}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Catégorie:</span>
                      <span className="text-sm text-gray-600">
                        {categoryConfig[selectedReport.category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Priorité:</span>
                      <span className={`px-2 py-1 rounded text-sm ${priorityConfig[selectedReport.priority].color}`}>
                        {priorityConfig[selectedReport.priority].label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Description détaillée</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>

                {/* Contenu signalé */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-yellow-600" />
                    Contenu signalé
                  </h3>
                  <div className="bg-white rounded p-3 border">
                    <p className="text-gray-700 italic">"{selectedReport.content}"</p>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Actions recommandées</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>• Vérifier l'historique de l'utilisateur signalé</div>
                    <div>• Examiner le contenu en détail</div>
                    <div>• Contacter les parties si nécessaire</div>
                    <div>• Appliquer les sanctions appropriées</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => takeAction('investigate', selectedReport.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Enquêter
                  </button>
                  <button
                    onClick={() => takeAction('approve', selectedReport.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => takeAction('reject', selectedReport.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                  <button
                    onClick={() => {
                      // Action pour bannir l'utilisateur
                      alert('Fonctionnalité de bannissement à implémenter');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Bannir
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

export default AdminReports;