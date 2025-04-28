import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateGroupModal from './CreateGroupModal';
import { createGroup, addGroupMember } from '@/utils/supabase';

// Mock des hooks et contextes
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    t: (key: string) => key, // Simple traduction qui retourne la clé
    currency: { symbol: '€', code: 'EUR', name: 'Euro' },
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', user_metadata: { full_name: 'Test User' } },
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock des fonctions Supabase
vi.mock('@/utils/supabase', () => ({
  createGroup: vi.fn(),
  addGroupMember: vi.fn(),
}));

describe('CreateGroupModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

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

  it('renders correctly when open', () => {
    render(
      <CreateGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Vérifier que le titre est présent
    expect(screen.getByText('createGroup')).toBeInTheDocument();
    
    // Vérifier que les champs du formulaire sont présents
    expect(screen.getByLabelText('groupName')).toBeInTheDocument();
    expect(screen.getByLabelText(/contributionAmount/)).toBeInTheDocument();
    expect(screen.getByLabelText('contributionFrequency')).toBeInTheDocument();
    expect(screen.getByLabelText('startDate')).toBeInTheDocument();
    expect(screen.getByLabelText('payoutMethod')).toBeInTheDocument();
    expect(screen.getByLabelText('inviteMembers')).toBeInTheDocument();
    
    // Vérifier que le bouton de soumission est présent
    expect(screen.getByRole('button', { name: 'createGroup' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CreateGroupModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Vérifier que le modal n'est pas rendu
    expect(screen.queryByText('createGroup')).not.toBeInTheDocument();
  });

  it('closes when the close button is clicked', () => {
    render(
      <CreateGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Trouver le bouton de fermeture et cliquer dessus
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    // Vérifier que onClose a été appelé
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits the form with correct data', async () => {
    render(
      <CreateGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('groupName'), {
      target: { value: 'Test Group' },
    });
    
    fireEvent.change(screen.getByLabelText(/contributionAmount/), {
      target: { value: '100' },
    });
    
    fireEvent.change(screen.getByLabelText('contributionFrequency'), {
      target: { value: 'monthly' },
    });
    
    fireEvent.change(screen.getByLabelText('startDate'), {
      target: { value: '2023-01-01' },
    });
    
    fireEvent.change(screen.getByLabelText('payoutMethod'), {
      target: { value: 'rotation' },
    });
    
    fireEvent.change(screen.getByLabelText('inviteMembers'), {
      target: { value: 'test1@example.com, test2@example.com' },
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: 'createGroup' }));

    // Vérifier que createGroup a été appelé avec les bonnes données
    await waitFor(() => {
      expect(createGroup).toHaveBeenCalledWith({
        name: 'Test Group',
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
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Group',
        contribution: '100',
        frequency: 'monthly',
        members: 'test1@example.com, test2@example.com',
      });
    });

    // Vérifier que onClose a été appelé
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
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
      <CreateGroupModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Remplir le formulaire minimalement
    fireEvent.change(screen.getByLabelText('groupName'), {
      target: { value: 'Test Group' },
    });
    
    fireEvent.change(screen.getByLabelText(/contributionAmount/), {
      target: { value: '100' },
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: 'createGroup' }));

    // Vérifier que toast a été appelé avec un message d'erreur
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive',
      }));
    });

    // Vérifier que onClose n'a pas été appelé
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
