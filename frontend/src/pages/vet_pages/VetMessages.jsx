import React, { useState, useEffect, useCallback } from "react";
import VetLayout from './VetLayout';
import PageSpinner from '../../components/PageSpinner';
import api, { mediaUrl } from '../../services/api';
import { Send, Search, User, Pencil, Trash2, Check } from "lucide-react";

const VetMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [myUserId, setMyUserId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [chatActionError, setChatActionError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/user/profile/');
        if (!cancelled) setMyUserId(data?.id ?? null);
      } catch {
        if (!cancelled) setMyUserId(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const mapThreadRows = useCallback((rows) => {
    const list = Array.isArray(rows) ? rows : [];
    return list.map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      sender: myUserId != null && m.sender_id === myUserId ? "vet" : "user",
      text: m.text,
      body: m.text,
      time: m.created_at
        ? new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "",
    }));
  }, [myUserId]);

  const fetchThread = useCallback(async (peerUserId) => {
    if (peerUserId == null) return [];
    try {
      const { data } = await api.get(`/user/chat/${peerUserId}/`);
      return mapThreadRows(data);
    } catch {
      return [];
    }
  }, [mapThreadRows]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/user/chat/partners/');
      const rows = Array.isArray(data) ? data : [];
      const convs = rows.map((conv) => ({
        id: Number(conv.user_id),
        owner: conv.name || "",
        ownerId: Number(conv.user_id),
        pet: "",
        avatarUrl: conv.avatar || "",
        avatar: conv.name ? conv.name.split(" ").map((n) => n[0]).join("").substring(0, 2) : "?",
        unread: conv.unread || 0,
        lastMessage: conv.last_message || "",
        messages: [],
      }));
      setConversations(convs);
      setActiveConv((prev) => {
        if (prev && convs.some((c) => c.id === prev.id)) {
          return { ...convs.find((c) => c.id === prev.id), messages: prev.messages };
        }
        return convs.length > 0 ? convs[0] : null;
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const oid = activeConv?.ownerId;
    if (myUserId == null || oid == null) return undefined;
    let cancelled = false;
    (async () => {
      const msgs = await fetchThread(oid);
      if (cancelled) return;
      setActiveConv((prev) => (prev && prev.ownerId === oid ? { ...prev, messages: msgs } : prev));
      setConversations((prev) =>
        prev.map((c) => (c.ownerId === oid ? { ...c, messages: msgs } : c))
      );
    })();
    return () => { cancelled = true; };
  }, [myUserId, activeConv?.ownerId, fetchThread]);

  const filteredConvs = conversations.filter((c) =>
    c.owner.toLowerCase().includes(search.toLowerCase()) ||
    (c.pet || "").toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !activeConv || sending) return;
    const peerId = activeConv.ownerId;
    const convId = activeConv.id;
    setChatActionError("");
    setSending(true);
    try {
      await api.post(`/user/chat/${peerId}/`, { text });
      const msgs = await fetchThread(peerId);
      setNewMessage("");
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: msgs, lastMessage: text, unread: 0 } : c
        )
      );
      setActiveConv((prev) => (prev && prev.id === convId ? { ...prev, messages: msgs, lastMessage: text, unread: 0 } : prev));
    } catch (error) {
      console.error("Error sending message:", error);
      setChatActionError(
        error?.response?.data?.detail || "Impossible d'envoyer le message. Vérifiez la connexion et réessayez."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingMessageText("");
  };

  const saveEditedMessage = async () => {
    if (!editingMessageId || !activeConv) return;
    const text = (editingMessageText || "").trim();
    if (!text) return;
    const peerId = activeConv.ownerId;
    const convId = activeConv.id;
    setChatActionError("");
    try {
      await api.patch(`/user/chat/message/${editingMessageId}/`, { text });
      const msgs = await fetchThread(peerId);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: msgs } : c))
      );
      setActiveConv((prev) => (prev && prev.id === convId ? { ...prev, messages: msgs } : prev));
      cancelEditMessage();
    } catch (err) {
      setChatActionError(err?.response?.data?.detail || "Impossible de modifier le message.");
    }
  };

  const deleteMessage = async (msg) => {
    if (!msg?.id || !activeConv) return;
    if (!window.confirm("Supprimer ce message ?")) return;
    const peerId = activeConv.ownerId;
    const convId = activeConv.id;
    setChatActionError("");
    try {
      await api.delete(`/user/chat/message/${msg.id}/`);
      const msgs = await fetchThread(peerId);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: msgs } : c))
      );
      setActiveConv((prev) => (prev && prev.id === convId ? { ...prev, messages: msgs } : prev));
      if (editingMessageId === msg.id) cancelEditMessage();
    } catch (err) {
      setChatActionError(err?.response?.data?.detail || "Impossible de supprimer le message.");
    }
  };

  const selectConv = async (conv) => {
    const msgs = await fetchThread(conv.ownerId);
    const updatedConv = { ...conv, messages: msgs, unread: 0 };
    setActiveConv(updatedConv);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, messages: msgs, unread: 0 } : c))
    );
  };

  useEffect(() => {
    if (!activeConv?.ownerId || myUserId == null) return undefined;
    const uid = activeConv.ownerId;
    let cancelled = false;
    const tick = async () => {
      const msgs = await fetchThread(uid);
      if (cancelled) return;
      setActiveConv((prev) => (prev && prev.ownerId === uid ? { ...prev, messages: msgs } : prev));
      setConversations((prev) =>
        prev.map((c) => (c.id === uid ? { ...c, messages: msgs } : c))
      );
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [activeConv?.ownerId, myUserId, fetchThread]);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  return (
    <VetLayout>
      <div className="p-6 h-screen flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-[#8657ff]">Messages</h1>
          <p className="text-gray-600">{totalUnread > 0 ? `${totalUnread} message(s) non lu(s)` : "Tous les messages sont lus"}</p>
        </div>

        <div className="flex flex-1 gap-0 bg-white rounded-xl shadow-md overflow-hidden" style={{ minHeight: 0 }}>
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff] text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <PageSpinner compact size="md" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">Aucune conversation</div>
              ) : (
                filteredConvs.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectConv(conv)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${activeConv && activeConv.id === conv.id ? "bg-green-50 border-l-4 border-l-[#8657ff]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                        {conv.avatarUrl ? (
                          <img src={mediaUrl(conv.avatarUrl)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{conv.owner}</p>
                          {(conv.unread || 0) > 0 && (
                            <span className="bg-[#8657ff] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{conv.unread}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{conv.pet}</p>
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'Commencez une conversation'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              {activeConv ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                      {activeConv.avatarUrl ? (
                        <img src={mediaUrl(activeConv.avatarUrl)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{activeConv.owner}</p>
                      <p className="text-sm text-gray-500">{activeConv.pet}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Sélectionnez une conversation</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {chatActionError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{chatActionError}</div>
              ) : null}
              {activeConv && activeConv.messages && activeConv.messages.length > 0 ? (
                activeConv.messages.map((msg) => {
                  const isMine = msg.sender === "vet";
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[65%] px-4 py-3 rounded-2xl ${
                          isMine ? "bg-[#8657ff] text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                        }`}
                      >
                        {isMine && editingMessageId === msg.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingMessageText}
                              onChange={(e) => setEditingMessageText(e.target.value)}
                              rows={2}
                              className="w-full resize-none rounded-lg border border-white/40 bg-white/15 px-2 py-1 text-sm text-white placeholder:text-purple-100"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditMessage}
                                className="rounded px-2 py-1 text-xs hover:bg-white/20"
                              >
                                Annuler
                              </button>
                              <button
                                type="button"
                                onClick={() => void saveEditedMessage()}
                                disabled={!editingMessageText.trim()}
                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-white/20 disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Enregistrer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.body || msg.text}</p>
                        )}
                        <p className={`text-xs mt-1 ${isMine ? "text-green-100" : "text-gray-400"} text-right`}>
                          {msg.time || msg.created_at}
                        </p>
                        {isMine && editingMessageId !== msg.id ? (
                          <div className="mt-1 flex justify-end gap-1 border-t border-white/20 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setChatActionError("");
                                setEditingMessageId(msg.id);
                                setEditingMessageText(msg.text || msg.body || "");
                              }}
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
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {activeConv ? "Aucun message. Commencez la conversation !" : "Sélectionnez une conversation pour commencer"}
                </div>
              )}
            </div>

            {activeConv && (
              <div className="p-4 bg-white border-t border-gray-200">
                <form
                  className="flex gap-3 items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendMessage();
                  }}
                >
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    rows={1}
                    className="flex-1 min-h-[44px] max-h-32 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8657ff] resize-y text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    aria-label="Envoyer le message"
                    className="flex-shrink-0 inline-flex h-11 w-11 items-center justify-center bg-[#8657ff] hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl transition-colors"
                  >
                    {sending ? <PageSpinner compact size="sm" borderTone="onDark" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </VetLayout>
  );
};

export default VetMessages;
