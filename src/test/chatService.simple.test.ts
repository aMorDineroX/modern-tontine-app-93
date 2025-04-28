import { describe, it, expect } from 'vitest';
import { 
  createMessage, 
  createConversation, 
  addMessageToConversation,
  markMessageAsRead,
  generateAutomaticResponse
} from '../services/chatService';

describe('chatService', () => {
  describe('createMessage', () => {
    it('should create a message with required fields', () => {
      const message = createMessage('user-1', 'John Doe', 'Hello, world!');
      
      expect(message).toHaveProperty('id');
      expect(message.sender.id).toBe('user-1');
      expect(message.sender.name).toBe('John Doe');
      expect(message.content).toBe('Hello, world!');
      expect(message.isRead).toBe(false);
      expect(message.timestamp).toBeInstanceOf(Date);
    });
    
    it('should create a message with avatar', () => {
      const message = createMessage('user-1', 'John Doe', 'Hello, world!', 'avatar.jpg');
      
      expect(message.sender.avatar).toBe('avatar.jpg');
    });
  });
  
  describe('markMessageAsRead', () => {
    it('should mark a message as read', () => {
      const message = createMessage('user-1', 'John Doe', 'Hello, world!');
      const readMessage = markMessageAsRead(message);
      
      expect(readMessage.isRead).toBe(true);
    });
  });
  
  describe('createConversation', () => {
    it('should create a conversation with required fields', () => {
      const participants = [
        { id: 'user-1', name: 'John Doe' },
        { id: 'user-2', name: 'Jane Doe' }
      ];
      
      const conversation = createConversation(participants);
      
      expect(conversation).toHaveProperty('id');
      expect(conversation.participants).toEqual(participants);
      expect(conversation.messages).toEqual([]);
      expect(conversation.lastActivity).toBeInstanceOf(Date);
      expect(conversation.isGroup).toBe(false);
      expect(conversation.title).toBeUndefined();
    });
    
    it('should create a group conversation with title', () => {
      const participants = [
        { id: 'user-1', name: 'John Doe' },
        { id: 'user-2', name: 'Jane Doe' }
      ];
      
      const conversation = createConversation(participants, true, 'Group Chat');
      
      expect(conversation.isGroup).toBe(true);
      expect(conversation.title).toBe('Group Chat');
    });
  });
  
  describe('addMessageToConversation', () => {
    it('should add a message to a conversation', () => {
      const participants = [
        { id: 'user-1', name: 'John Doe' },
        { id: 'user-2', name: 'Jane Doe' }
      ];
      
      const conversation = createConversation(participants);
      const message = createMessage('user-1', 'John Doe', 'Hello, world!');
      
      const updatedConversation = addMessageToConversation(conversation, message);
      
      expect(updatedConversation.messages).toHaveLength(1);
      expect(updatedConversation.messages[0]).toEqual(message);
      expect(updatedConversation.lastActivity).toEqual(message.timestamp);
    });
  });
  
  describe('generateAutomaticResponse', () => {
    it('should generate a default response for unknown input', () => {
      const response = generateAutomaticResponse('something random');
      
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
    });
  });
});
