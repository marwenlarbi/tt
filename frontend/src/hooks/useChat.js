import { useState, useEffect, useCallback } from 'react';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const sendMessage = useCallback((conversationId, message) => {
    const newMessage = {
      id: Date.now(),
      senderId: 1,
      senderName: 'Vous',
      text: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, newMessage],
            lastMessage: message,
            lastMessageTime: newMessage.timestamp
          }
        : conv
    ));
  }, []);

  return {
    conversations,
    onlineUsers,
    sendMessage
  };
};