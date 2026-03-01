import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Coins,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Download
} from 'lucide-react';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Données d'exemple des commandes
  const [orders, setOrders] = useState([
    {
      id: 'CMD001',
      customerName: 'Jean Dupont',
      customerEmail: 'jean.dupont@email.com',
      customerPhone: '06 12 34 56 78',
      address: '123 Rue de la Paix, 75001 Paris',
      date: '2024-03-15',
      status: 'delivered',
      total: 89.99,
      items: [
        { name: 'Croquettes Premium Chat', quantity: 2, price: 24.99 },
        { name: 'Jouet Souris', quantity: 1, price: 15.99 },
        { name: 'Litière Naturelle', quantity: 1, price: 24.01 }
      ]
    },
    {
      id: 'CMD002',
      customerName: 'Marie Martin',
      customerEmail: 'marie.martin@email.com',
      customerPhone: '06 98 76 54 32',
      address: '456 Avenue des Champs, 69000 Lyon',
      date: '2024-03-14',
      status: 'shipping',
      total: 156.50,
      items: [
        { name: 'Collier Anti-Puces Chien', quantity: 1, price: 32.99 },
        { name: 'Shampoing Naturel', quantity: 2, price: 18.99 },
        { name: 'Brosse Démêloir', quantity: 1, price: 25.99 }
      ]
    },
    {
      id: 'CMD003',
      customerName: 'Pierre Legrand',
      customerEmail: 'pierre.legrand@email.com',
      customerPhone: '06 11 22 33 44',
      address: '789 Boulevard Central, 13000 Marseille',
      date: '2024-03-13',
      status: 'processing',
      total: 67.80,
      items: [
        { name: 'Friandises pour Chat', quantity: 3, price: 12.99 },
        { name: 'Arbre à Chat Compact', quantity: 1, price: 28.83 }
      ]
    },
    {
      id: 'CMD004',
      customerName: 'Sophie Blanc',
      customerEmail: 'sophie.blanc@email.com',
      customerPhone: '06 55 44 33 22',
      address: '321 Rue du Commerce, 31000 Toulouse',
      date: '2024-03-12',
      status: 'cancelled',
      total: 43.20,
      items: [
        { name: 'Laisse Extensible', quantity: 1, price: 19.99 },
        { name: 'Gamelle Anti-Glouton', quantity: 1, price: 23.21 }
      ]
    }
  ]);

  const statusConfig = {
    processing: { label: 'En traitement', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    shipping: { label: 'En livraison', color: 'bg-blue-100 text-blue-800', icon: Truck },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const exportOrders = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Client,Email,Date,Statut,Total\n" +
      orders.map(order => 
        `${order.id},${order.customerName},${order.customerEmail},${order.date},${statusConfig[order.status].label},${order.total} DT`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "commandes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Gestion des Commandes</h1>
            <p className="text-gray-600">Suivez et gérez toutes les commandes de la boutique</p>
          </div>
          
          <button
            onClick={exportOrders}
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
                <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-[#8657ff]" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En traitement</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En livraison</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'shipping').length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)} DT
                </p>
              </div>
              <Coins className="h-8 w-8 text-green-600" />
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
                placeholder="Rechercher par ID, nom client ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="processing">En traitement</option>
                <option value="shipping">En livraison</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(order.date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.total.toFixed(2)} DT</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="text-[#8657ff] hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
                          >
                            <option value="processing">En traitement</option>
                            <option value="shipping">En livraison</option>
                            <option value="delivered">Livrée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal détails commande */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Détails de la commande {selectedOrder.id}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations client */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Informations client
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedOrder.address}</span>
                    </div>
                  </div>
                </div>

                {/* Articles commandés */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Articles commandés
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">Quantité: {item.quantity}</div>
                        </div>
                        <div className="font-medium text-gray-900">{item.price.toFixed(2)} DT</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#8657ff]">{selectedOrder.total.toFixed(2)} DT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;