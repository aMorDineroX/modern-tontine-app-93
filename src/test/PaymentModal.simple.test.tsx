import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useApp } from '../contexts/AppContext';

// Mock des dépendances
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('../contexts/AppContext', () => ({
  useApp: vi.fn(),
}));

vi.mock('../components/PayPalButton', () => ({
  default: () => <div data-testid="paypal-button">PayPal Button</div>,
}));

vi.mock('../components/PayPalRecurringPayment', () => ({
  default: () => <div data-testid="paypal-recurring">PayPal Recurring</div>,
}));

// Mock de la fonction de traduction
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('PaymentModal Simple Test', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de useAuth
    (useAuth as any).mockReturnValue({
      user: { id: 'user-123', user_metadata: { full_name: 'Test User' } },
    });

    // Mock de useToast
    (useToast as any).mockReturnValue({
      toast: mockToast,
    });

    // Mock de useApp
    (useApp as any).mockReturnValue({
      formatAmount: (amount: number) => `${amount.toFixed(2)} €`,
      formatDate: (date: Date) => date.toLocaleDateString(),
      formatDateTime: (date: Date) => date.toLocaleString(),
      currency: '€',
      locale: 'fr-FR',
      theme: 'light',
      setTheme: vi.fn(),
    });
  });

  it('renders correctly when open', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Vérifier que le modal est rendu
    expect(screen.getByText(/depositWithdraw/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PaymentModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Vérifier que le modal n'est pas rendu
    expect(screen.queryByText(/depositWithdraw/i)).not.toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Vérifier que l'onglet Dépôt est actif par défaut
    expect(screen.getByText(/Montant du dépôt/i)).toBeInTheDocument();

    // Cliquer sur l'onglet Retrait
    fireEvent.click(screen.getByText(/Retrait/i));

    // Vérifier que le contenu de l'onglet Retrait est affiché
    expect(screen.getByText(/Méthode de retrait/i)).toBeInTheDocument();

    // Cliquer sur l'onglet Récurrent
    fireEvent.click(screen.getByText(/Récurrent/i));

    // Vérifier que le composant PayPalRecurringPayment est affiché
    expect(screen.getByTestId('paypal-recurring')).toBeInTheDocument();
  });
});
