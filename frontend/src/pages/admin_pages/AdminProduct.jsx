import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Download, Edit, Plus, Search, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

function ProductThumb({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-slate-400 shrink-0`}>
        <ImageIcon className="w-5 h-5" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

const emptyForm = {
  name: '',
  category: '',
  price: '',
  stock: '',
  status: 'active',
  description: '',
  image: '',
};

const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const imageInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.q = searchTerm;
      if (filterStatus !== 'all') params.status = filterStatus;
      const res = await api.get('/admin/products/', { params });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur products admin:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus]);

  const filteredProducts = products.filter((product) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (product.name || '').toLowerCase().includes(q) ||
      (product.description || '').toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
      return;
    }
    setSelectedProducts(filteredProducts.map((p) => p.id));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setImageFile(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      status: product.status || 'active',
      description: product.description || '',
      image: product.image || '',
    });
    setImageFile(null);
    setShowModal(true);
  };

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const displayImageSrc = imageFile ? imagePreviewUrl : (formData.image || '');

  const buildPayload = () => {
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('category', formData.category);
    payload.append('price', String(parseFloat(formData.price || 0)));
    payload.append('stock', String(parseInt(formData.stock || '0', 10)));
    payload.append('status', formData.status);
    payload.append('description', formData.description || '');
    if (imageFile) payload.append('image_file', imageFile);
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
    if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct.id}/`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
    } else {
        await api.post('/admin/products/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    setShowModal(false);
    setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error('Erreur submit product:', err?.response?.data || err);
      alert("Impossible d'enregistrer le produit.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await api.delete(`/admin/products/${productId}/`);
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      await fetchProducts();
    } catch (err) {
      console.error('Erreur delete product:', err);
      alert("Impossible de supprimer le produit.");
    }
  };

  const exportProducts = () => {
    const csvContent = [
      ['ID', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Description'],
      ...filteredProducts.map((p) => [p.id, p.name, p.category, p.price, p.stock, p.status, p.description]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products_export.csv';
    link.click();
  };

  const getStatusBadge = (status) => {
    const labels = { active: 'En stock', low_stock: 'Stock faible', out_of_stock: 'Rupture' };
    const classes = {
      active: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[status] || classes.active}`}>{labels[status] || 'En stock'}</span>;
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Gestion des Produits</h1>
            <p className="text-gray-600">Gerez le catalogue produits</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddProduct} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
              <Plus className="w-4 h-4" />
              Ajouter produit
            </button>
            <button onClick={exportProducts} className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]">
              <option value="all">Tous les statuts</option>
              <option value="active">En stock</option>
              <option value="low_stock">Stock faible</option>
              <option value="out_of_stock">Rupture</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading && <div className="p-4 text-gray-600">Chargement...</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4"><input type="checkbox" checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length} onChange={handleSelectAll} /></th>
                  <th className="text-left p-4 font-semibold text-gray-600">Produit</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Categorie</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Prix</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Stock</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Statut</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4"><input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => handleSelectProduct(product.id)} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ProductThumb
                            src={product.image || ''}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{product.category}</td>
                    <td className="p-4 text-sm text-gray-600">{Number(product.price || 0).toFixed(2)} EUR</td>
                      <td className="p-4 text-sm text-gray-600">{product.stock}</td>
                      <td className="p-4">{getStatusBadge(product.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                        <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-800 p-1"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                ))}
                {!loading && filteredProducts.length === 0 && (
                  <tr><td colSpan="7" className="p-4 text-center text-gray-500">Aucun produit</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">x</button>
              <h3 className="text-xl font-semibold mb-4">{editingProduct ? 'Modifier produit' : 'Ajouter produit'}</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Nom du produit" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="Categorie" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="number" step="0.01" placeholder="Prix" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))} className="w-full p-2 border rounded" required />
                <select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))} className="w-full p-2 border rounded">
                    <option value="active">En stock</option>
                    <option value="low_stock">Stock faible</option>
                    <option value="out_of_stock">Rupture</option>
                  </select>
                <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className="w-full p-2 border rounded" rows="3" />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => imageInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      imageInputRef.current?.click();
                    }
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <p className="text-gray-700 font-medium">
                    {imageFile ? 'Image selectionnee' : 'Cliquez pour uploader une image'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {imageFile ? imageFile.name : 'PNG/JPG/JPEG'}
                  </p>
                </div>
                {displayImageSrc && (
                  <div className="flex items-center gap-3 pt-2">
                    <img src={displayImageSrc} alt="Prévisualisation" className="w-16 h-16 object-cover rounded border" />
                    <span className="text-sm text-gray-600 truncate">{imageFile ? imageFile.name : 'Image actuelle'}</span>
                </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 bg-[#8657ff] hover:bg-purple-700 text-white py-2 px-4 rounded font-medium disabled:opacity-70">{saving ? 'Enregistrement...' : editingProduct ? 'Modifier' : 'Ajouter'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded font-medium">Annuler</button>
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
