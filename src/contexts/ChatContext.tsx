import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  ChatMessage, 
  ChatConversation, 
  createMessage, 
  createConversation, 
  addMessageToConversation 
} from '@/services/chatService';

interface ChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  setActiveConversation: (conversation: ChatConversation | null) => void;
  sendMessage: (content: string) => void;
  unreadCount: number;
  createNewConversation: (participants: { id: string; name: string; avatar?: string }[], isGroup?: boolean, title?: string) => ChatConversation;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Initialiser une conversation par défaut avec le support
  useEffect(() => {
    if (conversations.length === 0) {
      const supportConversation = createConversation(
        [
          { id: 'support', name: 'Support Naat', avatar: '/logo.svg' },
          { id: user?.id || 'guest', name: user?.user_metadata?.full_name || 'Invité', avatar: user?.user_metadata?.avatar_url }
        ],
        false
      );
      
      // Ajouter un message de bienvenue
      const welcomeMessage = createMessage(
        'support',
        'Support Naat',
        'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
        '/logo.svg'
      );
      
      const conversationWithMessage = addMessageToConversation(supportConversation, welcomeMessage);
      
      setConversations([conversationWithMessage]);
      setActiveConversation(conversationWithMessage);
      setUnreadCount(1);
    }
  }, [user, conversations.length]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const openChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const sendMessage = (content: string) => {
    if (!activeConversation) return;
    
    const newMessage = createMessage(
      user?.id || 'guest',
      user?.user_metadata?.full_name || 'Invité',
      content,
      user?.user_metadata?.avatar_url
    );
    
    const updatedConversation = addMessageToConversation(activeConversation, newMessage);
    
    setActiveConversation(updatedConversation);
    setConversations(prev => 
      prev.map(conv => conv.id === updatedConversation.id ? updatedConversation : conv)
    );
    
    // Simuler une réponse automatique
    setTimeout(() => {
      const responseMessage = createMessage(
        'support',
        'Support Naat',
        'Merci pour votre message. Un conseiller va vous répondre prochainement.',
        '/logo.svg'
      );
      
      const conversationWithResponse = addMessageToConversation(updatedConversation, responseMessage);
      
      setActiveConversation(conversationWithResponse);
      setConversations(prev => 
        prev.map(conv => conv.id === conversationWithResponse.id ? conversationWithResponse : conv)
      );
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1000);
  };

  const createNewConversation = (
    participants: { id: string; name: string; avatar?: string }[], 
    isGroup: boolean = false, 
    title?: string
  ): ChatConversation => {
    const newConversation = createConversation(participants, isGroup, title);
    setConversations(prev => [...prev, newConversation]);
    return newConversation;
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        toggleChat,
        openChat,
        closeChat,
        conversations,
        activeConversation,
        setActiveConversation,
        sendMessage,
        unreadCount,
        createNewConversation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
