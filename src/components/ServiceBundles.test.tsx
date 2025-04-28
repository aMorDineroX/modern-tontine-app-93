import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceBundles from './ServiceBundles';
import { getServiceBundles } from '@/services/recommendationService';

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
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

vi.mock('@/contexts/AppContext', () => ({
  useApp: vi.fn(() => ({
    formatAmount: (amount: number) => `${amount.toFixed(2)} €`
  }))
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
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3); // 3 skeletons pour 3 bundles
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
    
    const { toast } = useToast() as any;
    
    render(<ServiceBundles />);
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Erreur",
        description: "Impossible de charger les offres groupées",
        variant: "destructive",
      });
    });
  });
});
