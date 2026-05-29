import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, X, Plus, User, Search, Pencil, Trash2, Check, MoreVertical, Ban } from 'lucide-react';
import api, { mediaUrl } from '../../services/api';
import PageSpinner from '../PageSpinner';

/** Première ligne d’un message = partage de publication (fil d’actualité). */
export const CHEEBO_POST_SHARE_PREFIX = '__CHEEBO_POST__:';

function parseSharedPostId(text) {
  if (!text || typeof text !== 'string') return null;
  const first = text.split('\n')[0]?.trim() ?? '';
  if (!first.startsWith(CHEEBO_POST_SHARE_PREFIX)) return null;
  const id = Number(first.slice(CHEEBO_POST_SHARE_PREFIX.length));
  return Number.isFinite(id) && id > 0 ? id : null;
}

function previewChatLastMessage(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const line = raw.split('\n')[0]?.trim() ?? '';
  if (line.startsWith(CHEEBO_POST_SHARE_PREFIX)) return 'Publication partagée';
  return raw.length > 120 ? `${raw.slice(0, 120)}…` : raw;
}

function sharedPostAuthorLabel(author) {
  if (!author) return '';
  const n = `${author.first_name || ''} ${author.last_name || ''}`.trim();
  return n || author.email || 'Utilisateur';
}

function SharedPostCard({ postId, isCurrentUser, navigate }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    (async () => {
      try {
        const { data } = await api.get(`/posts/${postId}/`);
        if (!cancelled) setPost(data);
      } catch {
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const muted = isCurrentUser ? 'text-purple-100' : 'text-gray-600 dark:text-gray-300';
  const btnClass = isCurrentUser
    ? 'bg-white/20 text-white hover:bg-white/30'
    : 'bg-primary/15 text-primary hover:bg-primary/25 dark:text-primary';

  if (loading) {
    return (
      <div className={`flex justify-center py-2 ${muted}`}>
        <PageSpinner compact size="sm" />
      </div>
    );
  }

  if (missing || !post) {
    return (
      <div className="space-y-2">
        <p className={`text-xs ${muted}`}>Publication indisponible ou supprimée.</p>
        <button
          type="button"
          onClick={() => navigate(`/home#post-${postId}`)}
          className={`w-full rounded-md px-2 py-1.5 text-center text-xs font-semibold ${btnClass}`}
        >
          Ouvrir le fil
        </button>
      </div>
    );
  }

  const name = sharedPostAuthorLabel(post.author);
  const img = post.image ? mediaUrl(post.image) : '';
  const vid = post.video ? mediaUrl(post.video) : '';
  const isVideo = String(post.type || '').toLowerCase() === 'video' && !!vid;
  const content = (post.content || '').trim();

  return (
    <div className="max-w-full space-y-2 overflow-hidden">
      <p
        className={`text-[10px] font-semibold uppercase tracking-wide ${
          isCurrentUser ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        Publication partagée
      </p>
      <p
        className={`truncate text-sm font-medium ${
          isCurrentUser ? 'text-white' : 'text-gray-900 dark:text-dark-text'
        }`}
      >
        {name}
      </p>
      {content ? (
        <p className={`max-h-28 overflow-y-auto whitespace-pre-wrap text-xs leading-snug ${muted}`}>{content}</p>
      ) : null}
      {isVideo && vid ? (
        <button
          type="button"
          onClick={() => navigate(`/home#post-${postId}`)}
          className="relative block w-full overflow-hidden rounded-md bg-black/80"
        >
          {img ? <img src={img} alt="" className="aspect-video max-h-32 w-full object-cover" /> : null}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
            Lire la vidéo sur le fil
          </span>
        </button>
      ) : img ? (
        <button type="button" onClick={() => navigate(`/home#post-${postId}`)} className="block w-full overflow-hidden rounded-md">
          <img src={img} alt="" className="max-h-36 w-full object-cover" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => navigate(`/home#post-${postId}`)}
        className={`w-full rounded-md px-2 py-1.5 text-center text-xs font-semibold ${btnClass}`}
      >
        Voir sur le fil
      </button>
    </div>
  );
}

function getAccessToken() {
  const t =
    localStorage.getItem('access_token') ||
    localStorage.getItem('access') ||
    localStorage.getItem('token');
  if (!t || t === 'undefined' || t === 'null') return null;
  return t;
}

function formatLastSeenFr(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 120) return "à l'instant";
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    return m === 1 ? 'vu il y a 1 min' : `vu il y a ${m} min`;
  }
  if (sec < 86400) {
    const h = Math.floor(sec / 3600);
    return h === 1 ? 'vu il y a 1 h' : `vu il y a ${h} h`;
  }
  return 'hors ligne';
}

function ChatAvatar({ src, alt, className, iconClassName, fallbackClassName = 'bg-gray-200 text-gray-500' }) {
  const [failed, setFailed] = React.useState(false);
  if (failed || !src) {
    return (
      <div className={`${className} flex items-center justify-center ${fallbackClassName} shrink-0`}>
        <User className={iconClassName} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

function mapThreadToUiMessages(rows, myId, otherName) {
  return (rows || []).map((m) => {
    const sharedPostId = parseSharedPostId(m.text);
    return {
      id: m.id,
      senderId: m.sender_id,
      senderName: m.sender_id === myId ? 'Vous' : otherName,
      text: m.text,
      sharedPostId,
      timestamp: m.created_at,
      type: 'text',
    };
  });
}

export const CHEEBO_CHAT_SHARE_POST_EVENT = 'cheebo:chat-share-post';

/** Détail: `{ user: { id, name, avatar } }` — ouvre le widget flottant (coin bas-gauche) sur cette conversation. */
export const CHEEBO_OPEN_PRIVATE_CHAT_EVENT = 'cheebo:open-private-chat';

const PrivateChat = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [myUserId, setMyUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatSearchQuery, setNewChatSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [debouncedNewChatSearchQuery, setDebouncedNewChatSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newChatSearchResults, setNewChatSearchResults] = useState([]);
  const [presenceById, setPresenceById] = useState({});
  const [pendingOpenChatUserId, setPendingOpenChatUserId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [chatActionError, setChatActionError] = useState('');
  const [conversationMenuUserId, setConversationMenuUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const isAuthed = Boolean(getAccessToken());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  useEffect(() => {
    if (!isAuthed) {
      setMyUserId(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/user/profile/');
        if (!cancelled) setMyUserId(data.id);
      } catch {
        if (!cancelled) setMyUserId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed, isOpen]);

  const loadPresenceMap = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const { data } = await api.get('/user/presence/directory/');
      const list = Array.isArray(data) ? data : [];
      const map = {};
      list.forEach((u) => {
        map[u.id] = { is_online: u.is_online, last_seen_at: u.last_seen_at };
      });
      setPresenceById(map);
    } catch {
      setPresenceById({});
    }
  }, []);

  const loadPartners = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const { data } = await api.get('/user/chat/partners/');
      const list = Array.isArray(data) ? data : [];
      setConversations(
        list.map((p) => ({
          user_id: p.user_id,
          participantId: p.user_id,
          participantName: p.name,
          participantAvatar: p.avatar,
          lastMessage: previewChatLastMessage(p.last_message || ''),
          lastMessageTime: p.last_message_at,
          unread: p.unread || 0,
          messages: [],
        }))
      );
    } catch {
      setConversations([]);
    }
  }, []);

  const filterNonAdminUsers = useCallback(
    (users) =>
      Array.isArray(users)
        ? users.filter(
            (u) =>
              u &&
              !u.is_superuser &&
              (!u.is_staff || u.role === 'vet')
          )
        : [],
    []
  );

  const loadDirectory = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const { data } = await api.get('/user/presence/directory/');
      setDirectoryUsers(filterNonAdminUsers(data));
    } catch {
      setDirectoryUsers([]);
    }
  }, [filterNonAdminUsers]);

  const searchUsers = useCallback(
    async (query) => {
      const q = (query || '').trim();
      if (!q || !getAccessToken()) return [];
      try {
        const { data } = await api.get('/user/users/search/', { params: { q } });
        return filterNonAdminUsers(data);
      } catch {
        return [];
      }
    },
    [filterNonAdminUsers]
  );

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedNewChatSearchQuery(newChatSearchQuery.trim()), 300);
    return () => clearTimeout(id);
  }, [newChatSearchQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!debouncedSearchQuery) {
        setSearchResults([]);
        return;
      }
      const rows = await searchUsers(debouncedSearchQuery);
      if (!cancelled) setSearchResults(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearchQuery, searchUsers]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!debouncedNewChatSearchQuery) {
        setNewChatSearchResults([]);
        return;
      }
      const rows = await searchUsers(debouncedNewChatSearchQuery);
      if (!cancelled) setNewChatSearchResults(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedNewChatSearchQuery, searchUsers]);

  useEffect(() => {
    if (!isAuthed) return undefined;
    loadPartners();
    const id = setInterval(loadPartners, 12000);
    return () => clearInterval(id);
  }, [isAuthed, loadPartners]);

  useEffect(() => {
    if (!isOpen || !isAuthed) return undefined;
    loadDirectory();
    loadPresenceMap();
    const id = setInterval(loadPresenceMap, 20000);
    return () => clearInterval(id);
  }, [isOpen, isAuthed, loadDirectory, loadPresenceMap]);

  useEffect(() => {
    const handler = async (e) => {
      const { userId, text } = e.detail || {};
      if (!userId || !text || !getAccessToken()) return;
      try {
        await api.post(`/user/chat/${userId}/`, { text });
      } catch {
        return;
      }
      setIsOpen(true);
      setShowNewChatModal(false);
      setPendingOpenChatUserId(userId);
      await loadPartners();
    };
    window.addEventListener(CHEEBO_CHAT_SHARE_POST_EVENT, handler);
    return () => window.removeEventListener(CHEEBO_CHAT_SHARE_POST_EVENT, handler);
  }, [loadPartners]);

  const fetchThread = useCallback(
    async (userId, meta) => {
      if (!userId || !getAccessToken()) return [];
      try {
        const { data } = await api.get(`/user/chat/${userId}/`);
        const rows = Array.isArray(data) ? data : [];
        return mapThreadToUiMessages(rows, myUserId, meta?.participantName || 'Utilisateur');
      } catch {
        return [];
      }
    },
    [myUserId]
  );

  useEffect(() => {
    if (!activeChat?.user_id || !isAuthed || myUserId == null) return undefined;
    let cancelled = false;
    const uid = activeChat.user_id;
    const name = activeChat.participantName;

    const tick = async () => {
      const msgs = await fetchThread(uid, { participantName: name });
      if (cancelled) return;
      setActiveChat((prev) => (prev && prev.user_id === uid ? { ...prev, messages: msgs } : prev));
      setConversations((prev) =>
        prev.map((c) =>
          c.user_id === uid
            ? {
                ...c,
                messages: msgs,
                unread: 0,
                lastMessage: msgs.length
                  ? previewChatLastMessage(msgs[msgs.length - 1].text || '')
                  : c.lastMessage,
              }
            : c
        )
      );
    };

    tick();
    const id = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [activeChat?.user_id, activeChat?.participantName, isAuthed, myUserId, fetchThread]);

  const openConversation = useCallback(async (conv) => {
    const msgs = await fetchThread(conv.user_id, conv);
    const next = { ...conv, messages: msgs, unread: 0 };
    setActiveChat(next);
    setConversations((prev) => prev.map((c) => (c.user_id === conv.user_id ? { ...c, unread: 0, messages: msgs } : c)));
  }, [fetchThread]);

  useEffect(() => {
    if (pendingOpenChatUserId == null || !isOpen) return;
    const c = conversations.find((x) => x.user_id === pendingOpenChatUserId);
    if (c) {
      void openConversation(c);
      setPendingOpenChatUserId(null);
    }
  }, [conversations, pendingOpenChatUserId, isOpen, openConversation]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat?.user_id) return;
    const text = message.trim();
    setMessage('');
    try {
      await api.post(`/user/chat/${activeChat.user_id}/`, { text });
      const msgs = await fetchThread(activeChat.user_id, activeChat);
      setActiveChat((prev) => (prev ? { ...prev, messages: msgs } : prev));
      setConversations((prev) =>
        prev.map((c) =>
          c.user_id === activeChat.user_id
            ? {
                ...c,
                messages: msgs,
                lastMessage: previewChatLastMessage(text),
                lastMessageTime: new Date().toISOString(),
              }
            : c
        )
      );
    } catch {
      setMessage(text);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startEditMessage = (msg) => {
    if (!msg || !msg.id) return;
    setChatActionError('');
    setEditingMessageId(msg.id);
    setEditingMessageText(msg.text || '');
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const saveEditedMessage = async () => {
    if (!editingMessageId || !activeChat?.user_id) return;
    const text = (editingMessageText || '').trim();
    if (!text) return;
    try {
      await api.patch(`/user/chat/message/${editingMessageId}/`, { text });
      const msgs = await fetchThread(activeChat.user_id, activeChat);
      setActiveChat((prev) => (prev ? { ...prev, messages: msgs } : prev));
      setConversations((prev) =>
        prev.map((c) =>
          c.user_id === activeChat.user_id
            ? {
                ...c,
                messages: msgs,
                lastMessage: msgs.length ? previewChatLastMessage(msgs[msgs.length - 1].text || '') : '',
                lastMessageTime: msgs.length ? msgs[msgs.length - 1].timestamp : c.lastMessageTime,
              }
            : c
        )
      );
      cancelEditMessage();
      setChatActionError('');
    } catch (err) {
      setChatActionError(err?.response?.data?.detail || 'Impossible de modifier le message.');
    }
  };

  const deleteMessage = async (msg) => {
    if (!msg?.id || !activeChat?.user_id) return;
    if (!window.confirm('Supprimer ce message ?')) return;
    setChatActionError('');
    try {
      await api.delete(`/user/chat/message/${msg.id}/`);
      const msgs = await fetchThread(activeChat.user_id, activeChat);
      setActiveChat((prev) => (prev ? { ...prev, messages: msgs } : prev));
      setConversations((prev) =>
        prev.map((c) =>
          c.user_id === activeChat.user_id
            ? {
                ...c,
                messages: msgs,
                lastMessage: msgs.length ? previewChatLastMessage(msgs[msgs.length - 1].text || '') : '',
                lastMessageTime: msgs.length ? msgs[msgs.length - 1].timestamp : c.lastMessageTime,
              }
            : c
        )
      );
      if (editingMessageId === msg.id) cancelEditMessage();
      setChatActionError('');
    } catch (err) {
      setChatActionError(err?.response?.data?.detail || 'Impossible de supprimer le message.');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const openChatWithUser = useCallback(
    async (user) => {
      if (!user?.id) return;
      const existing = conversations.find((c) => c.user_id === user.id);
      if (existing) {
        await openConversation(existing);
        setShowNewChatModal(false);
        return;
      }
      const conv = {
        user_id: user.id,
        participantId: user.id,
        participantName: user.name,
        participantAvatar: user.avatar,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unread: 0,
        messages: [],
      };
      setConversations((prev) => [conv, ...prev]);
      await openConversation(conv);
      setShowNewChatModal(false);
    },
    [conversations, openConversation]
  );

  const startNewChat = openChatWithUser;

  useEffect(() => {
    const handler = (e) => {
      const user = e.detail?.user;
      if (!user?.id || !getAccessToken()) return;
      setIsOpen(true);
      void openChatWithUser(user);
    };
    window.addEventListener(CHEEBO_OPEN_PRIVATE_CHAT_EVENT, handler);
    return () => window.removeEventListener(CHEEBO_OPEN_PRIVATE_CHAT_EVENT, handler);
  }, [openChatWithUser]);

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread || 0), 0);

  const headerStatus = (userId) => {
    const p = presenceById[userId];
    if (!p) return '';
    if (p.is_online) return 'En ligne';
    return formatLastSeenFr(p.last_seen_at) || 'Hors ligne';
  };

  const openUserProfile = (userId) => {
    setConversationMenuUserId(null);
    if (!userId) return;
    navigate(`/users/${userId}`);
  };

  const deleteConversation = async (userId) => {
    setConversationMenuUserId(null);
    if (!userId) return;
    if (!window.confirm('Supprimer toute la conversation ?')) return;
    try {
      await api.delete(`/user/chat/${userId}/`);
      setConversations((prev) => prev.filter((c) => c.user_id !== userId));
      if (activeChat?.user_id === userId) setActiveChat(null);
      setChatActionError('');
    } catch (err) {
      setChatActionError(err?.response?.data?.detail || 'Impossible de supprimer la conversation.');
    }
  };

  const blockConversationUser = async (userId) => {
    setConversationMenuUserId(null);
    if (!userId) return;
    if (!window.confirm('Bloquer cet utilisateur ?')) return;
    try {
      await api.post('/user/block/', { user_id: Number(userId) });
      setConversations((prev) => prev.filter((c) => c.user_id !== userId));
      if (activeChat?.user_id === userId) setActiveChat(null);
      setChatActionError('');
    } catch (err) {
      setChatActionError(err?.response?.data?.detail || 'Impossible de bloquer cet utilisateur.');
    }
  };

  if (!isAuthed) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[100] rounded-full bg-primary p-4 text-white shadow-lg transition hover:bg-primary-dark"
        title="Messages privés"
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 px-0.5 items-center justify-center rounded-full bg-red-600 text-[11px] font-semibold leading-none text-white shadow-sm">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 z-[100] flex h-[500px] w-96 max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-dark-card">
        <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-primary p-4 text-white dark:border-gray-600">
          <h3 className="font-semibold">
            {activeChat ? (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveChat(null)}
                  className="mr-2 rounded p-1 text-lg hover:bg-white/20"
                >
                  ←
                </button>
                <ChatAvatar
                  src={activeChat.participantAvatar}
                  alt={activeChat.participantName}
                  className="mr-2 h-8 w-8 rounded-full"
                  iconClassName="h-4 w-4"
                  fallbackClassName="bg-white/20 text-white"
                />
                <div>
                  <div className="font-medium">{activeChat.participantName}</div>
                  <div className="text-xs opacity-90">{headerStatus(activeChat.user_id)}</div>
                </div>
              </div>
            ) : (
              'Messages'
            )}
          </h3>

          <div className="flex items-center space-x-2">
            {!activeChat && (
              <button
                type="button"
                onClick={() => {
                  setShowNewChatModal(true);
                  setNewChatSearchQuery('');
                  setNewChatSearchResults([]);
                  loadDirectory();
                }}
                className="rounded p-1 hover:bg-white/20"
                title="Nouveau message"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setActiveChat(null);
              }}
              className="rounded p-1 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!activeChat ? (
          <div className="flex-1 overflow-y-auto">
            <div className="border-b border-gray-100 p-3 dark:border-gray-600">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un utilisateur…"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text"
                />
              </div>
            </div>
            {debouncedSearchQuery ? (
              <div className="border-b border-gray-100 dark:border-gray-600">
                <div className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Résultats utilisateurs
                </div>
                {searchResults.length === 0 ? (
                  <div className="px-3 pb-3 text-sm text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé.</div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={`search-${user.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => startNewChat(user)}
                      onKeyDown={(e) => e.key === 'Enter' && startNewChat(user)}
                      className="flex cursor-pointer items-center px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="relative">
                        <ChatAvatar
                          src={user.avatar}
                          alt={user.name}
                          className="mr-3 h-10 w-10 rounded-full"
                          iconClassName="h-5 w-5"
                        />
                        {user.is_online && (
                          <div className="absolute bottom-0 right-3 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark-card" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium text-gray-800 dark:text-dark-text">{user.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.is_online ? 'En ligne' : formatLastSeenFr(user.last_seen_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div className="mx-3 mb-2 border-t border-gray-100 dark:border-gray-600" />
              </div>
            ) : null}
            {conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">Aucune conversation</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatModal(true);
                    loadDirectory();
                  }}
                  className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Écrire à un membre
                </button>
              </div>
            ) : (
              conversations
                .filter((conv) => {
                  const q = debouncedSearchQuery.toLowerCase();
                  if (!q) return true;
                  return (conv.participantName || '').toLowerCase().includes(q);
                })
                .map((conv) => (
                <div
                  key={conv.user_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openConversation(conv)}
                  onKeyDown={(e) => e.key === 'Enter' && openConversation(conv)}
                  className="flex cursor-pointer items-center border-b border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <div className="relative">
                    <ChatAvatar
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="mr-3 h-12 w-12 rounded-full"
                      iconClassName="h-6 w-6"
                    />
                    {presenceById[conv.user_id]?.is_online && (
                      <div className="absolute bottom-0 right-3 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark-card" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="truncate text-sm font-medium text-gray-800 dark:text-dark-text">{conv.participantName}</h4>
                      <span className="ml-2 flex-shrink-0 text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">{conv.lastMessage || '…'}</p>
                  </div>

                  <div className="relative ml-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversationMenuUserId((prev) => (prev === conv.user_id ? null : conv.user_id));
                      }}
                      className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      title="Options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {conversationMenuUserId === conv.user_id && (
                      <div
                        className="absolute right-0 top-8 z-30 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-dark-card"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openUserProfile(conv.user_id)}
                          className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-gray-700"
                        >
                          Voir le profil
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteConversation(conv.user_id)}
                          className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-gray-700"
                        >
                          Supprimer la conversation
                        </button>
                        <button
                          type="button"
                          onClick={() => blockConversationUser(conv.user_id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Ban className="h-4 w-4" />
                          Bloquer
                        </button>
                      </div>
                    )}
                  </div>

                  {conv.unread > 0 && (
                    <span className="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                      {conv.unread > 99 ? '99+' : conv.unread}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {chatActionError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {chatActionError}
                </div>
              ) : null}
              {activeChat.messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">Envoyez un premier message</p>
                </div>
              ) : (
                activeChat.messages.map((msg, index) => {
                  const isCurrentUser = myUserId != null && msg.senderId === myUserId;
                  const showAvatar =
                    !isCurrentUser && (index === 0 || activeChat.messages[index - 1].senderId !== msg.senderId);

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
                    >
                      {!isCurrentUser && showAvatar && (
                        <ChatAvatar
                          src={activeChat.participantAvatar}
                          alt={activeChat.participantName}
                          className="mr-2 mt-1 h-6 w-6 rounded-full"
                          iconClassName="h-4 w-4"
                        />
                      )}

                      {!isCurrentUser && !showAvatar && <div className="mr-2 w-6" />}

                      <div
                        className={`${
                          msg.sharedPostId ? 'max-w-[min(92vw,20rem)]' : 'max-w-xs'
                        } rounded-lg px-3 py-2 ${
                          isCurrentUser
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-dark-text'
                        }`}
                      >
                        {msg.sharedPostId ? (
                          <SharedPostCard postId={msg.sharedPostId} isCurrentUser={isCurrentUser} navigate={navigate} />
                        ) : editingMessageId === msg.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingMessageText}
                              onChange={(e) => setEditingMessageText(e.target.value)}
                              rows={2}
                              className={`w-full resize-none rounded-md border px-2 py-1 text-sm ${
                                isCurrentUser
                                  ? 'border-white/40 bg-white/20 text-white placeholder:text-purple-100'
                                  : 'border-gray-300 bg-white text-gray-800'
                              }`}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditMessage}
                                className={`rounded px-2 py-1 text-xs ${
                                  isCurrentUser ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                              >
                                Annuler
                              </button>
                              <button
                                type="button"
                                onClick={saveEditedMessage}
                                disabled={!editingMessageText.trim()}
                                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs disabled:opacity-60 ${
                                  isCurrentUser ? 'bg-white/20 hover:bg-white/30' : 'bg-primary text-white hover:bg-primary-dark'
                                }`}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Enregistrer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                        )}
                        <p className={`mt-1 text-xs ${isCurrentUser ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                        {isCurrentUser && !msg.sharedPostId && (
                          <div className="mt-1 flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => startEditMessage(msg)}
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-white/20"
                            >
                              <Pencil className="h-3 w-3" />
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteMessage(msg)}
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-white/20"
                            >
                              <Trash2 className="h-3 w-3" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-3 dark:border-gray-600">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Votre message…"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="rounded-lg bg-primary p-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showNewChatModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowNewChatModal(false)}
          role="presentation"
        >
          <div
            className="max-h-96 w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-dark-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-dark-text">Nouveau message</h3>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <div className="p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={newChatSearchQuery}
                    onChange={(e) => setNewChatSearchQuery(e.target.value)}
                    placeholder="Rechercher un utilisateur…"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text"
                  />
                </div>
              </div>
              {(debouncedNewChatSearchQuery ? newChatSearchResults : directoryUsers).map((user) => (
                <div
                  key={user.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => startNewChat(user)}
                  onKeyDown={(e) => e.key === 'Enter' && startNewChat(user)}
                  className="flex cursor-pointer items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="relative">
                    <ChatAvatar
                      src={user.avatar}
                      alt={user.name}
                      className="mr-3 h-10 w-10 rounded-full"
                      iconClassName="h-6 w-6"
                    />
                    {user.is_online && (
                      <div className="absolute bottom-0 right-3 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark-card" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-dark-text">{user.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.is_online ? 'En ligne' : formatLastSeenFr(user.last_seen_at)}
                    </p>
                  </div>
                </div>
              ))}

              {(debouncedNewChatSearchQuery ? newChatSearchResults.length === 0 : directoryUsers.length === 0) && (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Aucun autre membre pour le moment.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default PrivateChat;
