// frontend/src/components/Chat/PrivateChat.jsx - Version nettoyée
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Plus } from 'lucide-react';

const PrivateChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [onlineUsers] = useState(new Set([2, 3, 5])); // Utilisateurs en ligne
  
  const [conversations, setConversations] = useState([
    {
      id: 1,
      participantId: 2,
      participantName: 'Dr. Mouna Boukadi',
      participantAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Kqt6vs7YvZXCB-7NpouY4jDPLdClHA4NrA&s',
      lastMessage: 'Merci pour la consultation',
      lastMessageTime: '2024-05-31T14:30:00',
      unread: 2,
      isOnline: true,
      messages: [
        { 
          id: 1, 
          senderId: 2, 
          senderName: 'Dr. Mouna Boukadi',
          text: 'Bonjour, comment va votre chien après le traitement ?', 
          timestamp: '2024-05-31T14:25:00',
          type: 'text'
        },
        { 
          id: 2, 
          senderId: 1, 
          senderName: 'Vous',
          text: 'Il va beaucoup mieux, merci ! Les médicaments ont bien fonctionné.', 
          timestamp: '2024-05-31T14:28:00',
          type: 'text'
        },
        { 
          id: 3, 
          senderId: 2, 
          senderName: 'Dr. Mouna Boukadi',
          text: 'Parfait ! Continuez le traitement encore 3 jours.', 
          timestamp: '2024-05-31T14:29:00',
          type: 'text'
        }
      ]
    },
    {
      id: 2,
      participantId: 3,
      participantName: 'Jean Dupont',
      participantAvatar: '/users/user_1.jpg',
      lastMessage: 'J\'aimerais adopter Luna',
      lastMessageTime: '2024-05-31T13:45:00',
      unread: 1,
      isOnline: true,
      messages: [
        { 
          id: 1, 
          senderId: 3, 
          senderName: 'Jean Dupont',
          text: 'Bonjour, j\'ai vu votre annonce pour l\'adoption de Luna.', 
          timestamp: '2024-05-31T13:40:00',
          type: 'text'
        },
        { 
          id: 2, 
          senderId: 1, 
          senderName: 'Vous',
          text: 'Bonjour ! Oui, Luna est toujours disponible. Qu\'aimeriez-vous savoir ?', 
          timestamp: '2024-05-31T13:42:00',
          type: 'text'
        }
      ]
    },
    {
      id: 3,
      participantId: 4,
      participantName: 'Marie Lefèvre',
      participantAvatar: '/users/user_2.jpg',
      lastMessage: 'Merci pour les conseils !',
      lastMessageTime: '2024-05-31T12:15:00',
      unread: 0,
      isOnline: false,
      messages: [
        { 
          id: 1, 
          senderId: 4, 
          senderName: 'Marie Lefèvre',
          text: 'Pouvez-vous me conseiller sur l\'alimentation de mon chat ?', 
          timestamp: '2024-05-31T12:10:00',
          type: 'text'
        },
        { 
          id: 2, 
          senderId: 1, 
          senderName: 'Vous',
          text: 'Bien sûr ! Quel âge a votre chat et quelle est sa race ?', 
          timestamp: '2024-05-31T12:12:00',
          type: 'text'
        }
      ]
    }
  ]);

  // Utilisateurs disponibles pour nouveaux chats
  const availableUsers = [
    { id: 5, name: 'Dr. Ahmed Ben Ali', avatar: '/users/vet1.jpg', isOnline: true, role: 'Vétérinaire' },
    { id: 6, name: 'Sophie Martin', avatar: '/users/user_3.jpg', isOnline: false, role: 'Propriétaire' },
    { id: 7, name: 'Thomas Dubois', avatar: '/users/user_4.jpg', isOnline: true, role: 'Propriétaire' },
    { id: 8, name: 'Dr. Sarah Johnson', avatar: '/users/vet2.jpg', isOnline: true, role: 'Vétérinaire' }
  ];

  const messagesEndRef = useRef(null);
  const currentUserId = 1;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return;

    const newMessage = {
      id: Date.now(),
      senderId: currentUserId,
      senderName: 'Vous',
      text: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeChat.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: message,
          lastMessageTime: newMessage.timestamp
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    setMessage('');

    // Simulation de réponse automatique
    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        senderId: activeChat.participantId,
        senderName: activeChat.participantName,
        text: getAutoReply(),
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeChat.id 
          ? { 
              ...conv, 
              messages: [...conv.messages, autoReply],
              lastMessage: autoReply.text,
              lastMessageTime: autoReply.timestamp
            }
          : conv
      ));

      setActiveChat(prev => ({
        ...prev,
        messages: [...prev.messages, autoReply]
      }));
    }, 1000 + Math.random() * 2000);
  };

  const getAutoReply = () => {
    const replies = [
      "Merci pour votre message !",
      "Je vous réponds dès que possible.",
      "C'est une excellente question !",
      "Je vais vérifier cela pour vous.",
      "Parfait, je note vos informations.",
      "N'hésitez pas si vous avez d'autres questions."
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const startNewChat = (user) => {
    const existingChat = conversations.find(conv => conv.participantId === user.id);
    
    if (existingChat) {
      setActiveChat(existingChat);
      setShowNewChatModal(false);
      return;
    }

    const newConversation = {
      id: Date.now(),
      participantId: user.id,
      participantName: user.name,
      participantAvatar: user.avatar,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unread: 0,
      isOnline: onlineUsers.has(user.id),
      messages: []
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveChat(newConversation);
    setShowNewChatModal(false);
  };

  const markAsRead = (conversationId) => {
    setConversations(prev =>
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread: 0 } : conv
      )
    );
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition z-40"
        title="Messages privés"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 w-96 h-[500px] bg-white dark:bg-dark-card rounded-lg shadow-2xl z-40 flex flex-col border border-gray-200 dark:border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-primary text-white rounded-t-lg">
          <h3 className="font-semibold">
            {activeChat ? (
              <div className="flex items-center">
                <button
                  onClick={() => setActiveChat(null)}
                  className="mr-2 p-1 hover:bg-white/20 rounded text-lg"
                >
                  ←
                </button>
                <img
                  src={activeChat.participantAvatar}
                  alt={activeChat.participantName}
                  className="w-8 h-8 rounded-full mr-2"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                  }}
                />
                <div>
                  <div className="font-medium">{activeChat.participantName}</div>
                  <div className="text-xs opacity-75">
                    {onlineUsers.has(activeChat.participantId) ? 'En ligne' : 'Hors ligne'}
                  </div>
                </div>
              </div>
            ) : (
              'Messages Privés'
            )}
          </h3>
          
          <div className="flex items-center space-x-2">
            {!activeChat && (
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-1 hover:bg-white/20 rounded"
                title="Nouveau message"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveChat(null);
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!activeChat ? (
          /* Liste des conversations */
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">Aucune conversation</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-2 text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Commencer une conversation
                </button>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveChat(conv);
                    markAsRead(conv.id);
                  }}
                  className="flex items-center p-3 border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="w-12 h-12 rounded-full mr-3"
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                      }}
                    />
                    {onlineUsers.has(conv.participantId) && (
                      <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-card"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-800 dark:text-dark-text text-sm truncate">
                        {conv.participantName}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      {conv.lastMessage || 'Aucun message'}
                    </p>
                  </div>
                  
                  {conv.unread > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                      {conv.unread > 99 ? '99+' : conv.unread}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Chat actif */
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activeChat.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Commencez la conversation</p>
                </div>
              ) : (
                activeChat.messages.map((msg, index) => {
                  const isCurrentUser = msg.senderId === currentUserId;
                  const showAvatar = !isCurrentUser && (
                    index === 0 || 
                    activeChat.messages[index - 1].senderId !== msg.senderId
                  );
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
                    >
                      {!isCurrentUser && showAvatar && (
                        <img
                          src={activeChat.participantAvatar}
                          alt={activeChat.participantName}
                          className="w-6 h-6 rounded-full mr-2 mt-1"
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                          }}
                        />
                      )}
                      
                      {!isCurrentUser && !showAvatar && (
                        <div className="w-6 mr-2"></div>
                      )}
                      
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          isCurrentUser
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-dark-text'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal nouveau chat */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-md max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-dark-text">Nouveau message</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {availableUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => startNewChat(user)}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full mr-3"
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                      }}
                    />
                    {onlineUsers.has(user.id) && (
                      <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-card"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-dark-text text-sm">
                      {user.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role}
                      {onlineUsers.has(user.id) && ' • En ligne'}
                    </p>
                  </div>
                </div>
              ))}
              
              {availableUsers.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivateChat;