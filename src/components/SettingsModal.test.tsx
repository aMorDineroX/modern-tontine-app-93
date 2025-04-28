import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsModal from './SettingsModal';
import { useApp } from '@/contexts/AppContext';

// Mock des dépendances
vi.mock('@/contexts/AppContext', () => ({
  useApp: vi.fn(),
}));

vi.mock('./LanguageCurrencySelector', () => ({
  default: ({ type }: { type: string }) => (
    <div data-testid={`${type}-selector`}>
      {type === 'language' ? 'Language Selector' : 'Currency Selector'}
    </div>
  ),
}));

describe('SettingsModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de useApp
    (useApp as any).mockReturnValue({
      t: (key: string) => key,
      isDarkMode: false,
      setIsDarkMode: vi.fn(),
    });

    // Mock de document.body.style
    Object.defineProperty(document.body.style, 'overflow', {
      value: '',
      writable: true,
    });
  });

  it('renders correctly when open', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Vérifier que le titre est présent
    expect(screen.getByText('settings')).toBeInTheDocument();

    // Vérifier que les sélecteurs sont présents
    expect(screen.getByText('language')).toBeInTheDocument();
    expect(screen.getByText('currency')).toBeInTheDocument();
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    expect(screen.getByTestId('currency-selector')).toBeInTheDocument();

    // Vérifier que le bouton de mode sombre est présent
    expect(screen.getByText('lightMode')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle dark mode' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <SettingsModal
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    // Vérifier que le modal n'est pas rendu
    expect(screen.queryByText('settings')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Cliquer sur le bouton de fermeture
    fireEvent.click(screen.getByRole('button', { name: '' }));

    // Vérifier que onClose a été appelé
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Cliquer sur l'arrière-plan
    fireEvent.click(document.querySelector('.fixed.inset-0.bg-black\\/30')!);

    // Vérifier que onClose a été appelé
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('toggles dark mode when the toggle button is clicked', () => {
    const setIsDarkModeMock = vi.fn();

    // Mock de useApp avec isDarkMode = false
    (useApp as any).mockReturnValue({
      t: (key: string) => key,
      isDarkMode: false,
      setIsDarkMode: setIsDarkModeMock,
    });

    const { unmount } = render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Vérifier que le texte du mode clair est affiché
    expect(screen.getByText('lightMode')).toBeInTheDocument();

    // Cliquer sur le bouton de basculement
    fireEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }));

    // Vérifier que setIsDarkMode a été appelé avec true
    expect(setIsDarkModeMock).toHaveBeenCalledWith(true);

    // Nettoyer le premier rendu
    unmount();

    // Changer le mock pour simuler le mode sombre
    (useApp as any).mockReturnValue({
      t: (key: string) => key,
      isDarkMode: true,
      setIsDarkMode: setIsDarkModeMock,
    });

    // Re-render le composant
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Vérifier que le texte du mode sombre est affiché
    expect(screen.getByText('darkMode')).toBeInTheDocument();

    // Cliquer sur le bouton de basculement
    fireEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }));

    // Vérifier que setIsDarkMode a été appelé avec false
    expect(setIsDarkModeMock).toHaveBeenCalledWith(false);
  });

  it('sets body overflow to hidden when open', () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Vérifier que overflow est défini sur hidden
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { unmount } = render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Vérifier que overflow est défini sur hidden
    expect(document.body.style.overflow).toBe('hidden');

    // Démonter le composant
    unmount();

    // Vérifier que overflow est réinitialisé
    expect(document.body.style.overflow).toBe('unset');
  });

  it('resets body overflow when isOpen changes to false', () => {
    const { rerender } = render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Vérifier que overflow est défini sur hidden
    expect(document.body.style.overflow).toBe('hidden');

    // Re-render avec isOpen = false
    rerender(
      <SettingsModal
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    // Vérifier que overflow est réinitialisé
    expect(document.body.style.overflow).toBe('unset');
  });
});
