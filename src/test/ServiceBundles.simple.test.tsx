import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceBundles from '../components/ServiceBundles';
import { getServiceBundles } from '../services/recommendationService';

// Mock des services
vi.mock('../services/recommendationService', () => ({
  getServiceBundles: vi.fn()
}));

// Mock des hooks
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

vi.mock('../contexts/AppContext', () => ({
  useApp: vi.fn(() => ({
    formatAmount: (amount: number) => `${amount.toFixed(2)} €`
  }))
}));

describe('ServiceBundles Simple Test', () => {
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
      bundle_items: []
    }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders loading state correctly', () => {
    (getServiceBundles as any).mockReturnValue(new Promise(() => {})); // Promise qui ne se résout jamais
    
    render(<ServiceBundles />);
    
    expect(screen.getByText('Offres groupées')).toBeInTheDocument();
  });
  
  it('renders bundles correctly', async () => {
    (getServiceBundles as any).mockResolvedValue({
      success: true,
      data: mockBundles
    });
    
    render(<ServiceBundles />);
    
    await waitFor(() => {
      expect(screen.getByText('Pack Premium + Assurance')).toBeInTheDocument();
    });
    
    expect(screen.getByText('20% de remise')).toBeInTheDocument();
    expect(screen.getByText('Abonnez-vous à Premium et bénéficiez d\'une remise sur l\'Assurance Tontine')).toBeInTheDocument();
  });
});
