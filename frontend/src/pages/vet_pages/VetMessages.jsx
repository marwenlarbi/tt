import React, { useState } from "react";
import VetLayout from './VetLayout';
import { Send, Search, Phone, Mail } from "lucide-react";

const VetMessages = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1, owner: "Imen Slama", pet: "Max (Chien)", avatar: "IS", unread: 2, lastMessage: "Merci docteur, Max va mieux !",
      messages: [
        { id: 1, sender: "owner", text: "Bonjour Docteur, est-ce que Max peut reprendre ses activités normales ?", time: "10:00" },
        { id: 2, sender: "vet", text: "Bonjour Imen ! Oui, Max peut reprendre progressivement ses activités. Évitez les efforts intenses pendant 2-3 jours.", time: "10:15" },
        { id: 3, sender: "owner", text: "Merci docteur, Max va mieux !", time: "11:30" },
      ]
    },
    {
      id: 2, owner: "Omar Belhaj", pet: "Rex (Chien)", avatar: "OB", unread: 1, lastMessage: "Rex semble essoufflé ce matin...",
      messages: [
        { id: 1, sender: "owner", text: "Docteur, Rex semble essoufflé ce matin et refuse de manger.", time: "08:00" },
        { id: 2, sender: "owner", text: "Rex semble essoufflé ce matin...", time: "08:05" },
      ]
    },
    {
      id: 3, owner: "Sara Mejri", pet: "Rocky (Lapin)", avatar: "SM", unread: 0, lastMessage: "Super, à vendredi alors !",
      messages: [
        { id: 1, sender: "vet", text: "Bonjour Sara, comment va Rocky depuis l'opération ?", time: "09:00" },
        { id: 2, sender: "owner", text: "Il va bien, mange normalement. La cicatrice paraît propre.", time: "09:30" },
        { id: 3, sender: "vet", text: "Parfait ! Je vous confirme le rendez-vous de contrôle vendredi à 14h.", time: "09:45" },
        { id: 4, sender: "owner", text: "Super, à vendredi alors !", time: "09:50" },
      ]
    },
    {
      id: 4, owner: "Ahmed Ben Ali", pet: "Luna (Chat)", avatar: "AB", unread: 0, lastMessage: "Elle mange bien depuis hier.",
      messages: [
        { id: 1, sender: "owner", text: "Docteur, Luna refuse de manger depuis 2 jours.", time: "14:00" },
        { id: 2, sender: "vet", text: "Continuez l'alimentation digestive et les probiotiques. C'est normal pendant la gastro-entérite.", time: "14:30" },
        { id: 3, sender: "owner", text: "Elle mange bien depuis hier.", time: "16:00" },
      ]
    },
  ]);

  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  const filteredConvs = conversations.filter((c) =>
    c.owner.toLowerCase().includes(search.toLowerCase()) ||
    c.pet.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = { id: Date.now(), sender: "vet", text: newMessage, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
    const updated = conversations.map((c) =>
      c.id === activeConv.id ? { ...c, messages: [...c.messages, msg], lastMessage: newMessage } : c
    );
    setConversations(updated);
    setActiveConv({ ...activeConv, messages: [...activeConv.messages, msg], lastMessage: newMessage });
    setNewMessage("");
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const markRead = (conv) => {
    const updated = conversations.map((c) => c.id === conv.id ? { ...c, unread: 0 } : c);
    setConversations(updated);
    setActiveConv({ ...conv, unread: 0 });
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  return (
    <VetLayout>
      <div className="p-6 h-screen flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-[#0e9f6e]">Messages</h1>
          <p className="text-gray-600">{totalUnread > 0 ? `${totalUnread} message(s) non lu(s)` : "Tous les messages sont lus"}</p>
        </div>

        <div className="flex flex-1 gap-0 bg-white rounded-xl shadow-md overflow-hidden" style={{ minHeight: 0 }}>
          {/* Liste des conversations */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e] text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => markRead(conv)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${activeConv.id === conv.id ? "bg-green-50 border-l-4 border-l-[#0e9f6e]" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{conv.owner}</p>
                        {conv.unread > 0 && (
                          <span className="bg-[#0e9f6e] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{conv.unread}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{conv.pet}</p>
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation active */}
          <div className="flex-1 flex flex-col">
            {/* Header conversation */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  {activeConv.avatar}
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
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {activeConv.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "vet" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[65%] px-4 py-3 rounded-2xl ${msg.sender === "vet" ? "bg-[#0e9f6e] text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm"}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "vet" ? "text-green-100" : "text-gray-400"} text-right`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrire un message... (Entrée pour envoyer)"
                  rows={1}
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e9f6e] resize-none text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-[#0e9f6e] hover:bg-green-700 disabled:opacity-40 text-white p-3 rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VetLayout>
  );
};

export default VetMessages;