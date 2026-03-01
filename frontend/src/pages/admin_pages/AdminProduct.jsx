import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Plus, Download, Search, Edit, Trash2 } from 'lucide-react';

const AdminProduct = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Croquettes Premium',
      category: 'Nourriture',
      price: 29.99,
      stock: 100,
      status: 'active',
      description: 'Croquettes pour chiens de haute qualité',
      image: 'data:image/jpeg;base64,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'
    },
    {
      id: 2,
      name: 'Jouet à mâcher',
      category: 'Jouets',
      price: 12.50,
      stock: 50,
      status: 'active',
      description: 'Jouet durable pour chiens',
      image: 'data:image/jpeg;base64,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'
    },
    {
      id: 3,
      name: 'Litière pour chats',
      category: 'Accessoires',
      price: 15.75,
      stock: 10,
      status: 'low_stock',
      description: 'Litière agglomérante pour chats',
      image: 'data:image/jpeg;base64,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'
    },
    {
      id: 4,
      name: 'Collier ajustable',
      category: 'Accessoires',
      price: 9.99,
      stock: 0,
      status: 'out_of_stock',
      description: 'Collier pour chiens, taille ajustable',
      image: 'data:image/jpeg;base64,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'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    status: 'active',
    description: '',
    image: ''
  });

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      status: 'active',
      description: '',
      image: ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      status: product.status,
      description: product.description,
      image: product.image
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newProductData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };

    if (editingProduct) {
      // Modifier produit existant
      setProducts(prev => prev.map(product => 
        product.id === editingProduct.id 
          ? { ...product, ...newProductData }
          : product
      ));
    } else {
      // Ajouter nouveau produit
      const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
      const newProduct = {
        id: maxId + 1,
        ...newProductData,
        image: formData.image || '/products/default.jpg'
      };
      setProducts(prev => [...prev, newProduct]);
    }
    
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(prev => prev.filter(product => product.id !== productId));
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedProducts.length === 0) return;
    
    switch (action) {
      case 'activate':
        setProducts(prev => prev.map(product => 
          selectedProducts.includes(product.id) 
            ? { ...product, status: 'active' }
            : product
        ));
        break;
      case 'out_of_stock':
        setProducts(prev => prev.map(product => 
          selectedProducts.includes(product.id) 
            ? { ...product, status: 'out_of_stock' }
            : product
        ));
        break;
      case 'delete':
        if (window.confirm(`Supprimer ${selectedProducts.length} produit(s) ?`)) {
          setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
          setSelectedProducts([]);
        }
        break;
      default:
        break;
    }
  };

  const exportProducts = () => {
    const csvContent = [
      ['ID', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Description'],
      ...products.map(product => [
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        product.status,
        product.description
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products_export.csv';
    link.click();
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      low_stock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    
    const labels = {
      active: 'En stock',
      out_of_stock: 'Rupture',
      low_stock: 'Stock faible'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Gestion des Produits</h1>
            <p className="text-gray-600">Gérez le catalogue de produits de la boutique</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter produit
            </button>
            <button
              onClick={exportProducts}
              className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Filtres et actions */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
              />
            </div>

            {/* Filtre par statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">En stock</option>
              <option value="low_stock">Stock faible</option>
              <option value="out_of_stock">Rupture</option>
            </select>
          </div>

          {/* Actions en lot */}
          {selectedProducts.length > 0 && (
            <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 self-center">
                {selectedProducts.length} produit(s) sélectionné(s)
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Activer
              </button>
              <button
                onClick={() => handleBulkAction('out_of_stock')}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Marquer rupture
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

        {/* Tableau des produits */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 focus:ring-[#8657ff]"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">Produit</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Catégorie</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Prix</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Stock</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Statut</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300 focus:ring-[#8657ff]"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => {
                              e.target.src = '/products/default.jpg';
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{product.category}</td>
                      <td className="p-4 text-sm text-gray-600">{product.price.toFixed(2)} €</td>
                      <td className="p-4 text-sm text-gray-600">{product.stock}</td>
                      <td className="p-4">{getStatusBadge(product.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Modifier"
                            aria-label={`Modifier le produit ${product.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                            aria-label={`Supprimer le produit ${product.name}`}
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
                {editingProduct ? 'Modifier produit' : 'Ajouter produit'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
                  <input
                    type="text"
                    placeholder="Nom du produit"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <input
                    type="text"
                    placeholder="Catégorie"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Prix"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                  >
                    <option value="active">En stock</option>
                    <option value="low_stock">Stock faible</option>
                    <option value="out_of_stock">Rupture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                    rows="4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL de l'image</label>
                  <input
                    type="text"
                    placeholder="URL de l'image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#8657ff] hover:bg-purple-700 text-white py-2 px-4 rounded font-medium transition-colors"
                  >
                    {editingProduct ? 'Modifier' : 'Ajouter'}
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

export default AdminProduct;