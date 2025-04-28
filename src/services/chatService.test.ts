import { describe, it, expect, vi } from 'vitest';
import {
  createMessage,
  markMessageAsRead,
  createConversation,
  addMessageToConversation,
  generateAutomaticResponse,
  ChatMessage,
  ChatConversation
} from './chatService';

// Mock de Date.now pour avoir des IDs prévisibles
const originalDateNow = Date.now;
const mockDateNow = vi.fn(() => 1234567890);

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Date.now = mockDateNow;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe('createMessage', () => {
    it('should create a message with required fields', () => {
      const message = createMessage('user-123', 'John Doe', 'Hello, world!');

      expect(message).toEqual({
        id: expect.any(String),
        sender: {
          id: 'user-123',
          name: 'John Doe',
          avatar: undefined
        },
        content: 'Hello, world!',
        timestamp: expect.any(Date),
        isRead: false
      });
    });

    it('should create a message with avatar', () => {
      const message = createMessage('user-123', 'John Doe', 'Hello, world!', 'avatar.jpg');

      expect(message).toEqual({
        id: expect.any(String),
        sender: {
          id: 'user-123',
          name: 'John Doe',
          avatar: 'avatar.jpg'
        },
        content: 'Hello, world!',
        timestamp: expect.any(Date),
        isRead: false
      });
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark a message as read', () => {
      const message: ChatMessage = {
        id: 'message-123',
        sender: {
          id: 'user-123',
          name: 'John Doe'
        },
        content: 'Hello, world!',
        timestamp: new Date(),
        isRead: false
      };

      const readMessage = markMessageAsRead(message);

      expect(readMessage).toEqual({
        ...message,
        isRead: true
      });

      // Vérifier que l'original n'a pas été modifié
      expect(message.isRead).toBe(false);
    });
  });

  describe('createConversation', () => {
    it('should create a conversation with required fields', () => {
      const participants = [
        { id: 'user-123', name: 'John Doe' },
        { id: 'user-456', name: 'Jane Doe' }
      ];

      const conversation = createConversation(participants);

      expect(conversation).toEqual({
        id: expect.any(String),
        participants,
        messages: [],
        lastActivity: expect.any(Date),
        isGroup: false,
        title: undefined
      });
    });

    it('should create a group conversation with title', () => {
      const participants = [
        { id: 'user-123', name: 'John Doe' },
        { id: 'user-456', name: 'Jane Doe' },
        { id: 'user-789', name: 'Bob Smith' }
      ];

      const conversation = createConversation(participants, true, 'Friends Group');

      expect(conversation).toEqual({
        id: expect.any(String),
        participants,
        messages: [],
        lastActivity: expect.any(Date),
        isGroup: true,
        title: 'Friends Group'
      });
    });

    it('should ignore title for non-group conversations', () => {
      const participants = [
        { id: 'user-123', name: 'John Doe' },
        { id: 'user-456', name: 'Jane Doe' }
      ];

      const conversation = createConversation(participants, false, 'Ignored Title');

      expect(conversation).toEqual({
        id: expect.any(String),
        participants,
        messages: [],
        lastActivity: expect.any(Date),
        isGroup: false,
        title: undefined
      });
    });
  });

  describe('addMessageToConversation', () => {
    it('should add a message to a conversation', () => {
      const conversation: ChatConversation = {
        id: 'conversation-123',
        participants: [
          { id: 'user-123', name: 'John Doe' },
          { id: 'user-456', name: 'Jane Doe' }
        ],
        messages: [],
        lastActivity: new Date(2023, 0, 1),
        isGroup: false
      };

      const message: ChatMessage = {
        id: 'message-123',
        sender: {
          id: 'user-123',
          name: 'John Doe'
        },
        content: 'Hello, world!',
        timestamp: new Date(2023, 0, 2),
        isRead: false
      };

      const updatedConversation = addMessageToConversation(conversation, message);

      expect(updatedConversation).toEqual({
        ...conversation,
        messages: [message],
        lastActivity: message.timestamp
      });

      // Vérifier que l'original n'a pas été modifié
      expect(conversation.messages).toEqual([]);
      expect(conversation.lastActivity).toEqual(new Date(2023, 0, 1));
    });

    it('should add a message to a conversation with existing messages', () => {
      const existingMessage: ChatMessage = {
        id: 'message-456',
        sender: {
          id: 'user-456',
          name: 'Jane Doe'
        },
        content: 'Hi there!',
        timestamp: new Date(2023, 0, 1),
        isRead: true
      };

      const conversation: ChatConversation = {
        id: 'conversation-123',
        participants: [
          { id: 'user-123', name: 'John Doe' },
          { id: 'user-456', name: 'Jane Doe' }
        ],
        messages: [existingMessage],
        lastActivity: new Date(2023, 0, 1),
        isGroup: false
      };

      const newMessage: ChatMessage = {
        id: 'message-123',
        sender: {
          id: 'user-123',
          name: 'John Doe'
        },
        content: 'Hello, world!',
        timestamp: new Date(2023, 0, 2),
        isRead: false
      };

      const updatedConversation = addMessageToConversation(conversation, newMessage);

      expect(updatedConversation).toEqual({
        ...conversation,
        messages: [existingMessage, newMessage],
        lastActivity: newMessage.timestamp
      });
    });
  });

  describe('generateAutomaticResponse', () => {
    it('should generate a response for "bonjour"', () => {
      // Mock Math.random pour avoir un résultat prévisible
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0);

      const response = generateAutomaticResponse('Bonjour, comment ça va ?');

      // Vérifier que la réponse contient le mot "Bonjour"
      expect(response).toBe(keywordResponses.bonjour[0]);

      // Restaurer Math.random
      Math.random = originalRandom;
    });

    it('should generate a response for "aide"', () => {
      // Mock Math.random pour avoir un résultat prévisible
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0);

      const response = generateAutomaticResponse('J\'ai besoin d\'aide avec l\'application');

      // Vérifier que la réponse est celle attendue
      expect(response).toBe(keywordResponses.aide[0]);

      // Restaurer Math.random
      Math.random = originalRandom;
    });

    it('should generate a response for "tontine"', () => {
      // Mock Math.random pour avoir un résultat prévisible
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0);

      const response = generateAutomaticResponse('Comment fonctionne la tontine ?');

      // Vérifier que la réponse est celle attendue
      expect(response).toBe(keywordResponses.tontine[0]);

      // Restaurer Math.random
      Math.random = originalRandom;
    });

    it('should generate a response for "paiement"', () => {
      // Mock Math.random pour avoir un résultat prévisible
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0);

      const response = generateAutomaticResponse('Quelles sont les options de paiement ?');

      // Vérifier que la réponse est celle attendue
      expect(response).toBe(keywordResponses.paiement[0]);

      // Restaurer Math.random
      Math.random = originalRandom;
    });

    it('should generate a response for "merci"', () => {
      // Mock Math.random pour avoir un résultat prévisible
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0);

      const response = generateAutomaticResponse('Merci pour votre aide !');

      // Vérifier que la réponse est celle attendue
      expect(response).toBe(keywordResponses.merci[0]);

      // Restaurer Math.random
      Math.random = originalRandom;
    });

    it('should generate a default response for unknown input', () => {
      // Mock Math.random pour avoir un résultat prévisible
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0);

      const response = generateAutomaticResponse('Quelque chose de complètement différent');

      // Vérifier que la réponse est une des réponses par défaut
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);

      // Restaurer Math.random
      Math.random = originalRandom;
    });
  });
});
