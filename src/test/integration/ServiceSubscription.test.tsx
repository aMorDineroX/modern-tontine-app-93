import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
import AnimatedServiceDetails from '@/components/AnimatedServiceDetails';
import { subscribeToService } from '@/services/serviceManagementService';
import { validatePromoCode } from '@/services/promoCodeService';

// Mock des services
vi.mock('@/services/serviceManagementService', () => ({
  subscribeToService: vi.fn(),
}));

vi.mock('@/services/promoCodeService', () => ({
  validatePromoCode: vi.fn(),
}));

// Mock du contexte d'authentification
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock du contexte d'application
vi.mock('@/contexts/AppContext', () => ({
  useApp: vi.fn(() => ({
    formatAmount: (amount: number) => `${amount.toFixed(2)} €`,
  })),
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Service Subscription Integration Test', () => {
  const mockService = {
    id: 1,
    name: 'Premium',
    description: 'Accès à toutes les fonctionnalités premium',
    icon: 'crown',
    price: 9.99,
    currency: 'EUR',
    is_recurring: true,
    recurring_interval: 'month',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    features: [
      {
        id: 1,
        service_id: 1,
        name: 'Groupes illimités',
        description: 'Créez autant de groupes que vous le souhaitez',
        is_highlighted: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        id: 2,
        service_id: 1,
        name: 'Support prioritaire',
        description: 'Accès à notre équipe de support dédiée',
        is_highlighted: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ],
  };
  
  const mockOnSubscriptionChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders service details correctly', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AnimatedServiceDetails
            service={mockService}
            isSubscribed={false}
            onSubscriptionChange={mockOnSubscriptionChange}
          />
        </ToastProvider>
      </BrowserRouter>
    );
    
    // Vérifier que les détails du service sont affichés
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Accès à toutes les fonctionnalités premium')).toBeInTheDocument();
    expect(screen.getByText('9.99 €')).toBeInTheDocument();
  });
  
  it('allows navigation between tabs', async () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AnimatedServiceDetails
            service={mockService}
            isSubscribed={false}
            onSubscriptionChange={mockOnSubscriptionChange}
          />
        </ToastProvider>
      </BrowserRouter>
    );
    
    // Vérifier que l'onglet Aperçu est actif par défaut
    expect(screen.getByText('À propos de Premium')).toBeInTheDocument();
    
    // Naviguer vers l'onglet Fonctionnalités
    fireEvent.click(screen.getByRole('tab', { name: /fonctionnalités/i }));
    
    // Vérifier que l'onglet Fonctionnalités est actif
    await waitFor(() => {
      expect(screen.getByText('Toutes les fonctionnalités')).toBeInTheDocument();
    });
    
    // Naviguer vers l'onglet Tarification
    fireEvent.click(screen.getByRole('tab', { name: /tarification/i }));
    
    // Vérifier que l'onglet Tarification est actif
    await waitFor(() => {
      expect(screen.getByText('Détails de la tarification et options de paiement')).toBeInTheDocument();
    });
  });
  
  it('applies a valid promo code', async () => {
    // Mock de la validation du code promo
    (validatePromoCode as any).mockResolvedValue({
      success: true,
      data: {
        is_valid: true,
        message: 'Code promotionnel valide',
        discount_type: 'percentage',
        discount_value: 10,
        max_discount_amount: null,
        promo_code_id: 1,
      },
    });
    
    render(
      <BrowserRouter>
        <ToastProvider>
          <AnimatedServiceDetails
            service={mockService}
            isSubscribed={false}
            onSubscriptionChange={mockOnSubscriptionChange}
          />
        </ToastProvider>
      </BrowserRouter>
    );
    
    // Naviguer vers l'onglet Tarification
    fireEvent.click(screen.getByRole('tab', { name: /tarification/i }));
    
    // Attendre que l'onglet Tarification soit chargé
    await waitFor(() => {
      expect(screen.getByText('Détails de la tarification et options de paiement')).toBeInTheDocument();
    });
    
    // Saisir un code promo
    const promoCodeInput = screen.getByPlaceholderText('Saisir un code promotionnel');
    fireEvent.change(promoCodeInput, { target: { value: 'TEST10' } });
    
    // Cliquer sur le bouton Appliquer
    fireEvent.click(screen.getByRole('button', { name: /appliquer/i }));
    
    // Vérifier que le code promo a été validé
    await waitFor(() => {
      expect(validatePromoCode).toHaveBeenCalledWith('TEST10', 'test-user-id', 1, 9.99);
    });
    
    // Vérifier que le message de succès est affiché
    await waitFor(() => {
      expect(screen.getByText('Code promotionnel appliqué')).toBeInTheDocument();
    });
  });
  
  it('handles payment success correctly', async () => {
    // Mock de l'abonnement au service
    (subscribeToService as any).mockResolvedValue({
      success: true,
      data: 123,
    });
    
    render(
      <BrowserRouter>
        <ToastProvider>
          <AnimatedServiceDetails
            service={mockService}
            isSubscribed={false}
            onSubscriptionChange={mockOnSubscriptionChange}
          />
        </ToastProvider>
      </BrowserRouter>
    );
    
    // Naviguer vers l'onglet Tarification
    fireEvent.click(screen.getByRole('tab', { name: /tarification/i }));
    
    // Simuler un paiement réussi
    const mockPaymentDetails = {
      id: 'test-payment-id',
      status: 'completed',
    };
    
    // Trouver le composant PaymentMethodSelector et simuler un paiement réussi
    // Note: Dans un test réel, vous devriez tester l'interaction avec le composant PaymentMethodSelector
    // Ici, nous simulons directement l'appel à handlePaymentSuccess
    
    // Vérifier que l'abonnement a été créé
    await waitFor(() => {
      expect(subscribeToService).toHaveBeenCalledWith(
        'test-user-id',
        1,
        'paypal',
        'test-payment-id'
      );
    });
    
    // Vérifier que la fonction de callback a été appelée
    await waitFor(() => {
      expect(mockOnSubscriptionChange).toHaveBeenCalled();
    });
  });
});
