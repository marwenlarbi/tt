import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const allProducts = [
  {
    id: 1,
    name: 'Croquettes Premium pour Chien',
    price: 49.99,
    oldPrice: 59.99,
    description: 'Croquettes haut de gamme pour chiens adultes...',
    rating: 4.8,
    reviews: 124,
    stock: 15,
    images: ['https://ik.imagekit.io/yynn3ntzglc/france/production/catalog/products/001005/1.jpg'],
    category: 'Chien',
  },
  {
    id: 2,
    name: 'Croquettes Premium pour Chat',
    price: 39.99,
    oldPrice: 49.99,
    description: 'Croquettes haut de gamme pour chats adultes...',
    rating: 4.7,
    reviews: 90,
    stock: 20,
    images: ['https://ik.imagekit.io/yynn3ntzglc/france/production/catalog/products/001005/2.jpg'],
    category: 'Chat',
  },
];

export default function AdminProduct() {
  const [products, setProducts] = useState(allProducts);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    description: '',
    rating: '',
    reviews: '',
    stock: '',
    images: '',
    category: '',
  });

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      description: product.description,
      rating: product.rating,
      reviews: product.reviews,
      stock: product.stock,
      images: product.images.join(', '),
      category: product.category,
    });
  };

  const saveEdit = () => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: formData.name,
              price: parseFloat(formData.price),
              oldPrice: parseFloat(formData.oldPrice),
              description: formData.description,
              rating: parseFloat(formData.rating),
              reviews: parseInt(formData.reviews),
              stock: parseInt(formData.stock),
              images: formData.images.split(',').map((img) => img.trim()),
              category: formData.category,
            }
          : p
      )
    );
    setEditingId(null);
    resetForm();
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addProduct = () => {
    const newProduct = {
      id: products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1,
      name: formData.name,
      price: parseFloat(formData.price),
      oldPrice: parseFloat(formData.oldPrice),
      description: formData.description,
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews),
      stock: parseInt(formData.stock),
      images: formData.images.split(',').map((img) => img.trim()),
      category: formData.category,
    };
    setProducts((prev) => [...prev, newProduct]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      oldPrice: '',
      description: '',
      rating: '',
      reviews: '',
      stock: '',
      images: '',
      category: '',
    });
    setEditingId(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#8657ff] text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-4">
          <Link to="/admin/users" className="block hover:text-gray-300">👤 Gestion des utilisateurs</Link>
          <Link to="/admin/product" className="block hover:text-gray-300">📝 Gestion des produits</Link>
          <Link to="/admin/stats" className="block hover:text-gray-300">📊 Statistiques</Link>
          <Link to="/" className="block text-red-300 hover:text-red-200">🔓 Déconnexion</Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6 text-[#8657ff]">Gestion des Produits</h1>

        {/* Form */}
        <section className="mb-12 bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#8657ff]">
            {editingId ? 'Modifier Produit' : 'Ajouter un Produit'}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editingId ? saveEdit() : addProduct();
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* ... same inputs ... */}
            <input type="text" placeholder="Nom" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8657ff]" required />
            <input type="number" placeholder="Prix (€)" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8657ff]" required />
            {/* ... other inputs ... */}
            <textarea placeholder="Description" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="border rounded px-3 py-2 col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-[#8657ff] resize-none" required />
            {/* Buttons */}
            <div className="col-span-1 md:col-span-2 flex gap-4 items-center">
              <button type="submit" className="bg-[#8657ff] text-white px-6 py-2 rounded hover:bg-purple-700 transition">
                {editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Table */}
        <section className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#8657ff]">Liste des Produits</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-5 text-left font-semibold">Nom</th>
                  <th className="py-3 px-5 text-left font-semibold">Prix (€)</th>
                  <th className="py-3 px-5 text-left font-semibold">Ancien Prix (€)</th>
                  <th className="py-3 px-5 text-left font-semibold">Stock</th>
                  <th className="py-3 px-5 text-left font-semibold">Catégorie</th>
                  <th className="py-3 px-5 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-6">Aucun produit disponible.</td>
                  </tr>
                )}
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-5">{p.name}</td>
                    <td className="py-3 px-5">{p.price.toFixed(2)}</td>
                    <td className="py-3 px-5">{p.oldPrice?.toFixed(2) || '-'}</td>
                    <td className="py-3 px-5">{p.stock}</td>
                    <td className="py-3 px-5">{p.category}</td>
                    <td className="py-3 px-5 space-x-2">
                      <button onClick={() => startEdit(p)} className="text-[#8657ff] hover:text-purple-700 font-semibold">Modifier</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-800 font-semibold">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
