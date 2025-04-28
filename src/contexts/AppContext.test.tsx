import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppProvider, useApp } from './AppContext';
import { translations, currencies } from '@/utils/translations';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Test component that uses the AppContext
const TestComponent = () => {
  const { 
    language, 
    setLanguage, 
    t, 
    currency, 
    setCurrency, 
    formatAmount, 
    isDarkMode, 
    setIsDarkMode 
  } = useApp();

  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="translation">{t('dashboard')}</div>
      <div data-testid="currency">{currency.code}</div>
      <div data-testid="formatted-amount">{formatAmount(1000)}</div>
      <div data-testid="dark-mode">{isDarkMode ? 'dark' : 'light'}</div>
      
      <button onClick={() => setLanguage('fr')}>Set French</button>
      <button onClick={() => setCurrency(currencies[1])}>Set EUR</button>
      <button onClick={() => setIsDarkMode(!isDarkMode)}>Toggle Dark Mode</button>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('provides default values when no localStorage values exist', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Default language should be 'en' (since we mocked matchMedia to not match dark mode)
    expect(screen.getByTestId('language').textContent).toBe('en');
    
    // Default currency should be the first one (USD)
    expect(screen.getByTestId('currency').textContent).toBe('USD');
    
    // Default theme should be light (since we mocked matchMedia to not match dark mode)
    expect(screen.getByTestId('dark-mode').textContent).toBe('light');
  });

  it('loads values from localStorage if they exist', () => {
    // Set values in localStorage
    localStorageMock.setItem('language', 'fr');
    localStorageMock.setItem('currency', JSON.stringify(currencies[1])); // EUR
    localStorageMock.setItem('theme', 'dark');

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Values should be loaded from localStorage
    expect(screen.getByTestId('language').textContent).toBe('fr');
    expect(screen.getByTestId('currency').textContent).toBe('EUR');
    expect(screen.getByTestId('dark-mode').textContent).toBe('dark');
  });

  it('changes language when setLanguage is called', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Initial language should be 'en'
    expect(screen.getByTestId('language').textContent).toBe('en');
    expect(screen.getByTestId('translation').textContent).toBe(translations.en.dashboard);

    // Change language to French
    fireEvent.click(screen.getByText('Set French'));

    // Language should be updated
    expect(screen.getByTestId('language').textContent).toBe('fr');
    expect(screen.getByTestId('translation').textContent).toBe(translations.fr.dashboard);
    
    // localStorage should be updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'fr');
  });

  it('changes currency when setCurrency is called', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Initial currency should be USD
    expect(screen.getByTestId('currency').textContent).toBe('USD');
    expect(screen.getByTestId('formatted-amount').textContent).toBe('$1,000.00');

    // Change currency to EUR
    fireEvent.click(screen.getByText('Set EUR'));

    // Currency should be updated
    expect(screen.getByTestId('currency').textContent).toBe('EUR');
    expect(screen.getByTestId('formatted-amount').textContent).toBe('€1,000.00');
    
    // localStorage should be updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('currency', JSON.stringify(currencies[1]));
  });

  it('toggles dark mode when setIsDarkMode is called', () => {
    // Mock document.documentElement
    const classList = {
      add: vi.fn(),
      remove: vi.fn(),
    };
    Object.defineProperty(document.documentElement, 'classList', { value: classList });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Initial theme should be light
    expect(screen.getByTestId('dark-mode').textContent).toBe('light');

    // Toggle dark mode
    fireEvent.click(screen.getByText('Toggle Dark Mode'));

    // Theme should be updated to dark
    expect(screen.getByTestId('dark-mode').textContent).toBe('dark');
    
    // classList.add should be called with 'dark'
    expect(classList.add).toHaveBeenCalledWith('dark');
    
    // localStorage should be updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Toggle dark mode again
    fireEvent.click(screen.getByText('Toggle Dark Mode'));

    // Theme should be updated to light
    expect(screen.getByTestId('dark-mode').textContent).toBe('light');
    
    // classList.remove should be called with 'dark'
    expect(classList.remove).toHaveBeenCalledWith('dark');
    
    // localStorage should be updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('formats amounts correctly', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Check initial formatted amount
    expect(screen.getByTestId('formatted-amount').textContent).toBe('$1,000.00');

    // Change currency to EUR
    fireEvent.click(screen.getByText('Set EUR'));

    // Check formatted amount with new currency
    expect(screen.getByTestId('formatted-amount').textContent).toBe('€1,000.00');
  });

  it('throws an error when useApp is used outside of AppProvider', () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Expect an error when rendering TestComponent without AppProvider
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useApp must be used within an AppProvider');

    // Restore console.error
    console.error = originalConsoleError;
  });
});
