import { mediaUrl } from '../../services/api';

export function authorDisplayName(author) {
  if (!author) return 'Utilisateur';
  const full = `${author.first_name || ''} ${author.last_name || ''}`.trim();
  return full || author.email || 'Utilisateur';
}

export function authorAvatarUrl(author) {
  if (!author) return null;
  const raw = author.avatar;
  if (typeof raw === 'string' && raw.length) return mediaUrl(raw);
  return null;
}

function initialsAvatarUrl(displayName) {
  const n = (displayName || 'U').trim() || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=8657ff&color=fff&size=128`;
}

export function formatFeedTime(iso) {
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

/** Normalise un nœud API (arbre) pour l’UI. */
export function normalizeCommentNode(apiNode) {
  if (!apiNode) return null;
  const author = apiNode.author || {};
  const fullName = authorDisplayName(author);
  const avatar = authorAvatarUrl(author) || initialsAvatarUrl(fullName);
  return {
    id: apiNode.id,
    text: apiNode.text || '',
    parentId: apiNode.parent_id ?? null,
    userId: author.id ?? null,
    user: fullName,
    userImage: avatar,
    time: formatFeedTime(apiNode.created_at),
    likeCount: typeof apiNode.like_count === 'number' ? apiNode.like_count : 0,
    loveCount: typeof apiNode.love_count === 'number' ? apiNode.love_count : 0,
    myReaction: apiNode.my_reaction || null,
    replies: Array.isArray(apiNode.replies) ? apiNode.replies.map(normalizeCommentNode) : [],
  };
}

export function normalizeCommentTree(apiList) {
  if (!Array.isArray(apiList)) return [];
  return apiList.map(normalizeCommentNode);
}

export function countCommentsInTree(nodes) {
  let n = 0;
  const walk = (arr) => {
    for (const c of arr || []) {
      n += 1;
      if (c.replies?.length) walk(c.replies);
    }
  };
  walk(nodes);
  return n;
}

export function updateCommentInTree(nodes, commentId, patch) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => {
    if (node.id === commentId) {
      return { ...node, ...patch };
    }
    if (node.replies?.length) {
      return { ...node, replies: updateCommentInTree(node.replies, commentId, patch) };
    }
    return node;
  });
}

/** Insère une réponse sous le parent (arbre API : id, replies, …). */
export function addReplyToTree(roots, parentId, newNode) {
  if (parentId == null) {
    return [...(roots || []), newNode];
  }
  const walk = (arr) =>
    (arr || []).map((r) => {
      if (r.id === parentId) {
        return { ...r, replies: [...(r.replies || []), newNode] };
      }
      if (r.replies?.length) {
        return { ...r, replies: walk(r.replies) };
      }
      return r;
    });
  return walk(roots || []);
}
