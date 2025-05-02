import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import AccessibilitySettings from '../AccessibilitySettings';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

// Wrap component with necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      {ui}
    </AccessibilityProvider>
  );
};

describe('AccessibilitySettings', () => {
  it('should have no accessibility violations', async () => {
    const { container } = renderWithProviders(<AccessibilitySettings />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should open the dialog when the trigger is clicked', () => {
    renderWithProviders(<AccessibilitySettings />);
    
    // Find and click the trigger button
    const triggerButton = screen.getByLabelText('Accessibility settings');
    fireEvent.click(triggerButton);
    
    // Check that the dialog is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
  });

  it('should toggle high contrast mode when the switch is clicked', () => {
    renderWithProviders(<AccessibilitySettings />);
    
    // Open the dialog
    const triggerButton = screen.getByLabelText('Accessibility settings');
    fireEvent.click(triggerButton);
    
    // Find and click the high contrast switch
    const highContrastSwitch = screen.getByLabelText('Toggle high contrast mode');
    fireEvent.click(highContrastSwitch);
    
    // Check that the switch is toggled
    expect(highContrastSwitch).toBeChecked();
  });

  it('should change font size when a radio button is clicked', () => {
    renderWithProviders(<AccessibilitySettings />);
    
    // Open the dialog
    const triggerButton = screen.getByLabelText('Accessibility settings');
    fireEvent.click(triggerButton);
    
    // Find and click the large font size radio button
    const largeFontRadio = screen.getByLabelText('Large');
    fireEvent.click(largeFontRadio);
    
    // Check that the radio button is selected
    expect(largeFontRadio).toBeChecked();
  });

  it('should be navigable with keyboard', () => {
    renderWithProviders(<AccessibilitySettings />);
    
    // Find the trigger button
    const triggerButton = screen.getByLabelText('Accessibility settings');
    
    // Focus the button
    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);
    
    // Press Enter to open the dialog
    fireEvent.keyDown(triggerButton, { key: 'Enter' });
    
    // Check that the dialog is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Tab to the high contrast switch
    const highContrastSwitch = screen.getByLabelText('Toggle high contrast mode');
    highContrastSwitch.focus();
    expect(document.activeElement).toBe(highContrastSwitch);
    
    // Press Space to toggle the switch
    fireEvent.keyDown(highContrastSwitch, { key: ' ' });
    
    // Check that the switch is toggled
    expect(highContrastSwitch).toBeChecked();
  });
});
