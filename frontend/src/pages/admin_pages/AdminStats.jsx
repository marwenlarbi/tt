import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import PageSpinner from '../../components/PageSpinner';
import {
  Users,
  FileText,
  ShoppingCart,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  PawPrint,
  Stethoscope,
  Star,
  Download,
  Coins
} from 'lucide-react';
import api from '../../services/api';

function formatRelativeFr(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l’instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AdminStats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedChart, setSelectedChart] = useState('users');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    vetsTotal: 0,
    vetsPending: 0,
    totalPosts: 0,
    reportsPending: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    petsRegistered: 0,
    consultationsTotal: 0,
  });

  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    popularPosts: [],
    topProducts: [],
    recentActivity: [],
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, anaRes] = await Promise.all([
        api.get('/admin/dashboard/'),
        api.get('/admin/stats/analytics/', {
          params: { days: selectedPeriod },
        }),
      ]);
      const d = dashRes.data;
      setStats({
        totalUsers: d.users?.total ?? 0,
        activeUsers: d.users?.active ?? 0,
        vetsTotal: d.users?.vets_total ?? 0,
        vetsPending: d.users?.vets_pending ?? 0,
        totalPosts: d.posts?.total ?? 0,
        reportsPending: d.posts?.reports_pending ?? 0,
        totalProducts: d.products?.total ?? 0,
        totalOrders: d.orders?.total ?? 0,
        revenue: d.orders?.revenue ?? 0,
        petsRegistered: d.platform?.pets_registered ?? 0,
        consultationsTotal: d.platform?.consultations_total ?? 0,
      });
      const a = anaRes.data || {};
      setAnalytics({
        userGrowth: Array.isArray(a.userGrowth) ? a.userGrowth : [],
        popularPosts: Array.isArray(a.popularPosts) ? a.popularPosts : [],
        topProducts: Array.isArray(a.topProducts) ? a.topProducts : [],
        recentActivity: Array.isArray(a.recentActivity) ? a.recentActivity : [],
      });
    } catch (e) {
      console.error('Erreur stats admin:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle ? (
              <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
            ) : null}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const SimpleChart = ({ data, type }) => {
    if (!data.length) {
      return (
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
          Aucune donnée pour cette période
        </div>
      );
    }
    const values = data.map((d) => Number(d[type]) || 0);
    const maxValue = Math.max(...values, 1);

    return (
      <div className="flex items-end justify-between h-40 px-4 gap-1">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 min-w-0">
            <div
              className="bg-purple-500 rounded-t w-full max-w-[2rem] mb-2 transition-all duration-500"
              style={{ height: `${((Number(item[type]) || 0) / maxValue) * 120}px`, minHeight: '4px' }}
            />
            <span className="text-xs text-gray-600 truncate w-full text-center">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const exportData = () => {
    const data = {
      stats,
      analytics,
      date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Statistiques</h1>
            <p className="text-gray-600">Analyse détaillée des performances de la plateforme</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
              <option value="365">1 an</option>
            </select>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {loading && (
          <div className="mb-4 flex justify-start">
            <PageSpinner compact size="md" />
          </div>
        )}

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total utilisateurs"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.activeUsers.toLocaleString()} comptes actifs`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Posts publiés"
            value={stats.totalPosts.toLocaleString()}
            subtitle={
              stats.reportsPending > 0
                ? `${stats.reportsPending} signalement(s) en cours`
                : 'Aucun signalement en attente'
            }
            icon={FileText}
            color="green"
          />
          <StatCard
            title="Commandes"
            value={stats.totalOrders.toLocaleString()}
            subtitle={`${stats.totalProducts.toLocaleString()} produits au catalogue`}
            icon={ShoppingCart}
            color="purple"
          />
          <StatCard
            title="Revenus (hors annulées)"
            value={`${Number(stats.revenue).toLocaleString()} DT`}
            subtitle={`${stats.totalOrders.toLocaleString()} commande(s) au total`}
            icon={Coins}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique des utilisateurs */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Inscriptions par mois</h3>
                <p className="text-xs text-gray-500 mt-1">6 derniers mois glissants (données réelles)</p>
              </div>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="users">Nouveaux comptes</option>
                <option value="active">Dont encore actifs</option>
              </select>
            </div>
            <SimpleChart data={analytics.userGrowth} type={selectedChart} />
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
            <div className="space-y-3">
              {analytics.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Aucune activité récente</p>
              ) : (
                analytics.recentActivity.map((activity, index) => {
                  const icons = {
                    user: <Users className="w-4 h-4 text-blue-500" />,
                    post: <FileText className="w-4 h-4 text-green-500" />,
                    order: <ShoppingCart className="w-4 h-4 text-purple-500" />,
                    vet: <Stethoscope className="w-4 h-4 text-orange-500" />
                  };
                  const Icon = icons[activity.type] || icons.user;

                  return (
                    <div key={`${activity.type}-${activity.at}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {Icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.user} • {formatRelativeFr(activity.at)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts populaires */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-1">Publications les plus aimées</h3>
            <p className="text-xs text-gray-500 mb-4">Classées par nombre de « j’aime »</p>
            <div className="space-y-3">
              {analytics.popularPosts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Aucune publication</p>
              ) : (
                analytics.popularPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{post.title}</p>
                      <p className="text-xs text-gray-600 truncate">par {post.author}</p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Heart className="w-3 h-3 shrink-0" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Eye className="w-3 h-3 shrink-0" />
                          {post.views} interactions
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Produits les plus vendus */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-1">Produits les plus vendus</h3>
            <p className="text-xs text-gray-500 mb-4">Quantités vendues (toutes commandes)</p>
            <div className="space-y-3">
              {analytics.topProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Aucune vente enregistrée</p>
              ) : (
                analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{product.name}</p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="text-xs text-gray-600">{product.sales} ventes</span>
                        <span className="text-xs text-green-600 font-medium">
                          {Number(product.revenue).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT
                        </span>
                        <span className="flex items-center gap-1 text-xs text-yellow-600">
                          <Star className="w-3 h-3" />
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Métriques supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <PawPrint className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800">Animaux enregistrés</h4>
            <p className="text-2xl font-bold text-purple-500">{stats.petsRegistered.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total plateforme</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Stethoscope className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800">Comptes vétérinaires</h4>
            <p className="text-2xl font-bold text-blue-500">{stats.vetsTotal.toLocaleString()}</p>
            <p className="text-sm text-gray-600">
              {stats.vetsPending > 0
                ? `${stats.vetsPending} en attente de vérification`
                : 'Aucune demande en attente'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Calendar className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800">Consultations</h4>
            <p className="text-2xl font-bold text-green-500">{stats.consultationsTotal.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total historique (tous vétérinaires)</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStats;