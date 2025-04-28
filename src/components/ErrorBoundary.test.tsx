import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

// Composant qui lance une erreur
const ErrorComponent = () => {
  throw new Error('Test error');
};

// Mock de console.error pour éviter les logs d'erreur pendant les tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByText('Une erreur est survenue')).not.toBeInTheDocument();
  });
  
  it('renders fallback UI when there is an error', () => {
    // Supprime les logs d'erreur React pour ce test
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Vérifier que le fallback UI est affiché
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    expect(screen.getByText('Nous sommes désolés, une erreur inattendue s\'est produite.')).toBeInTheDocument();
    
    // Restaure les logs d'erreur React
    spy.mockRestore();
  });
  
  it('renders custom fallback when provided', () => {
    // Supprime les logs d'erreur React pour ce test
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Vérifier que le fallback personnalisé est affiché
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByText('Une erreur est survenue')).not.toBeInTheDocument();
    
    // Restaure les logs d'erreur React
    spy.mockRestore();
  });
  
  it('calls onError when there is an error', () => {
    // Supprime les logs d'erreur React pour ce test
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const onErrorMock = vi.fn();
    
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Vérifier que onError a été appelé
    expect(onErrorMock).toHaveBeenCalled();
    
    // Restaure les logs d'erreur React
    spy.mockRestore();
  });
});
