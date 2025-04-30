import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserAchievements from '../components/UserAchievements';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  getUserAchievements, 
  getUserLevel, 
  checkAndAwardAchievements
} from '../services/gamificationService';

// Mock des hooks et services
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('../services/gamificationService', () => ({
  getUserAchievements: vi.fn(),
  getUserLevel: vi.fn(),
  checkAndAwardAchievements: vi.fn()
}));

describe('UserAchievements', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockToast = { toast: vi.fn() };
  
  const mockAchievements = [
    {
      id: 'achievement-1',
      name: 'Premier pas',
      description: 'Créez votre premier groupe de tontine',
      icon: 'star',
      points: 100,
      category: 'beginner'
    },
    {
      id: 'achievement-2',
      name: 'Épargnant régulier',
      description: 'Effectuez 5 contributions consécutives à temps',
      icon: 'medal',
      points: 200,
      category: 'intermediate'
    }
  ];
  
  const mockUserLevel = {
    level: 3,
    points: 450,
    next_level_points: 900,
    progress_percentage: 50
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des hooks
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useToast as any).mockReturnValue(mockToast);
    
    // Mock des services
    (getUserAchievements as any).mockResolvedValue({ 
      success: true, 
      data: mockAchievements.map(a => ({ achievements: a }))
    });
    (getUserLevel as any).mockResolvedValue({ success: true, data: mockUserLevel });
    (checkAndAwardAchievements as any).mockResolvedValue({ success: true, data: [] });
  });
  
  it('should render the achievements component', async () => {
    render(<UserAchievements />);
    
    // Vérifier que le titre est affiché
    expect(screen.getByText('Réalisations et Niveau')).toBeInTheDocument();
    
    // Vérifier que les onglets sont affichés
    expect(screen.getByText('Toutes')).toBeInTheDocument();
    expect(screen.getByText('Débutant')).toBeInTheDocument();
    expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
    expect(screen.getByText('Avancé')).toBeInTheDocument();
    
    // Vérifier que le niveau est affiché
    await waitFor(() => {
      expect(screen.getByText('Niveau 3')).toBeInTheDocument();
      expect(screen.getByText('450 points')).toBeInTheDocument();
    });
    
    // Vérifier que les réalisations sont chargées
    await waitFor(() => {
      expect(getUserAchievements).toHaveBeenCalledWith(mockUser.id);
      expect(getUserLevel).toHaveBeenCalledWith(mockUser.id);
    });
    
    // Vérifier que les réalisations sont affichées
    await waitFor(() => {
      expect(screen.getByText('Premier pas')).toBeInTheDocument();
      expect(screen.getByText('Épargnant régulier')).toBeInTheDocument();
    });
  });
  
  it('should filter achievements by category', async () => {
    render(<UserAchievements />);
    
    // Attendre que les réalisations soient chargées
    await waitFor(() => {
      expect(screen.getByText('Premier pas')).toBeInTheDocument();
      expect(screen.getByText('Épargnant régulier')).toBeInTheDocument();
    });
    
    // Cliquer sur l'onglet "Débutant"
    fireEvent.click(screen.getByText('Débutant'));
    
    // Vérifier que seules les réalisations de débutant sont affichées
    await waitFor(() => {
      expect(screen.getByText('Premier pas')).toBeInTheDocument();
      expect(screen.queryByText('Épargnant régulier')).not.toBeInTheDocument();
    });
    
    // Cliquer sur l'onglet "Intermédiaire"
    fireEvent.click(screen.getByText('Intermédiaire'));
    
    // Vérifier que seules les réalisations intermédiaires sont affichées
    await waitFor(() => {
      expect(screen.queryByText('Premier pas')).not.toBeInTheDocument();
      expect(screen.getByText('Épargnant régulier')).toBeInTheDocument();
    });
  });
  
  it('should check for new achievements', async () => {
    // Simuler une nouvelle réalisation
    const newAchievement = {
      id: 'achievement-3',
      name: 'Réseau social',
      description: 'Invitez 3 amis à rejoindre un groupe',
      icon: 'users',
      points: 150,
      category: 'beginner'
    };
    
    (checkAndAwardAchievements as any).mockResolvedValue({ 
      success: true, 
      data: [newAchievement]
    });
    
    render(<UserAchievements />);
    
    // Vérifier que les nouvelles réalisations sont vérifiées
    await waitFor(() => {
      expect(checkAndAwardAchievements).toHaveBeenCalledWith(mockUser.id);
    });
    
    // Vérifier que le toast est affiché pour la nouvelle réalisation
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Nouvelle réalisation !",
        description: `Vous avez débloqué "Réseau social" (+150 points)`,
      });
    });
    
    // Vérifier que le niveau est rechargé
    await waitFor(() => {
      // La première fois pour le chargement initial
      // La deuxième fois après avoir obtenu une nouvelle réalisation
      expect(getUserLevel).toHaveBeenCalledTimes(2);
    });
  });
  
  it('should display progress towards next level', async () => {
    render(<UserAchievements />);
    
    // Vérifier que la progression est affichée
    await waitFor(() => {
      expect(screen.getByText('50% vers niveau 4')).toBeInTheDocument();
      expect(screen.getByText('450 points restants pour le niveau 4')).toBeInTheDocument();
    });
  });
  
  it('should display total achievements and points', async () => {
    render(<UserAchievements />);
    
    // Vérifier que le total des réalisations et des points est affiché
    await waitFor(() => {
      expect(screen.getByText('Total: 2 réalisations débloquées')).toBeInTheDocument();
      expect(screen.getByText('300 points gagnés')).toBeInTheDocument();
    });
  });
  
  it('should display a message when no achievements are found', async () => {
    // Simuler aucune réalisation
    (getUserAchievements as any).mockResolvedValue({ success: true, data: [] });
    
    render(<UserAchievements />);
    
    // Vérifier que le message est affiché
    await waitFor(() => {
      expect(screen.getByText('Aucune réalisation dans cette catégorie')).toBeInTheDocument();
      expect(screen.getByText('Continuez à utiliser l\'application pour en débloquer !')).toBeInTheDocument();
    });
  });
});
