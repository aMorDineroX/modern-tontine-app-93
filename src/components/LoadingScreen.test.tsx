import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingScreen } from './LoadingScreen';

describe('LoadingScreen', () => {
  it('renders with default message', () => {
    render(<LoadingScreen />);
    
    // Vérifier que le message par défaut est affiché
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
    
    // Vérifier que l'animation de chargement est présente
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
  
  it('renders with custom message', () => {
    const customMessage = 'Traitement en cours...';
    render(<LoadingScreen message={customMessage} />);
    
    // Vérifier que le message personnalisé est affiché
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});
