import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import CreateGroupModal from '@/components/CreateGroupModal';
import { createGroup, addGroupMember } from '@/utils/supabase';

// Mock des fonctions Supabase
vi.mock('@/utils/supabase', () => {
  const createGroupMock = vi.fn();
  const addGroupMemberMock = vi.fn();
  
  return {
    supabase: {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
          error: null
        }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } }
        }),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        signInWithOAuth: vi.fn()
      }
    },
    createGroup: createGroupMock,
    addGroupMember: addGroupMemberMock,
  };
});

// Mock des hooks et contextes
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

/**
 * Test d'intégration pour le flux de création de groupe
 * 
 * Ce test vérifie l'intégration entre le composant CreateGroupModal,
 * les contextes AppContext et AuthContext, et les services Supabase.
 */
describe('Create Group Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuration des mocks par défaut
    (createGroup as any).mockResolvedValue({
      data: { id: 'group-123', name: 'Test Group' },
      error: null,
    });
    
    (addGroupMember as any).mockResolvedValue({
      data: { id: 'member-123' },
      error: null,
    });
  });
  
  it('completes the full group creation flow successfully', async () => {
    const onCloseMock = vi.fn();
    const onSubmitMock = vi.fn();
    
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <CreateGroupModal
              isOpen={true}
              onClose={onCloseMock}
              onSubmit={onSubmitMock}
            />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que le modal soit chargé
    await waitFor(() => {
      expect(screen.getByText(/createGroup/i)).toBeInTheDocument();
    });
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/groupName/i), {
      target: { value: 'Family Tontine' },
    });
    
    fireEvent.change(screen.getByLabelText(/contributionAmount/i), {
      target: { value: '100' },
    });
    
    fireEvent.change(screen.getByLabelText(/contributionFrequency/i), {
      target: { value: 'monthly' },
    });
    
    fireEvent.change(screen.getByLabelText(/startDate/i), {
      target: { value: '2023-01-01' },
    });
    
    fireEvent.change(screen.getByLabelText(/payoutMethod/i), {
      target: { value: 'rotation' },
    });
    
    fireEvent.change(screen.getByLabelText(/inviteMembers/i), {
      target: { value: 'friend1@example.com, friend2@example.com' },
    });
    
    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /createGroup/i });
    fireEvent.click(submitButton);
    
    // Vérifier que createGroup a été appelé avec les bonnes données
    await waitFor(() => {
      expect(createGroup).toHaveBeenCalledWith({
        name: 'Family Tontine',
        contribution_amount: 100,
        frequency: 'monthly',
        start_date: '2023-01-01',
        payout_method: 'rotation',
        created_by: 'user-123',
      });
    });
    
    // Vérifier que addGroupMember a été appelé pour ajouter le créateur
    await waitFor(() => {
      expect(addGroupMember).toHaveBeenCalledWith({
        group_id: 'group-123',
        user_id: 'user-123',
        role: 'admin',
        status: 'active',
      });
    });
    
    // Vérifier que onSubmit a été appelé avec les bonnes données
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        name: 'Family Tontine',
        contribution: '100',
        frequency: 'monthly',
        members: 'friend1@example.com, friend2@example.com',
      });
    });
    
    // Vérifier que onClose a été appelé
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });
  });
  
  it('handles errors during group creation', async () => {
    // Configurer le mock pour simuler une erreur
    (createGroup as any).mockResolvedValue({
      data: null,
      error: { message: 'Error creating group' },
    });
    
    const { toast } = useToast();
    
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <CreateGroupModal
              isOpen={true}
              onClose={() => {}}
              onSubmit={() => {}}
            />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Remplir le formulaire minimalement
    fireEvent.change(screen.getByLabelText(/groupName/i), {
      target: { value: 'Test Group' },
    });
    
    fireEvent.change(screen.getByLabelText(/contributionAmount/i), {
      target: { value: '100' },
    });
    
    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /createGroup/i });
    fireEvent.click(submitButton);
    
    // Vérifier que toast a été appelé avec un message d'erreur
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive',
      }));
    });
  });
});
