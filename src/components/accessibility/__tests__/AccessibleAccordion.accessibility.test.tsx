import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AccessibleAccordion, AccessibleAccordionItem } from '@/components/accessibility/AccessibleAccordion';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';
import { keyboardInteractions } from '@/test/accessibility-test-setup';

describe('AccessibleAccordion Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <AccessibleAccordion>
        <AccessibleAccordionItem title="Section 1">
          Content for section 1
        </AccessibleAccordionItem>
        <AccessibleAccordionItem title="Section 2">
          Content for section 2
        </AccessibleAccordionItem>
        <AccessibleAccordionItem title="Section 3">
          Content for section 3
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations with expanded items', async () => {
    const { container } = renderWithProviders(
      <AccessibleAccordion defaultExpanded="section-1">
        <AccessibleAccordionItem id="section-1" title="Section 1">
          Content for section 1
        </AccessibleAccordionItem>
        <AccessibleAccordionItem id="section-2" title="Section 2">
          Content for section 2
        </AccessibleAccordionItem>
        <AccessibleAccordionItem id="section-3" title="Section 3">
          Content for section 3
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations with multiple expanded items', async () => {
    const { container } = renderWithProviders(
      <AccessibleAccordion allowMultiple defaultExpandedItems={['section-1', 'section-3']}>
        <AccessibleAccordionItem id="section-1" title="Section 1">
          Content for section 1
        </AccessibleAccordionItem>
        <AccessibleAccordionItem id="section-2" title="Section 2">
          Content for section 2
        </AccessibleAccordionItem>
        <AccessibleAccordionItem id="section-3" title="Section 3">
          Content for section 3
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    await testAccessibility(container);
  });

  it('should have proper ARIA attributes', () => {
    renderWithProviders(
      <AccessibleAccordion>
        <AccessibleAccordionItem title="Section 1">
          Content for section 1
        </AccessibleAccordionItem>
        <AccessibleAccordionItem title="Section 2">
          Content for section 2
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    
    // Check accordion buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    // Check first button attributes
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[0]).toHaveAttribute('aria-controls');
    
    // Check that the button controls the correct panel
    const controlsId = buttons[0].getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    
    // Check that the panel has the correct ID and attributes
    const panel = document.getElementById(controlsId!);
    expect(panel).toBeTruthy();
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-labelledby');
    expect(panel).toHaveAttribute('hidden');
    
    // Check that the panel is labeled by the button
    const labelledById = panel!.getAttribute('aria-labelledby');
    expect(labelledById).toBe(buttons[0].id);
  });

  it('should announce expansion state changes to screen readers', async () => {
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
      <AccessibleAccordion>
        <AccessibleAccordionItem title="Section 1">
          Content for section 1
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    
    // Click to expand
    fireEvent.click(screen.getByText('Section 1'));
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('Section 1 expanded');
    
    // Click to collapse
    fireEvent.click(screen.getByText('Section 1'));
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('Section 1 collapsed');
  });

  it('should be keyboard accessible', async () => {
    renderWithProviders(
      <AccessibleAccordion>
        <AccessibleAccordionItem title="Section 1">
          Content for section 1
        </AccessibleAccordionItem>
        <AccessibleAccordionItem title="Section 2">
          Content for section 2
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    
    const buttons = screen.getAllByRole('button');
    
    // Focus the first button
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);
    
    // Press Enter to expand
    fireEvent.keyDown(buttons[0], keyboardInteractions.enter);
    
    // Check that the panel is expanded
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    
    // Check that the panel content is visible
    expect(screen.getByText('Content for section 1')).toBeVisible();
    
    // Press Enter again to collapse
    fireEvent.keyDown(buttons[0], keyboardInteractions.enter);
    
    // Check that the panel is collapsed
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    
    // Press Space to expand
    fireEvent.keyDown(buttons[0], keyboardInteractions.space);
    
    // Check that the panel is expanded
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
  });

  it('should handle disabled state correctly', async () => {
    renderWithProviders(
      <AccessibleAccordion>
        <AccessibleAccordionItem title="Section 1" disabled>
          Content for section 1
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    
    const button = screen.getByRole('button');
    
    // Check that the button is disabled
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    // Try to click the button
    fireEvent.click(button);
    
    // Check that the panel remains collapsed
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should support multiple expanded items', async () => {
    renderWithProviders(
      <AccessibleAccordion allowMultiple>
        <AccessibleAccordionItem title="Section 1">
          Content for section 1
        </AccessibleAccordionItem>
        <AccessibleAccordionItem title="Section 2">
          Content for section 2
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    
    const buttons = screen.getAllByRole('button');
    
    // Expand the first item
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    
    // Expand the second item
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    
    // Check that both items are expanded
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });

  it('should collapse other items when single mode is used', async () => {
    renderWithProviders(
      <AccessibleAccordion>
        <AccessibleAccordionItem title="Section 1">
          Content for section 1
        </AccessibleAccordionItem>
        <AccessibleAccordionItem title="Section 2">
          Content for section 2
        </AccessibleAccordionItem>
      </AccessibleAccordion>
    );
    
    const buttons = screen.getAllByRole('button');
    
    // Expand the first item
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    
    // Expand the second item
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    
    // Check that the first item is collapsed
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
  });
});
