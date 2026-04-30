import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import FollowButton from '../../components/FollowButton';
import PageSpinner from '../../components/PageSpinner';
import {
  MapPin,
  User,
  PawPrint,
  MessageSquare,
  Heart,
  Calendar,
  MoreHorizontal,
  Share,
  BookmarkPlus,
  Loader2,
  MessageCircle,
  Ban,
} from 'lucide-react';
import api, { mediaUrl } from '../../services/api';

const getAccessToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('access') ||
  localStorage.getItem('token');

function mapEmbeddedForProfile(sp) {
  if (!sp || !sp.id) return null;
  const img = sp.image ? mediaUrl(sp.image) : '';
  const vid = sp.video ? mediaUrl(sp.video) : '';
  const t = (sp.type || 'text').toLowerCase();
  const isVideo = t === 'video' && !!vid;
  const author = sp.author || {};
  const authorName =
    `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email || 'Auteur';
  return {
    id: sp.id,
    authorName,
    content: sp.content || '',
    image: !isVideo && img ? img : isVideo && img ? img : null,
    video: isVideo ? vid : null,
    type: isVideo ? 'video' : t === 'image' && img ? 'image' : 'text',
  };
}

function mapPost(p) {
  const isShare = !!(p.shared_post && p.shared_post.id) || (p.type || '').toLowerCase() === 'share';
  const embedded = p.shared_post ? mapEmbeddedForProfile(p.shared_post) : null;
  const img = !isShare && p.image ? mediaUrl(p.image) : '';
  const vid = !isShare && p.video ? mediaUrl(p.video) : '';
  const t = (p.type || 'text').toLowerCase();
  const isVideo = !isShare && t === 'video' && !!vid;
  return {
    id: p.id,
    content: p.content || '',
    image: !isVideo && img ? img : isVideo && img ? img : null,
    video: isVideo ? vid : null,
    likes: typeof p.like_count === 'number' ? p.like_count : 0,
    comments: typeof p.comment_count === 'number' ? p.comment_count : 0,
    shares: 0,
    createdAt: p.created_at,
    type: isShare ? 'share' : isVideo ? 'video' : t === 'image' && img ? 'image' : 'text',
    isShare,
    embedded,
  };
}

function mapPetRow(p) {
  const birth = p.birth_date ? new Date(p.birth_date) : null;
  let age = '';
  if (birth && !Number.isNaN(birth.getTime())) {
    const y = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    age = y > 0 ? `${y} an(s)` : 'Moins d’un an';
  }
  const details = [p.gender, p.sterilized].filter(Boolean).join(' · ') || '—';
  const vac = (p.vaccines || '').trim();
  return {
    id: p.id,
    name: p.name,
    type: p.species || '—',
    details,
    vaccinesShort: vac.length > 48 ? `${vac.slice(0, 48)}…` : vac || null,
    age: age || '—',
    photo: p.photo ? mediaUrl(p.photo) : null,
  };
}

function formatMemberSince(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [profileData, setProfileData] = useState({
    name: 'Utilisateur',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    bio: '',
    joinDate: new Date().toISOString(),
    role: 'user',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [userAnimals, setUserAnimals] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [profileFollowInitial, setProfileFollowInitial] = useState(false);
  const [iBlocked, setIBlocked] = useState(false);
  const [blockedMe, setBlockedMe] = useState(false);
  const [canFollowProfile, setCanFollowProfile] = useState(true);
  const [blockBusy, setBlockBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [commentsModal, setCommentsModal] = useState({ open: false, postId: null, comments: [], loading: false });
   const [openPostOptionsId, setOpenPostOptionsId] = useState(null);

   const currentUser = useRef(null);

   useEffect(() => {
     const userData = JSON.parse(localStorage.getItem('user') || '{}');
     currentUser.current = userData;
     if (userId && userData.id && String(userId) === String(userData.id)) {
       navigate('/profile', { replace: true });
     }
   }, [userId, navigate]);

   const loadProfile = useCallback(async () => {
    if (!userId) return;
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setProfileLoading(true);
    setLoadError(null);
    try {
      const profileRes = await api.get(`/user/profiles/${userId}/`);
      const postsRes = await api.get(`/posts/users/${userId}/posts/`).catch(() => ({ data: [] }));
      const petsRes = await api.get(`/pets/user/${userId}/`).catch(() => ({ data: [] }));

       const data = profileRes.data;

       // Get follow status
      let followData = { followers_count: data.followers || 0, following_count: data.following || 0, is_following: data.is_following || false };
      try {
        const followRes = await api.get(`/user/is-following/${data.id}/`);
        followData = followRes.data || followData;
      } catch (err) {
        console.error('Error fetching follow status:', err);
      }

      setFollowStats({
        followers: followData.followers_count || 0,
        following: followData.following_count || 0,
      });
      setProfileFollowInitial(!!followData.is_following);
      setIBlocked(!!data.i_blocked);
      setBlockedMe(!!data.blocked_me);
      setCanFollowProfile(data.can_follow !== false && !data.blocked_me);

       setProfileData({
         name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email || 'Utilisateur',
         email: data.email || '',
         phone: data.phone || '',
         address: '',
         city: '',
         postalCode: '',
         country: '',
         bio: data.bio || '',
         joinDate: data.join_date || new Date().toISOString(),
         role: data.role || 'user',
       });
       const avatarUrl = (data.avatar || data.image) ? mediaUrl(data.avatar || data.image) : null;
       serverAvatarRef.current = avatarUrl;
       setProfileImage(avatarUrl);

      const postsData = postsRes.data;
      const postsList = Array.isArray(postsData) ? postsData : postsData?.results || [];
      setUserPosts(postsList.map(mapPost));

      const petsData = petsRes.data;
      const petsList = Array.isArray(petsData) ? petsData : petsData?.results || [];
      setUserAnimals(petsList.map(mapPetRow));
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setLoadError(
        e?.response?.data?.detail ||
          (typeof e?.message === 'string' ? e.message : null) ||
          'Impossible de charger le profil.'
      );
    } finally {
      setProfileLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const serverAvatarRef = useRef(null);

  const stats = {
    posts: userPosts.length,
    followers: followStats.followers,
    following: followStats.following,
    animals: userAnimals.length,
    likes: userPosts.reduce((s, p) => s + (p.likes || 0), 0),
  };

  const tabs = [
    { id: 'info', label: 'Publications', icon: MessageSquare },
    { id: 'animals', label: 'Animaux', icon: PawPrint },
    { id: 'activity', label: 'Activité', icon: MessageSquare },
  ];

  const refreshFollowStats = async () => {
    try {
      const followRes = await api.get(`/user/is-following/${userId}/`);
      const fd = followRes.data || {};
      setProfileFollowInitial(!!fd.is_following);
      setFollowStats({
        followers: fd.followers_count || 0,
        following: fd.following_count || 0,
      });
    } catch {
      /* ignore */
    }
  };

  const handleBlockToggle = async () => {
    if (!getAccessToken()) {
      navigate('/login');
      return;
    }
    if (!window.confirm(iBlocked ? 'Débloquer cet utilisateur ?' : 'Bloquer cet utilisateur ? Vous ne verrez plus ses publications.')) {
      return;
    }
    setBlockBusy(true);
    try {
      if (iBlocked) {
        await api.delete(`/user/block/${userId}/`);
        setIBlocked(false);
        setCanFollowProfile(true);
      } else {
        await api.post('/user/block/', { user_id: Number(userId) });
        setIBlocked(true);
        setCanFollowProfile(false);
        setProfileFollowInitial(false);
      }
      await loadProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setBlockBusy(false);
    }
  };

  const openCommentsModal = async (postId) => {
    if (!postId) return;
    setCommentsModal({ open: true, postId, comments: [], loading: true });
    try {
      const { data } = await api.get(`/posts/${postId}/comments/`);
      const list = Array.isArray(data) ? data : [];
      setCommentsModal({ open: true, postId, comments: list, loading: false });
    } catch (err) {
      setCommentsModal({ open: true, postId, comments: [], loading: false });
    }
  };

  const closeCommentsModal = () => setCommentsModal({ open: false, postId: null, comments: [], loading: false });

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'advice':
        return '💡';
      case 'image':
        return '📸';
      case 'video':
        return '🎬';
      case 'share':
        return '🔁';
      default:
        return '📝';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 bg-gray-50 dark:bg-dark-gray text-gray-900 dark:text-dark-text min-h-screen relative transition-colors duration-300">
        {profileLoading && <PageSpinner className="py-16" />}
        {!profileLoading && loadError && (
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-6 mb-6 text-center">
            <p className="text-red-700 dark:text-red-300 text-sm mb-4">{loadError}</p>
            <button
              type="button"
              onClick={() => loadProfile()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
            >
              Réessayer
            </button>
          </div>
        )}
        {!profileLoading && !loadError && (
          <>
            {/* Back button */}
            <div className="mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
              >
                ← Retour
              </button>
            </div>

            {/* Profile Header */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-lg">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-2">
                    {profileData.name}
                  </h2>
                  {profileData.role && profileData.role !== 'user' && (
                    <p className="mb-2">
                      <span className="inline-block text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                        {profileData.role === 'vet'
                          ? 'Vétérinaire'
                          : profileData.role === 'admin'
                            ? 'Administrateur'
                            : profileData.role}
                      </span>
                    </p>
                  )}
                  {profileData.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{profileData.email}</p>
                  )}
                  <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span>
                      {[profileData.address, profileData.city, profileData.country]
                        .map((s) => (s || '').trim())
                        .filter(Boolean)
                        .join(' · ') || 'Localisation non renseignée'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 mr-1 shrink-0" />
                    <span>Membre depuis {formatMemberSince(profileData.joinDate)}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{profileData.bio}</p>

                  <div className="flex justify-center md:justify-start space-x-4 mb-4">
                    <button className="text-center hover:opacity-80 transition-opacity">
                      <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.followers}</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Abonnés</p>
                    </button>
                    <button className="text-center hover:opacity-80 transition-opacity">
                      <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.following}</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Abonnements</p>
                    </button>
                    <div className="text-center">
                      <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.animals}</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Animaux</p>
                    </div>
                  </div>

                  {blockedMe && (
                    <p className="mb-3 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      Ce compte vous a bloqué. Vous ne pouvez pas suivre, commenter ni lui écrire.
                    </p>
                  )}
                  {iBlocked && !blockedMe && (
                    <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                      Vous avez bloqué cet utilisateur.
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4">
                    {!blockedMe && canFollowProfile && (
                      <FollowButton
                        key={`follow-${userId}-${profileFollowInitial}`}
                        userId={Number(userId)}
                        initialFollowing={profileFollowInitial}
                        initialFollowersCount={followStats.followers}
                        skipInitialStatusFetch
                        showFollowersCount={false}
                        canFollow={canFollowProfile}
                        onFollowChange={() => void refreshFollowStats()}
                      />
                    )}
                    {!blockedMe && !iBlocked && (
                      <button
                        type="button"
                        onClick={() => navigate(`/chat/${userId}`)}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    )}
                    {currentUser.current?.id && String(userId) !== String(currentUser.current.id) && (
                      <button
                        type="button"
                        onClick={() => void handleBlockToggle()}
                        disabled={blockBusy}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-6 py-2 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                      >
                        {blockBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                        <span>{iBlocked ? 'Débloquer' : 'Bloquer'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors text-sm border-b-2 ${
                        activeTab === tab.id
                          ? 'text-primary border-primary bg-purple-50 dark:bg-gray-700'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Publications</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{userPosts.length} posts</span>
                  </div>

                  <div className="space-y-4">
                    {userPosts.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Aucune publication</p>
                      </div>
                    ) : (
                      userPosts.map((post) => (
                        <div key={post.id} className="bg-gray-50 dark:bg-dark-accent rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                                {profileImage ? (
                                  <img
                                    src={profileImage}
                                    alt="Profil"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 dark:text-dark-text text-sm">{profileData.name}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                  <span>{formatTimeAgo(post.createdAt)}</span>
                                  <span>{getPostTypeIcon(post.type)}</span>
                                </div>
                              </div>
                            </div>
                          <div className="relative">
                            <button
                              onClick={() => setOpenPostOptionsId((id) => (id === post.id ? null : post.id))}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              aria-haspopup="menu"
                              aria-expanded={openPostOptionsId === post.id}
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {openPostOptionsId === post.id && (
                              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-600 rounded shadow-lg z-20">
                                <button
                                  onClick={() => {
                                    setOpenPostOptionsId(null);
                                    navigate(`/chat/${userId}`);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <MessageCircle className="w-4 h-4" /> Envoyer un message
                                </button>
                              </div>
                            )}
                          </div>
                          </div>

                          <div className="mb-3">
                            {post.isShare ? (
                              <>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                  Partage
                                </p>
                                {post.content?.trim() ? (
                                  <p className="mb-3 text-gray-800 dark:text-dark-text text-sm leading-relaxed">{post.content}</p>
                                ) : null}
                                {post.embedded && (
                                  <button
                                    type="button"
                                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-dark-card dark:hover:bg-gray-800"
                                    onClick={() => navigate(`/home#post-${post.embedded.id}`)}
                                  >
                                    <p className="font-semibold text-gray-800 dark:text-dark-text">{post.embedded.authorName}</p>
                                    {post.embedded.content?.trim() ? (
                                      <p className="mt-1 line-clamp-3 text-gray-600 dark:text-gray-400">{post.embedded.content}</p>
                                    ) : null}
                                    {post.embedded.video && (
                                      <div className="mt-2 rounded bg-black">
                                        <video src={post.embedded.video} controls className="max-h-48 w-full object-contain" playsInline />
                                      </div>
                                    )}
                                    {!post.embedded.video && post.embedded.image && (
                                      <img src={post.embedded.image} alt="" className="mt-2 max-h-48 w-full rounded object-contain" />
                                    )}
                                    <p className="mt-2 text-xs font-medium text-primary">Voir la publication originale →</p>
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="text-gray-800 dark:text-dark-text text-sm leading-relaxed">{post.content}</p>
                                {post.video && (
                                  <div className="mt-3 rounded-lg overflow-hidden bg-black">
                                    <video
                                      src={post.video}
                                      controls
                                      className="w-full max-h-64 object-contain"
                                      playsInline
                                    />
                                  </div>
                                )}
                                {!post.video && post.image && (
                                  <div className="mt-3 rounded-lg overflow-hidden">
                                    <img
                                      src={post.image}
                                      alt=""
                                      className="w-full max-h-96 object-contain"
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span className="text-xs">{post.likes}</span>
                              </button>
                              <button onClick={() => openCommentsModal(post.id)} className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs">{post.comments}</span>
                              </button>
                              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                                <Share className="w-4 h-4" />
                                <span className="text-xs">{post.shares}</span>
                              </button>
                            </div>
                            <button className="text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors">
                              <BookmarkPlus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'animals' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Animaux</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userAnimals.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Aucun animal enregistré</p>
                      </div>
                    ) : (
                      userAnimals.map((animal) => (
                        <div key={animal.id} className="bg-gray-50 dark:bg-dark-accent rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                              {animal.photo ? (
                                <img src={animal.photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <PawPrint className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-dark-text text-sm">{animal.name}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {animal.type} · {animal.details}
                              </p>
                              {animal.vaccinesShort && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-2">
                                  Vaccins : {animal.vaccinesShort}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 dark:text-gray-400">{animal.age}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Activité récente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                      <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-blue-600">{stats.posts}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Posts publiés</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                      <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-red-600">{stats.likes}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">J'aime reçus</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                      <PawPrint className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-green-600">{stats.animals}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Animaux enregistrés</div>
                    </div>
                  </div>
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Aucune publication</p>
                    </div>
                  ) : (
                    <div className="max-w-lg mx-auto space-y-2">
                      <p className="text-sm font-medium text-gray-800 dark:text-dark-text mb-2">Aperçu des publications</p>
                      {userPosts.slice(0, 6).map((p) => (
                        <div
                          key={p.id}
                          className="flex gap-3 items-start p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-accent text-left"
                        >
                          <span className="text-lg shrink-0">{getPostTypeIcon(p.type)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{formatTimeAgo(p.createdAt)}</p>
                            <p className="text-sm text-gray-800 dark:text-dark-text line-clamp-2">
                              {(p.content || '').trim() || '(Publication sans texte)'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments Modal */}
            {commentsModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-4 relative max-h-[90vh] overflow-y-auto">
                  <button onClick={closeCommentsModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-3">Commentaires</h3>
                  {commentsModal.loading ? (
                    <div className="text-center py-8">Chargement…</div>
                  ) : (commentsModal.comments || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Aucun commentaire</div>
                  ) : (
                    <div className="space-y-3">
                      {(commentsModal.comments || []).map((c) => {
                        const author = c.author || {};
                        const name = `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email || 'Utilisateur';
                        return (
                          <div key={c.id} className="p-3 border rounded bg-gray-50 dark:bg-dark-accent border-gray-200 dark:border-gray-600">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-sm text-gray-800 dark:text-dark-text">{name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{c.text}</div>
                                <div className="text-xs text-gray-400 mt-1">{c.created_at ? new Date(c.created_at).toLocaleString('fr-FR') : ''}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default UserProfile;
