import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeToggle from './ThemeToggle';
import { useApp } from '@/contexts/AppContext';

// Mock du contexte AppContext
vi.mock('@/contexts/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('ThemeToggle', () => {
  it('renders light mode button when in dark mode', () => {
    // Configuration du mock pour simuler le mode sombre
    (useApp as any).mockReturnValue({
      isDarkMode: true,
      setIsDarkMode: vi.fn(),
    });
    
    render(<ThemeToggle />);
    
    // Vérifier que le bouton de mode clair est affiché
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Vérifier que l'icône Sun est présente
    const sunIcon = document.querySelector('svg.lucide-sun');
    expect(sunIcon).toBeInTheDocument();
  });
  
  it('renders dark mode button when in light mode', () => {
    // Configuration du mock pour simuler le mode clair
    (useApp as any).mockReturnValue({
      isDarkMode: false,
      setIsDarkMode: vi.fn(),
    });
    
    render(<ThemeToggle />);
    
    // Vérifier que le bouton de mode sombre est affiché
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Vérifier que l'icône Moon est présente
    const moonIcon = document.querySelector('svg.lucide-moon');
    expect(moonIcon).toBeInTheDocument();
  });
  
  it('toggles theme when clicked', () => {
    // Mock de la fonction setIsDarkMode
    const setIsDarkModeMock = vi.fn();
    
    // Configuration du mock pour simuler le mode clair
    (useApp as any).mockReturnValue({
      isDarkMode: false,
      setIsDarkMode: setIsDarkModeMock,
    });
    
    render(<ThemeToggle />);
    
    // Cliquer sur le bouton
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Vérifier que setIsDarkMode a été appelé avec true
    expect(setIsDarkModeMock).toHaveBeenCalledWith(true);
  });
});
