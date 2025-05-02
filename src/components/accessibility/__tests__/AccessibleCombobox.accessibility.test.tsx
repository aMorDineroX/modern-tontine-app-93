import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import AccessibleCombobox from '@/components/accessibility/AccessibleCombobox';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';
import { keyboardInteractions } from '@/test/accessibility-test-setup';

describe('AccessibleCombobox Accessibility', () => {
  const items = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
    { value: 'grape', label: 'Grape' },
    { value: 'pear', label: 'Pear' },
  ];

  it('should have no accessibility violations when closed', async () => {
    const { container } = renderWithProviders(
      <AccessibleCombobox
        items={items}
        placeholder="Select a fruit"
        label="Favorite Fruit"
      />
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations when open', async () => {
    const { container } = renderWithProviders(
      <AccessibleCombobox
        items={items}
        placeholder="Select a fruit"
        label="Favorite Fruit"
      />
    );
    
    // Open the combobox
    fireEvent.click(screen.getByRole('combobox'));
    
    await testAccessibility(container);
  });

  it('should have proper ARIA attributes', () => {
    renderWithProviders(
      <AccessibleCombobox
        items={items}
        placeholder="Select a fruit"
        label="Favorite Fruit"
        required
      />
    );
    
    // Check combobox attributes
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    expect(combobox).toHaveAttribute('aria-labelledby');
    expect(combobox).toHaveAttribute('aria-required', 'true');
    
    // Check label
    const labelId = combobox.getAttribute('aria-labelledby');
    const label = document.getElementById(labelId!);
    expect(label).toHaveTextContent('Favorite Fruit');
  });

  it('should announce selection changes to screen readers', async () => {
    const announceMock = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      announce: announceMock,
      announcements: [],
      clearAnnouncements: jest.fn(),
      highContrast: false,
      toggleHighContrast: jest.fn(),
      fontSize: 'normal',
      setFontSize: jest.fn(),
      reducedMotion: false,
      toggleReducedMotion: jest.fn(),
      enhancedFocus: false,
      toggleEnhancedFocus: jest.fn(),
      enhancedTextSpacing: false,
      toggleEnhancedTextSpacing: jest.fn(),
      dyslexiaFriendly: false,
      toggleDyslexiaFriendly: jest.fn(),
      keyboardMode: false,
      setKeyboardMode: jest.fn(),
      screenReaderHints: false,
      toggleScreenReaderHints: jest.fn(),
    }));
    
    renderWithProviders(
      <AccessibleCombobox
        items={items}
        placeholder="Select a fruit"
        label="Favorite Fruit"
      />
    );
    
    // Open the combobox
    fireEvent.click(screen.getByRole('combobox'));
    
    // Select an item
    fireEvent.click(screen.getByText('Banana'));
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('Selected Banana');
  });

  it('should be keyboard navigable', async () => {
    renderWithProviders(
      <AccessibleCombobox
        items={items}
        placeholder="Select a fruit"
        label="Favorite Fruit"
      />
    );
    
    const combobox = screen.getByRole('combobox');
    
    // Focus the combobox
    combobox.focus();
    expect(document.activeElement).toBe(combobox);
    
    // Open with ArrowDown
    fireEvent.keyDown(combobox, keyboardInteractions.arrowDown);
    
    // Wait for the popover to open
    await waitFor(() => {
      expect(combobox).toHaveAttribute('aria-expanded', 'true');
    });
    
    // Find the input
    const input = screen.getByRole('textbox');
    expect(document.activeElement).toBe(input);
    
    // Type to filter
    fireEvent.change(input, { target: { value: 'ba' } });
    
    // Check that the filtered items are visible
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    
    // Press Enter to select
    fireEvent.keyDown(input, keyboardInteractions.enter);
    
    // Check that the selection was made
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });
  });

  it('should support multiple selection', async () => {
    renderWithProviders(
      <AccessibleCombobox
        items={items}
        placeholder="Select fruits"
        label="Favorite Fruits"
        multiple
      />
    );
    
    // Open the combobox
    fireEvent.click(screen.getByRole('combobox'));
    
    // Select multiple items
    fireEvent.click(screen.getByText('Apple'));
    fireEvent.click(screen.getByText('Banana'));
    
    // Check that both items are selected
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveTextContent('2 selected');
    
    // Remove an item
    const removeButtons = screen.getAllByRole('button', { name: /Remove/ });
    fireEvent.click(removeButtons[0]);
    
    // Check that only one item is selected
    expect(combobox).toHaveTextContent('1 selected');
  });

  it('should handle disabled state correctly', async () => {
    renderWithProviders(
      <AccessibleCombobox
        items={items}
        placeholder="Select a fruit"
        label="Favorite Fruit"
        disabled
      />
    );
    
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeDisabled();
    
    // Try to open the combobox
    fireEvent.click(combobox);
    
    // Check that it remains closed
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });

  it('should handle error state correctly', async () => {
    renderWithProviders(
      <AccessibleCombobox
        items={items}
        placeholder="Select a fruit"
        label="Favorite Fruit"
        error="Please select a fruit"
      />
    );
    
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-invalid', 'true');
    expect(combobox).toHaveAttribute('aria-describedby');
    
    const errorId = combobox.getAttribute('aria-describedby');
    const errorMessage = document.getElementById(errorId!);
    expect(errorMessage).toHaveTextContent('Please select a fruit');
  });
});
