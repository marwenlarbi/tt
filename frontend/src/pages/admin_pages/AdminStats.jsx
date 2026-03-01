import React, { useState } from 'react';
import AdminLayout from './AdminLayout';import { 
  Users, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
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

const AdminStats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedChart, setSelectedChart] = useState('users');

  // Données statistiques
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsers: 45,
    totalPosts: 3456,
    totalProducts: 89,
    totalOrders: 234,
    revenue: 15674.50,
    growthRate: 12.5
  };

  const userStats = [
    { month: 'Jan', users: 100, active: 80 },
    { month: 'Fév', users: 150, active: 120 },
    { month: 'Mar', users: 200, active: 180 },
    { month: 'Avr', users: 280, active: 240 },
    { month: 'Mai', users: 350, active: 300 },
    { month: 'Jun', users: 420, active: 380 }
  ];

  const popularPosts = [
    { id: 1, title: 'Belle journée au parc avec Rex !', author: 'Jean Dupont', likes: 245, comments: 32, views: 1250 },
    { id: 2, title: 'Première visite chez le vétérinaire', author: 'Marie Lefèvre', likes: 189, comments: 28, views: 980 },
    { id: 3, title: 'Nouvel arrivant dans la famille !', author: 'Thomas Martin', likes: 167, comments: 24, views: 850 },
    { id: 4, title: 'Conseils pour dresser votre chien', author: 'Dr. Mouna', likes: 234, comments: 45, views: 1456 },
    { id: 5, title: 'Les meilleures croquettes pour chat', author: 'Véto Expert', likes: 198, comments: 38, views: 1120 }
  ];

  const topProducts = [
    { id: 1, name: 'Croquettes Premium Chien', sales: 156, revenue: 7799.44, rating: 4.8 },
    { id: 2, name: 'Croquettes Premium Chat', sales: 134, revenue: 5358.66, rating: 4.7 },
    { id: 3, name: 'Jouet Corde pour Chien', sales: 89, revenue: 1423.11, rating: 4.5 },
    { id: 4, name: 'Litière Chat Naturelle', sales: 78, revenue: 1012.22, rating: 4.3 },
    { id: 5, name: 'Collier Anti-Puces', sales: 67, revenue: 2010.33, rating: 4.6 }
  ];

  const recentActivity = [
    { type: 'user', action: 'Nouvel utilisateur inscrit', user: 'Alice Martin', time: 'Il y a 5 min' },
    { type: 'post', action: 'Nouveau post publié', user: 'Jean Dupont', time: 'Il y a 12 min' },
    { type: 'order', action: 'Commande passée', user: 'Marie Lebrun', time: 'Il y a 23 min' },
    { type: 'vet', action: 'Vétérinaire vérifié', user: 'Dr. Sophie', time: 'Il y a 1h' },
    { type: 'user', action: 'Utilisateur suspendu', user: 'Spam Account', time: 'Il y a 2h' }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const isPositive = change > 0;
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
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs mois dernier</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const SimpleChart = ({ data, type }) => {
    const maxValue = Math.max(...data.map(d => d[type]));
    
    return (
      <div className="flex items-end justify-between h-40 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="bg-purple-500 rounded-t w-8 mb-2 transition-all duration-500"
              style={{ height: `${(item[type] / maxValue) * 120}px` }}
            ></div>
            <span className="text-xs text-gray-600">{item.month}</span>
          </div>
        ))}
      </div>
    );
  };

  const exportData = () => {
    // Simulation d'export
    const data = {
      stats,
      userStats,
      popularPosts,
      topProducts,
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

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Utilisateurs"
            value={stats.totalUsers.toLocaleString()}
            change={12.5}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Posts Publiés"
            value={stats.totalPosts.toLocaleString()}
            change={8.2}
            icon={FileText}
            color="green"
          />
          <StatCard
            title="Commandes"
            value={stats.totalOrders.toLocaleString()}
            change={15.7}
            icon={ShoppingCart}
            color="purple"
          />
          <StatCard
            title="Revenus"
            value={`${stats.revenue.toLocaleString()} DT`}
            change={23.1}
            icon={Coins}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique des utilisateurs */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Croissance des Utilisateurs</h3>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="users">Nouveaux utilisateurs</option>
                <option value="active">Utilisateurs actifs</option>
              </select>
            </div>
            <SimpleChart data={userStats} type={selectedChart} />
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Activité Récente</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const icons = {
                  user: <Users className="w-4 h-4 text-blue-500" />,
                  post: <FileText className="w-4 h-4 text-green-500" />,
                  order: <ShoppingCart className="w-4 h-4 text-purple-500" />,
                  vet: <Stethoscope className="w-4 h-4 text-orange-500" />
                };
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {icons[activity.type]}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts populaires */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Posts les Plus Populaires</h3>
            <div className="space-y-3">
              {popularPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{post.title}</p>
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
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Produits les plus vendus */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Produits les Plus Vendus</h3>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-gray-600">{product.sales} ventes</span>
                      <span className="text-xs text-green-600 font-medium">
                        {product.revenue.toFixed(2)} DT
                      </span>
                      <span className="flex items-center gap-1 text-xs text-yellow-600">
                        <Star className="w-3 h-3" />
                        {product.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métriques supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <PawPrint className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800">Animaux Enregistrés</h4>
            <p className="text-2xl font-bold text-purple-500">2,847</p>
            <p className="text-sm text-gray-600">+156 ce mois</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Stethoscope className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800">Vétérinaires Actifs</h4>
            <p className="text-2xl font-bold text-blue-500">47</p>
            <p className="text-sm text-gray-600">+3 ce mois</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Calendar className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800">Consultations</h4>
            <p className="text-2xl font-bold text-green-500">394</p>
            <p className="text-sm text-gray-600">+28 ce mois</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStats;