import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import FollowButton from '../../components/FollowButton';
import FeedCommentThread from '../../components/feed/FeedCommentThread';
import { addReplyToTree, countCommentsInTree } from '../../components/feed/commentUtils';
import { CHEEBO_CHAT_SHARE_POST_EVENT, CHEEBO_POST_SHARE_PREFIX } from '../../components/Chat/PrivateChat';
import api, { mediaUrl } from '../../services/api';
import {
  Heart,
  MessageSquare,
  Share2,
  PenLine,
  X,
  Bookmark,
  Video,
  MoreHorizontal,
  Search,
  PawPrint,
  Play,
  Pause,
  Upload,
  Image as ImageIcon,
  Home as HomeIcon,
  UserRound,
  Stethoscope,
  ShoppingBag,
  LogIn,
  Pencil,
  Trash2,
  Users,
  Lightbulb,
} from 'lucide-react';

function initialsAvatarUrl(displayName) {
  const n = (displayName || 'U').trim() || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=8657ff&color=fff&size=128`;
}

function authorDisplayName(author) {
  if (!author) return 'Utilisateur';
  const full = `${author.first_name || ''} ${author.last_name || ''}`.trim();
  return full || author.email || 'Utilisateur';
}

function authorAvatarUrl(author) {
  if (!author) return null;
  const raw = author.avatar;
  if (typeof raw === 'string' && raw.length) {
    return mediaUrl(raw);
  }
  return null;
}

function getAccessToken() {
  const t =
    localStorage.getItem('access_token') ||
    localStorage.getItem('access') ||
    localStorage.getItem('token');
  if (!t || t === 'undefined' || t === 'null') return null;
  return t;
}

function SafeAvatar({ src, alt, className, onClick }) {
  const fallback = initialsAvatarUrl(alt);
  const [failed, setFailed] = useState(false);
  const display = !src || failed ? fallback : src;
  return (
    <img
      src={display}
      alt={alt || ''}
      className={className}
      onClick={onClick}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
    />
  );
}

// Composant pour les éléments de la barre latérale
const SidebarItem = ({ icon, text, onClick }) => {
  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium text-gray-900 dark:text-dark-text">{text}</span>
    </div>
  );
};

// Composant pour les utilisateurs connectés
const ConnectedUserItem = ({ userImage, name, isOnline, lastSeenLabel, onClick }) => {
  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700 ${!onClick ? 'cursor-default opacity-80' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <SafeAvatar
        src={userImage}
        alt={name}
        className="h-8 w-8 shrink-0 rounded-full border border-gray-300 object-cover dark:border-gray-600"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-900 dark:text-dark-text">{name}</div>
        {isOnline ? (
          <div className="truncate text-[11px] font-medium text-green-600 dark:text-green-400">En ligne</div>
        ) : lastSeenLabel ? (
          <div className="truncate text-[11px] text-gray-500 dark:text-gray-400">Actif {lastSeenLabel}</div>
        ) : (
          <div className="truncate text-[11px] text-gray-500 dark:text-gray-400">Hors ligne</div>
        )}
      </div>
      <div
        className={`h-3 w-3 shrink-0 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        title={isOnline ? 'En ligne' : 'Hors ligne'}
        aria-hidden
      />
    </div>
  );
};

// Barre latérale gauche — compte, filtre du fil, liens utiles
const LeftSidebar = ({ sidebarSearch, onSidebarSearchChange, me, isLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-gray-50 dark:bg-dark-card border-r border-gray-200 dark:border-gray-600 p-4 overflow-y-auto h-screen hidden lg:block scrollbar-thin scrollbar-thumb-custom-purple scrollbar-track-custom-light-track dark:scrollbar-track-custom-dark-track scrollbar-rounded">
      <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-600">
        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <SafeAvatar
              src={me?.avatarUrl}
              alt={me?.name || 'Moi'}
              className="h-11 w-11 shrink-0 rounded-full border-2 border-primary object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-gray-900 dark:text-dark-text">{me?.name || 'Mon compte'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Voir le profil</div>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            Connexion
          </button>
        )}
      </div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-dark-text" />
          <input
            type="search"
            placeholder="Filtrer le fil…"
            value={sidebarSearch}
            onChange={(e) => onSidebarSearchChange(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-dark-text dark:focus:ring-primary-dark"
          />
        </div>
      </div>
      <nav className="mb-4 flex flex-col gap-1" aria-label="Navigation principale">
        <SidebarItem icon={<PawPrint className="h-6 w-6 text-primary" />} text="Mes animaux" onClick={() => navigate('/pets')} />
        <SidebarItem icon={<Stethoscope className="h-6 w-6 text-primary" />} text="Vétérinaires" onClick={() => navigate('/vet')} />
        <SidebarItem icon={<Lightbulb className="h-6 w-6 text-primary" />} text="Conseils véto" onClick={() => navigate('/vet-advice')} />
        <SidebarItem icon={<Users className="h-6 w-6 text-primary" />} text="Ami(e)s" onClick={() => navigate('/friends')} />
        <SidebarItem icon={<Bookmark className="h-6 w-6 text-primary" />} text="Enregistrements" onClick={() => navigate('/bookmarks')} />
        <SidebarItem icon={<ShoppingBag className="h-6 w-6 text-primary" />} text="Boutique" onClick={() => navigate('/product')} />
        <SidebarItem icon={<PawPrint className="h-6 w-6 text-primary" />} text="Adoption" onClick={() => navigate('/adoption')} />
      </nav>
    </div>
   );
 };

function mapFollowedRowToContact(u) {
  return {
    id: u.id,
    userImage: u.avatar,
    name: u.name,
    isOnline: !!u.is_online,
    lastSeenLabel: u.is_online ? '' : formatLastSeenFr(u.last_seen_at),
  };
}

/** Barre latérale droite : suivis (propriétaires / vétérinaires) ou suggestions du fil. */
const RightSidebar = ({
  followedOwners,
  followedVets,
  followedLoading,
  suggestedContacts,
  onShowUserProfile,
  showFollowedOnly,
}) => {
  const owners = (followedOwners || []).map(mapFollowedRowToContact);
  const vets = (followedVets || []).map(mapFollowedRowToContact);
  const hasFollowed = showFollowedOnly;

  return (
    <div className="hidden h-screen w-64 overflow-y-auto border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-dark-card lg:block scrollbar-thin scrollbar-thumb-custom-purple scrollbar-track-custom-light-track dark:scrollbar-track-custom-dark-track scrollbar-rounded">
      {followedLoading && (
        <p className="mb-4 text-center text-xs text-gray-500 dark:text-gray-400">Mise à jour…</p>
      )}
      {hasFollowed ? (
        <>
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-dark-text">
              Propriétaires suivis
            </h2>
            {owners.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">Aucun pour le moment.</p>
            ) : (
              owners.map((user, index) => (
                <ConnectedUserItem
                  key={user.id ?? `o-${index}`}
                  userImage={user.userImage}
                  name={user.name}
                  isOnline={user.isOnline}
                  lastSeenLabel={user.lastSeenLabel}
                  onClick={() => user.id != null && onShowUserProfile(user.id)}
                />
              ))
            )}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-dark-text">
              Vétérinaires suivis
            </h2>
            {vets.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">Aucun pour le moment.</p>
            ) : (
              vets.map((user, index) => (
                <ConnectedUserItem
                  key={user.id ?? `v-${index}`}
                  userImage={user.userImage}
                  name={user.name}
                  isOnline={user.isOnline}
                  lastSeenLabel={user.lastSeenLabel}
                  onClick={() => user.id != null && onShowUserProfile(user.id)}
                />
              ))
            )}
          </section>
        </>
      ) : (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-dark-text">À découvrir</h2>
          {suggestedContacts && suggestedContacts.length > 0 ? (
            suggestedContacts.map((user, index) => (
              <ConnectedUserItem
                key={user.id ?? `c-${index}`}
                userImage={user.userImage}
                name={user.name}
                isOnline={user.isOnline}
                lastSeenLabel={user.lastSeenLabel}
                onClick={() => (user.id != null ? onShowUserProfile(user.id) : undefined)}
              />
            ))
          ) : (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Suivez des utilisateurs pour les voir ici avec leur statut.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

function PostFeedImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const u = src && String(src).trim();
  if (!u || failed) {
    return (
      <div className="flex min-h-[8rem] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-dark-accent dark:text-gray-400">
        {failed ? 'Image introuvable ou inaccessible.' : 'Aucune image.'}
      </div>
    );
  }
  return (
    <img
      src={u}
      alt={alt}
      className="max-h-[min(70vh,32rem)] w-full rounded-lg bg-gray-100 object-contain dark:bg-black/30"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

// Composant vidéo
const VideoPlayer = ({ src, poster }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const safeSrc = src && String(src).trim() ? String(src).trim() : '';

  useEffect(() => {
    setVideoError(false);
  }, [safeSrc]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setVideoError(true));
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!safeSrc) {
    return (
      <div className="rounded-lg bg-gray-100 px-4 py-10 text-center text-sm text-gray-500 dark:bg-black/40 dark:text-gray-400">
        Vidéo indisponible (fichier introuvable).
      </div>
    );
  }

  if (videoError) {
    return (
      <div className="rounded-lg bg-gray-100 px-4 py-10 text-center text-sm text-gray-500 dark:bg-black/40 dark:text-gray-400">
        Impossible de lire cette vidéo (format ou fichier non pris en charge).
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={safeSrc}
        poster={poster && String(poster).trim() ? poster : undefined}
        className="w-full max-h-[min(70vh,36rem)] rounded-lg bg-black object-contain"
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setVideoError(true)}
      />
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
      >
        {isPlaying ? (
          <Pause className="w-12 h-12 text-white" />
        ) : (
          <Play className="w-12 h-12 text-white" />
        )}
      </button>
    </div>
  );
};

// Composant principal pour une carte de post
function commentCountDisplayed(post) {
  if (post.commentsLoaded && Array.isArray(post.comments)) {
    return countCommentsInTree(post.comments);
  }
  if (typeof post.commentCount === 'number') return post.commentCount;
  return Array.isArray(post.comments) ? countCommentsInTree(post.comments) : 0;
}

const PostCard = ({
  post,
  onOpenShareModal,
  onShowUserProfile,
  onToggleLike,
  onToggleSave,
  onRequestComments,
  onSubmitComment,
  currentUserId,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
  onAuthorFollowChange,
}) => {
  const navigate = useNavigate();
  const fromApi = post.fromApi !== false;
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const dropdownRef = useRef(null);
  const isMine = fromApi && currentUserId != null && post.userId === currentUserId;
  const blocked = !!post.interactionBlocked;
  const isSharePost = post.type === 'share' || !!post.originalPost;
  const shellClass =
    'w-full bg-white dark:bg-dark-card shadow-md rounded-lg mb-6 overflow-hidden transition-colors duration-300 relative';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveClick = async () => {
    if (typeof onToggleSave !== 'function') return;
    setSaveBusy(true);
    try {
      await onToggleSave(post.id, fromApi);
    } finally {
      setSaveBusy(false);
    }
  };

  const handleLikeClick = async () => {
    if (blocked) return;
    if (typeof onToggleLike !== 'function') return;
    setLikeBusy(true);
    try {
      await onToggleLike(post.id, fromApi);
    } finally {
      setLikeBusy(false);
    }
  };

  const handleReportPost = async () => {
    if (!post?.id || blocked) return;
    const reasonInput = window.prompt('Raison du signalement (optionnel) :');
    const reason = (reasonInput || '').trim() || 'Contenu inapproprié';
    const description = window.prompt('Description (optionnelle) :') || '';
    try {
      await api.post(`/posts/${post.id}/report/`, {
        reason,
        description: description.trim(),
        priority: 'medium',
      });
      alert('Signalement envoyé.');
    } catch (err) {
      const msg = err?.response?.data?.detail || "Impossible d'envoyer le signalement.";
      alert(msg);
    }
  };

  return (
    <div
      id={fromApi && post.id != null ? `post-${post.id}` : undefined}
      className={shellClass}
    >
      <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SafeAvatar
            src={post.userImage}
            alt={post.user}
            className="h-10 w-10 shrink-0 cursor-pointer rounded-full border-2 border-gray-300 object-cover shadow-sm hover:ring-2 hover:ring-primary dark:border-gray-600"
            onClick={() => post.userId != null && onShowUserProfile(post.userId)}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="font-semibold text-gray-800 dark:text-dark-text cursor-pointer hover:text-primary"
                onClick={() => post.userId != null && onShowUserProfile(post.userId)}
              >
                {post.user}
              </p>
              {fromApi && currentUserId != null && post.userId != null && post.userId !== currentUserId && !blocked ? (
                <FollowButton
                  userId={post.userId}
                  initialFollowing={!!post.isFollowingAuthor}
                  skipInitialStatusFetch={fromApi}
                  showFollowersCount={false}
                  textOnly
                  canFollow={!blocked}
                  onFollowChange={(v) => onAuthorFollowChange?.(post.id, v)}
                />
              ) : null}
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-text">{post.time}</p>
            {isSharePost ? (
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">a partagé une publication</p>
            ) : null}
          </div>
        </div>
        <div className="relative shrink-0">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-500 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
            aria-label="Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showOptions && (
            <div
              ref={dropdownRef}
              className="absolute top-8 right-0 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg w-48 z-10"
            >
              <div className="py-1">
                {isMine && typeof onEditPost === 'function' && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-gray-700"
                    onClick={() => {
                      setShowOptions(false);
                      onEditPost(post);
                    }}
                  >
                    <Pencil className="h-4 w-4 shrink-0" />
                    Modifier
                  </button>
                )}
                {isMine && typeof onDeletePost === 'function' && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setShowOptions(false);
                      onDeletePost(post);
                    }}
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    Supprimer
                  </button>
                )}
                {isMine && <div className="my-1 border-t border-gray-100 dark:border-gray-600" />}
                {!isSharePost && (
                <button
                  type="button"
                  disabled={blocked}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-dark-text dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowOptions(false);
                    onOpenShareModal(post);
                  }}
                >
                  Partager…
                </button>
                )}
                <button
                  type="button"
                  disabled={blocked}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-dark-text dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowOptions(false);
                    void handleSaveClick();
                  }}
                >
                  {post.saved ? 'Retirer des enregistrements' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowOptions(false);
                    void handleReportPost();
                  }}
                >
                  Rapport
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {isSharePost && post.originalPost ? (
          <>
            {post.phrase?.trim() ? (
              <p className="mb-3 whitespace-pre-wrap text-gray-700 dark:text-dark-text">{post.phrase}</p>
            ) : null}
            <EmbeddedOriginalPreview
              original={post.originalPost}
              onShowUserProfile={onShowUserProfile}
              onOpenOriginal={(origId) => navigate(`/home#post-${origId}`)}
            />
          </>
        ) : (
          <>
            {post.phrase?.trim() ? (
              <p className="mb-4 whitespace-pre-wrap text-gray-700 dark:text-dark-text">{post.phrase}</p>
            ) : null}
            {post.type === 'video' && post.videoUrl?.trim() ? (
              <VideoPlayer src={post.videoUrl} poster={post.petImage || undefined} />
            ) : post.petImage?.trim() ? (
              <PostFeedImage
                src={post.petImage}
                alt={post.phrase?.trim() ? `Illustration : ${post.phrase.trim().slice(0, 80)}` : `Publication de ${post.user}`}
              />
            ) : null}
          </>
        )}
      </div>

      {blocked && (
        <p className="px-4 py-2 text-xs text-amber-800 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-200">
          Vous ne pouvez pas interagir avec cette publication (blocage).
        </p>
      )}

      <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={blocked || likeBusy || typeof onToggleLike !== 'function'}
            title={blocked ? 'Indisponible (blocage)' : !fromApi ? 'Mode démo' : undefined}
            className="flex items-center gap-2 disabled:opacity-50"
            aria-label={post.liked ? "Je n'aime plus" : "J'aime"}
          >
            <Heart className={`w-5 h-5 ${post.liked ? 'text-red-500 fill-red-500' : 'text-gray-500 dark:text-dark-text'}`} />
            <span className="text-sm text-gray-600 dark:text-dark-text">{post.likes}</span>
          </button>
          <button
            type="button"
            onClick={() => !blocked && setShowComments(!showComments)}
            disabled={blocked}
            className="flex items-center gap-2 disabled:opacity-50"
            aria-label="Commenter"
          >
            <MessageSquare className="w-5 h-5 text-gray-500 dark:text-dark-text" />
            <span className="text-sm text-gray-600 dark:text-dark-text">{commentCountDisplayed(post)}</span>
          </button>
          {typeof onToggleSave === 'function' && (
            <button
              type="button"
              onClick={() => !blocked && void handleSaveClick()}
              disabled={blocked || saveBusy}
              className="flex items-center gap-2 disabled:opacity-50"
              aria-label={post.saved ? 'Retirer des enregistrements' : 'Enregistrer'}
            >
              <Bookmark
                className={`h-5 w-5 ${post.saved ? 'fill-primary text-primary' : 'text-gray-500 dark:text-dark-text'}`}
              />
            </button>
          )}
        </div>
        {!isSharePost ? (
          <button
            type="button"
            onClick={() => !blocked && onOpenShareModal(post)}
            disabled={blocked}
            className="text-gray-500 dark:text-dark-text disabled:opacity-50"
            aria-label="Partager"
          >
            <Share2 className="w-5 h-5" />
          </button>
        ) : (
          <span className="w-5" aria-hidden />
        )}
      </div>

      {showComments && !blocked && (
        <FeedCommentThread
          postId={post.id}
          comments={post.comments || []}
          fromApi={fromApi}
          commentsLoaded={!!post.commentsLoaded}
          onRequestComments={onRequestComments}
          currentUserId={currentUserId}
          onShowUserProfile={onShowUserProfile}
          onSubmitComment={onSubmitComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          commentError={commentError}
          onCommentErrorClear={() => setCommentError(null)}
        />
      )}
    </div>
  );
};

/** Aperçu du post original dans un partage (pas de j’aime / commentaires ici). */
function EmbeddedOriginalPreview({ original, onShowUserProfile, onOpenOriginal }) {
  if (!original?.id) return null;
  return (
    <button
      type="button"
      className="w-full rounded-lg border border-gray-200 bg-gray-50 text-left transition hover:bg-gray-100 dark:border-gray-600 dark:bg-dark-accent/60 dark:hover:bg-dark-accent"
      onClick={() => onOpenOriginal(original.id)}
    >
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-600">
        <SafeAvatar
          src={original.userImage}
          alt={original.user}
          className="h-9 w-9 shrink-0 rounded-full border border-gray-300 object-cover dark:border-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            if (original.userId != null) onShowUserProfile(original.userId);
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800 dark:text-dark-text">{original.user}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{original.time}</p>
        </div>
      </div>
      <div className="space-y-2 p-3">
        {original.phrase?.trim() ? (
          <p className="line-clamp-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{original.phrase}</p>
        ) : null}
        {original.type === 'video' && original.videoUrl?.trim() ? (
          <VideoPlayer src={original.videoUrl} poster={original.petImage || undefined} />
        ) : original.petImage?.trim() ? (
          <PostFeedImage src={original.petImage} alt="" />
        ) : null}
      </div>
      <p className="px-3 pb-2 text-left text-xs font-medium text-primary">Voir la publication originale →</p>
    </button>
  );
}

function formatFeedTime(iso) {
  if (!iso) return '';
  const postDate = new Date(iso);
  if (Number.isNaN(postDate.getTime())) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 172800) return 'Hier';
  return postDate.toLocaleDateString('fr-FR');
}

/** Dernière activité (hors « en ligne ») — affiché après « Actif » dans la sidebar */
function formatLastSeenFr(iso) {
  if (!iso) return 'il y a longtemps';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 10) return "à l'instant";
  if (sec < 60) return `il y a ${sec} s`;
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    return m === 1 ? 'il y a 1 min' : `il y a ${m} min`;
  }
  if (sec < 86400) {
    const h = Math.floor(sec / 3600);
    return h === 1 ? 'il y a 1 h' : `il y a ${h} h`;
  }
  if (sec < 172800) return 'hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function buildPostShareChatBody(postId, authorName, phrase) {
  const snippet = (phrase || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const more = snippet.length >= 160 ? '…' : '';
  const excerpt =
    snippet.length > 0
      ? `\n📎 « ${snippet.slice(0, 160)}${more} » — ${(authorName || 'Auteur').trim()}`
      : '\n📎 Publication du fil d’actualité';
  return `${CHEEBO_POST_SHARE_PREFIX}${postId}${excerpt}`;
}

function SharePostModal({
  post,
  open,
  onClose,
  saved,
  onToggleSave,
  onShareToProfile,
  profileBusy,
  isLoggedIn,
}) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [msgBusyId, setMsgBusyId] = useState(null);
  const [saveBusy, setSaveBusy] = useState(false);

  const handleSaveClick = async () => {
    setSaveBusy(true);
    try {
      await onToggleSave(post.id, post.fromApi);
    } finally {
      setSaveBusy(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingUsers(true);
    api
      .get('/user/presence/directory/')
      .then(({ data }) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const sendToUser = (userId) => {
    if (!post?.id || !userId) return;
    const linkPostId = post.originalPost?.id ?? post.id;
    const authorName = post.originalPost?.user ?? post.user;
    const phrase = post.originalPost?.phrase ?? post.phrase;
    const text = buildPostShareChatBody(linkPostId, authorName, phrase);
    setMsgBusyId(userId);
    window.dispatchEvent(
      new CustomEvent(CHEEBO_CHAT_SHARE_POST_EVENT, { detail: { userId, text } })
    );
    setMsgBusyId(null);
    onClose();
  };

  const copyLink = () => {
    const linkId = post?.originalPost?.id ?? post?.id;
    const url = `${window.location.origin}/home#post-${linkId ?? ''}`;
    navigator.clipboard?.writeText(url).then(
      () => {
        onClose();
      },
      () => {}
    );
  };

  if (!open || !post) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-600 dark:bg-dark-card"
        role="dialog"
        aria-labelledby="share-post-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="share-post-title" className="pr-8 text-lg font-semibold text-gray-900 dark:text-dark-text">
          Partager la publication
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {post.originalPost?.phrase || post.phrase || 'Publication'}
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            disabled={!isLoggedIn || saveBusy}
            onClick={() => void handleSaveClick()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text dark:hover:bg-gray-700"
          >
            {saveBusy ? (
              <PageSpinner compact size="xs" />
            ) : (
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`} />
            )}
            {saved ? 'Retirer des enregistrements' : 'Enregistrer'}
          </button>

          <button
            type="button"
            disabled={!isLoggedIn || profileBusy}
            onClick={() => onShareToProfile(post)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {profileBusy ? <PageSpinner compact size="xs" borderTone="onDark" /> : <Share2 className="h-4 w-4" />}
            Publier sur mon profil
          </button>

          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-dark-text dark:hover:bg-gray-700"
          >
            Copier le lien
          </button>

          <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Envoyer en message privé
            </p>
            {!isLoggedIn ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Connectez-vous pour envoyer un message.</p>
            ) : loadingUsers ? (
              <div className="flex justify-center py-6">
                <PageSpinner compact size="md" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucun autre utilisateur pour le moment.</p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto">
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      disabled={msgBusyId === u.id}
                      onClick={() => sendToUser(u.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <SafeAvatar src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                      <span className="min-w-0 flex-1 truncate font-medium text-gray-800 dark:text-dark-text">{u.name}</span>
                      <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function mapOriginalEmbedFromApi(o) {
  if (!o || !o.id) return null;
  const author = o.author || {};
  const fullName = authorDisplayName(author);
  const avatar = authorAvatarUrl(author) || initialsAvatarUrl(fullName);
  const img = o.image ? mediaUrl(o.image) : '';
  const vid = o.video ? mediaUrl(o.video) : '';
  const isVideo = (o.type || '').toLowerCase() === 'video' && !!vid;
  return {
    id: o.id,
    userId: author.id ?? null,
    userImage: avatar,
    user: fullName,
    time: formatFeedTime(o.created_at),
    phrase: o.content || '',
    petImage: isVideo ? img || '' : img,
    videoUrl: isVideo ? vid : '',
    type: isVideo ? 'video' : img ? 'image' : 'text',
    fromApi: true,
  };
}

function mapApiPostToFeed(p) {
  const author = p.author || {};
  const fullName = authorDisplayName(author);
  const avatar = authorAvatarUrl(author) || initialsAvatarUrl(fullName);
  const img = p.image ? mediaUrl(p.image) : '';
  const vid = p.video ? mediaUrl(p.video) : '';
  const isVideo = (p.type || '').toLowerCase() === 'video' && !!vid;
  const isShare = !!(p.shared_post && p.shared_post.id) || (p.type || '').toLowerCase() === 'share';
  const originalPost = p.shared_post ? mapOriginalEmbedFromApi(p.shared_post) : null;
  return {
    feedKind: isShare ? 'share' : 'post',
    id: p.id,
    userId: author.id ?? null,
    userImage: avatar,
    user: fullName,
    time: formatFeedTime(p.created_at),
    phrase: p.content || '',
    petImage: isShare ? '' : isVideo ? img || '' : img,
    videoUrl: isShare ? '' : isVideo ? vid : '',
    type: isShare ? 'share' : isVideo ? 'video' : img ? 'image' : 'text',
    likes: typeof p.like_count === 'number' ? p.like_count : 0,
    liked: !!p.liked_by_me,
    saved: !!p.saved_by_me,
    comments: [],
    commentCount: typeof p.comment_count === 'number' ? p.comment_count : 0,
    commentsLoaded: false,
    fromApi: true,
    isFollowingAuthor: !!p.is_following_author,
    interactionBlocked: !!p.interaction_blocked,
    originalPost,
  };
}

function buildDemoCommentNode(text, parentId, me) {
  const name = me?.name || 'Vous';
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return {
    id: -Math.abs(Date.now()),
    text,
    created_at: new Date().toISOString(),
    parent_id: parentId ?? null,
    author: {
      id: me?.id ?? 0,
      first_name: parts[0] || 'Vous',
      last_name: parts.slice(1).join(' ') || '',
      email: '',
    },
    like_count: 0,
    love_count: 0,
    my_reaction: null,
    replies: [],
  };
}

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [me, setMe] = useState(null);
  const isLoggedIn = Boolean(getAccessToken());

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();
    if (!token) {
      setMe(null);
      return undefined;
    }
    (async () => {
      try {
        const { data } = await api.get('/user/profile/');
        if (cancelled) return;
        const av = data.profile?.avatar;
        setMe({
          id: data.id,
          name: data.name || data.email || '',
          avatarUrl: av ? mediaUrl(av) : null,
        });
      } catch {
        if (!cancelled) setMe(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState(null);
  const [sidebarQuery, setSidebarQuery] = useState('');

  const loadFeed = useCallback(async (options = {}) => {
    const silent = !!options.silent;
    if (!silent) {
      setFeedLoading(true);
      setFeedError(null);
    }
    try {
      const { data } = await api.get('/posts/feed/');
      const list = Array.isArray(data) ? data : data?.results || [];
      setPosts(list.map(mapApiPostToFeed));
    } catch {
      if (!silent) {
        setFeedError('Impossible de charger le fil. Vérifiez votre connexion.');
        setPosts([]);
      }
    } finally {
      if (!silent) setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (feedLoading) return;
    const hash = (location.hash || '').replace(/^#/, '');
    const m = /^post-(\d+)(?:-comment-(\d+))?$/.exec(hash);
    if (!m) return;
    const postId = m[1];
    const commentId = m[2];
    requestAnimationFrame(() => {
      document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (commentId) {
        document.getElementById(`feed-comment-${commentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, [feedLoading, posts, location.hash]);

  const filteredPosts = useMemo(() => {
    const q = sidebarQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const hay = `${p.user} ${p.phrase || ''} ${p.originalPost?.user || ''} ${p.originalPost?.phrase || ''}`;
      return hay.toLowerCase().includes(q);
    });
  }, [posts, sidebarQuery]);

  const handleAuthorFollowChange = useCallback((postId, following) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isFollowingAuthor: following } : p))
    );
  }, []);

  const suggestedContacts = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const p of posts) {
      const id = p.userId;
      if (id == null || seen.has(id)) continue;
      seen.add(id);
      out.push({
        id,
        userImage: p.userImage,
        name: p.user,
        isOnline: false,
        lastSeenLabel: '',
      });
      if (out.length >= 8) break;
    }
    return out;
  }, [posts]);

  const [followedOwners, setFollowedOwners] = useState([]);
  const [followedVets, setFollowedVets] = useState([]);
  const [followedLoading, setFollowedLoading] = useState(false);

  const loadFollowedPresence = useCallback(async () => {
    if (!getAccessToken()) {
      setFollowedOwners([]);
      setFollowedVets([]);
      return;
    }
    setFollowedLoading(true);
    try {
      const { data } = await api.get('/user/presence/followed/');
      setFollowedOwners(Array.isArray(data?.owners) ? data.owners : []);
      setFollowedVets(Array.isArray(data?.vets) ? data.vets : []);
    } catch {
      setFollowedOwners([]);
      setFollowedVets([]);
    } finally {
      setFollowedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowedPresence();
    if (!isLoggedIn) return undefined;
    const t = setInterval(loadFollowedPresence, 20000);
    return () => clearInterval(t);
  }, [loadFollowedPresence, isLoggedIn]);

   const [showModal, setShowModal] = useState(false);
   const [newPost, setNewPost] = useState({
    phrase: '',
    petImage: '',
    type: 'text',
    videoUrl: '',
    imageFile: null,
    videoFile: null,
  });
  const [postError, setPostError] = useState(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [shareProfileBusy, setShareProfileBusy] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [editPhrase, setEditPhrase] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState(null);

  const sharePostLive = useMemo(() => {
    if (!sharePost?.id) return null;
    return posts.find((p) => p.id === sharePost.id) || sharePost;
  }, [sharePost, posts]);

  const handleComment = useCallback((postId, node) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const roots = post.comments || [];
        const nextRoots = node.parent_id ? addReplyToTree(roots, node.parent_id, node) : [...roots, node];
        return {
          ...post,
          comments: nextRoots,
          commentCount: countCommentsInTree(nextRoots),
        };
      })
    );
  }, []);

  const loadCommentsForPost = useCallback(async (postId) => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments/`);
      const list = Array.isArray(data) ? data : [];
      setPosts((prev) =>
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
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsLoaded: true, comments: p.comments || [] } : p))
      );
    }
  }, []);

  const toggleLike = useCallback(
    async (postId, fromApi) => {
      if (!fromApi) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            const liked = !p.liked;
            const likes = Math.max(0, p.likes + (liked ? 1 : -1));
            return { ...p, liked, likes };
          })
        );
        return;
      }
      if (!getAccessToken()) {
        navigate('/login');
        return;
      }
      try {
        const { data } = await api.post(`/posts/${postId}/like/`);
        setPosts((prev) =>
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

  const submitComment = useCallback(
    async (postId, text, fromApi, parentId = null) => {
      if (!fromApi) {
        handleComment(postId, buildDemoCommentNode(text, parentId, me));
        return;
      }
      if (!getAccessToken()) {
        navigate('/login');
        throw new Error('auth');
      }
      const body = { text };
      if (parentId != null) body.parent_id = parentId;
      await api.post(`/posts/${postId}/comments/`, body);
      await loadCommentsForPost(postId);
    },
    [handleComment, loadCommentsForPost, navigate, me]
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

  const toggleSave = useCallback(
    async (postId, fromApi) => {
      if (!fromApi) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p))
        );
        return;
      }
      if (!getAccessToken()) {
        navigate('/login');
        return;
      }
      try {
        const { data } = await api.post(`/posts/${postId}/save/`);
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, saved: data.saved } : p))
        );
      } catch {
        /* ignore */
      }
    },
    [navigate]
  );

  const deletePost = useCallback(
    async (post) => {
      if (!post?.id || post.fromApi === false) return;
      if (!window.confirm('Supprimer définitivement cette publication ?')) return;
      if (!getAccessToken()) {
        navigate('/login');
        return;
      }
      try {
        await api.delete(`/posts/${post.id}/`);
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        setSharePost((sp) => (sp && sp.id === post.id ? null : sp));
        setEditPost((ep) => (ep && ep.id === post.id ? null : ep));
      } catch {
        /* ignore */
      }
    },
    [navigate]
  );

  const submitEditPost = async (e) => {
    e.preventDefault();
    if (!editPost?.id) return;
    const t = editPhrase.trim();
    if (!t && editPost.type === 'text') {
      setEditError('Le texte ne peut pas être vide.');
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      const { data } = await api.patch(`/posts/${editPost.id}/`, { content: t });
      const mapped = mapApiPostToFeed(data);
      setPosts((prev) =>
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
      setEditPost(null);
      setEditPhrase('');
    } catch (err) {
      const d = err?.response?.data;
      const msg =
        (typeof d === 'string' ? d : null) ||
        d?.detail ||
        (d && typeof d === 'object' ? JSON.stringify(d) : null) ||
        'Modification impossible.';
      setEditError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setEditBusy(false);
    }
  };

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
          setPosts((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)]);
        }
        await loadFeed({ silent: true });
      } catch {
        /* ignore */
      } finally {
        setShareProfileBusy(false);
      }
    },
    [navigate, loadFeed]
  );

  const handleShowUserProfile = useCallback((userId) => {
    if (userId != null) {
      navigate(`/users/${userId}`);
    }
  }, [navigate]);

  const resetNewPost = () => {
    if (newPost.petImage && newPost.petImage.startsWith('blob:')) {
      URL.revokeObjectURL(newPost.petImage);
    }
    if (newPost.videoUrl && newPost.videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(newPost.videoUrl);
    }
    setNewPost({
      phrase: '',
      petImage: '',
      type: 'text',
      videoUrl: '',
      imageFile: null,
      videoFile: null,
    });
    setPostError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPostError(null);
    if (!getAccessToken()) {
      navigate('/login');
      return;
    }
    const contentType = newPost.type;
    if (contentType === 'text' && !newPost.phrase.trim()) {
      setPostError('Écrivez un message pour une publication texte.');
      return;
    }
    if (contentType === 'image' && !newPost.imageFile) {
      setPostError('Ajoutez une image.');
      return;
    }
    if (contentType === 'video' && !newPost.videoFile) {
      setPostError('Ajoutez une vidéo.');
      return;
    }
    setPostSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('content', newPost.phrase || '');
      fd.append('type', contentType);
      if (contentType === 'image' && newPost.imageFile) {
        fd.append('image', newPost.imageFile);
      }
      if (contentType === 'video' && newPost.videoFile) {
        fd.append('video', newPost.videoFile);
      }
      await api.post('/posts/create/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      resetNewPost();
      setShowModal(false);
      await loadFeed();
    } catch (err) {
      const d = err?.response?.data;
      const msg =
        (typeof d === 'string' ? d : null) ||
        d?.detail ||
        (d && typeof d === 'object' ? JSON.stringify(d) : null) ||
        'Impossible de publier.';
      setPostError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'image') {
      setNewPost((prev) => {
        if (prev.videoUrl?.startsWith('blob:')) URL.revokeObjectURL(prev.videoUrl);
        return {
          ...prev,
          petImage: url,
          videoUrl: '',
          type: 'image',
          imageFile: file,
          videoFile: null,
        };
      });
    } else if (type === 'video') {
      setNewPost((prev) => {
        if (prev.petImage?.startsWith('blob:')) URL.revokeObjectURL(prev.petImage);
        return {
          ...prev,
          videoUrl: url,
          petImage: url,
          type: 'video',
          videoFile: file,
          imageFile: null,
        };
      });
    }
  };

  return (
    <Layout>
      <div className="bg-white dark:bg-dark-gray min-h-screen flex">
        <LeftSidebar
          sidebarSearch={sidebarQuery}
          onSidebarSearchChange={setSidebarQuery}
          me={me}
          isLoggedIn={isLoggedIn}
        />
        <div className="flex-1 container mx-auto px-4 py-6 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-custom-purple scrollbar-track-custom-light-track dark:scrollbar-track-custom-dark-track scrollbar-rounded">
          <nav
            className="mb-4 flex flex-wrap items-center justify-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-1 py-2 dark:border-gray-600 dark:bg-dark-card lg:hidden"
            aria-label="Navigation rapide"
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg p-2 text-[11px] text-gray-700 dark:text-dark-text"
              onClick={() => navigate('/home')}
            >
              <HomeIcon className="h-5 w-5 shrink-0 text-primary" />
              Fil
            </button>
            <button
              type="button"
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg p-2 text-[11px] text-gray-700 dark:text-dark-text"
              onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
            >
              <UserRound className="h-5 w-5 shrink-0 text-primary" />
              Profil
            </button>
            <button
              type="button"
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg p-2 text-[11px] text-gray-700 dark:text-dark-text"
              onClick={() => navigate('/pets')}
            >
              <PawPrint className="h-5 w-5 shrink-0 text-primary" />
              Animaux
            </button>
            <button
              type="button"
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg p-2 text-[11px] text-gray-700 dark:text-dark-text"
              onClick={() => navigate('/product')}
            >
              <ShoppingBag className="h-5 w-5 shrink-0 text-primary" />
              Boutique
            </button>
            <button
              type="button"
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg p-2 text-[11px] text-gray-700 dark:text-dark-text"
              onClick={() => navigate('/vet')}
            >
              <Stethoscope className="h-5 w-5 shrink-0 text-primary" />
              Vétos
            </button>
            <button
              type="button"
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg p-2 text-[11px] text-gray-700 dark:text-dark-text"
              onClick={() => navigate('/vet-advice')}
            >
              <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
              Conseils
            </button>
          </nav>

          {!feedLoading && !isLoggedIn && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-gray-700 dark:text-dark-text">
              <span className="font-semibold text-primary">Mode invité</span>
              {' — '}
              connectez-vous pour publier, aimer et commenter.
              <button
                type="button"
                className="ml-2 font-medium text-primary hover:underline"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </button>
            </div>
          )}

          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  navigate('/login');
                  return;
                }
                setPostError(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-white transition-colors duration-300 hover:bg-primary-dark"
            >
              <PenLine className="h-4 w-4" />
              <span className="font-medium">Nouvelle publication</span>
            </button>
          </div>
          <div className="max-w-2xl mx-auto">
            {feedLoading && <PageSpinner />}
            {feedError && !feedLoading && (
              <p className="text-center text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4 py-3 mb-4">
                {feedError}
              </p>
            )}
            {!feedLoading && filteredPosts.length === 0 && (
              <div className="text-center py-12 px-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Aucune publication à afficher.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {sidebarQuery.trim()
                    ? 'Aucun résultat pour cette recherche.'
                    : 'Publiez quelque chose ou revenez plus tard.'}
                </p>
              </div>
            )}
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenShareModal={setSharePost}
                onShowUserProfile={handleShowUserProfile}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
                onRequestComments={loadCommentsForPost}
                onSubmitComment={submitComment}
                currentUserId={me?.id ?? null}
                onEditPost={(p) => {
                  setEditError(null);
                  setEditPost(p);
                  setEditPhrase(p.phrase || '');
                }}
                onDeletePost={deletePost}
                onEditComment={editComment}
                onDeleteComment={deleteComment}
                onAuthorFollowChange={handleAuthorFollowChange}
              />
            ))}
          </div>
        </div>
        <RightSidebar
          followedOwners={followedOwners}
          followedVets={followedVets}
          followedLoading={followedLoading}
          suggestedContacts={suggestedContacts}
          onShowUserProfile={handleShowUserProfile}
          showFollowedOnly={isLoggedIn}
        />
        
        {/* Modal de nouvelle publication */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShowModal(false);
              resetNewPost();
            }}
            role="presentation"
          >
            <div
              className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetNewPost();
                }}
                className="absolute top-3 right-3 text-gray-500 dark:text-dark-text hover:text-gray-800"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-dark-text">
                Nouvelle publication
              </h2>
              <div className="mb-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-dark-gray">
                <SafeAvatar
                  src={me?.avatarUrl}
                  alt={me?.name || 'Vous'}
                  className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-600"
                />
                <div className="min-w-0 text-sm">
                  <div className="font-medium text-gray-800 dark:text-dark-text">{me?.name || 'Mon compte'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Visible sur le fil</div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  placeholder="Que voulez-vous partager ?"
                  value={newPost.phrase}
                  onChange={(e) => setNewPost({ ...newPost, phrase: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text h-20 resize-none"
                  required={newPost.type === 'text'}
                />
                
                {/* Type de contenu */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentType"
                      value="text"
                      checked={newPost.type === 'text'}
                      onChange={() =>
                        setNewPost((prev) => {
                          if (prev.petImage?.startsWith('blob:')) URL.revokeObjectURL(prev.petImage);
                          if (prev.videoUrl?.startsWith('blob:')) URL.revokeObjectURL(prev.videoUrl);
                          return {
                            ...prev,
                            type: 'text',
                            petImage: '',
                            videoUrl: '',
                            imageFile: null,
                            videoFile: null,
                          };
                        })
                      }
                    />
                    <PenLine className="w-4 h-4" />
                    Texte
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentType"
                      value="image"
                      checked={newPost.type === 'image'}
                      onChange={() =>
                        setNewPost((prev) => ({
                          ...prev,
                          type: 'image',
                          videoUrl: '',
                          videoFile: null,
                        }))
                      }
                    />
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentType"
                      value="video"
                      checked={newPost.type === 'video'}
                      onChange={() =>
                        setNewPost((prev) => ({
                          ...prev,
                          type: 'video',
                          petImage: '',
                          imageFile: null,
                        }))
                      }
                    />
                    <Video className="w-4 h-4" />
                    Vidéo
                  </label>
                </div>

                {/* Upload de fichier */}
                {newPost.type !== 'text' && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <input
                      type="file"
                      accept={newPost.type === 'video' ? 'video/*' : 'image/*'}
                      onChange={(e) => handleFileUpload(e, newPost.type)}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Cliquez pour uploader {newPost.type === 'video' ? 'une vidéo' : 'une image'}
                      </span>
                    </label>
                    
                    {newPost.type === 'image' && newPost.petImage && (
                      <img src={newPost.petImage} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
                    )}
                    {newPost.type === 'video' && newPost.videoUrl && (
                      <video src={newPost.videoUrl} className="mt-2 w-full h-32 object-cover rounded" controls />
                    )}
                  </div>
                )}

                {postError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{postError}</p>
                )}

                <button
                  type="submit"
                  disabled={postSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition-colors duration-300 disabled:opacity-60"
                >
                  {postSubmitting ? 'Publication…' : 'Publier'}
                </button>
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

        {editPost && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onClick={() => {
              setEditPost(null);
              setEditPhrase('');
              setEditError(null);
            }}
            role="presentation"
          >
            <div
              className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-600 dark:bg-dark-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setEditPost(null);
                  setEditPhrase('');
                  setEditError(null);
                }}
                className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="pr-8 text-lg font-semibold text-gray-900 dark:text-dark-text">Modifier la publication</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Seul le texte est modifiable (l’image ou la vidéo d’origine est conservée).
              </p>
              <form onSubmit={submitEditPost} className="mt-4 space-y-3">
                <textarea
                  value={editPhrase}
                  onChange={(e) => {
                    setEditPhrase(e.target.value);
                    setEditError(null);
                  }}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text"
                  placeholder="Texte de la publication…"
                />
                {editError && <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={editBusy}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
                  >
                    {editBusy ? <PageSpinner compact size="xs" borderTone="onDark" /> : null}
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
         )}
       </div>
     </Layout>
   );
 };

export default Home;