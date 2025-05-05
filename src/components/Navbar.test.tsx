import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock des hooks et contextes
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    t: (key: string) => key, // Simple traduction qui retourne la clé
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signOut: vi.fn((callback) => {
      if (callback) callback();
      return Promise.resolve();
    }),
    user: { id: 'user-123' },
  }),
}));

// Mock des composants utilisés dans Navbar
vi.mock('./ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('./SettingsModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="settings-modal">Settings Modal <button onClick={onClose}>Close</button></div> : null
  ),
}));

vi.mock('./PaymentModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="payment-modal">Payment Modal <button onClick={onClose}>Close</button></div> : null
  ),
}));

// Mock de useNavigate et useLocation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with all navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Vérifier que le logo est présent
    expect(screen.getByText('Naat')).toBeInTheDocument();

    // Vérifier que les liens de navigation sont présents
    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.getByText('myGroups')).toBeInTheDocument();
    expect(screen.getByText('profile')).toBeInTheDocument();
    expect(screen.getByText('Cycles')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Statistiques')).toBeInTheDocument();
    expect(screen.getByText('premium')).toBeInTheDocument();

    // Vérifier que le composant ThemeToggle est présent
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('opens settings modal when settings button is clicked', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Trouver le bouton des paramètres et cliquer dessus
    const settingsButtons = screen.getAllByRole('button', { name: '' });
    const settingsButton = settingsButtons.find(button =>
      button.innerHTML.includes('Settings')
    );

    if (settingsButton) {
      fireEvent.click(settingsButton);
    } else {
      throw new Error('Settings button not found');
    }

    // Vérifier que le modal des paramètres est ouvert
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument();

    // Fermer le modal
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
  });

  it('opens payment modal when deposit/withdraw button is clicked', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Trouver le bouton de dépôt/retrait et cliquer dessus
    const depositButton = screen.getByText('depositWithdraw');
    fireEvent.click(depositButton);

    // Vérifier que le modal de paiement est ouvert
    expect(screen.getByTestId('payment-modal')).toBeInTheDocument();

    // Fermer le modal
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument();
  });

  it('navigates to premium page when premium button is clicked', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Trouver le bouton premium et cliquer dessus
    const premiumButton = screen.getByText('premium');
    fireEvent.click(premiumButton);

    // Vérifier que la navigation a été appelée avec le bon chemin
    expect(mockNavigate).toHaveBeenCalledWith('/premium');
  });

  it('toggles mobile menu when menu button is clicked', () => {
    // Simuler un écran mobile
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Trouver le bouton de menu mobile
    const menuButton = screen.getByRole('button', { name: 'Open main menu' });

    // Vérifier que le menu mobile est initialement fermé
    expect(screen.queryByText('signOut')).not.toBeInTheDocument();

    // Ouvrir le menu mobile
    fireEvent.click(menuButton);

    // Vérifier que le menu mobile est maintenant ouvert
    expect(screen.getByText('signOut')).toBeInTheDocument();

    // Fermer le menu mobile
    fireEvent.click(menuButton);

    // Vérifier que le menu mobile est à nouveau fermé
    expect(screen.queryByText('signOut')).not.toBeInTheDocument();
  });

  it('calls signOut when logout button is clicked', () => {
    const { signOut } = useAuth();

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Trouver le bouton de déconnexion et cliquer dessus
    const logoutButtons = screen.getAllByRole('button', { name: '' });
    const logoutButton = logoutButtons.find(button =>
      button.innerHTML.includes('LogOut')
    );

    if (logoutButton) {
      fireEvent.click(logoutButton);
    } else {
      throw new Error('Logout button not found');
    }

    // Vérifier que la fonction signOut a été appelée
    expect(signOut).toHaveBeenCalled();
  });
});
