// Types pour les messages et les conversations
export interface ChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  messages: ChatMessage[];
  lastActivity: Date;
  isGroup: boolean;
  title?: string;
}

// Fonction pour générer un ID unique
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Fonction pour créer un nouveau message
export const createMessage = (
  senderId: string,
  senderName: string,
  content: string,
  senderAvatar?: string
): ChatMessage => {
  return {
    id: generateId(),
    sender: {
      id: senderId,
      name: senderName,
      avatar: senderAvatar
    },
    content,
    timestamp: new Date(),
    isRead: false
  };
};

// Fonction pour marquer un message comme lu
export const markMessageAsRead = (message: ChatMessage): ChatMessage => {
  return {
    ...message,
    isRead: true
  };
};

// Fonction pour créer une nouvelle conversation
export const createConversation = (
  participants: { id: string; name: string; avatar?: string }[],
  isGroup: boolean = false,
  title?: string
): ChatConversation => {
  return {
    id: generateId(),
    participants,
    messages: [],
    lastActivity: new Date(),
    isGroup,
    title: isGroup ? title : undefined
  };
};

// Fonction pour ajouter un message à une conversation
export const addMessageToConversation = (
  conversation: ChatConversation,
  message: ChatMessage
): ChatConversation => {
  return {
    ...conversation,
    messages: [...conversation.messages, message],
    lastActivity: message.timestamp
  };
};

// Réponses automatiques basées sur des mots-clés
const keywordResponses: Record<string, string[]> = {
  "bonjour": [
    "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    "Bonjour ! Ravi de vous accueillir sur Naat. Que puis-je faire pour vous ?",
    "Bonjour ! Je suis l'assistant Naat. Comment puis-je vous être utile ?"
  ],
  "aide": [
    "Je suis là pour vous aider. Que souhaitez-vous savoir sur Naat ?",
    "Comment puis-je vous aider aujourd'hui ?",
    "N'hésitez pas à me poser des questions sur l'application Naat."
  ],
  "tontine": [
    "Naat est une application moderne de tontine qui simplifie la gestion des groupes d'épargne rotative.",
    "Les tontines sont des systèmes d'épargne collective où les membres contribuent régulièrement à un fonds commun.",
    "Avec Naat, vous pouvez créer et gérer facilement vos groupes de tontine."
  ],
  "paiement": [
    "Naat propose plusieurs méthodes de paiement, dont PayPal, les cartes bancaires et le mobile money.",
    "Vous pouvez effectuer des dépôts et des retraits facilement via notre interface de paiement sécurisée.",
    "Avez-vous des questions spécifiques sur les paiements dans Naat ?"
  ],
  "merci": [
    "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.",
    "Avec plaisir ! Je suis là pour vous aider.",
    "De rien ! Bonne journée !"
  ]
};

// Fonction pour générer une réponse automatique basée sur le message de l'utilisateur
export const generateAutomaticResponse = (userMessage: string): string => {
  const lowercaseMessage = userMessage.toLowerCase();
  
  // Vérifier les mots-clés
  for (const [keyword, responses] of Object.entries(keywordResponses)) {
    if (lowercaseMessage.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Réponses par défaut si aucun mot-clé n'est trouvé
  const defaultResponses = [
    "Merci pour votre message. Comment puis-je vous aider davantage ?",
    "Je comprends. Avez-vous d'autres questions ?",
    "N'hésitez pas à me poser d'autres questions sur Naat.",
    "Je suis là pour vous aider avec toutes vos questions concernant Naat.",
    "Avez-vous besoin d'aide pour autre chose ?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};
