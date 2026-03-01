import React, { useState } from "react";
import AdminLayout from './AdminLayout';
import { Users, FileText, ShoppingCart, TrendingUp, AlertTriangle, Heart, MessageSquare, Activity, Coins, PawPrint, Stethoscope, Calendar, Bell } from "lucide-react";

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Données du tableau de bord
  const dashboardData = {
    users: {
      total: 1247,
      active: 892,
      new: 45,
      growth: 12.5
    },
    posts: {
      total: 3456,
      pending: 12,
      reported: 3,
      growth: 8.2
    },
    products: {
      total: 89,
      outOfStock: 5,
      lowStock: 8,
      growth: 15.7
    },
    orders: {
      total: 234,
      pending: 18,
      completed: 216,
      revenue: 15674.50
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'user',
      message: 'Nouvel utilisateur inscrit',
      user: 'Alice Martin',
      time: '5 min',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'post',
      message: 'Nouveau post publié',
      user: 'Jean Dupont',
      time: '12 min',
      icon: FileText,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'order',
      message: 'Commande passée',
      user: 'Marie Lebrun',
      time: '23 min',
      icon: ShoppingCart,
      color: 'text-purple-500'
    },
    {
      id: 4,
      type: 'report',
      message: 'Post signalé',
      user: 'Système',
      time: '45 min',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      id: 5,
      type: 'vet',
      message: 'Vétérinaire vérifié',
      user: 'Dr. Sophie',
      time: '1h',
      icon: Stethoscope,
      color: 'text-orange-500'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Posts en attente',
      message: '12 posts nécessitent une modération',
      action: 'Modérer',
      link: '/admin/posts'
    },
    {
      id: 2,
      type: 'error',
      title: 'Stock faible',
      message: '8 produits ont un stock faible',
      action: 'Gérer',
      link: '/admin/products'
    },
    {
      id: 3,
      type: 'info',
      title: 'Signalements',
      message: '3 posts ont été signalés',
      action: 'Vérifier',
      link: '/admin/posts'
    }
  ];

  const topPosts = [
    {
      id: 1,
      title: 'Belle journée au parc avec Rex !',
      author: 'Jean Dupont',
      likes: 245,
      comments: 32,
      engagement: 92.5
    },
    {
      id: 2,
      title: 'Conseils pour dresser votre chien',
      author: 'Dr. Mouna',
      likes: 456,
      comments: 67,
      engagement: 89.2
    },
    {
      id: 3,
      title: 'Première visite chez le vétérinaire',
      author: 'Marie Lefèvre',
      likes: 189,
      comments: 28,
      engagement: 76.8
    }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => {
    const isPositive = change > 0;
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs mois dernier</span>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Utilisateurs"
            value={dashboardData.users.total.toLocaleString()}
            change={dashboardData.users.growth}
            icon={Users}
            color="bg-blue-500"
            subtitle={`${dashboardData.users.active} actifs`}
          />
          <StatCard
            title="Publications"
            value={dashboardData.posts.total.toLocaleString()}
            change={dashboardData.posts.growth}
            icon={FileText}
            color="bg-green-500"
            subtitle={`${dashboardData.posts.pending} en attente`}
          />
          <StatCard
            title="Produits"
            value={dashboardData.products.total}
            change={dashboardData.products.growth}
            icon={ShoppingCart}
            color="bg-purple-500"
            subtitle={`${dashboardData.products.outOfStock} en rupture`}
          />
          <StatCard
            title="Revenus"
            value={`${dashboardData.orders.revenue.toLocaleString()} DT`}
            change={23.1}
            icon={Coins}
            color="bg-orange-500"
            subtitle={`${dashboardData.orders.total} commandes`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activité récente */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Activité Récente</h3>
            <div className="space-y-4">
              {recentActivities.map(activity => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <IconComponent className={`w-5 h-5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-600">{activity.user} • Il y a {activity.time}</p>
                    </div>
                  </div>
                );
              })}
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
              {topPosts.map((post, index) => (
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
                        {post.engagement}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
            <p className="text-3xl font-bold text-purple-500 mb-1">2,847</p>
            <div className="flex items-center justify-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+156 ce mois</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Stethoscope className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Vétérinaires Actifs</h4>
            <p className="text-3xl font-bold text-blue-500 mb-1">47</p>
            <div className="flex items-center justify-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+3 ce mois</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Calendar className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Consultations</h4>
            <p className="text-3xl font-bold text-green-500 mb-1">394</p>
            <div className="flex items-center justify-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+28 ce mois</span>
            </div>
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