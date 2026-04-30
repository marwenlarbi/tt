import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Star, ShoppingCart, Filter, Search, Heart, Trash2, Plus, Minus } from 'lucide-react';
import api, { mediaUrl } from '../../services/api';

function mapApiProduct(p) {
  return {
    id: p.id,
    name: p.name || 'Produit',
    price: Number(p.price ?? 0),
    oldPrice: p.old_price != null ? Number(p.old_price) : null,
    description: p.description || '',
    rating: Number(p.rating ?? 0),
    reviews: p.reviews_count ?? 0,
    stock: p.stock ?? 0,
    images: [p.image ? mediaUrl(p.image) : 'https://placehold.co/400x300?text=Produit'],
    category: p.category || 'Autre',
    brand: p.brand || 'Marque',
    weight: p.weight || '—',
  };
}

const ProductList = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [orderAddress, setOrderAddress] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/products/');
        const list = Array.isArray(data) ? data : data?.results || [];
        if (cancelled) return;
        const mapped = list.map(mapApiProduct);
        setAllProducts(mapped);
        setQuantities(mapped.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {}));
      } catch {
        // Échec d'appel API, garder la liste vide pour s'appuyer sur les données réelles.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleCheckout = async () => {
    setCheckoutError(null);
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!cart.length) {
      setCheckoutError('Votre panier est vide.');
      return;
    }
    if (orderAddress.trim().length < 3) {
      setCheckoutError('Indiquez une adresse de livraison.');
      return;
    }
    if (orderPhone.trim().length < 6) {
      setCheckoutError('Indiquez un numéro de téléphone valide.');
      return;
    }
    setCheckoutLoading(true);
    try {
      await api.post('/products/orders/', {
        address: orderAddress.trim(),
        phone: orderPhone.trim(),
        items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      });
      setCart([]);
      setOrderAddress('');
      setOrderPhone('');
      setShowCart(false);
      alert('Commande enregistrée. Merci !');
      const { data } = await api.get('/products/');
      const list = Array.isArray(data) ? data : data?.results || [];
      if (list.length) {
        const mapped = list.map(mapApiProduct);
        setAllProducts(mapped);
        setQuantities(mapped.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {}));
      }
    } catch (err) {
      const d = err?.response?.data;
      const msg = d?.detail || d?.message || (typeof d === 'string' ? d : null) || 'La commande a échoué.';
      setCheckoutError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setCheckoutLoading(false);
    }
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
                  {product.description && product.description.length > 100
                    ? `${product.description.slice(0, 100)}…`
                    : product.description || ''}
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

              <div className="border-t pt-4 mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Adresse de livraison
                  </label>
                  <input
                    type="text"
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="Rue, ville…"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    placeholder="Ex. +216 …"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent text-sm"
                  />
                </div>
                {checkoutError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{checkoutError}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg text-primary">{getTotalPrice()} DT</span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cart.length === 0}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {checkoutLoading ? 'Envoi…' : 'Passer commande'}
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