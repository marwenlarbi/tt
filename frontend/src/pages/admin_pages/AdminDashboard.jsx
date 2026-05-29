import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from './AdminLayout';
import PageSpinner from '../../components/PageSpinner';
import { Users, FileText, ShoppingCart, Heart, MessageSquare, Activity, Coins, PawPrint, Stethoscope, Calendar, Bell } from "lucide-react";
import api from '../../services/api';

const PERIOD_TO_DAYS = {
  today: 1,
  week: 7,
  month: 30,
  year: 365,
};

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
  return `Il y a ${days} j`;
}

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState({
    popularPosts: [],
    recentActivity: [],
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const days = PERIOD_TO_DAYS[selectedPeriod] || 30;
      const [dashRes, anaRes] = await Promise.all([
        api.get('/admin/dashboard/'),
        api.get('/admin/stats/analytics/', { params: { days } }),
      ]);
      const d = dashRes.data;
      const a = anaRes.data || {};
      // Normalisation minimale pour l'UI existante
      setDashboardData({
        users: {
          total: d.users?.total ?? 0,
          active: d.users?.active ?? 0,
          vetsTotal: d.users?.vets_total ?? 0,
          vetsPending: d.users?.vets_pending ?? 0,
        },
        posts: {
          total: d.posts?.total ?? 0,
          reported: d.posts?.reports_pending ?? 0,
        },
        products: {
          total: d.products?.total ?? 0,
          outOfStock: d.products?.outOfStock ?? 0,
          lowStock: d.products?.lowStock ?? 0,
        },
        orders: {
          total: d.orders?.total ?? 0,
          pending: d.orders?.pending ?? 0,
          revenue: d.orders?.revenue ?? 0,
        },
        platform: {
          petsRegistered: d.platform?.pets_registered ?? 0,
          consultationsTotal: d.platform?.consultations_total ?? 0,
        },
      });
      setAnalytics({
        popularPosts: Array.isArray(a.popularPosts) ? a.popularPosts : [],
        recentActivity: Array.isArray(a.recentActivity) ? a.recentActivity : [],
      });
    } catch (e) {
      console.error('Erreur dashboard admin:', e);
      setDashboardData(null);
      setAnalytics({ popularPosts: [], recentActivity: [] });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const alerts = [
    {
      id: 1,
      type: dashboardData?.posts?.reported > 0 ? 'warning' : 'info',
      title: 'Signalements',
      message:
        dashboardData?.posts?.reported > 0
          ? `${dashboardData.posts.reported} signalement(s) en attente`
          : 'Aucun signalement en attente',
      action: 'Vérifier',
      link: '/admin/posts',
    },
    {
      id: 2,
      type: dashboardData?.products?.lowStock > 0 ? 'error' : 'info',
      title: 'Stock produits',
      message:
        dashboardData?.products?.lowStock > 0
          ? `${dashboardData.products.lowStock} produit(s) en stock faible`
          : 'Aucun stock faible détecté',
      action: 'Gérer',
      link: '/admin/products',
    },
    {
      id: 3,
      type: dashboardData?.users?.vetsPending > 0 ? 'warning' : 'info',
      title: 'Demandes vétérinaires',
      message:
        dashboardData?.users?.vetsPending > 0
          ? `${dashboardData.users.vetsPending} vérification(s) en attente`
          : 'Aucune vérification en attente',
      action: 'Traiter',
      link: '/admin/vets',
    },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const AlertCard = ({ alert }) => {
    const alertStyles = {
      warning: 'border-yellow-200 bg-yellow-50',
      error: 'border-red-200 bg-red-50',
      info: 'border-blue-200 bg-blue-50'
    };

    const iconStyles = {
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600'
    };

    return (
      <div className={`p-4 border rounded-lg ${alertStyles[alert.type]}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <Bell className={`w-5 h-5 mr-3 mt-0.5 ${iconStyles[alert.type]}`} />
            <div>
              <h4 className="font-medium text-gray-900">{alert.title}</h4>
              <p className="text-sm text-gray-600">{alert.message}</p>
            </div>
          </div>
          <a
            href={alert.link}
            className={`text-sm font-medium hover:underline ${iconStyles[alert.type]}`}
          >
            {alert.action}
          </a>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Tableau de bord Admin</h1>
            <p className="text-gray-600">Vue d'ensemble de la plateforme Cheebo</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>

        {/* Alertes */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Alertes</h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Statistiques principales */}
        {loading && (
          <div className="mb-6 flex justify-start">
            <PageSpinner compact size="md" />
          </div>
        )}
        {!loading && !dashboardData && (
          <div className="mb-6 text-red-600">Impossible de charger le dashboard.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Utilisateurs"
            value={(dashboardData?.users?.total ?? 0).toLocaleString()}
            icon={Users}
            color="bg-blue-500"
            subtitle={`${dashboardData?.users?.active ?? 0} actifs`}
          />
          <StatCard
            title="Publications"
            value={(dashboardData?.posts?.total ?? 0).toLocaleString()}
            icon={FileText}
            color="bg-green-500"
            subtitle={`${dashboardData?.posts?.reported ?? 0} signalés`}
          />
          <StatCard
            title="Produits"
            value={dashboardData?.products?.total ?? 0}
            icon={ShoppingCart}
            color="bg-purple-500"
            subtitle={`${dashboardData?.products?.outOfStock ?? 0} en rupture`}
          />
          <StatCard
            title="Revenus (hors annulées)"
            value={`${(dashboardData?.orders?.revenue ?? 0).toLocaleString()} DT`}
            icon={Coins}
            color="bg-orange-500"
            subtitle={`${dashboardData?.orders?.total ?? 0} commandes`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activité récente */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Activité Récente</h3>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => {
                const icons = {
                  user: Users,
                  post: FileText,
                  order: ShoppingCart,
                  vet: Stethoscope,
                };
                const colors = {
                  user: 'text-blue-500',
                  post: 'text-green-500',
                  order: 'text-purple-500',
                  vet: 'text-orange-500',
                };
                const IconComponent = icons[activity.type] || Users;
                const iconColor = colors[activity.type] || 'text-gray-500';
                return (
                  <div key={`${activity.type}-${activity.at}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <IconComponent className={`w-5 h-5 ${iconColor}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.user} • {formatRelativeFr(activity.at)}</p>
                    </div>
                  </div>
                );
              })}
              {analytics.recentActivity.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">Aucune activité récente</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <a 
                href="/admin/stats" 
                className="text-[#8657ff] hover:text-purple-700 font-medium text-sm"
              >
                Voir toutes les activités →
              </a>
            </div>
          </div>

          {/* Posts populaires */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Posts Populaires</h3>
            <div className="space-y-4">
              {analytics.popularPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{post.title}</p>
                    <p className="text-xs text-gray-600">par {post.author}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MessageSquare className="w-3 h-3" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-purple-600">
                        <Activity className="w-3 h-3" />
                        {post.views} interactions
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {analytics.popularPosts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">Aucune publication</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <a 
                href="/admin/posts" 
                className="text-[#8657ff] hover:text-purple-700 font-medium text-sm"
              >
                Gérer les posts →
              </a>
            </div>
          </div>
        </div>

        {/* Métriques supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <PawPrint className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Animaux Enregistrés</h4>
            <p className="text-3xl font-bold text-purple-500 mb-1">
              {(dashboardData?.platform?.petsRegistered ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total plateforme</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Stethoscope className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Vétérinaires Actifs</h4>
            <p className="text-3xl font-bold text-blue-500 mb-1">
              {(dashboardData?.users?.vetsTotal ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {(dashboardData?.users?.vetsPending ?? 0) > 0
                ? `${dashboardData.users.vetsPending} en attente`
                : 'Aucune attente'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Calendar className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Consultations</h4>
            <p className="text-3xl font-bold text-green-500 mb-1">
              {(dashboardData?.platform?.consultationsTotal ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total historique</p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Actions Rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/users"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Users className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Gérer Utilisateurs</span>
            </a>
            <a
              href="/admin/posts"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <FileText className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Modérer Posts</span>
            </a>
            <a
              href="/admin/products" // Corrigé de "/admin/product" à "/admin/products"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <ShoppingCart className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Gérer Produits</span>
            </a>
            <a
              href="/admin/stats"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Activity className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Voir Stats</span>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;