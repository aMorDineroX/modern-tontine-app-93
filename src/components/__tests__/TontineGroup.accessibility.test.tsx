import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import TontineGroup from '../TontineGroup';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

// Mock framer-motion to avoid issues with animations in tests
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Wrap component with necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      {ui}
    </AccessibilityProvider>
  );
};

describe('TontineGroup Accessibility', () => {
  const defaultProps = {
    name: 'Test Group',
    members: 5,
    contribution: '100€ / mensuel',
    nextDue: '15 juin 2023',
    status: 'active' as const,
    progress: 75,
    onClick: jest.fn(),
  };

  it('should have no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <TontineGroup {...defaultProps} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', () => {
    renderWithProviders(
      <TontineGroup {...defaultProps} />
    );
    
    // Find the main button
    const groupCard = screen.getByRole('article');
    
    // Focus the card
    groupCard.focus();
    expect(document.activeElement).toBe(groupCard);
    
    // Press Enter to activate the card
    fireEvent.keyDown(groupCard, { key: 'Enter' });
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA attributes', () => {
    renderWithProviders(
      <TontineGroup {...defaultProps} />
    );
    
    // Check for proper ARIA attributes
    const groupCard = screen.getByRole('article');
    expect(groupCard).toHaveAttribute('aria-label', `Groupe ${defaultProps.name}`);
    expect(groupCard).toHaveAttribute('aria-describedby');
    expect(groupCard).toHaveAttribute('aria-roledescription', 'Carte de groupe tontine');
    
    // Check for screen reader description
    const descriptionId = groupCard.getAttribute('aria-describedby');
    const description = document.getElementById(descriptionId!);
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('sr-only');
  });

  it('should have accessible action buttons', () => {
    const onToggleFavorite = jest.fn();
    
    renderWithProviders(
      <TontineGroup 
        {...defaultProps} 
        isFavorite={true}
        onToggleFavorite={onToggleFavorite}
      />
    );
    
    // Check favorite button
    const favoriteButton = screen.getByLabelText('Retirer des favoris');
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
    
    // Click the favorite button
    fireEvent.click(favoriteButton);
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    
    // Check that event propagation was stopped (onClick not called)
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('should have accessible progress bar', () => {
    renderWithProviders(
      <TontineGroup {...defaultProps} />
    );
    
    // Check progress bar
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', defaultProps.progress.toString());
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-labelledby');
    
    // Check progress label
    const labelId = progressBar.getAttribute('aria-labelledby');
    const label = document.getElementById(labelId!);
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Progression du cycle');
  });
});
