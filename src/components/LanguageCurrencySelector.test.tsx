import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageCurrencySelector from './LanguageCurrencySelector';
import { useApp } from '@/contexts/AppContext';
import { currencies } from '@/utils/translations';

// Mock des dépendances
vi.mock('@/contexts/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('LanguageCurrencySelector', () => {
  const setLanguageMock = vi.fn();
  const setCurrencyMock = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de useApp
    (useApp as any).mockReturnValue({
      language: 'en',
      setLanguage: setLanguageMock,
      currency: currencies[0], // USD
      setCurrency: setCurrencyMock,
      t: (key: string) => key,
    });
  });
  
  it('renders language selector correctly', () => {
    render(<LanguageCurrencySelector type="language" />);
    
    // Vérifier que le bouton affiche la langue actuelle
    expect(screen.getByRole('button')).toHaveTextContent('English');
    
    // Vérifier que le menu est fermé
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
  });
  
  it('renders currency selector correctly', () => {
    render(<LanguageCurrencySelector type="currency" />);
    
    // Vérifier que le bouton affiche la devise actuelle
    expect(screen.getByRole('button')).toHaveTextContent('USD ($)');
    
    // Vérifier que le menu est fermé
    expect(screen.queryByText('EUR (€)')).not.toBeInTheDocument();
  });
  
  it('opens language dropdown when clicked', () => {
    render(<LanguageCurrencySelector type="language" />);
    
    // Cliquer sur le bouton
    fireEvent.click(screen.getByRole('button'));
    
    // Vérifier que le menu est ouvert
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
    expect(screen.getByText('Kiswahili')).toBeInTheDocument();
  });
  
  it('opens currency dropdown when clicked', () => {
    render(<LanguageCurrencySelector type="currency" />);
    
    // Cliquer sur le bouton
    fireEvent.click(screen.getByRole('button'));
    
    // Vérifier que le menu est ouvert
    expect(screen.getByText(/EUR \(€\)/)).toBeInTheDocument();
    expect(screen.getByText(/GBP \(£\)/)).toBeInTheDocument();
  });
  
  it('selects a language when clicked', () => {
    render(<LanguageCurrencySelector type="language" />);
    
    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button'));
    
    // Cliquer sur une option
    fireEvent.click(screen.getByText('Français'));
    
    // Vérifier que setLanguage a été appelé avec la bonne valeur
    expect(setLanguageMock).toHaveBeenCalledWith('fr');
    
    // Vérifier que le menu est fermé
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
  });
  
  it('selects a currency when clicked', () => {
    render(<LanguageCurrencySelector type="currency" />);
    
    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button'));
    
    // Cliquer sur une option
    fireEvent.click(screen.getByText(/EUR \(€\)/));
    
    // Vérifier que setCurrency a été appelé avec la bonne valeur
    expect(setCurrencyMock).toHaveBeenCalledWith(currencies[1]); // EUR
    
    // Vérifier que le menu est fermé
    expect(screen.queryByText(/EUR \(€\)/)).not.toBeInTheDocument();
  });
  
  it('closes dropdown when clicking outside', () => {
    render(<LanguageCurrencySelector type="language" />);
    
    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button'));
    
    // Vérifier que le menu est ouvert
    expect(screen.getByText('Français')).toBeInTheDocument();
    
    // Cliquer en dehors du menu
    fireEvent.click(document.querySelector('.fixed.inset-0')!);
    
    // Vérifier que le menu est fermé
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
  });
  
  it('shows check mark for selected language', () => {
    render(<LanguageCurrencySelector type="language" />);
    
    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button'));
    
    // Vérifier que l'option sélectionnée a une coche
    const englishOption = screen.getByText('English').parentElement;
    expect(englishOption).toHaveClass('bg-gray-100');
    
    // Vérifier que les autres options n'ont pas de coche
    const frenchOption = screen.getByText('Français').parentElement;
    expect(frenchOption).not.toHaveClass('bg-gray-100');
  });
  
  it('shows check mark for selected currency', () => {
    render(<LanguageCurrencySelector type="currency" />);
    
    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button'));
    
    // Vérifier que l'option sélectionnée a une coche
    const usdOption = screen.getByText(/USD \(\$\)/).closest('button');
    expect(usdOption).toHaveClass('bg-gray-100');
    
    // Vérifier que les autres options n'ont pas de coche
    const eurOption = screen.getByText(/EUR \(€\)/).closest('button');
    expect(eurOption).not.toHaveClass('bg-gray-100');
  });
});
