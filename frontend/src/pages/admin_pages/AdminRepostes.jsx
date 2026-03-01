import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Flag,
  Shield,
  Ban,
  Download
} from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      type: 'post',
      contentId: 15,
      contentTitle: 'Post inapproprié avec contenu violent',
      contentAuthor: 'User123',
      reportedBy: 'Marie Lefèvre',
      reporterEmail: 'marie.lefevre@email.com',
      reason: 'Contenu inapproprié',
      description: 'Ce post contient des images violentes qui ne respectent pas les règles de la communauté.',
      date: '2024-01-20T10:30:00',
      status: 'pending',
      severity: 'high',
      category: 'Violence',
      adminNotes: ''
    },
    {
      id: 2,
      type: 'comment',
      contentId: 45,
      contentTitle: 'Commentaire offensant sur "Soins pour chats"',
      contentAuthor: 'TrollUser',
      reportedBy: 'Jean Dupont',
      reporterEmail: 'jean.dupont@email.com',
      reason: 'Langage offensant',
      description: 'L\'utilisateur utilise un langage inapproprié et offensant dans ses commentaires.',
      date: '2024-01-19T15:45:00',
      status: 'reviewed',
      severity: 'medium',
      category: 'Harcèlement',
      adminNotes: 'Contenu vérifié, action nécessaire'
    },
    {
      id: 3,
      type: 'user',
      contentId: 78,
      contentTitle: 'Profil utilisateur suspect',
      contentAuthor: 'SpamBot2024',
      reportedBy: 'Dr. Mouna',
      reporterEmail: 'dr.mouna@email.com',
      reason: 'Spam/Bot',
      description: 'Ce compte semble être un bot qui publie du spam automatiquement.',
      date: '2024-01-18T09:15:00',
      status: 'resolved',
      severity: 'high',
      category: 'Spam',
      adminNotes: 'Compte suspendu définitivement'
    },
    {
      id: 4,
      type: 'post',
      contentId: 92,
      contentTitle: 'Vente illégale d\'animaux',
      contentAuthor: 'IllegalSeller',
      reportedBy: 'Sarah Martin',
      reporterEmail: 'sarah.martin@email.com',
      reason: 'Activité illégale',
      description: 'L\'utilisateur tente de vendre des animaux sans licence appropriée.',
      date: '2024-01-17T14:20:00',
      status: 'pending',
      severity: 'critical',
      category: 'Illégal',
      adminNotes: ''
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedReports, setSelectedReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Filtrage des signalements
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.contentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.contentAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  const statuses = ['all', 'pending', 'reviewed', 'resolved', 'dismissed'];
  const severities = ['all', 'low', 'medium', 'high', 'critical'];
  const types = ['all', 'post', 'comment', 'user', 'message'];

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  };

  const handleReportAction = (reportId, action, notes = '') => {
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        switch (action) {
          case 'approve':
            return { ...report, status: 'resolved', adminNotes: notes };
          case 'dismiss':
            return { ...report, status: 'dismissed', adminNotes: notes };
          case 'review':
            return { ...report, status: 'reviewed', adminNotes: notes };
          default:
            return report;
        }
      }
      return report;
    }));
  };

  const handleBulkAction = (action) => {
    if (selectedReports.length === 0) return;
    
    switch (action) {
      case 'review':
        setReports(prev => prev.map(report => 
          selectedReports.includes(report.id) 
            ? { ...report, status: 'reviewed' }
            : report
        ));
        break;
      case 'resolve':
        setReports(prev => prev.map(report => 
          selectedReports.includes(report.id) 
            ? { ...report, status: 'resolved' }
            : report
        ));
        break;
      case 'dismiss':
        if (window.confirm(`Rejeter ${selectedReports.length} signalement(s) ?`)) {
          setReports(prev => prev.map(report => 
            selectedReports.includes(report.id) 
              ? { ...report, status: 'dismissed' }
              : report
          ));
        }
        break;
    }
    setSelectedReports([]);
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setAdminNotes('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      pending: 'En attente',
      reviewed: 'Examiné',
      resolved: 'Résolu',
      dismissed: 'Rejeté'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[severity]}`}>
        {labels[severity]}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      post: <FileText className="w-4 h-4" />,
      comment: <MessageSquare className="w-4 h-4" />,
      user: <User className="w-4 h-4" />,
      message: <MessageSquare className="w-4 h-4" />
    };
    return icons[type] || <AlertTriangle className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportReports = () => {
    const data = filteredReports.map(report => ({
      ID: report.id,
      Type: report.type,
      Contenu: report.contentTitle,
      Auteur: report.contentAuthor,
      'Signalé par': report.reportedBy,
      Raison: report.reason,
      Date: formatDate(report.date),
      Statut: report.status,
      Gravité: report.severity
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signalements-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ReportModal = () => {
    if (!selectedReport) return null;

    const handleSaveNotes = () => {
      handleReportAction(selectedReport.id, 'review', adminNotes);
      closeModal();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Détails du signalement */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                {getTypeIcon(selectedReport.type)}
                Signalement #{selectedReport.id}
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Contenu signalé</h3>
                <div className="space-y-2">
                  <p><strong>Titre:</strong> {selectedReport.contentTitle}</p>
                  <p><strong>Auteur:</strong> {selectedReport.contentAuthor}</p>
                  <p><strong>Type:</strong> {selectedReport.type}</p>
                  <p><strong>ID du contenu:</strong> {selectedReport.contentId}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Détails du signalement</h3>
                <div className="space-y-2">
                  <p><strong>Signalé par:</strong> {selectedReport.reportedBy}</p>
                  <p><strong>Email:</strong> {selectedReport.reporterEmail}</p>
                  <p><strong>Raison:</strong> {selectedReport.reason}</p>
                  <p><strong>Catégorie:</strong> {selectedReport.category}</p>
                  <p><strong>Date:</strong> {formatDate(selectedReport.date)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedReport.description}</p>
              </div>

              <div className="flex gap-2 mb-4">
                {getStatusBadge(selectedReport.status)}
                {getSeverityBadge(selectedReport.severity)}
              </div>
            </div>

            {/* Actions et notes */}
            <div>
              <h3 className="font-semibold mb-4">Actions administrateur</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes administrateur
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                  rows="4"
                  placeholder="Ajoutez vos notes sur ce signalement..."
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Sauvegarder les notes
                </button>
              </div>

              {selectedReport.adminNotes && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Notes existantes</h4>
                  <p className="text-blue-700 text-sm">{selectedReport.adminNotes}</p>
                </div>
              )}

              <div className="space-y-3">
                {selectedReport.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleReportAction(selectedReport.id, 'review', 'Signalement pris en compte pour examen');
                        closeModal();
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Marquer comme examiné
                    </button>
                    <button
                      onClick={() => {
                        handleReportAction(selectedReport.id, 'dismiss', 'Signalement rejeté - pas de violation constatée');
                        closeModal();
                      }}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter le signalement
                    </button>
                  </>
                )}
                
                {(selectedReport.status === 'pending' || selectedReport.status === 'reviewed') && (
                  <button
                    onClick={() => {
                      handleReportAction(selectedReport.id, 'approve', 'Action prise - contenu traité selon les règles');
                      closeModal();
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Résoudre - Action prise
                  </button>
                )}

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Actions sur le contenu</h4>
                  <div className="space-y-2">
                    <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm">
                      Avertir l'auteur
                    </button>
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm">
                      Suspendre temporairement
                    </button>
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm">
                      Bannir définitivement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, auteur ou motif..."
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
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="all">Toutes les gravités</option>
              {severities.slice(1).map(severity => (
                <option key={severity} value={severity}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="all">Tous les types</option>
              {types.slice(1).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions en lot */}
          {selectedReports.length > 0 && (
            <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 self-center">
                {selectedReports.length} signalement(s) sélectionné(s)
              </span>
              <button
                onClick={() => handleBulkAction('review')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Examiner
              </button>
              <button
                onClick={() => handleBulkAction('resolve')}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Résoudre
              </button>
              <button
                onClick={() => handleBulkAction('dismiss')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Rejeter
              </button>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Signalements</p>
                <p className="text-2xl font-bold text-orange-600">{reports.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.severity === 'critical').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Résolus</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tableau des signalements */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedReports.length === filteredReports.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold">Signalement</th>
                  <th className="text-left p-4 font-semibold">Contenu</th>
                  <th className="text-left p-4 font-semibold">Signalé par</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Statut</th>
                  <th className="text-left p-4 font-semibold">Gravité</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleSelectReport(report.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(report.type)}
                        <div>
                          <div className="font-medium">#{report.id}</div>
                          <div className="text-sm text-gray-500">{report.reason}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-sm">{report.contentTitle}</div>
                        <div className="text-sm text-gray-500">par {report.contentAuthor}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{report.reportedBy}</div>
                        <div className="text-sm text-gray-500">{report.reporterEmail}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {formatDate(report.date)}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="p-4">
                      {getSeverityBadge(report.severity)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => openModal(report)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && <ReportModal />}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;