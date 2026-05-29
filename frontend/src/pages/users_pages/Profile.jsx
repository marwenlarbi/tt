import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import PostCard, { mapApiPostToFeed } from '../../components/feed/FeedPostCard';
import SharePostModal from '../../components/feed/SharePostModal';
import { CHEEBO_OPEN_PRIVATE_CHAT_EVENT } from '../../components/Chat/PrivateChat';
import { countCommentsInTree } from '../../components/feed/commentUtils';
import { MapPin, LogOut, UserCog, Upload, Trash2, User, PawPrint, MessageSquare, Heart, Bell, Eye, Edit3, Camera, Calendar, UserPlus, UserCheck, Unlock, Ban } from 'lucide-react';
import api, { mediaUrl } from '../../services/api';

const getAccessToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('access') ||
  localStorage.getItem('token');

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

function formatProfileSaveError(err) {
  const d = err?.response?.data;
  if (!d) return 'Impossible d’enregistrer le profil.';
  if (typeof d === 'string') return d;
  if (d.detail) return typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail);
  const lines = [];
  const walk = (obj, prefix = '') => {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (Array.isArray(v)) lines.push(`${key}: ${v.join(', ')}`);
      else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
      else lines.push(`${key}: ${v}`);
    }
  };
  walk(d);
  return lines.length ? lines.join(' ') : JSON.stringify(d);
}

const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [pendingAvatarClear, setPendingAvatarClear] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [profileLoading, setProfileLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: 'Utilisateur',
    email: '',
    phone: '',
    address: '',
    city: 'Tunis',
    postalCode: '',
    country: 'Tunisia',
    bio: '',
    joinDate: new Date().toISOString(),
    role: 'user',
  });
  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: true,
  });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
  const [unblockBusyById, setUnblockBusyById] = useState({});
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountBusy, setDeleteAccountBusy] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState(null);
  const [userAnimals, setUserAnimals] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [sharePost, setSharePost] = useState(null);
  const [shareProfileBusy, setShareProfileBusy] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState(null);
   const [avatarDraftUrl, setAvatarDraftUrl] = useState(null);
   const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
   const [isFollowing, setIsFollowing] = useState(false);
   const [followBusy, setFollowBusy] = useState(false);
   const settingsBoot = useRef(true);
   const serverAvatarRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewUserId = searchParams.get('user');
  const isViewingOther = !!viewUserId && viewUserId !== String(currentUser?.id);
  
   // Get current user from localStorage
   useEffect(() => {
     const userData = JSON.parse(localStorage.getItem('user') || '{}');
     setCurrentUser(userData);
   }, []);

   // Redirect to new user profile route if viewing another user
   useEffect(() => {
     if (viewUserId && viewUserId !== String(currentUser?.id)) {
       navigate(`/users/${viewUserId}`, { replace: true });
     }
   }, [viewUserId, currentUser?.id, navigate]);

   const stats = {
     posts: userPosts.length,
     followers: followStats.followers,
     following: followStats.following,
     animals: userAnimals.length,
     likes: userPosts.reduce((s, p) => s + (p.likes || 0), 0),
   };

   const baseTabs = [
     { id: 'info', label: 'Publications', icon: MessageSquare },
     { id: 'animals', label: 'Animaux', icon: PawPrint },
     { id: 'activity', label: 'Activité', icon: MessageSquare },
   ];

   const tabs = isViewingOther
     ? baseTabs
     : [...baseTabs, { id: 'settings', label: 'Paramètres', icon: UserCog }];

  const loadDashboard = useCallback(async (opts = {}) => {
    const { quiet = false } = opts;
     const token = getAccessToken();
     if (!token) {
       navigate('/login');
       return;
     }
     
     const isOtherUser = !!viewUserId;
    
    settingsBoot.current = true;
    if (!quiet) {
      setProfileLoading(true);
      setLoadError(null);
    }
    try {
      setLoadError(null);
      
      let profileRes;
      if (isOtherUser) {
        profileRes = await api.get(`/user/profiles/${viewUserId}/`);
      } else {
        profileRes = await api.get('/user/profile/');
      }
      
      const postsRes = isOtherUser
        ? await api.get(`/posts/users/${viewUserId}/posts/`).catch(() => ({ data: [] }))
        : await api.get('/posts/mine/').catch(() => ({ data: [] }));
      const petsRes = isOtherUser 
        ? await api.get(`/pets/user/${viewUserId}/`).catch(() => ({ data: [] })) 
        : await api.get('/pets/').catch(() => ({ data: [] }));
      
      const data = profileRes.data;
      const prof = isOtherUser ? {} : (data.profile || {});
      
      // Get follow stats
      let followData = { followers_count: data.followers || 0, following_count: data.following || 0, is_following: data.is_following || false };
      if (!isOtherUser) {
        try {
          const followRes = await api.get(`/user/is-following/${data.id}/`);
          followData = followRes.data || followData;
        } catch (err) {
          console.error('Error fetching follow stats:', err);
        }
       }
       setFollowStats({
         followers: followData.followers_count || 0,
         following: followData.following_count || 0,
       });
       setIsFollowing(followData.is_following || false);
      setProfileData({
        name:
          data.name ||
          `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
          data.email ||
          'Utilisateur',
        email: data.email || '',
        phone: data.phone || '',
        address: prof.address || '',
        city: prof.city || '',
        postalCode: prof.postal_code || '',
        country: (prof.country && String(prof.country).trim()) || 'Tunisia',
        bio: prof.bio || '',
        joinDate: data.join_date || new Date().toISOString(),
        role: data.role || 'user',
      });
      serverAvatarRef.current = prof.avatar ? mediaUrl(prof.avatar) : null;
      setProfileImage(serverAvatarRef.current);
      setSettings({
        notifications: prof.notifications_enabled !== false,
        publicProfile: prof.public_profile !== false,
      });

      const postsData = postsRes.data;
      const postsList = Array.isArray(postsData) ? postsData : postsData?.results || [];
      setUserPosts(postsList.map(mapApiPostToFeed));

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
          'Impossible de charger le profil. Vérifiez la connexion au serveur.'
      );
     } finally {
       if (!quiet) setProfileLoading(false);
     }
   }, [navigate, viewUserId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, viewUserId]);

  const isLoggedIn = Boolean(getAccessToken());

  const sharePostLive = useMemo(() => {
    if (!sharePost?.id) return null;
    return userPosts.find((p) => p.id === sharePost.id) || sharePost;
  }, [sharePost, userPosts]);

  const handleDeletePost = useCallback(
    async (post) => {
      if (!post?.id || post.fromApi === false) return;
      if (!window.confirm('Supprimer définitivement cette publication ?')) return;
      const token = getAccessToken();
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        await api.delete(`/posts/${post.id}/`);
        setUserPosts((prev) => prev.filter((p) => p.id !== post.id));
        setSharePost((sp) => (sp && sp.id === post.id ? null : sp));
      } catch (err) {
        console.error('Delete post error', err);
      }
    },
    [navigate]
  );

  const handleShowUserProfile = useCallback(
    (userId) => {
      if (userId != null) navigate(`/users/${userId}`);
    },
    [navigate]
  );

  const handleAuthorFollowChange = useCallback((postId, following) => {
    setUserPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isFollowingAuthor: following } : p))
    );
  }, []);

  const loadCommentsForPost = useCallback(async (postId) => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments/`);
      const list = Array.isArray(data) ? data : [];
      setUserPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: list,
                commentCount: countCommentsInTree(list),
                commentsLoaded: true,
              }
            : p
        )
      );
    } catch {
      setUserPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsLoaded: true, comments: p.comments || [] } : p))
      );
    }
  }, []);

  const toggleLike = useCallback(
    async (postId, fromApi) => {
      if (!fromApi) return;
      if (!getAccessToken()) {
        navigate('/login');
        return;
      }
      try {
        const { data } = await api.post(`/posts/${postId}/like/`);
        setUserPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, liked: data.liked, likes: data.like_count } : p
          )
        );
      } catch {
        /* ignore */
      }
    },
    [navigate]
  );

  const toggleSave = useCallback(
    async (postId, fromApi) => {
      if (!fromApi) return;
      if (!getAccessToken()) {
        navigate('/login');
        return;
      }
      try {
        const { data } = await api.post(`/posts/${postId}/save/`);
        setUserPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, saved: data.saved } : p))
        );
      } catch {
        /* ignore */
      }
    },
    [navigate]
  );

  const submitComment = useCallback(
    async (postId, text, fromApi, parentId = null) => {
      if (!fromApi) return;
      if (!getAccessToken()) {
        navigate('/login');
        throw new Error('auth');
      }
      const body = { text };
      if (parentId != null) body.parent_id = parentId;
      await api.post(`/posts/${postId}/comments/`, body);
      await loadCommentsForPost(postId);
    },
    [loadCommentsForPost, navigate]
  );

  const deleteComment = useCallback(
    async (postId, commentId) => {
      if (!postId || !commentId) return;
      if (!window.confirm('Supprimer définitivement ce commentaire ?')) return;
      if (!getAccessToken()) {
        navigate('/login');
        return;
      }
      try {
        await api.delete(`/posts/${postId}/comments/${commentId}/`);
        await loadCommentsForPost(postId);
      } catch {
        /* ignore */
      }
    },
    [navigate, loadCommentsForPost]
  );

  const editComment = useCallback(
    async (postId, commentId, text) => {
      if (!postId || !commentId) return;
      if (!getAccessToken()) {
        navigate('/login');
        throw new Error('auth');
      }
      try {
        await api.patch(`/posts/${postId}/comments/${commentId}/`, { text });
        await loadCommentsForPost(postId);
      } catch (err) {
        throw err;
      }
    },
    [navigate, loadCommentsForPost]
  );

  const sharePostToProfile = useCallback(
    async (post) => {
      if (!post?.id) return;
      if (!getAccessToken()) {
        navigate('/login');
        return;
      }
      const sourcePostId = post.originalPost?.id ?? post.id;
      setShareProfileBusy(true);
      try {
        const { data } = await api.post(`/posts/${sourcePostId}/share/`);
        setSharePost(null);
        if (data && typeof data === 'object' && data.id != null) {
          const mapped = mapApiPostToFeed(data);
          setUserPosts((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)]);
        }
        await loadDashboard({ quiet: true });
      } catch {
        /* ignore */
      } finally {
        setShareProfileBusy(false);
      }
    },
    [navigate, loadDashboard]
  );

  const openEditPost = (post) => {
    setEditingPost(post);
    setEditingContent(post.phrase || post.content || '');
    setEditError(null);
  };

  const submitEditPost = async (e) => {
    e.preventDefault();
    if (!editingPost?.id) return;
    const t = (editingContent || '').trim();
    if (!t && editingPost.type === 'text') {
      setEditError('Le texte ne peut pas être vide.');
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      const { data } = await api.patch(`/posts/${editingPost.id}/`, { content: t });
      const mapped = mapApiPostToFeed(data);
      setUserPosts((prev) =>
        prev.map((p) =>
          p.id === mapped.id
            ? {
                ...mapped,
                comments: p.comments,
                commentsLoaded: p.commentsLoaded,
                commentCount: p.commentCount,
              }
            : p
        )
      );
      setEditingPost(null);
      setEditingContent('');
    } catch (err) {
      const d = err?.response?.data;
      const msg = (typeof d === 'string' ? d : null) || d?.detail || 'Modification impossible.';
      setEditError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setEditBusy(false);
    }
  };

  useEffect(() => {
    if (!selectedImage) {
      setAvatarDraftUrl(null);
      return;
    }
    const u = URL.createObjectURL(selectedImage);
    setAvatarDraftUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [selectedImage]);

  useEffect(() => {
    if (profileLoading) return;
    if (settingsBoot.current) {
      settingsBoot.current = false;
      return;
    }
    const token = getAccessToken();
    if (!token) return;
    const t = setTimeout(() => {
      api
        .patch('/user/profile/', {
          profile: {
            notifications_enabled: settings.notifications,
            public_profile: settings.publicProfile,
          },
        })
        .catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [settings.notifications, settings.publicProfile, profileLoading]);

  const loadBlockedUsers = useCallback(async () => {
    if (isViewingOther || !getAccessToken()) return;
    setBlockedUsersLoading(true);
    try {
      const { data } = await api.get('/user/blocked-users/');
      const rows = Array.isArray(data) ? data : [];
      setBlockedUsers(rows.filter((u) => !u?.is_staff && !u?.is_superuser));
    } catch {
      setBlockedUsers([]);
    } finally {
      setBlockedUsersLoading(false);
    }
  }, [isViewingOther]);

  useEffect(() => {
    return () => {
      if (profileImage && profileImage.startsWith('blob:')) URL.revokeObjectURL(profileImage);
    };
  }, [profileImage]);

   const clearStoredAuth = () => {
     localStorage.removeItem('access_token');
     localStorage.removeItem('refresh_token');
     localStorage.removeItem('access');
     localStorage.removeItem('token');
     localStorage.removeItem('isAdmin');
     localStorage.removeItem('user');
   };

   const handleLogout = () => {
     clearStoredAuth();
     navigate('/login');
   };

   const handleConfirmDeleteAccount = async () => {
     setDeleteAccountError(null);
     setDeleteAccountBusy(true);
     try {
       await api.delete('/user/profile/');
       setShowDeleteAccountModal(false);
       clearStoredAuth();
       navigate('/login');
     } catch (err) {
       const d = err?.response?.data;
       const msg =
         (typeof d?.detail === 'string' && d.detail) ||
         (Array.isArray(d?.detail) && d.detail.join(' ')) ||
         'Impossible de supprimer le compte. Réessayez plus tard.';
       setDeleteAccountError(msg);
     } finally {
       setDeleteAccountBusy(false);
     }
   };

   const handleFollow = async () => {
     if (!getAccessToken()) {
       navigate('/login');
       return;
     }
     setFollowBusy(true);
     try {
       const response = await api.post('/user/follow/', { user_id: viewUserId });
       const newFollowingState = response.data.following;
       setIsFollowing(newFollowingState);
       setFollowStats(prev => ({
         ...prev,
         followers: newFollowingState ? prev.followers + 1 : prev.followers - 1
       }));
     } catch (err) {
       console.error('Error following/unfollowing:', err);
     } finally {
       setFollowBusy(false);
     }
   };

   const handleEditProfile = () => {
     setShowModal(true);
   };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
    setSaveError(null);
    setPendingAvatarClear(false);
    setProfileImage(serverAvatarRef.current);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setPendingAvatarClear(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setProfileImage(null);
    setPendingAvatarClear(true);
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnblockUser = async (userId) => {
    if (!userId) return;
    setUnblockBusyById((prev) => ({ ...prev, [userId]: true }));
    try {
      await api.delete('/user/unblock/', { data: { user_id: userId } });
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Error unblocking user:', err);
    } finally {
      setUnblockBusyById((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  const handleSaveProfile = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const parts = profileData.name.trim().split(/\s+/);
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';
      const profilePayload = {
        bio: profileData.bio,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postalCode,
        country: profileData.country,
        notifications_enabled: settings.notifications,
        public_profile: settings.publicProfile,
      };
      if (pendingAvatarClear && !selectedImage) {
        profilePayload.avatar = null;
      }
      await api.patch('/user/profile/', {
        first_name,
        last_name,
        phone: profileData.phone,
        profile: profilePayload,
      });
      if (selectedImage) {
        const fd = new FormData();
        fd.append('avatar', selectedImage);
        await api.patch('/user/profile/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setPendingAvatarClear(false);
      setSelectedImage(null);
      await loadDashboard({ quiet: true });
      closeModal();
    } catch (err) {
      setSaveError(formatProfileSaveError(err));
    } finally {
      setSaving(false);
    }
  };

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
        {profileLoading && (
          <div className="flex justify-center py-16">
            <PageSpinner compact size="md" />
          </div>
        )}
        {!profileLoading && loadError && (
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-6 mb-6 text-center">
            <p className="text-red-700 dark:text-red-300 text-sm mb-4">{loadError}</p>
            <button
              type="button"
              onClick={() => loadDashboard()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
            >
              Réessayer
            </button>
          </div>
        )}
         {!profileLoading && !loadError && (
           <>
        {/* Edit post modal */}
        {editingPost && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingPost(null)}
            role="presentation"
          >
            <div
              className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 text-xl leading-none"
                aria-label="Fermer"
              >
                ×
              </button>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-3">Modifier la publication</h3>
              <form onSubmit={submitEditPost}>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  rows={5}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text"
                />
                {editError && <p className="text-sm text-red-600 mt-2">{editError}</p>}
                <div className="mt-4 flex justify-end">
                  <button type="submit" disabled={editBusy} className="px-4 py-2 bg-primary text-white rounded text-sm">{editBusy ? 'Enregistrement…' : 'Enregistrer'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {sharePost && (
          <SharePostModal
            post={sharePostLive || sharePost}
            open
            onClose={() => setSharePost(null)}
            saved={!!(sharePostLive || sharePost).saved}
            onToggleSave={toggleSave}
            onShareToProfile={sharePostToProfile}
            profileBusy={shareProfileBusy}
            isLoggedIn={isLoggedIn}
          />
        )}

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
               {!isViewingOther && (
                 <button
                   onClick={handleEditProfile}
                   className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                 >
                   <Camera className="w-4 h-4" />
                 </button>
               )}
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
               {profileData.phone && (
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{profileData.phone}</p>
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
                 <button 
                   onClick={() => navigate('/followers')}
                   className="text-center hover:opacity-80 transition-opacity"
                 >
                   <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.followers}</span>
                   <p className="text-xs text-gray-600 dark:text-gray-400">Abonnés</p>
                 </button>
                 <button 
                   onClick={() => navigate('/following')}
                   className="text-center hover:opacity-80 transition-opacity"
                 >
                   <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.following}</span>
                   <p className="text-xs text-gray-600 dark:text-gray-400">Abonnements</p>
                 </button>
                 <div className="text-center">
                   <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.animals}</span>
                   <p className="text-xs text-gray-600 dark:text-gray-400">Animaux</p>
                 </div>
               </div>

               {isViewingOther && (
                 <div className="flex flex-col sm:flex-row gap-3 mt-4">
                   <button
                     onClick={handleFollow}
                     disabled={followBusy}
                     className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                       isFollowing
                         ? 'bg-purple-500 text-white border border-purple-600 hover:bg-purple-600'
                         : 'bg-purple-600 text-white hover:bg-purple-700'
                     }`}
                   >
                     {followBusy ? (
                       <PageSpinner compact size="xs" borderTone="onDark" />
                     ) : isFollowing ? (
                       <>
                         <UserCheck className="w-4 h-4" />
                         <span>Suivi</span>
                       </>
                     ) : (
                       <>
                         <UserPlus className="w-4 h-4" />
                         <span>Suivre</span>
                       </>
                     )}
                   </button>
                   <button
                     type="button"
                     onClick={() =>
                       window.dispatchEvent(
                         new CustomEvent(CHEEBO_OPEN_PRIVATE_CHAT_EVENT, {
                           detail: {
                             user: {
                               id: Number(viewUserId),
                               name: profileData.name,
                               avatar: profileImage,
                             },
                           },
                         })
                       )
                     }
                     className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                   >
                     <MessageSquare className="w-4 h-4" />
                     <span>Message</span>
                   </button>
                 </div>
               )}
             </div>
           </div>
         </div>

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
            {!isViewingOther && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-3 font-medium transition-colors text-sm border-b-2 border-transparent text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                    {isViewingOther ? 'Publications' : 'Mes publications'}
                  </h3>
                  {!isViewingOther && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{userPosts.length} posts</span>
                      <button
                        onClick={() => navigate('/home')}
                        className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Nouveau post</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mx-auto w-full max-w-4xl space-y-4">
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {isViewingOther ? 'Aucune publication' : 'Aucune publication pour le moment'}
                      </p>
                      {!isViewingOther && (
                        <button
                          onClick={() => navigate('/home')}
                          className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                        >
                          Créer votre premier post
                        </button>
                      )}
                    </div>
                  ) : (
                  userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onOpenShareModal={setSharePost}
                      onShowUserProfile={handleShowUserProfile}
                      onToggleLike={toggleLike}
                      onToggleSave={toggleSave}
                      onRequestComments={loadCommentsForPost}
                      onSubmitComment={submitComment}
                      currentUserId={currentUser?.id ?? null}
                      onEditPost={(p) => {
                        setEditError(null);
                        openEditPost(p);
                      }}
                      onDeletePost={handleDeletePost}
                      onEditComment={editComment}
                      onDeleteComment={deleteComment}
                      onAuthorFollowChange={handleAuthorFollowChange}
                    />
                  ))
                )}
              </div>
            </div>
          )}

           {activeTab === 'animals' && (
             <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                   {isViewingOther ? 'Animaux' : 'Mes Animaux'}
                 </h3>
                 {!isViewingOther && (
                   <button
                     onClick={() => navigate('/pets')}
                     className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                   >
                     Ajouter un animal
                   </button>
                 )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {userAnimals.length === 0 ? (
                   <div className="col-span-full text-center py-8">
                     <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                     <p className="text-gray-600 dark:text-gray-400 text-sm">
                       {isViewingOther ? 'Aucun animal enregistré' : 'Aucun animal enregistré'}
                     </p>
                     {!isViewingOther && (
                       <button
                         onClick={() => navigate('/pets')}
                         className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                       >
                         Ajouter votre premier animal
                       </button>
                     )}
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
                   <p className="text-gray-600 dark:text-gray-400 text-sm">
                     {isViewingOther ? 'Aucune publication' : 'Commencez à publier pour voir votre activité ici'}
                   </p>
                   {!isViewingOther && (
                     <button
                       type="button"
                       onClick={() => navigate('/home')}
                       className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                     >
                       Créer un post
                     </button>
                   )}
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
                          {(p.phrase || '').trim() || '(Publication sans texte)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Paramètres du compte</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-accent rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-dark-text text-sm">Notifications</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Recevoir des notifications</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-accent rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-dark-text text-sm">Profil public</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Rendre mon profil visible</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.publicProfile}
                      onChange={(e) => handleSettingChange('publicProfile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="mb-3 text-base font-semibold text-gray-800 dark:text-dark-text">Utilisateurs bloqués</h4>
                <button
                  type="button"
                  onClick={async () => {
                    setShowBlockedUsersModal(true);
                    await loadBlockedUsers();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-purple-50 dark:border-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900/20"
                >
                  <Ban className="h-4 w-4" />
                  Gérer les utilisateurs bloqués
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-base font-semibold text-gray-800 dark:text-dark-text mb-3">Zone de danger</h4>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteAccountError(null);
                    setShowDeleteAccountModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
            onClick={closeModal}
            role="presentation"
          >
            <div
              className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto scrollbar scrollbar-thumb-custom-purple scrollbar-track-custom-light-track dark:scrollbar-track-custom-dark-track scrollbar-rounded border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                    Modifier le profil
                  </h3>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl leading-none"
                    aria-label="Fermer"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    {avatarDraftUrl ? (
                      <img
                        src={avatarDraftUrl}
                        alt="Preview"
                        className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg"
                      />
                    ) : profileImage ? (
                      <img
                        src={profileImage}
                        alt="Current"
                        className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary-dark transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Changer la photo</p>
                    </div>
                  </label>

                  <input
                    type="text"
                    placeholder="Nom"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">E-mail (non modifiable)</label>
                    <input
                      type="email"
                      readOnly
                      value={profileData.email}
                      className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm cursor-not-allowed"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Adresse"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Ville"
                    value={profileData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Code Postal"
                    value={profileData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <select
                    value={profileData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  >
                    <option value="Algeria">Algeria</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Morocco">Morocco</option>
                  </select>

                  <textarea
                    placeholder="Bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />

                  {saveError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
                  )}

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      disabled={saving}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded transition-colors text-sm disabled:opacity-60"
                      onClick={handleSaveProfile}
                    >
                      {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </button>
                    {(selectedImage || profileImage || serverAvatarRef.current) && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteAccountModal && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
            onClick={() => !deleteAccountBusy && setShowDeleteAccountModal(false)}
            role="presentation"
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-dark-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 p-4 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Supprimer le compte</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Cette action est définitive : votre profil, publications et données associées seront supprimés.
                </p>
                {deleteAccountError && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">{deleteAccountError}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 p-4">
                <button
                  type="button"
                  disabled={deleteAccountBusy}
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-dark-text dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={deleteAccountBusy}
                  onClick={handleConfirmDeleteAccount}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteAccountBusy ? 'Suppression…' : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showBlockedUsersModal && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowBlockedUsersModal(false)}
            role="presentation"
          >
            <div
              className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-dark-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Utilisateurs bloqués</h3>
                <button
                  type="button"
                  onClick={() => setShowBlockedUsersModal(false)}
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-xl leading-none"
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-4">
                {blockedUsersLoading ? (
                  <div className="flex justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-600 dark:bg-dark-accent">
                    <PageSpinner compact size="md" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-600 dark:bg-dark-accent dark:text-gray-300">
                    Aucun utilisateur bloqué.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-dark-accent"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            <Ban className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800 dark:text-dark-text">{u.name || 'Utilisateur'}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblockUser(u.id)}
                          disabled={!!unblockBusyById[u.id]}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-dark-text dark:hover:bg-gray-600"
                        >
                          {unblockBusyById[u.id] ? <PageSpinner compact size="2xs" /> : <Unlock className="h-3.5 w-3.5" />}
                          Débloquer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Profile;