import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import WalletPage from '@/pages/WalletPage';
import { processPayment } from '@/utils/supabase';
import { savePayPalTransaction } from '@/services/paypalService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/utils/supabase';

// Mock des dépendances
vi.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
  processPayment: vi.fn(),
}));

vi.mock('@/services/paypalService', () => ({
  savePayPalTransaction: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

// Mock des composants PayPal
vi.mock('@/components/PayPalButton', () => ({
  default: ({ onSuccess }) => (
    <button 
      data-testid="paypal-button"
      onClick={() => onSuccess({ 
        paymentID: 'test-payment-id', 
        orderID: 'test-order-id' 
      })}
    >
      PayPal Button
    </button>
  ),
}));

vi.mock('@/components/PayPalRecurringPayment', () => ({
  default: ({ onSuccess }) => (
    <button 
      data-testid="paypal-recurring-button"
      onClick={() => onSuccess({ amount: 10 })}
    >
      PayPal Recurring Button
    </button>
  ),
}));

describe('Payment Flow Integration Test', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de useToast
    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
    
    // Mock de processPayment
    (processPayment as any).mockResolvedValue({
      success: true,
      error: null,
    });
    
    // Mock de savePayPalTransaction
    (savePayPalTransaction as any).mockResolvedValue({});
    
    // Mock de supabase.auth.getUser
    (supabase.auth.getUser as any).mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          user_metadata: {
            full_name: 'Test User',
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
            email: 'user@example.com',
            user_metadata: {
              full_name: 'Test User',
            },
          },
        },
      },
      error: null,
    });
    
    // Mock de supabase.from pour les transactions
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          data: [
            {
              id: 'transaction-1',
              user_id: 'user-123',
              amount: 100,
              type: 'deposit',
              status: 'completed',
              created_at: new Date().toISOString(),
            },
            {
              id: 'transaction-2',
              user_id: 'user-123',
              amount: 50,
              type: 'withdrawal',
              status: 'completed',
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
      }),
    });
    
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'transactions') {
        return {
          select: mockSelect,
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });
  });
  
  it('should process a card payment successfully', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <WalletPage />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que la page soit chargée
    await waitFor(() => {
      expect(screen.getByText('Mon portefeuille')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de dépôt
    fireEvent.click(screen.getByText('Déposer'));
    
    // Vérifier que le modal de paiement est ouvert
    await waitFor(() => {
      expect(screen.getByText('Montant du dépôt')).toBeInTheDocument();
    });
    
    // Saisir un montant
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '100' },
    });
    
    // Sélectionner la méthode Carte bancaire
    fireEvent.click(screen.getByText('Carte bancaire'));
    
    // Cliquer sur le bouton de paiement
    fireEvent.click(screen.getByText('Payer par carte'));
    
    // Vérifier que processPayment a été appelé avec les bons paramètres
    await waitFor(() => {
      expect(processPayment).toHaveBeenCalledWith(
        'user-123',
        100,
        'deposit'
      );
    });
    
    // Vérifier que le toast de succès a été affiché
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Dépôt réussi',
      description: 'Dépôt de €100.00',
      variant: 'default',
    });
    
    // Vérifier que l'écran de succès est affiché
    expect(screen.getByText('Dépôt réussi!')).toBeInTheDocument();
  });
  
  it('should process a PayPal payment successfully', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <WalletPage />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que la page soit chargée
    await waitFor(() => {
      expect(screen.getByText('Mon portefeuille')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de dépôt
    fireEvent.click(screen.getByText('Déposer'));
    
    // Vérifier que le modal de paiement est ouvert
    await waitFor(() => {
      expect(screen.getByText('Montant du dépôt')).toBeInTheDocument();
    });
    
    // Saisir un montant
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '100' },
    });
    
    // Sélectionner la méthode PayPal
    fireEvent.click(screen.getByText('PayPal'));
    
    // Vérifier que le bouton PayPal est affiché
    expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
    
    // Cliquer sur le bouton PayPal
    fireEvent.click(screen.getByTestId('paypal-button'));
    
    // Vérifier que savePayPalTransaction a été appelé
    await waitFor(() => {
      expect(savePayPalTransaction).toHaveBeenCalledWith({
        user_id: 'user-123',
        transaction_id: 'test-payment-id',
        order_id: 'test-order-id',
        amount: 100,
        currency: expect.any(Object),
        status: 'completed',
        type: 'payment',
        description: 'Dépôt sur votre compte Naat',
        metadata: { details: { paymentID: 'test-payment-id', orderID: 'test-order-id' } },
      });
    });
    
    // Vérifier que l'écran de succès est affiché
    expect(screen.getByText('Dépôt réussi!')).toBeInTheDocument();
  });
  
  it('should process a recurring payment successfully', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <WalletPage />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que la page soit chargée
    await waitFor(() => {
      expect(screen.getByText('Mon portefeuille')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de dépôt
    fireEvent.click(screen.getByText('Déposer'));
    
    // Vérifier que le modal de paiement est ouvert
    await waitFor(() => {
      expect(screen.getByText('Montant du dépôt')).toBeInTheDocument();
    });
    
    // Cliquer sur l'onglet Récurrent
    fireEvent.click(screen.getByText('Récurrent'));
    
    // Vérifier que le composant PayPalRecurringPayment est affiché
    expect(screen.getByTestId('paypal-recurring-button')).toBeInTheDocument();
    
    // Cliquer sur le bouton PayPal Recurring
    fireEvent.click(screen.getByTestId('paypal-recurring-button'));
    
    // Vérifier que l'écran de succès est affiché
    await waitFor(() => {
      expect(screen.getByText('Dépôt réussi!')).toBeInTheDocument();
    });
  });
  
  it('should handle payment errors', async () => {
    // Configurer processPayment pour simuler une erreur
    (processPayment as any).mockResolvedValue({
      success: false,
      error: new Error('Payment failed'),
    });
    
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <WalletPage />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que la page soit chargée
    await waitFor(() => {
      expect(screen.getByText('Mon portefeuille')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de dépôt
    fireEvent.click(screen.getByText('Déposer'));
    
    // Saisir un montant
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '100' },
    });
    
    // Sélectionner la méthode Carte bancaire
    fireEvent.click(screen.getByText('Carte bancaire'));
    
    // Cliquer sur le bouton de paiement
    fireEvent.click(screen.getByText('Payer par carte'));
    
    // Vérifier que le toast d'erreur a été affiché
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Échec du paiement',
        description: 'Une erreur s\'est produite lors de la transaction',
        variant: 'destructive',
      });
    });
    
    // Vérifier que l'écran de succès n'est pas affiché
    expect(screen.queryByText('Dépôt réussi!')).not.toBeInTheDocument();
  });
  
  it('should validate input before processing payment', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <WalletPage />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    );
    
    // Attendre que la page soit chargée
    await waitFor(() => {
      expect(screen.getByText('Mon portefeuille')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de dépôt
    fireEvent.click(screen.getByText('Déposer'));
    
    // Cliquer sur le bouton de paiement sans saisir de montant ni sélectionner de méthode
    fireEvent.click(screen.getByText('Payer par carte'));
    
    // Vérifier que le toast d'erreur de montant a été affiché
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Montant invalide',
      description: 'Veuillez entrer un montant valide supérieur à 0',
      variant: 'destructive',
    });
    
    // Saisir un montant mais ne pas sélectionner de méthode
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '100' },
    });
    
    // Cliquer sur le bouton de paiement
    fireEvent.click(screen.getByText('Payer par carte'));
    
    // Vérifier que le toast d'erreur de méthode a été affiché
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Méthode de paiement requise',
      description: 'Veuillez sélectionner une méthode de paiement',
      variant: 'destructive',
    });
    
    // Vérifier que processPayment n'a pas été appelé
    expect(processPayment).not.toHaveBeenCalled();
  });
});
