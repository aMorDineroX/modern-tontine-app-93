import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatProvider, useChat } from './ChatContext';
import { useAuth } from './AuthContext';
import { createMessage, createConversation, addMessageToConversation } from '@/services/chatService';

// Mock des dépendances
vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/chatService', () => ({
  createMessage: vi.fn(),
  createConversation: vi.fn(),
  addMessageToConversation: vi.fn(),
}));

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const {
    isOpen,
    toggleChat,
    openChat,
    closeChat,
    conversations,
    activeConversation,
    setActiveConversation,
    sendMessage,
    unreadCount,
    createNewConversation,
  } = useChat();

  return (
    <div>
      <div data-testid="isOpen">{isOpen ? 'open' : 'closed'}</div>
      <div data-testid="unreadCount">{unreadCount}</div>
      <div data-testid="conversationsCount">{conversations.length}</div>
      <div data-testid="activeConversation">
        {activeConversation ? activeConversation.id : 'none'}
      </div>
      <button data-testid="toggleChat" onClick={toggleChat}>
        Toggle Chat
      </button>
      <button data-testid="openChat" onClick={openChat}>
        Open Chat
      </button>
      <button data-testid="closeChat" onClick={closeChat}>
        Close Chat
      </button>
      <button
        data-testid="sendMessage"
        onClick={() => sendMessage('Test message')}
      >
        Send Message
      </button>
      <button
        data-testid="createConversation"
        onClick={() =>
          createNewConversation([
            { id: 'user1', name: 'User 1' },
            { id: 'user2', name: 'User 2' },
          ])
        }
      >
        Create Conversation
      </button>
      <button
        data-testid="setActiveConversation"
        onClick={() => {
          if (conversations.length > 0) {
            setActiveConversation(conversations[0]);
          }
        }}
      >
        Set Active Conversation
      </button>
    </div>
  );
};

describe('ChatContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: false });

    // Mock des fonctions de chatService avec des valeurs déterministes
    let messageIdCounter = 0;
    (createMessage as any).mockImplementation((senderId, senderName, content, senderAvatar) => ({
      id: `message-id-${messageIdCounter++}`,
      sender: {
        id: senderId,
        name: senderName,
        avatar: senderAvatar,
      },
      content,
      timestamp: new Date(2023, 0, 1, 12, 0, 0), // Date fixe pour les tests
      isRead: false,
    }));

    let conversationIdCounter = 0;
    (createConversation as any).mockImplementation((participants, isGroup, title) => ({
      id: `conversation-id-${conversationIdCounter++}`,
      participants,
      messages: [],
      lastActivity: new Date(2023, 0, 1, 12, 0, 0), // Date fixe pour les tests
      isGroup,
      title: isGroup ? title : undefined,
    }));

    (addMessageToConversation as any).mockImplementation((conversation, message) => ({
      ...conversation,
      messages: [...conversation.messages, message],
      lastActivity: message.timestamp,
    }));

    // Mock de useAuth avec des valeurs déterministes
    (useAuth as any).mockReturnValue({
      user: {
        id: 'user-123',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'avatar.jpg',
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with default values', async () => {
    await act(async () => {
      render(
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      );
    });

    // Vérifier les valeurs initiales
    expect(screen.getByTestId('isOpen').textContent).toBe('closed');

    // Attendre que la conversation par défaut soit créée
    await waitFor(() => {
      expect(screen.getByTestId('conversationsCount').textContent).toBe('1');
      expect(screen.getByTestId('unreadCount').textContent).toBe('1');
      expect(createConversation).toHaveBeenCalled();
      expect(createMessage).toHaveBeenCalled();
      expect(addMessageToConversation).toHaveBeenCalled();
    });
  });

  it('should toggle chat', async () => {
    await act(async () => {
      render(
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      );
    });

    // Attendre que la conversation par défaut soit créée
    await waitFor(() => {
      expect(screen.getByTestId('conversationsCount').textContent).toBe('1');
    });

    // Vérifier que le chat est initialement fermé
    expect(screen.getByTestId('isOpen').textContent).toBe('closed');

    // Ouvrir le chat
    await act(async () => {
      screen.getByTestId('toggleChat').click();
    });

    // Vérifier que le chat est ouvert
    expect(screen.getByTestId('isOpen').textContent).toBe('open');
    expect(screen.getByTestId('unreadCount').textContent).toBe('0');

    // Fermer le chat
    await act(async () => {
      screen.getByTestId('toggleChat').click();
    });

    // Vérifier que le chat est fermé
    expect(screen.getByTestId('isOpen').textContent).toBe('closed');
  });

  it('should open and close chat', async () => {
    await act(async () => {
      render(
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      );
    });

    // Attendre que la conversation par défaut soit créée
    await waitFor(() => {
      expect(screen.getByTestId('conversationsCount').textContent).toBe('1');
    });

    // Ouvrir le chat
    await act(async () => {
      screen.getByTestId('openChat').click();
    });

    // Vérifier que le chat est ouvert
    expect(screen.getByTestId('isOpen').textContent).toBe('open');
    expect(screen.getByTestId('unreadCount').textContent).toBe('0');

    // Fermer le chat
    await act(async () => {
      screen.getByTestId('closeChat').click();
    });

    // Vérifier que le chat est fermé
    expect(screen.getByTestId('isOpen').textContent).toBe('closed');
  });

  it('should send a message and receive an automatic response', async () => {
    await act(async () => {
      render(
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      );
    });

    // Attendre que la conversation par défaut soit créée
    await waitFor(() => {
      expect(screen.getByTestId('conversationsCount').textContent).toBe('1');
    });

    // Réinitialiser les mocks pour pouvoir compter les appels
    vi.clearAllMocks();

    // Envoyer un message
    await act(async () => {
      screen.getByTestId('sendMessage').click();
    });

    // Vérifier que createMessage a été appelé pour le message de l'utilisateur
    expect(createMessage).toHaveBeenCalledWith(
      'user-123',
      'Test User',
      'Test message',
      'avatar.jpg'
    );

    // Vérifier que addMessageToConversation a été appelé
    expect(addMessageToConversation).toHaveBeenCalled();

    // Avancer le temps pour déclencher la réponse automatique
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Vérifier que createMessage a été appelé pour la réponse automatique
    await waitFor(() => {
      expect(createMessage).toHaveBeenCalledTimes(2);
    });

    expect(createMessage).toHaveBeenLastCalledWith(
      'support',
      'Support Naat',
      'Merci pour votre message. Un conseiller va vous répondre prochainement.',
      '/logo.svg'
    );

    // Vérifier que addMessageToConversation a été appelé à nouveau
    expect(addMessageToConversation).toHaveBeenCalledTimes(2);
  });

  it('should create a new conversation', async () => {
    await act(async () => {
      render(
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      );
    });

    // Attendre que la conversation par défaut soit créée
    await waitFor(() => {
      expect(screen.getByTestId('conversationsCount').textContent).toBe('1');
    });

    // Réinitialiser les mocks
    vi.clearAllMocks();

    // Créer une nouvelle conversation
    await act(async () => {
      screen.getByTestId('createConversation').click();
    });

    // Vérifier que createConversation a été appelé
    expect(createConversation).toHaveBeenCalledWith(
      [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
      ],
      false,
      undefined
    );

    // Vérifier que la nouvelle conversation a été ajoutée
    await waitFor(() => {
      expect(screen.getByTestId('conversationsCount').textContent).toBe('2');
    });
  });

  it('should set active conversation', async () => {
    await act(async () => {
      render(
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      );
    });

    // Attendre que la conversation par défaut soit créée
    await waitFor(() => {
      expect(screen.getByTestId('conversationsCount').textContent).toBe('1');
    });

    // Vérifier que la conversation active est définie
    expect(screen.getByTestId('activeConversation').textContent).not.toBe('none');

    // Définir la conversation active
    await act(async () => {
      screen.getByTestId('setActiveConversation').click();
    });

    // Vérifier que la conversation active a été définie
    await waitFor(() => {
      expect(screen.getByTestId('activeConversation').textContent).toBe('conversation-id');
    });
  });

  it('should increment unread count when receiving a message while chat is closed', async () => {
    await act(async () => {
      render(
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      );
    });

    // Attendre que la conversation par défaut soit créée
    await waitFor(() => {
      expect(screen.getByTestId('conversationsCount').textContent).toBe('1');
    });

    // Réinitialiser le compteur de messages non lus
    await act(async () => {
      screen.getByTestId('openChat').click();
    });

    await act(async () => {
      screen.getByTestId('closeChat').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('unreadCount').textContent).toBe('0');
    });

    // Envoyer un message
    await act(async () => {
      screen.getByTestId('sendMessage').click();
    });

    // Avancer le temps pour déclencher la réponse automatique
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Vérifier que le compteur de messages non lus a été incrémenté
    await waitFor(() => {
      expect(screen.getByTestId('unreadCount').textContent).toBe('1');
    });
  });

  it('should throw an error when useChat is used outside of ChatProvider', () => {
    // Supprimer les logs d'erreur pour ce test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Vérifier que useChat lance une erreur lorsqu'il est utilisé en dehors de ChatProvider
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useChat must be used within a ChatProvider');

    // Restaurer console.error
    console.error = originalConsoleError;
  });
});
