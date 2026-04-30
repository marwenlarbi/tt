import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Heart,
  Star,
  Clock,
  X,
  Phone,
} from 'lucide-react';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import FollowButton from '../../components/FollowButton';
import api, { mediaUrl } from '../../services/api';

const Vet = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [extraReviewsByVetId, setExtraReviewsByVetId] = useState({});
  const [selectedVet, setSelectedVet] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);

  const loadVets = useCallback(async () => {
    try {
      const response = await api.get('/user/vets/');
      const list = Array.isArray(response.data) ? response.data : [];
      if (list.length > 0) {
        setVets(list.map((v) => ({
          ...v,
          reviewsData: Array.isArray(v.reviewsData) ? v.reviewsData : [],
        })));
      }
    } catch (error) {
      console.error("Error loading vets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVets();
  }, [loadVets]);

  const filteredVets = vets.filter((v) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${v.name} ${v.city} ${v.specialty || ''}`.toLowerCase().includes(q);
  });

  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredVets.length / perPage));
  const pageSlice = filteredVets.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, vets.length]);

  const openModal = (vet) => {
    setSelectedVet(vet);
  };

  const getReviewCount = (vet) => {
    if (!vet) return 0;
    const baseCount = (vet.reviewsData || []).length;
    const extraCount = (extraReviewsByVetId[vet.id] || []).length;
    return baseCount + extraCount;
  };

  const closeModal = () => {
    setSelectedVet(null);
    setShowCommentInput(false);
    setComment('');
    setRating(0);
  };

  const handleCommentClick = () => {
    setShowCommentInput(true);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (selectedVet && comment.trim() && rating > 0) {
      const newReview = {
        user: 'Vous',
        date: new Date().toLocaleDateString('fr-FR'),
        rating,
        comment: comment.trim(),
      };
      const id = selectedVet.id;
      setExtraReviewsByVetId((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), newReview],
      }));
      setComment('');
      setRating(0);
      setShowCommentInput(false);
    }
  };

  const getVetImage = (vet) => {
    if (vet.image && !vet.image.startsWith('http')) {
      return mediaUrl(vet.image);
    }
    return vet.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.name)}&background=0e9f6e&color=fff&size=256`;
  };

  const getScheduleDisplay = (schedule) => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return '09:00 - 17:00';
    }
    const values = Object.values(schedule);
    if (values.length > 0 && values[0] !== 'Fermé' && values[0] !== 'closed') {
      return values[0];
    }
    return '09:00 - 17:00';
  };

  return (
    <Layout className="bg-gray-100 dark:bg-dark-gray min-h-screen">
      <div className="bg-white dark:bg-dark-card p-4 shadow-md">
        <div className="container mx-auto flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Recherche par nom ou ville"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-dark-accent text-gray-700 dark:text-dark-text border border-gray-300 dark:border-gray-600 p-2 rounded"
            />
          </div>
          <button type="button" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <Search className="h-6 w-6 text-gray-500" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Tous les vétérinaires</h2>
        {loading && <PageSpinner />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageSlice.map((vet) => (
            <div
              key={vet.id}
              role="button"
              tabIndex={0}
              onClick={() => openModal(vet)}
              onKeyDown={(e) => e.key === 'Enter' && openModal(vet)}
              className="cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-white dark:bg-dark-card rounded-lg"
            >
              <div className="relative">
                <img src={getVetImage(vet)} alt={vet.name} className="w-full h-40 object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.name)}&background=0e9f6e&color=fff&size=256`; }}/>
                <button
                  type="button"
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  onClick={(e) => { e.stopPropagation(); }}
                  aria-label="Favori"
                >
                  <Heart className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{vet.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{vet.city || '—'}</p>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full py-1 px-2 text-xs">{vet.specialty || 'Médecine vétérinaire'}</span>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" strokeWidth={2} />
                  <span>{vet.rating || 0} ({vet.reviews || 0} avis)</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <Clock className="h-4 w-4 mr-1" strokeWidth={2} />
                  <span>{getScheduleDisplay(vet.schedule)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVets.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
           Aucun vétérinaire trouvé.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 flex-wrap gap-2 items-center">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="mr-2 text-gray-700 dark:text-dark-text border border-gray-300 dark:border-gray-600 p-2 rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-gray-700 text-sm px-2">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="mr-2 text-gray-700 dark:text-dark-text border border-gray-300 dark:border-gray-600 p-2 rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {selectedVet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={closeModal} className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
              <X className="h-6 w-6" strokeWidth={2} />
            </button>

            <div className="flex items-center mb-4">
              <img src={getVetImage(selectedVet)} alt={selectedVet.name} className="w-16 h-16 rounded-full mr-4 object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVet.name)}&background=0e9f6e&color=fff&size=256`; }}/>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">{selectedVet.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedVet.city || '—'}</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" strokeWidth={2} />
                  <span>{selectedVet.rating || 0} ({selectedVet.reviews || 0} avis)</span>
                </div>
              </div>
            </div>

            {selectedVet.bio && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text">À propos</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedVet.bio}</p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Spécialités</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {(selectedVet.specialties || [selectedVet.specialty || 'Médecine vétérinaire']).map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Jours ouvrés</h4>
              <div className="space-y-2">
                {selectedVet.schedule && Object.keys(selectedVet.schedule).length > 0 ? (
                  Object.entries(selectedVet.schedule).map(([day, hours]) => {
                    const key = String(day || '').toLowerCase();
                    const dayMap = {
                      monday: 'Lundi',
                      tuesday: 'Mardi',
                      wednesday: 'Mercredi',
                      thursday: 'Jeudi',
                      friday: 'Vendredi',
                      saturday: 'Samedi',
                      sunday: 'Dimanche',
                    };
                    const displayDay = dayMap[key] || day;
                    return (
                      <div key={day} className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{displayDay}</span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" strokeWidth={2} />
                          {hours}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Lundi - Dimanche</span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" strokeWidth={2} />
                      09:00 - 17:00
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                  Avis ({getReviewCount(selectedVet)})
                </h4>
                {!showCommentInput && (
                  <button onClick={handleCommentClick} className="text-[#8657ff] hover:underline">
                    Ajouter un commentaire ?
                  </button>
                )}
              </div>
              {showCommentInput && selectedVet && (
                <form onSubmit={handleSubmitComment} className="mt-4">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Note</label>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i + 1)}
                          className="p-0 border-0 bg-transparent cursor-pointer"
                          aria-label={`Note ${i + 1} sur 5`}
                        >
                          <Star
                            className={`h-6 w-6 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            strokeWidth={2}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 dark:text-dark-text bg-white dark:bg-dark-accent dark:border-gray-600"
                    placeholder="Écrivez votre commentaire..."
                    rows="3"
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      type="submit"
                      className="bg-[#8657ff] text-white py-1 px-3 rounded-md hover:bg-primary-dark"
                    >
                      Soumettre
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCommentInput(false)}
                      className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-dark-text py-1 px-3 rounded-md hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
              <div className="space-y-4 mt-2">
                {[...(selectedVet.reviewsData || []), ...(extraReviewsByVetId[selectedVet.id] || [])].map((review, index) => (
                  <div key={index} className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{review.user}</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-4">
              <FollowButton 
                userId={selectedVet.id} 
                initialFollowing={selectedVet.is_following || false}
                initialFollowersCount={selectedVet.followers_count || 0}
              />
              <a href={`tel:${selectedVet.phone}`} className="flex items-center bg-purple-500 text-white py-2 px-4 rounded-full">
                <Phone className="h-5 w-5 mr-2" strokeWidth={2} />
                {selectedVet.phone || 'Appeler'}
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Vet;