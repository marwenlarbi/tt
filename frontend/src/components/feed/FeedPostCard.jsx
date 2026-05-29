import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FollowButton from '../FollowButton';
import FeedCommentThread from './FeedCommentThread';
import { countCommentsInTree } from './commentUtils';
import api from '../../services/api';
import { mediaUrl } from '../../services/api';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Play,
  Pause,
} from 'lucide-react';

export function initialsAvatarUrl(displayName) {
  const n = (displayName || 'U').trim() || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=8657ff&color=fff&size=128`;
}

export function authorDisplayName(author) {
  if (!author) return 'Utilisateur';
  const full = `${author.first_name || ''} ${author.last_name || ''}`.trim();
  return full || author.email || 'Utilisateur';
}

export function authorAvatarUrl(author) {
  if (!author) return null;
  const raw = author.avatar;
  if (typeof raw === 'string' && raw.length) {
    return mediaUrl(raw);
  }
  return null;
}

export function SafeAvatar({ src, alt, className, onClick }) {
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
        type="button"
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
            type="button"
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
                  disabled={blocked}
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
                alt={
                  post.phrase?.trim()
                    ? `Illustration : ${post.phrase.trim().slice(0, 80)}`
                    : `Publication de ${post.user}`
                }
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

export function mapApiPostToFeed(p) {
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
    createdAt: p.created_at,
  };
}

export default PostCard;
