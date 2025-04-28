import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatProvider, useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

// Mock des dépendances
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Composant de test simplifié
const TestComponent = () => {
  const { isOpen, toggleChat } = useChat();
  
  return (
    <div>
      <div data-testid="isOpen">{isOpen ? 'open' : 'closed'}</div>
      <button data-testid="toggleChat" onClick={toggleChat}>Toggle Chat</button>
    </div>
  );
};

describe('ChatContext Simple Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de useAuth avec des valeurs simples
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
  
  it('should initialize with chat closed', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Vérifier que le chat est initialement fermé
    expect(screen.getByTestId('isOpen').textContent).toBe('closed');
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
