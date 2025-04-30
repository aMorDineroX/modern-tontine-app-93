import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnhancedChatSystem from '../components/EnhancedChatSystem';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../utils/supabase';

// Mock des hooks et services
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } })
      })
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      send: vi.fn().mockReturnThis()
    })
  }
}));

describe('EnhancedChatSystem', () => {
  const mockUser = { 
    id: 'user-123', 
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg'
    }
  };
  const mockToast = { toast: vi.fn() };
  const mockReceiverId = 'user-456';
  const mockGroupId = 'group-789';
  const mockOnClose = vi.fn();
  
  const mockMessages = [
    {
      id: 'msg-1',
      sender_id: 'user-123',
      receiver_id: 'user-456',
      content: 'Hello there!',
      created_at: '2023-07-01T10:00:00Z',
      read: true,
      sender: {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      }
    },
    {
      id: 'msg-2',
      sender_id: 'user-456',
      receiver_id: 'user-123',
      content: 'Hi! How are you?',
      created_at: '2023-07-01T10:05:00Z',
      read: false,
      sender: {
        id: 'user-456',
        email: 'other@example.com',
        full_name: 'Other User',
        avatar_url: 'https://example.com/other-avatar.jpg'
      }
    }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des hooks
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useToast as any).mockReturnValue(mockToast);
    
    // Mock de supabase
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.or as any).mockReturnThis();
    (supabase.order as any).mockReturnThis();
    (supabase.single as any).mockReturnThis();
    
    // Mock de la réponse de supabase pour les messages
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'messages' || table === 'group_messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                or: () => Promise.resolve({ data: mockMessages, error: null })
              })
            }),
            or: () => ({
              order: () => Promise.resolve({ data: mockMessages, error: null })
            })
          }),
          update: () => ({
            eq: () => Promise.resolve({ data: null, error: null }),
            in: () => Promise.resolve({ data: null, error: null })
          }),
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { ...mockMessages[0], id: 'new-msg' }, error: null })
            })
          })
        };
      }
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      };
    });
  });
  
  it('should render the chat system for direct messages', async () => {
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
      />
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText('Test Chat')).toBeInTheDocument();
    
    // Vérifier que les messages sont chargés
    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
      expect(screen.getByText('Hi! How are you?')).toBeInTheDocument();
    });
    
    // Vérifier que le champ de saisie est affiché
    expect(screen.getByPlaceholderText('Écrivez un message...')).toBeInTheDocument();
    
    // Vérifier que le bouton d'envoi est affiché
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
  
  it('should render the chat system for group messages', async () => {
    // Mock pour les messages de groupe
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'group_messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockMessages, error: null })
            })
          }),
          update: () => ({
            eq: () => Promise.resolve({ data: null, error: null }),
            in: () => Promise.resolve({ data: null, error: null })
          }),
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { ...mockMessages[0], id: 'new-msg', group_id: mockGroupId }, error: null })
            })
          })
        };
      }
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      };
    });
    
    render(
      <EnhancedChatSystem 
        groupId={mockGroupId}
        isGroupChat={true}
        title="Test Group Chat"
      />
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText('Test Group Chat')).toBeInTheDocument();
    
    // Vérifier que les messages sont chargés
    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
      expect(screen.getByText('Hi! How are you?')).toBeInTheDocument();
    });
  });
  
  it('should send a message', async () => {
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
      />
    );
    
    // Attendre que les messages soient chargés
    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });
    
    // Saisir un message
    const input = screen.getByPlaceholderText('Écrivez un message...');
    fireEvent.change(input, { target: { value: 'New message' } });
    
    // Envoyer le message
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Vérifier que le message est envoyé
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(supabase.insert).toHaveBeenCalled();
    });
    
    // Vérifier que le champ de saisie est vidé
    expect(input).toHaveValue('');
  });
  
  it('should mark messages as read', async () => {
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
      />
    );
    
    // Attendre que les messages soient chargés
    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });
    
    // Vérifier que les messages non lus sont marqués comme lus
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(supabase.update).toHaveBeenCalled();
    });
  });
  
  it('should handle file attachments', async () => {
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
      />
    );
    
    // Attendre que les messages soient chargés
    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });
    
    // Simuler l'ajout d'un fichier
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Vérifier que le fichier est affiché
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
    
    // Envoyer le message avec la pièce jointe
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Vérifier que le fichier est téléchargé
    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalledWith('chat-attachments');
      expect(supabase.storage.from().upload).toHaveBeenCalled();
    });
    
    // Vérifier que le message avec la pièce jointe est envoyé
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(supabase.insert).toHaveBeenCalled();
    });
  });
  
  it('should display typing indicator', async () => {
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
      />
    );
    
    // Attendre que les messages soient chargés
    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });
    
    // Simuler un événement de frappe
    const callback = (supabase.channel().on as any).mock.calls[0][2];
    callback({ payload: { user_id: 'user-456' } });
    
    // Vérifier que l'indicateur de frappe est affiché
    await waitFor(() => {
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });
  });
  
  it('should close the chat when close button is clicked', async () => {
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
        onClose={mockOnClose}
      />
    );
    
    // Attendre que les messages soient chargés
    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de fermeture
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Vérifier que le callback de fermeture est appelé
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should display empty state when no messages', async () => {
    // Mock pour aucun message
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            or: () => Promise.resolve({ data: [], error: null })
          })
        }),
        or: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        })
      })
    }));
    
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
      />
    );
    
    // Vérifier que le message d'absence de messages est affiché
    await waitFor(() => {
      expect(screen.getByText('Aucun message')).toBeInTheDocument();
      expect(screen.getByText('Commencez la conversation en envoyant un message')).toBeInTheDocument();
    });
  });
  
  it('should display loading state', async () => {
    // Mock pour simuler un chargement long
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            or: () => new Promise(resolve => setTimeout(() => resolve({ data: mockMessages, error: null }), 1000))
          })
        }),
        or: () => ({
          order: () => new Promise(resolve => setTimeout(() => resolve({ data: mockMessages, error: null }), 1000))
        })
      })
    }));
    
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
      />
    );
    
    // Vérifier que l'indicateur de chargement est affiché
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('should group messages by date', async () => {
    // Mock pour des messages de dates différentes
    const messagesOnDifferentDays = [
      {
        ...mockMessages[0],
        created_at: '2023-07-01T10:00:00Z'
      },
      {
        ...mockMessages[1],
        created_at: '2023-07-02T10:00:00Z'
      }
    ];
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            or: () => Promise.resolve({ data: messagesOnDifferentDays, error: null })
          })
        }),
        or: () => ({
          order: () => Promise.resolve({ data: messagesOnDifferentDays, error: null })
        })
      })
    }));
    
    render(
      <EnhancedChatSystem 
        receiverId={mockReceiverId}
        title="Test Chat"
      />
    );
    
    // Vérifier que les séparateurs de date sont affichés
    await waitFor(() => {
      expect(screen.getByText('01/07/2023')).toBeInTheDocument();
      expect(screen.getByText('02/07/2023')).toBeInTheDocument();
    });
  });
});
