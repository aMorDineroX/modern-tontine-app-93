import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceRecommendations from './ServiceRecommendations';
import { getUserServiceRecommendations } from '@/services/recommendationService';
import { renderWithProviders } from '@/test/accessibility-test-utils';

// Création d'un mock pour useToast
const mockToast = vi.fn();

// Mock des services
vi.mock('@/services/recommendationService', () => ({
  getUserServiceRecommendations: vi.fn(),
  getRecommendationReasonText: (reason: string) => {
    switch (reason) {
      case 'history':
        return 'Basé sur votre historique';
      case 'similar_users':
        return 'Les utilisateurs similaires aiment aussi';
      case 'popular':
        return 'Populaire auprès des utilisateurs';
      case 'bundle':
        return 'Offre groupée avec remise';
      default:
        return 'Recommandé pour vous';
    }
  }
}));

// Mock des hooks
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

vi.mock('@/contexts/AppContext', () => ({
  useApp: vi.fn(() => ({
    formatAmount: (amount: number) => `${amount.toFixed(2)} €`
  }))
}));

// Mock du composant Card pour éviter le problème avec data-testid="skeleton"
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardFooter: ({ children }: any) => <div data-testid="card-footer">{children}</div>,
}));

// Mock du composant Skeleton pour résoudre le problème avec data-testid="skeleton"
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className}></div>,
}));

describe('ServiceRecommendations', () => {
  const mockRecommendations = [
    {
      service_id: 1,
      service_name: 'Premium',
      service_description: 'Service premium avec fonctionnalités avancées',
      service_icon: 'crown',
      service_price: 9.99,
      service_currency: 'EUR',
      service_is_recurring: true,
      service_recurring_interval: 'month',
      recommendation_score: 85,
      recommendation_reason: 'history'
    },
    {
      service_id: 2,
      service_name: 'Assurance Tontine',
      service_description: 'Protection contre les défauts de paiement',
      service_icon: 'shield',
      service_price: 4.99,
      service_currency: 'EUR',
      service_is_recurring: true,
      service_recurring_interval: 'month',
      recommendation_score: 75,
      recommendation_reason: 'similar_users'
    },
    {
      service_id: 3,
      service_name: 'Analyse Financière',
      service_description: 'Rapports détaillés sur vos finances',
      service_icon: 'chart-bar',
      service_price: 2.99,
      service_currency: 'EUR',
      service_is_recurring: true,
      service_recurring_interval: 'month',
      recommendation_score: 65,
      recommendation_reason: 'popular'
    }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders loading state correctly', () => {
    (getUserServiceRecommendations as any).mockReturnValue(new Promise(() => {})); // Promise qui ne se résout jamais
    
    render(<ServiceRecommendations />);
    
    expect(screen.getByText('Recommandations pour vous')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3); // 3 skeletons pour 3 recommandations
  });
  
  it('renders recommendations correctly', async () => {
    (getUserServiceRecommendations as any).mockResolvedValue({
      success: true,
      data: mockRecommendations
    });
    
    render(<ServiceRecommendations />);
    
    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Assurance Tontine')).toBeInTheDocument();
      expect(screen.getByText('Analyse Financière')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Basé sur votre historique')).toBeInTheDocument();
    expect(screen.getByText('Les utilisateurs similaires aiment aussi')).toBeInTheDocument();
    expect(screen.getByText('Populaire auprès des utilisateurs')).toBeInTheDocument();
    
    expect(screen.getByText('9.99 €')).toBeInTheDocument();
    expect(screen.getByText('4.99 €')).toBeInTheDocument();
    expect(screen.getByText('2.99 €')).toBeInTheDocument();
  });
  
  it('handles service click correctly', async () => {
    (getUserServiceRecommendations as any).mockResolvedValue({
      success: true,
      data: mockRecommendations
    });
    
    const mockOnServiceClick = vi.fn();
    
    render(<ServiceRecommendations onServiceClick={mockOnServiceClick} />);
    
    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton "Voir les détails" du premier service
    const buttons = screen.getAllByText('Voir les détails');
    fireEvent.click(buttons[0]);
    
    expect(mockOnServiceClick).toHaveBeenCalledWith(1);
  });
  
  it('renders nothing when there are no recommendations', async () => {
    (getUserServiceRecommendations as any).mockResolvedValue({
      success: true,
      data: []
    });
    
    const { container } = render(<ServiceRecommendations />);
    
    await waitFor(() => {
      expect(getUserServiceRecommendations).toHaveBeenCalled();
    });
    
    expect(container.firstChild).toBeNull();
  });
  
  it('handles error correctly', async () => {
    (getUserServiceRecommendations as any).mockResolvedValue({
      success: false,
      error: new Error('Test error')
    });
    
    render(<ServiceRecommendations />);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erreur",
        description: "Impossible de charger les recommandations",
        variant: "destructive",
      });
    });
  });
});
