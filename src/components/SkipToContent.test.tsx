import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SkipToContent from './SkipToContent';

describe('SkipToContent', () => {
  it('renders correctly', () => {
    render(<SkipToContent contentId="main-content" />);

    // Le bouton devrait être présent mais invisible par défaut
    const button = screen.getByText('Aller au contenu principal');
    expect(button).toBeInTheDocument();

    // Vérifier que le bouton a la classe sr-only (screen reader only)
    expect(button).toHaveClass('sr-only');
  });

  it('has focus styles', () => {
    render(<SkipToContent contentId="main-content" />);

    const button = screen.getByText('Aller au contenu principal');

    // Vérifier que le bouton a la classe focus:not-sr-only
    expect(button.className).toContain('focus:not-sr-only');
  });

  it('becomes invisible again on blur', () => {
    render(<SkipToContent contentId="main-content" />);

    const button = screen.getByText('Aller au contenu principal');

    // Simuler le focus puis le blur sur le bouton
    fireEvent.focus(button);
    fireEvent.blur(button);

    // Vérifier que le bouton a de nouveau la classe sr-only
    expect(button).toHaveClass('sr-only');
  });

  it('has the correct href attribute', () => {
    render(<SkipToContent contentId="main-content" />);

    const button = screen.getByText('Aller au contenu principal');

    // Vérifier que le bouton a l'attribut href correct
    expect(button).toHaveAttribute('href', '#main-content');
  });

  it('uses custom label when provided', () => {
    render(<SkipToContent contentId="main-content" label="Passer au contenu" />);

    // Vérifier que le label personnalisé est utilisé
    const button = screen.getByText('Passer au contenu');
    expect(button).toBeInTheDocument();
  });
});
