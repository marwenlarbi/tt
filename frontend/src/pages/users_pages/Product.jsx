import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Star, ShoppingCart, Filter, Search, Heart, Trash2, Plus, Minus } from 'lucide-react';

const allProducts = [
  {
    id: 1,
    name: 'Croquettes Premium pour Chien',
    price: 49.99,
    oldPrice: 59.99,
    description: 'Croquettes haut de gamme pour chiens adultes de toutes races. Enrichies en vitamines et minéraux pour une santé optimale. Sans céréales ni conservateurs artificiels.',
    rating: 4.8,
    reviews: 124,
    stock: 15,
    images: ['https://ik.imagekit.io/yynn3ntzglc/france/production/catalog/products/001005/1.jpg'],
    category: 'Chien',
    brand: 'Royal Canin',
    weight: '2kg'
  },
  {
    id: 2,
    name: 'Croquettes Premium pour Chat',
    price: 39.99,
    oldPrice: 49.99,
    description: 'Croquettes haut de gamme pour chats adultes. Formulées pour maintenir une peau saine et un pelage brillant.',
    rating: 4.7,
    reviews: 90,
    stock: 20,
    images: ['https://ik.imagekit.io/yynn3ntzglc/france/production/catalog/products/001005/2.jpg'],
    category: 'Chat',
    brand: 'Royal Canin',
    weight: '1.5kg'
  },
  {
    id: 3,
    name: 'Jouet Corde pour Chien',
    price: 15.99,
    oldPrice: null,
    description: 'Jouet en corde naturelle, parfait pour le jeu et le nettoyage des dents.',
    rating: 4.5,
    reviews: 45,
    stock: 30,
    images: ['data:image/jpeg;base64,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'],
    category: 'Chien',
    brand: 'Kong',
    weight: '200g'
  },
  {
    id: 4,
    name: 'Litière Chat Naturelle',
    price: 12.99,
    oldPrice: 15.99,
    description: 'Litière naturelle absorbante et anti-odeurs.',
    rating: 4.3,
    reviews: 67,
    stock: 25,
    images: ['data:image/jpeg;base64,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'],
    category: 'Chat',
    brand: 'Catsan',
    weight: '10L'
  }
];

const ProductList = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [quantities, setQuantities] = useState(
    allProducts.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  );

  // Filtrage et tri des produits
  const filteredProducts = allProducts
    .filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
      
      return matchesCategory && matchesSearch && matchesPrice && matchesBrand;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const brands = ['All', ...new Set(allProducts.map(p => p.brand))];
  const categories = ['All', 'Chien', 'Chat', 'Oiseau'];

  const handleQuantityChange = (id, delta, maxStock) => {
    setQuantities(prev => {
      const newQty = prev[id] + delta;
      if (newQty < 1 || newQty > maxStock) return prev;
      return { ...prev, [id]: newQty };
    });
  };

  const addToCart = (product) => {
    const quantity = quantities[product.id];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart(prev => [...prev, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header avec recherche et panier */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              Filtres
            </button>
            
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              <ShoppingCart className="h-4 w-4" />
              Panier ({getTotalItems()})
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Marque</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent"
                >
                  <option value="name">Nom</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="rating">Note</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Prix: {priceRange[0]} DT - {priceRange[1]} DT
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Liste des produits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md relative">
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Heart 
                  className={`w-5 h-5 ${
                    wishlist.some(item => item.id === product.id) 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-gray-400'
                  }`} 
                />
              </button>

              <img
                src={product.images[0]}
                alt={product.name}
                className="rounded-lg w-full object-contain h-64 mb-4"
              />
              
              <div className="space-y-2">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {product.brand}
                </span>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h2>

                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {product.rating} ({product.reviews} avis)
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-primary">
                    {product.price.toFixed(2)} DT
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.oldPrice.toFixed(2)} DT
                    </span>
                  )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  {product.description.substring(0, 100)}...
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Poids: {product.weight}</span>
                  <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Rupture de stock'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Quantité:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1, product.stock)}
                      className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      disabled={quantities[product.id] <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1 border-x border-gray-300 dark:border-gray-600">
                      {quantities[product.id]}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1, product.stock)}
                      className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      disabled={quantities[product.id] >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg"
                  disabled={product.stock === 0}
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Panier en modale */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Panier ({getTotalItems()})</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Votre panier est vide</p>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded">
                      <img src={item.images[0]} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-primary font-bold">{item.price.toFixed(2)} DT</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg text-primary">{getTotalPrice()} DT</span>
                </div>
                <button className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold">
                  Passer commande
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductList;