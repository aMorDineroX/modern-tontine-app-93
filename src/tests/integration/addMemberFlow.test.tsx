import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import GroupDetailPage from '@/pages/GroupDetailPage';
import { getGroupDetails, getGroupMembers, addMemberToGroup } from '@/services/tontineService';
import { supabase } from '@/utils/supabase';
import { useToast } from '@/hooks/use-toast';

// Mock des dépendances
vi.mock('@/services/tontineService', () => ({
  getGroupDetails: vi.fn(),
  getGroupMembers: vi.fn(),
  addMemberToGroup: vi.fn(),
}));

vi.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

// Mock de useParams pour simuler les paramètres d'URL
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({
      id: 'group-123',
    }),
  };
});

describe('Add Member Flow Integration Test', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de useToast
    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
    
    // Mock de getGroupDetails
    (getGroupDetails as any).mockResolvedValue({
      id: 'group-123',
      name: 'Test Group',
      description: 'A test group',
      contribution_amount: 100,
      frequency: 'monthly',
      created_by: 'user-123',
      created_at: new Date().toISOString(),
    });
    
    // Mock de getGroupMembers
    (getGroupMembers as any).mockResolvedValue([
      {
        id: 'member-123',
        group_id: 'group-123',
        user_id: 'user-123',
        role: 'admin',
        status: 'active',
        profiles: {
          full_name: 'Admin User',
          avatar_url: null,
        },
      },
    ]);
    
    // Mock de addMemberToGroup
    (addMemberToGroup as any).mockResolvedValue({
      id: 'member-456',
      group_id: 'group-123',
      user_id: 'user-456',
      role: 'member',
      status: 'pending',
    });
    
    // Mock de supabase.auth.getUser
    (supabase.auth.getUser as any).mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          user_metadata: {
            full_name: 'Admin User',
          },
        },
      },
      error: null,
    });
    
    // Mock de supabase.auth.getSession
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-123',
            email: 'admin@example.com',
            user_metadata: {
              full_name: 'Admin User',
            },
          },
        },
      },
      error: null,
    });
  });
  
  it('should allow adding a new member to a group', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <GroupDetailPage />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que les données du groupe soient chargées
    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
    
    // Vérifier que le bouton d'ajout de membre est présent
    const addMemberButton = screen.getByText('Ajouter un membre');
    expect(addMemberButton).toBeInTheDocument();
    
    // Cliquer sur le bouton d'ajout de membre
    fireEvent.click(addMemberButton);
    
    // Vérifier que le modal d'ajout de membre est ouvert
    await waitFor(() => {
      expect(screen.getByText('Ajouter un nouveau membre')).toBeInTheDocument();
    });
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'newmember@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText('Nom complet'), {
      target: { value: 'New Member' },
    });
    
    // Sélectionner le rôle
    fireEvent.click(screen.getByLabelText('Membre'));
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByText('Ajouter'));
    
    // Vérifier que addMemberToGroup a été appelé avec les bons paramètres
    await waitFor(() => {
      expect(addMemberToGroup).toHaveBeenCalledWith({
        group_id: 'group-123',
        user_id: expect.any(String), // L'ID sera généré
        email: 'newmember@example.com',
        full_name: 'New Member',
        role: 'member',
        status: 'pending',
        invited_by: 'user-123',
      });
    });
    
    // Vérifier que le toast de succès a été affiché
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Membre ajouté',
      description: 'New Member a été ajouté au groupe avec succès.',
      variant: 'default',
    });
    
    // Vérifier que getGroupMembers a été appelé à nouveau pour rafraîchir la liste
    expect(getGroupMembers).toHaveBeenCalledTimes(2);
  });
  
  it('should show an error when adding a member fails', async () => {
    // Configurer addMemberToGroup pour simuler une erreur
    (addMemberToGroup as any).mockRejectedValue(new Error('Failed to add member'));
    
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <GroupDetailPage />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que les données du groupe soient chargées
    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton d'ajout de membre
    fireEvent.click(screen.getByText('Ajouter un membre'));
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'newmember@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText('Nom complet'), {
      target: { value: 'New Member' },
    });
    
    // Sélectionner le rôle
    fireEvent.click(screen.getByLabelText('Membre'));
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByText('Ajouter'));
    
    // Vérifier que le toast d'erreur a été affiché
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout du membre.',
        variant: 'destructive',
      });
    });
  });
  
  it('should validate the form before submission', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <GroupDetailPage />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que les données du groupe soient chargées
    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton d'ajout de membre
    fireEvent.click(screen.getByText('Ajouter un membre'));
    
    // Soumettre le formulaire sans le remplir
    fireEvent.click(screen.getByText('Ajouter'));
    
    // Vérifier que les messages d'erreur sont affichés
    await waitFor(() => {
      expect(screen.getByText('L\'email est requis')).toBeInTheDocument();
      expect(screen.getByText('Le nom complet est requis')).toBeInTheDocument();
    });
    
    // Vérifier que addMemberToGroup n'a pas été appelé
    expect(addMemberToGroup).not.toHaveBeenCalled();
  });
});
