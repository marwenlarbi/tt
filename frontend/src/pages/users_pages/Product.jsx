import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import { Star, ShoppingCart, Filter, Search, Trash2, Plus, Minus, Pencil } from 'lucide-react';
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
  const [orderAddress, setOrderAddress] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  /** Modale détail produit (image / « Laisser un avis ») : infos + commentaires */
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailReviews, setDetailReviews] = useState([]);
  const [detailReviewsLoading, setDetailReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token');
    if (!token) {
      setCurrentUserId(null);
      return undefined;
    }
    let cancelled = false;
    api
      .get('/user/profile/')
      .then(({ data }) => {
        if (!cancelled && data?.id != null) setCurrentUserId(Number(data.id));
      })
      .catch(() => {
        if (!cancelled) setCurrentUserId(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyProductSummary = (productId, summary) => {
    if (!summary) return;
    setAllProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, rating: summary.average_rating, reviews: summary.reviews_count }
          : p,
      ),
    );
    setDetailProduct((prev) =>
      prev && prev.id === productId
        ? { ...prev, rating: summary.average_rating, reviews: summary.reviews_count }
        : prev,
    );
  };

  const refreshProductReviews = async (productId) => {
    setDetailReviewsLoading(true);
    setDetailReviews([]);
    try {
      const { data } = await api.get('/reviews/', { params: { product_id: productId } });
      setDetailReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      if (data && typeof data.average_rating === 'number' && typeof data.reviews_count === 'number') {
        applyProductSummary(productId, {
          average_rating: data.average_rating,
          reviews_count: data.reviews_count,
        });
      }
    } catch (err) {
      console.log('GET /reviews/', err?.response?.data ?? err?.response ?? err);
      setDetailReviews([]);
    } finally {
      setDetailReviewsLoading(false);
    }
  };

  const handleCommentClick = () => {
    setEditingReviewId(null);
    setReviewRating(0);
    setReviewComment('');
    setShowCommentInput(true);
  };

  const cancelCommentForm = () => {
    setShowCommentInput(false);
    setEditingReviewId(null);
    setReviewComment('');
    setReviewRating(0);
  };

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment || '');
    setShowCommentInput(true);
  };

  const handleDeleteProductReview = async (reviewId) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    const pid = detailProduct?.id;
    if (pid == null) return;
    try {
      const { data } = await api.delete(`/reviews/${reviewId}/`);
      applyProductSummary(pid, data?.product_summary);
      await refreshProductReviews(pid);
      await reloadProducts();
    } catch (err) {
      console.log(err?.response?.data ?? err?.response ?? err);
    }
  };

  const reloadProducts = async () => {
    try {
      const { data } = await api.get('/products/');
      const list = Array.isArray(data) ? data : data?.results || [];
      const mapped = list.map(mapApiProduct);
      setAllProducts(mapped);
      setQuantities(mapped.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {}));
    } catch (err) {
      console.log('reloadProducts', err?.response?.data ?? err?.response ?? err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProductsLoading(true);
      try {
        const { data } = await api.get('/products/');
        const list = Array.isArray(data) ? data : data?.results || [];
        if (cancelled) return;
        const mapped = list.map(mapApiProduct);
        setAllProducts(mapped);
        setQuantities(mapped.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {}));
      } catch (err) {
        console.log('GET /products/', err?.response?.data ?? err?.response ?? err);
      } finally {
        if (!cancelled) setProductsLoading(false);
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
      await reloadProducts();
    } catch (err) {
      const d = err?.response?.data;
      const msg = d?.detail || d?.message || (typeof d === 'string' ? d : null) || 'La commande a échoué.';
      setCheckoutError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openProductDetail = (product) => {
    setDetailProduct(product);
    setReviewRating(0);
    setReviewComment('');
    setShowCommentInput(false);
    setEditingReviewId(null);
    refreshProductReviews(product.id);
  };

  const closeProductDetail = () => {
    setDetailProduct(null);
    setDetailReviews([]);
    setShowCommentInput(false);
    setEditingReviewId(null);
    setReviewComment('');
    setReviewRating(0);
  };

  const openReviewModal = (product) => {
    openProductDetail(product);
  };

  const submitProductReview = async (e) => {
    e.preventDefault();
    if (!detailProduct || reviewRating < 1) return;
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const pid = detailProduct.id;
    setReviewSubmitting(true);
    try {
      if (editingReviewId) {
        const { data } = await api.patch(`/reviews/${editingReviewId}/`, {
          rating: reviewRating,
          comment: (reviewComment || '').trim(),
        });
        applyProductSummary(pid, data?.product_summary);
      } else {
        const { data } = await api.post('/reviews/', {
          rating: reviewRating,
          comment: (reviewComment || '').trim(),
          product_id: pid,
        });
        applyProductSummary(pid, data?.product_summary);
      }
      setReviewRating(0);
      setReviewComment('');
      setShowCommentInput(false);
      setEditingReviewId(null);
      await refreshProductReviews(pid);
      await reloadProducts();
    } catch (err) {
      console.log(err?.response?.data ?? err?.response ?? err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getProductReviewCount = () =>
    detailProduct != null ? Number(detailProduct.reviews ?? 0) : 0;

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
        {productsLoading ? (
          <PageSpinner />
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            Aucun produit ne correspond à vos critères.
          </p>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex flex-col h-full min-h-0">
              <button
                type="button"
                onClick={() => openProductDetail(product)}
                className="block w-full p-0 border-0 bg-transparent rounded-lg mb-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-dark-card"
                aria-label={`Voir les détails et avis — ${product.name}`}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="rounded-lg w-full object-contain h-64 pointer-events-none"
                />
              </button>
              
              <div className="space-y-2 flex flex-col flex-1 min-h-0">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded w-fit">
                  {product.brand}
                </span>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
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

                <p
                  className="text-gray-700 dark:text-gray-300 text-sm mb-2 truncate shrink-0"
                  title={product.description || undefined}
                >
                  {product.description || ''}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 shrink-0">
                  <span>Poids: {product.weight}</span>
                  <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Rupture de stock'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-4 mt-auto pt-2">
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
                  type="button"
                  onClick={() => openReviewModal(product)}
                  className="w-full mb-2 border border-primary text-primary hover:bg-primary/10 font-semibold py-2 px-4 rounded-lg"
                >
                  Laisser un avis
                </button>
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
        )}

        {detailProduct && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeProductDetail}
            role="presentation"
          >
            <div
              className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl leading-none"
                onClick={closeProductDetail}
                aria-label="Fermer"
              >
                ×
              </button>

              <div className="flex flex-col md:flex-row gap-6 pr-6">
                <div className="md:w-2/5 shrink-0">
                  <img
                    src={detailProduct.images[0]}
                    alt={detailProduct.name}
                    className="rounded-lg w-full object-contain max-h-64 md:max-h-80 bg-gray-50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded inline-block">
                    {detailProduct.brand}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {detailProduct.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(detailProduct.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {detailProduct.rating} ({detailProduct.reviews} avis)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold text-primary">
                      {detailProduct.price.toFixed(2)} DT
                    </span>
                    {detailProduct.oldPrice != null && (
                      <span className="text-sm text-gray-500 line-through">
                        {detailProduct.oldPrice.toFixed(2)} DT
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                    {detailProduct.description || 'Aucune description.'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Poids : {detailProduct.weight}</span>
                    <span className={detailProduct.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600'}>
                      {detailProduct.stock > 0 ? `Stock : ${detailProduct.stock}` : 'Rupture de stock'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 dark:border-gray-600 pt-6">
                <div className="flex justify-between items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                    Avis ({getProductReviewCount()})
                  </h4>
                  {!showCommentInput && (
                    <button
                      type="button"
                      onClick={handleCommentClick}
                      className="text-[#8657ff] hover:underline text-sm shrink-0"
                    >
                      Ajouter un avis ?
                    </button>
                  )}
                </div>
                {showCommentInput && detailProduct && (
                  <form onSubmit={submitProductReview} className="mt-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {editingReviewId ? 'Modifier votre avis' : 'Nouvel avis'}
                    </p>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note</label>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i + 1)}
                            className="p-0 border-0 bg-transparent cursor-pointer"
                            aria-label={`Note ${i + 1} sur 5`}
                          >
                            <Star
                              className={`h-6 w-6 ${i < reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              strokeWidth={2}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-700 dark:text-dark-text bg-white dark:bg-dark-accent dark:border-gray-600"
                      placeholder="Écrivez votre commentaire…"
                      rows={3}
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="bg-[#8657ff] text-white py-1 px-3 rounded-md hover:bg-primary-dark disabled:opacity-50"
                      >
                        {reviewSubmitting ? 'Envoi…' : editingReviewId ? 'Enregistrer' : 'Soumettre'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelCommentForm}
                        className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-dark-text py-1 px-3 rounded-md hover:bg-gray-400"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
                {detailReviewsLoading && (
                  <div className="mt-2 flex justify-start">
                    <PageSpinner compact size="sm" className="!py-0" />
                  </div>
                )}
                <div className="space-y-0 mt-2 max-h-56 overflow-y-auto pr-1">
                  {!detailReviewsLoading && detailReviews.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun avis pour le moment.</p>
                  )}
                  {detailReviews.map((review) => {
                    const reviewerLabel = review.user || 'Utilisateur';
                    const avatarFromApi = mediaUrl(review.user_avatar);
                    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerLabel)}&background=6b7280&color=fff&size=128`;
                    return (
                      <div key={review.id} className="border-t border-gray-200 dark:border-gray-700 pt-2 first:border-0 first:pt-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <div className="flex items-center min-w-0">
                            <img
                              src={avatarFromApi || avatarFallback}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover mr-2 shrink-0 bg-gray-300 dark:bg-gray-600"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = avatarFallback;
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{reviewerLabel}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                            </div>
                          </div>
                          {currentUserId != null && Number(review.author_id) === Number(currentUserId) && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditReview(review)}
                                className="p-1 rounded text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/40"
                                title="Modifier"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProductReview(review.id)}
                                className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              strokeWidth={2}
                            />
                          ))}
                        </div>
                        {review.comment ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{review.comment}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Pas de commentaire</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panier en modale */}
        {showCart && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCart(false)}
            role="presentation"
          >
            <div
              className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl w-full max-w-md mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-lg font-semibold pr-2">Panier ({getTotalItems()})</h3>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  className="shrink-0 text-2xl leading-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Fermer"
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