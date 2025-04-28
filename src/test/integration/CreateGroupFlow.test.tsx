import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import CreateGroupModal from '@/components/CreateGroupModal';
import { createGroup, addGroupMember } from '@/utils/supabase';
import { useToast } from '@/hooks/use-toast';

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
const toastMock = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: toastMock,
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

    // Attendre que le modal soit chargé en cherchant un élément spécifique
    await waitFor(() => {
      // Utiliser une fonction de correspondance plus flexible pour trouver le titre
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'h2' &&
               (content === 'Create Group' || content === 'createGroup');
      })).toBeInTheDocument();
    });

    // Remplir le formulaire - utiliser des sélecteurs plus spécifiques
    const nameInput = screen.getByLabelText(/Group Name|groupName/i);
    fireEvent.change(nameInput, {
      target: { value: 'Family Tontine' },
    });

    const contributionInput = screen.getByLabelText(/Contribution Amount|contributionAmount/i);
    fireEvent.change(contributionInput, {
      target: { value: '100' },
    });

    const frequencySelect = screen.getByLabelText(/Contribution Frequency|contributionFrequency/i);
    fireEvent.change(frequencySelect, {
      target: { value: 'monthly' },
    });

    const startDateInput = screen.getByLabelText(/Start Date|startDate/i);
    fireEvent.change(startDateInput, {
      target: { value: '2023-01-01' },
    });

    const payoutMethodSelect = screen.getByLabelText(/Payout Method|payoutMethod/i);
    fireEvent.change(payoutMethodSelect, {
      target: { value: 'rotation' },
    });

    const membersInput = screen.getByLabelText(/Invite Members|inviteMembers/i);
    fireEvent.change(membersInput, {
      target: { value: 'friend1@example.com, friend2@example.com' },
    });

    // Soumettre le formulaire - utiliser une requête plus flexible
    const submitButton = screen.getByRole('button', {
      name: (content) => /create group/i.test(content) || /creategroup/i.test(content)
    });
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

    // Reset the toast mock before the test
    toastMock.mockClear();

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

    // Remplir le formulaire minimalement - utiliser des sélecteurs plus spécifiques
    const nameInput = screen.getByLabelText(/Group Name|groupName/i);
    fireEvent.change(nameInput, {
      target: { value: 'Test Group' },
    });

    const contributionInput = screen.getByLabelText(/Contribution Amount|contributionAmount/i);
    fireEvent.change(contributionInput, {
      target: { value: '100' },
    });

    // Soumettre le formulaire - utiliser une requête plus flexible
    const submitButton = screen.getByRole('button', {
      name: (content) => /create group/i.test(content) || /creategroup/i.test(content)
    });
    fireEvent.click(submitButton);

    // Vérifier que toast a été appelé avec un message d'erreur
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive',
      }));
    });
  });
});
