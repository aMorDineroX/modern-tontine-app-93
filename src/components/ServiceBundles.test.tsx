import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceBundles from './ServiceBundles';
import { getServiceBundles } from '@/services/recommendationService';
import { renderWithProviders } from '@/test/accessibility-test-utils';

// Création d'un mock pour useToast
const mockToast = vi.fn();

// Mock des services
vi.mock('@/services/recommendationService', () => ({
  getServiceBundles: vi.fn()
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

describe('ServiceBundles', () => {
  const mockBundles = [
    {
      id: 1,
      name: 'Pack Premium + Assurance',
      description: 'Abonnez-vous à Premium et bénéficiez d\'une remise sur l\'Assurance Tontine',
      service_id: 1,
      discount_percentage: 20,
      is_active: true,
      services: {
        id: 1,
        name: 'Premium',
        description: 'Service premium avec fonctionnalités avancées',
        icon: 'crown',
        price: 9.99,
        currency: 'EUR',
        is_recurring: true,
        recurring_interval: 'month'
      },
      bundle_items: [
        {
          service_id: 2,
          services: {
            id: 2,
            name: 'Assurance Tontine',
            description: 'Protection contre les défauts de paiement',
            icon: 'shield',
            price: 4.99,
            currency: 'EUR',
            is_recurring: true,
            recurring_interval: 'month'
          }
        }
      ]
    },
    {
      id: 2,
      name: 'Pack Analyse Complète',
      description: 'Analyse Financière avec Consultation Financière à prix réduit',
      service_id: 3,
      discount_percentage: 15,
      is_active: true,
      services: {
        id: 3,
        name: 'Analyse Financière',
        description: 'Rapports détaillés sur vos finances',
        icon: 'chart-bar',
        price: 2.99,
        currency: 'EUR',
        is_recurring: true,
        recurring_interval: 'month'
      },
      bundle_items: [
        {
          service_id: 5,
          services: {
            id: 5,
            name: 'Consultation Financière',
            description: 'Session de 30 minutes avec un conseiller financier',
            icon: 'user',
            price: 29.99,
            currency: 'EUR',
            is_recurring: false,
            recurring_interval: null
          }
        }
      ]
    }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders loading state correctly', () => {
    (getServiceBundles as any).mockReturnValue(new Promise(() => {})); // Promise qui ne se résout jamais
    
    render(<ServiceBundles />);
    
    expect(screen.getByText('Offres groupées')).toBeInTheDocument();
    // Vérifie la présence des éléments de chargement mais sans data-testid spécifique
    expect(screen.getAllByText(/Chargement/i)).toBeTruthy();
  });
  
  it('renders bundles correctly', async () => {
    (getServiceBundles as any).mockResolvedValue({
      success: true,
      data: mockBundles
    });
    
    render(<ServiceBundles />);
    
    await waitFor(() => {
      expect(screen.getByText('Pack Premium + Assurance')).toBeInTheDocument();
      expect(screen.getByText('Pack Analyse Complète')).toBeInTheDocument();
    });
    
    expect(screen.getByText('20% de remise')).toBeInTheDocument();
    expect(screen.getByText('15% de remise')).toBeInTheDocument();
    
    expect(screen.getByText('Abonnez-vous à Premium et bénéficiez d\'une remise sur l\'Assurance Tontine')).toBeInTheDocument();
    expect(screen.getByText('Analyse Financière avec Consultation Financière à prix réduit')).toBeInTheDocument();
  });
  
  it('expands accordion to show services', async () => {
    (getServiceBundles as any).mockResolvedValue({
      success: true,
      data: mockBundles
    });
    
    render(<ServiceBundles />);
    
    await waitFor(() => {
      expect(screen.getByText('Pack Premium + Assurance')).toBeInTheDocument();
    });
    
    // Cliquer sur l'accordéon pour afficher les services
    fireEvent.click(screen.getAllByText('Services inclus')[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Assurance Tontine')).toBeInTheDocument();
    });
  });
  
  it('handles bundle click correctly', async () => {
    (getServiceBundles as any).mockResolvedValue({
      success: true,
      data: mockBundles
    });
    
    const mockOnBundleClick = vi.fn();
    
    render(<ServiceBundles onBundleClick={mockOnBundleClick} />);
    
    await waitFor(() => {
      expect(screen.getByText('Pack Premium + Assurance')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton "S'abonner à l'offre groupée" du premier bundle
    const buttons = screen.getAllByText('S\'abonner à l\'offre groupée');
    fireEvent.click(buttons[0]);
    
    expect(mockOnBundleClick).toHaveBeenCalledWith(1);
  });
  
  it('renders nothing when there are no bundles', async () => {
    (getServiceBundles as any).mockResolvedValue({
      success: true,
      data: []
    });
    
    const { container } = render(<ServiceBundles />);
    
    await waitFor(() => {
      expect(getServiceBundles).toHaveBeenCalled();
    });
    
    expect(container.firstChild).toBeNull();
  });
  
  it('handles error correctly', async () => {
    (getServiceBundles as any).mockResolvedValue({
      success: false,
      error: new Error('Test error')
    });
    
    render(<ServiceBundles />);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erreur",
        description: "Impossible de charger les offres groupées",
        variant: "destructive",
      });
    });
  });
});
