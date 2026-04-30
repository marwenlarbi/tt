import React, { useCallback, useEffect, useState } from 'react';
import { Heart, Pencil, Send, ThumbsUp, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { normalizeCommentTree, updateCommentInTree } from './commentUtils';

function SafeAvatar({ src, alt, className, onClick }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'U')}&background=8657ff&color=fff&size=128`;
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

function CommentNode({
  node,
  depth,
  postId,
  fromApi,
  currentUserId,
  onShowUserProfile,
  onEdit,
  onDelete,
  onReplyPosted,
  onReplyError,
  onReactionToggled,
  activeReplyParentId,
  setActiveReplyParentId,
  replyDraft,
  setReplyDraft,
  reactionBusyId,
  setReactionBusyId,
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.text || '');
  const [busy, setBusy] = useState(false);
  const isMine = currentUserId != null && node.userId === currentUserId;
  const isReplying = activeReplyParentId === node.id;
  const maxDepth = 1;
  const canReply = depth < maxDepth && fromApi;

  useEffect(() => {
    setEditText(node.text || '');
  }, [node.text]);

  const handleSaveEdit = async () => {
    const t = (editText || '').trim();
    if (!t || !onEdit) return;
    setBusy(true);
    try {
      await onEdit(postId, node.id, t);
      setEditing(false);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const submitInlineReply = async (e) => {
    e.preventDefault();
    const text = (replyDraft || '').trim();
    if (!text || !onReplyPosted) return;
    setBusy(true);
    try {
      await onReplyPosted(node.id, text);
      setReplyDraft('');
      setActiveReplyParentId(null);
    } catch {
      onReplyError?.();
    } finally {
      setBusy(false);
    }
  };

  const toggleReaction = async (type) => {
    if (!fromApi || !onReactionToggled) return;
    setReactionBusyId(node.id);
    try {
      const { data } = await api.post(`/posts/${postId}/comments/${node.id}/reaction/`, { type });
      onReactionToggled(node.id, {
        likeCount: data.like_count ?? 0,
        loveCount: data.love_count ?? 0,
        myReaction: data.my_reaction ?? null,
      });
    } catch {
      /* ignore */
    } finally {
      setReactionBusyId(null);
    }
  };

  const indentClass = depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-3 dark:border-gray-600' : '';

  return (
    <div id={node.id != null ? `feed-comment-${node.id}` : undefined} className={`${indentClass} py-2`}>
      <div className="flex items-start gap-3">
        <SafeAvatar
          src={node.userImage}
          alt={node.user}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-full object-cover hover:ring-2 hover:ring-primary"
          onClick={() => node.userId && onShowUserProfile(node.userId)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button
                type="button"
                className="text-left text-sm font-semibold text-gray-800 hover:text-primary dark:text-dark-text"
                onClick={() => node.userId && onShowUserProfile(node.userId)}
              >
                {node.user}
              </button>
              {!editing ? (
                <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-dark-text">{node.text}</p>
              ) : (
                <div className="mt-1">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white p-1 text-sm text-gray-800 dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text"
                  />
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleSaveEdit}
                      className="rounded bg-primary px-2 py-1 text-xs text-white"
                    >
                      {busy ? '…' : 'Enregistrer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setEditText(node.text || '');
                      }}
                      className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700 dark:text-dark-text"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
            {isMine && !editing && (
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(postId, node.id)}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {canReply && (
              <button
                type="button"
                onClick={() => {
                  setActiveReplyParentId(isReplying ? null : node.id);
                  if (!isReplying) setReplyDraft('');
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Répondre
              </button>
            )}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3 dark:border-gray-600">
              <button
                type="button"
                disabled={reactionBusyId != null || !fromApi}
                onClick={() => void toggleReaction('like')}
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition disabled:opacity-50 ${
                  node.myReaction === 'like'
                    ? 'bg-primary/15 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="J'aime"
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${node.myReaction === 'like' ? 'fill-primary text-primary' : ''}`} />
                <span>{node.likeCount}</span>
              </button>
              <button
                type="button"
                disabled={reactionBusyId != null || !fromApi}
                onClick={() => void toggleReaction('love')}
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition disabled:opacity-50 ${
                  node.myReaction === 'love'
                    ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="J'adore"
              >
                <Heart className={`h-3.5 w-3.5 ${node.myReaction === 'love' ? 'fill-pink-500 text-pink-500' : ''}`} />
                <span>{node.loveCount}</span>
              </button>
            </div>
          </div>

          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{node.time}</p>

          {isReplying && (
            <form onSubmit={submitInlineReply} className="mt-2 flex gap-2">
              <input
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder={`Réponse à ${node.user}…`}
                className="flex-1 rounded border border-gray-300 bg-white p-2 text-sm dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-primary p-2 text-white hover:bg-primary-dark disabled:opacity-50"
                aria-label="Envoyer la réponse"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {node.replies?.length > 0 && (
        <div className="mt-1">
          {node.replies.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              depth={depth + 1}
              postId={postId}
              fromApi={fromApi}
              currentUserId={currentUserId}
              onShowUserProfile={onShowUserProfile}
              onEdit={onEdit}
              onDelete={onDelete}
              onReplyPosted={onReplyPosted}
              onReplyError={onReplyError}
              onReactionToggled={onReactionToggled}
              activeReplyParentId={activeReplyParentId}
              setActiveReplyParentId={setActiveReplyParentId}
              replyDraft={replyDraft}
              setReplyDraft={setReplyDraft}
              reactionBusyId={reactionBusyId}
              setReactionBusyId={setReactionBusyId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Fil de commentaires imbriqués (style Facebook) + réactions persistées (API).
 */
export default function FeedCommentThread({
  postId,
  comments,
  fromApi,
  commentsLoaded,
  onRequestComments,
  currentUserId,
  onShowUserProfile,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
  commentError,
  onCommentErrorClear,
}) {
  const [tree, setTree] = useState(() => normalizeCommentTree(comments));
  const [rootText, setRootText] = useState('');
  const [rootBusy, setRootBusy] = useState(false);
  const [activeReplyParentId, setActiveReplyParentId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [reactionBusyId, setReactionBusyId] = useState(null);
  const [threadError, setThreadError] = useState(null);

  useEffect(() => {
    setTree(normalizeCommentTree(comments));
  }, [comments]);

  useEffect(() => {
    if (fromApi && !commentsLoaded && typeof onRequestComments === 'function') {
      onRequestComments(postId);
    }
  }, [fromApi, commentsLoaded, onRequestComments, postId]);

  const handleReactionToggled = useCallback((commentId, patch) => {
    setTree((prev) => updateCommentInTree(prev, commentId, patch));
  }, []);

  const handleReplyPosted = useCallback(
    async (parentId, text) => {
      await onSubmitComment(postId, text, fromApi, parentId);
    },
    [postId, fromApi, onSubmitComment]
  );

  const submitRoot = async (e) => {
    e.preventDefault();
    const text = rootText.trim();
    if (!text) return;
    setRootBusy(true);
    setThreadError(null);
    try {
      await onSubmitComment(postId, text, fromApi, null);
      setRootText('');
    } catch {
      setThreadError(
        fromApi ? 'Impossible d’envoyer le commentaire. Êtes-vous connecté ?' : 'Envoi impossible.'
      );
    } finally {
      setRootBusy(false);
    }
  };

  const displayError = threadError || commentError;

  const reportReplyError = useCallback(() => {
    setThreadError(fromApi ? 'Impossible d’envoyer la réponse. Êtes-vous connecté ?' : 'Envoi impossible.');
  }, [fromApi]);

  return (
    <div className="border-t border-gray-200 p-0 dark:border-gray-600">
      {displayError && (
        <p className="mb-2 px-4 pt-4 text-sm text-red-600 dark:text-red-400">{displayError}</p>
      )}
      <form onSubmit={submitRoot} className="mb-4 flex items-center gap-2 px-4">
        <input
          type="text"
          placeholder="Écrire un commentaire…"
          value={rootText}
          onChange={(e) => {
            setRootText(e.target.value);
            setThreadError(null);
            onCommentErrorClear?.();
          }}
          className="flex-1 rounded border border-gray-300 bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text"
        />
        <button
          type="submit"
          disabled={rootBusy}
          className="rounded-full bg-primary p-2 text-white hover:bg-primary-dark disabled:opacity-50"
          aria-label="Envoyer le commentaire"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      <div className="px-4 pb-4">
      {tree.map((node) => (
        <CommentNode
          key={node.id}
          node={node}
          depth={0}
          postId={postId}
          fromApi={fromApi}
          currentUserId={currentUserId}
          onShowUserProfile={onShowUserProfile}
          onEdit={onEditComment}
          onDelete={onDeleteComment}
          onReplyPosted={handleReplyPosted}
          onReplyError={reportReplyError}
          onReactionToggled={handleReactionToggled}
          activeReplyParentId={activeReplyParentId}
          setActiveReplyParentId={setActiveReplyParentId}
          replyDraft={replyDraft}
          setReplyDraft={setReplyDraft}
          reactionBusyId={reactionBusyId}
          setReactionBusyId={setReactionBusyId}
        />
      ))}
      </div>
    </div>
  );
}
