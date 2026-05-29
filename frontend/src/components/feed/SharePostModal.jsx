import React, { useState, useEffect } from 'react';
import { X, Bookmark, MessageSquare, Share2 } from 'lucide-react';
import PageSpinner from '../PageSpinner';
import { CHEEBO_CHAT_SHARE_POST_EVENT, CHEEBO_POST_SHARE_PREFIX } from '../Chat/PrivateChat';
import api from '../../services/api';
import { SafeAvatar } from './FeedPostCard';

export function buildPostShareChatBody(postId, authorName, phrase) {
  const snippet = (phrase || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const more = snippet.length >= 160 ? '…' : '';
  const excerpt =
    snippet.length > 0
      ? `\n📎 « ${snippet.slice(0, 160)}${more} » — ${(authorName || 'Auteur').trim()}`
      : '\n📎 Publication du fil d’actualité';
  return `${CHEEBO_POST_SHARE_PREFIX}${postId}${excerpt}`;
}

export default function SharePostModal({
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
