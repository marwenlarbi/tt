import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  Clock,
  X,
  Phone,
  Pencil,
  Trash2,
  Camera,
} from 'lucide-react';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import FollowButton from '../../components/FollowButton';
import api, { mediaUrl } from '../../services/api';
import {
  formatVetScheduleHours,
  getVetScheduleEntriesSorted,
  vetScheduleDayLabelFr,
} from '../../utils/vetScheduleDisplay';

function formatApiError(err, fallback) {
  const d = err?.response?.data;
  if (d?.detail != null) {
    if (typeof d.detail === 'string') return d.detail;
    if (Array.isArray(d.detail)) return d.detail.map(String).join(' ');
    return String(d.detail);
  }
  if (typeof d === 'string') return d;
  const flat = [];
  if (d && typeof d === 'object') {
    Object.entries(d).forEach(([k, v]) => {
      if (Array.isArray(v)) flat.push(`${k}: ${v.join(', ')}`);
      else if (v != null) flat.push(`${k}: ${v}`);
    });
  }
  if (flat.length) return flat.join(' ');
  return fallback;
}

const Vet = () => {
  const navigate = useNavigate();
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVet, setSelectedVet] = useState(null);
  const [vetReviewsList, setVetReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showRdvModal, setShowRdvModal] = useState(false);
  const [rdvPets, setRdvPets] = useState([]);
  const [rdvPetsLoading, setRdvPetsLoading] = useState(false);
  const [rdvPetId, setRdvPetId] = useState('');
  const [rdvDate, setRdvDate] = useState('');
  const [rdvTime, setRdvTime] = useState('');
  const [rdvReason, setRdvReason] = useState('');
  const [rdvSubmitting, setRdvSubmitting] = useState(false);
  const [rdvError, setRdvError] = useState(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

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

  const loadVets = useCallback(async () => {
    try {
      const response = await api.get('/user/vets/');
      const list = Array.isArray(response.data) ? response.data : [];
      if (list.length > 0) {
        setVets(list.map((v) => ({
          ...v,
          reviewsData: Array.isArray(v.reviewsData) ? v.reviewsData : [],
          rating: Number(v.rating ?? 0),
          reviews: Number(v.reviews ?? 0),
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
    setEditingReviewId(null);
    setShowCommentInput(false);
    setShowAllReviews(false);
    setComment('');
    setRating(0);
    setSelectedVet(vet);
  };

  const refreshVetReviews = async (vetIdStr) => {
    const { data } = await api.get('/reviews/', { params: { vet_id: vetIdStr } });
    setVetReviewsList(Array.isArray(data?.reviews) ? data.reviews : []);
    if (data && typeof data.average_rating === 'number') {
      setVets((prev) =>
        prev.map((v) =>
          String(v.id) === vetIdStr
            ? { ...v, rating: data.average_rating, reviews: data.reviews_count }
            : v,
        ),
      );
      setSelectedVet((prev) =>
        prev && String(prev.id) === vetIdStr
          ? { ...prev, rating: data.average_rating, reviews: data.reviews_count }
          : prev,
      );
    }
  };

  const applyVetSummary = (idStr, summary) => {
    if (!summary) return;
    setVets((prev) =>
      prev.map((v) =>
        String(v.id) === idStr
          ? { ...v, rating: summary.average_rating, reviews: summary.reviews_count }
          : v,
      ),
    );
    setSelectedVet((prev) =>
      prev && String(prev.id) === idStr
        ? { ...prev, rating: summary.average_rating, reviews: summary.reviews_count }
        : prev,
    );
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    const idStr = selectedVet ? String(selectedVet.id) : '';
    try {
      const { data } = await api.delete(`/reviews/${reviewId}/`);
      applyVetSummary(idStr, data?.vet_summary);
      await refreshVetReviews(idStr);
    } catch (err) {
      console.log(err?.response?.data ?? err?.response ?? err);
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment || '');
    setShowCommentInput(true);
  };

  const isOwnVetProfile =
    currentUserId != null &&
    selectedVet != null &&
    String(selectedVet.id) === String(currentUserId);

  const handleAvatarSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedVet) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.patch('/user/profile/', fd);
      const url = data?.profile?.avatar || null;
      const idStr = String(selectedVet.id);
      setSelectedVet((prev) => (prev ? { ...prev, image: url || prev.image } : prev));
      setVets((prev) =>
        prev.map((v) => (String(v.id) === idStr ? { ...v, image: url || v.image } : v)),
      );
    } catch (err) {
      console.log(err?.response?.data ?? err?.response ?? err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleClearAvatar = async () => {
    if (!window.confirm('Retirer votre photo de profil ?')) return;
    setAvatarUploading(true);
    try {
      const { data } = await api.patch('/user/profile/', { clear_avatar: true });
      const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVet?.name || '')}&background=0e9f6e&color=fff&size=256`;
      const url = data?.profile?.avatar || fallback;
      const idStr = String(selectedVet.id);
      setSelectedVet((prev) => (prev ? { ...prev, image: url } : prev));
      setVets((prev) =>
        prev.map((v) => (String(v.id) === idStr ? { ...v, image: url } : v)),
      );
    } catch (err) {
      console.log(err?.response?.data ?? err?.response ?? err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const getReviewCount = (vet) => {
    if (!vet) return 0;
    return Number(vet.reviews ?? 0);
  };

  useEffect(() => {
    if (!selectedVet?.id) {
      setVetReviewsList([]);
      return undefined;
    }
    const vid = String(selectedVet.id);
    let cancelled = false;
    setReviewsLoading(true);
    api
      .get('/reviews/', { params: { vet_id: vid } })
      .then(({ data }) => {
        if (cancelled) return;
        setVetReviewsList(Array.isArray(data?.reviews) ? data.reviews : []);
        if (data && typeof data.average_rating === 'number' && typeof data.reviews_count === 'number') {
          setSelectedVet((prev) =>
            prev && String(prev.id) === vid
              ? {
                  ...prev,
                  rating: data.average_rating,
                  reviews: data.reviews_count,
                }
              : prev,
          );
          setVets((prev) =>
            prev.map((v) =>
              String(v.id) === vid
                ? { ...v, rating: data.average_rating, reviews: data.reviews_count }
                : v,
            ),
          );
        }
      })
      .catch((err) => {
        console.log('GET /api/reviews/ (vet)', err?.response?.data ?? err?.response ?? err);
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedVet?.id]);

  const resetRdvForm = () => {
    setRdvPetId('');
    setRdvDate('');
    setRdvTime('');
    setRdvReason('');
    setRdvError(null);
  };

  const closeRdvModal = () => {
    setShowRdvModal(false);
    resetRdvForm();
  };

  const loadRdvPets = useCallback(async () => {
    setRdvPetsLoading(true);
    try {
      const { data } = await api.get('/pets/');
      const list = Array.isArray(data) ? data : data?.results || [];
      setRdvPets(list);
    } catch {
      setRdvPets([]);
    } finally {
      setRdvPetsLoading(false);
    }
  }, []);

  const handleOpenRdv = () => {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setRdvError(null);
    setShowRdvModal(true);
    loadRdvPets();
  };

  const handleSubmitRdv = async (e) => {
    e.preventDefault();
    if (!selectedVet) return;
    setRdvError(null);
    if (!rdvPetId) {
      setRdvError('Choisissez un animal.');
      return;
    }
    if (!rdvDate || !rdvTime) {
      setRdvError('Indiquez une date et une heure.');
      return;
    }
    setRdvSubmitting(true);
    try {
      await api.post('/user/appointments/request/', {
        vet: selectedVet.id,
        pet: Number(rdvPetId),
        date: rdvDate,
        time: rdvTime.length === 5 ? `${rdvTime}:00` : rdvTime,
        reason: rdvReason.trim(),
      });
      closeRdvModal();
      setAppointmentSuccess(true);
      window.setTimeout(() => setAppointmentSuccess(false), 6000);
    } catch (err) {
      setRdvError(formatApiError(err, 'Impossible d’envoyer la demande.'));
    } finally {
      setRdvSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedVet(null);
    setShowCommentInput(false);
    setShowAllReviews(false);
    setComment('');
    setRating(0);
    setEditingReviewId(null);
    setShowRdvModal(false);
    resetRdvForm();
    setAppointmentSuccess(false);
  };

  const handleCommentClick = () => {
    setEditingReviewId(null);
    setRating(0);
    setComment('');
    setShowCommentInput(true);
  };

  const cancelCommentForm = () => {
    setShowCommentInput(false);
    setEditingReviewId(null);
    setComment('');
    setRating(0);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!selectedVet || !comment.trim() || rating < 1) return;

    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const vid = Number(selectedVet.id);
    const idStr = String(selectedVet.id);
    setReviewSubmitting(true);
    try {
      if (editingReviewId) {
        const { data } = await api.patch(`/reviews/${editingReviewId}/`, {
          rating,
          comment: comment.trim(),
        });
        applyVetSummary(idStr, data?.vet_summary);
        await refreshVetReviews(idStr);
      } else {
        const { data } = await api.post('/reviews/', {
          rating,
          comment: comment.trim(),
          vet_id: vid,
        });
        applyVetSummary(idStr, data?.vet_summary);
        await refreshVetReviews(idStr);
      }
      setComment('');
      setRating(0);
      setShowCommentInput(false);
      setEditingReviewId(null);
    } catch (err) {
      console.log(err?.response?.data ?? err?.response ?? err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getVetImage = (vet) => {
    if (vet.image && !vet.image.startsWith('http')) {
      return mediaUrl(vet.image);
    }
    return vet.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.name)}&background=0e9f6e&color=fff&size=256`;
  };

  const displayedReviews = showAllReviews ? vetReviewsList : vetReviewsList.slice(0, 1);
  const reviewCount = vetReviewsList.length;
  const moreReviewsAvailable = reviewCount > 1;
  const todayIso = new Date().toISOString().split('T')[0];

  const getScheduleDisplay = (schedule) => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return '09:00 - 17:00';
    }
    for (const [, hours] of getVetScheduleEntriesSorted(schedule)) {
      const formatted = formatVetScheduleHours(hours);
      if (formatted && formatted !== 'Fermé' && formatted !== 'closed') {
        return formatted;
      }
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
              <div>
                <img src={getVetImage(vet)} alt={vet.name} className="w-full h-40 object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.name)}&background=0e9f6e&color=fff&size=256`; }}/>
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-6 w-6" strokeWidth={2} />
            </button>

            {appointmentSuccess && (
              <div className="mb-4 rounded-lg bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-3 py-2 text-sm">
                Demande de rendez-vous envoyée. Le vétérinaire pourra la confirmer.
              </div>
            )}

            <div className="flex items-start mb-4 gap-3">
              <div className="relative shrink-0">
                <img src={getVetImage(selectedVet)} alt={selectedVet.name} className="w-16 h-16 rounded-full object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVet.name)}&background=0e9f6e&color=fff&size=256`; }}/>
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/users/${selectedVet.id}`}
                  onClick={closeModal}
                  className="block text-xl font-semibold text-gray-800 dark:text-dark-text hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  {selectedVet.name}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedVet.city || '—'}</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" strokeWidth={2} />
                  <span>{selectedVet.rating || 0} ({selectedVet.reviews || 0} avis)</span>
                </div>
                {isOwnVetProfile && (
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarSelected}
                    />
                    <button
                      type="button"
                      disabled={avatarUploading}
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-900 disabled:opacity-50"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {avatarUploading ? '…' : 'Photo'}
                    </button>
                    <button
                      type="button"
                      disabled={avatarUploading}
                      onClick={handleClearAvatar}
                      className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      Supprimer la photo
                    </button>
                  </div>
                )}
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
                  getVetScheduleEntriesSorted(selectedVet.schedule).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{vetScheduleDayLabelFr(day)}</span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" strokeWidth={2} />
                        {formatVetScheduleHours(hours)}
                      </span>
                    </div>
                  ))
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
                  <button type="button" onClick={handleCommentClick} className="text-[#8657ff] hover:underline">
                    Ajouter un commentaire ?
                  </button>
                )}
              </div>
              {showCommentInput && selectedVet && (
                <form onSubmit={handleSubmitComment} className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {editingReviewId ? 'Modifier votre avis' : 'Nouvel avis'}
                  </p>
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
              {reviewsLoading && (
                <div className="mt-2 flex justify-start">
                  <PageSpinner compact size="sm" className="!py-0" />
                </div>
              )}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {reviewCount === 0
                    ? 'Aucun avis'
                    : showAllReviews
                    ? `Tous les avis affichés (${reviewCount})`
                    : `1 avis affiché sur ${reviewCount}`}
                </span>
                {moreReviewsAvailable && (
                  <button
                    type="button"
                    onClick={() => setShowAllReviews((prev) => !prev)}
                    className="text-sm text-[#8657ff] hover:underline"
                  >
                    {showAllReviews ? 'Voir moins' : 'Voir tous les avis'}
                  </button>
                )}
              </div>
              <div className="space-y-4 mt-2">
                {displayedReviews.map((review) => {
                  const reviewerLabel = review.user || 'Utilisateur';
                  const avatarFromApi = mediaUrl(review.user_avatar);
                  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerLabel)}&background=6b7280&color=fff&size=128`;
                  return (
                  <div key={review.id} className="border-t border-gray-200 dark:border-gray-700 pt-2">
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
                            onClick={() => handleDeleteReview(review.id)}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex justify-center gap-3 flex-wrap">
                <FollowButton 
                  userId={selectedVet.id} 
                  initialFollowing={selectedVet.is_following || false}
                  initialFollowersCount={selectedVet.followers_count || 0}
                  showFollowersCount={false}
                />
                <a
                  href={`tel:${selectedVet.phone}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors bg-primary hover:bg-primary-dark text-white"
                >
                  <Phone className="h-5 w-5 mr-2" strokeWidth={2} />
                  {selectedVet.phone || 'Appeler'}
                </a>
              </div>
              <button
                type="button"
                onClick={handleOpenRdv}
                className="w-full flex items-center justify-center gap-2 border-2 border-violet-600 text-violet-700 dark:text-violet-300 dark:border-violet-400 bg-white dark:bg-dark-accent py-2 px-4 rounded-full font-medium hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
              >
                📅 Demander un RDV
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVet && showRdvModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
          onClick={closeRdvModal}
          role="presentation"
        >
          <div
            className="relative z-10 bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeRdvModal}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-6 w-6" strokeWidth={2} />
            </button>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text pr-8">
              Demander un rendez-vous
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
              Avec {selectedVet.name}
            </p>
            <form onSubmit={handleSubmitRdv} className="space-y-4">
              <div>
                <label htmlFor="rdv-pet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Animal
                </label>
                {rdvPetsLoading ? (
                  <div className="flex justify-start py-2">
                    <PageSpinner compact size="sm" className="!py-0" />
                  </div>
                ) : (
                  <select
                    id="rdv-pet"
                    value={rdvPetId}
                    onChange={(e) => setRdvPetId(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text"
                    required
                  >
                    <option value="">— Sélectionner —</option>
                    {rdvPets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.species ? ` (${p.species})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {!rdvPetsLoading && rdvPets.length === 0 && (
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                    Aucun animal enregistré.{' '}
                    <button
                      type="button"
                      className="underline font-medium"
                      onClick={() => { navigate('/pets'); closeRdvModal(); }}
                    >
                      Ajouter un animal
                    </button>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="rdv-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    id="rdv-date"
                    type="date"
                    min={todayIso}
                    value={rdvDate}
                    onChange={(e) => setRdvDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rdv-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heure
                  </label>
                  <input
                    id="rdv-time"
                    type="time"
                    value={rdvTime}
                    onChange={(e) => setRdvTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="rdv-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motif
                </label>
                <textarea
                  id="rdv-reason"
                  value={rdvReason}
                  onChange={(e) => setRdvReason(e.target.value)}
                  rows={4}
                  placeholder="Décrivez le motif du rendez-vous…"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text"
                />
              </div>
              {rdvError && (
                <p className="text-sm text-red-600 dark:text-red-400">{rdvError}</p>
              )}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={rdvSubmitting || rdvPets.length === 0}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium"
                >
                  {rdvSubmitting ? 'Envoi…' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Vet;