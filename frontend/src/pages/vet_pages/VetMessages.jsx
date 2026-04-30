import React, { useState, useEffect } from "react";
import VetLayout from './VetLayout';
import api from '../../services/api';
import { Send, Search, Phone, Mail, User } from "lucide-react";

const VetMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/messages/conversations/');
      const convs = response.data.map(conv => ({
        id: conv.id,
        owner: conv.owner_name || '',
        ownerId: conv.owner_id,
        pet: conv.pet_name || '',
        avatar: conv.owner_name ? conv.owner_name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?',
        unread: conv.unread || 0,
        lastMessage: conv.last_message || '',
        messages: conv.messages || [],
      }));
      setConversations(convs);
      if (convs.length > 0 && !activeConv) {
        setActiveConv(convs[0]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.owner.toLowerCase().includes(search.toLowerCase()) ||
    c.pet.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    try {
      const response = await api.post('/user/messages/send/', {
        recipient: activeConv.ownerId,
        body: newMessage,
      });
      const msg = {
        id: Date.now(),
        sender: "vet",
        text: newMessage,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
      const updated = conversations.map((c) =>
        c.id === activeConv.id ? { ...c, messages: [...c.messages, msg], lastMessage: newMessage } : c
      );
      setConversations(updated);
      setActiveConv({ ...activeConv, messages: [...activeConv.messages, msg], lastMessage: newMessage });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const selectConv = (conv) => {
    setActiveConv(conv);
    const updated = conversations.map((c) => c.id === conv.id ? { ...c, unread: 0 } : c);
    setConversations(updated);
  };

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
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8657ff]"></div>
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
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        <User className="w-5 h-5" />
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
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{activeConv.owner}</p>
                      <p className="text-sm text-gray-500">{activeConv.pet}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Sélectionnez une conversation</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {activeConv && activeConv.messages && activeConv.messages.length > 0 ? (
                activeConv.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "vet" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[65%] px-4 py-3 rounded-2xl ${msg.sender === "vet" ? "bg-[#8657ff] text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm"}`}>
                      <p className="text-sm">{msg.body || msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "vet" ? "text-green-100" : "text-gray-400"} text-right`}>{msg.time || msg.created_at}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {activeConv ? "Aucun message. Commencez la conversation !" : "Sélectionnez une conversation pour commencer"}
                </div>
              )}
            </div>

            {activeConv && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    rows={1}
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8657ff] resize-none text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[#8657ff] hover:bg-purple-700 disabled:opacity-40 text-white p-3 rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </VetLayout>
  );
};

export default VetMessages;