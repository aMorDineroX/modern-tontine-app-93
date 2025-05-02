import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import AccessibleTooltip from '@/components/accessibility/AccessibleTooltip';
import { Button } from '@/components/ui/button';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';
import { keyboardInteractions } from '@/test/accessibility-test-setup';

describe('AccessibleTooltip Accessibility', () => {
  it('should have no accessibility violations when closed', async () => {
    const { container } = renderWithProviders(
      <AccessibleTooltip content="This is a tooltip">
        <Button>Hover me</Button>
      </AccessibleTooltip>
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations when open', async () => {
    const { container } = renderWithProviders(
      <AccessibleTooltip content="This is a tooltip" delayShow={0}>
        <Button>Hover me</Button>
      </AccessibleTooltip>
    );
    
    // Hover to show tooltip
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    await testAccessibility(container);
  });

  it('should have proper ARIA attributes', async () => {
    renderWithProviders(
      <AccessibleTooltip content="This is a tooltip" delayShow={0} id="test-tooltip">
        <Button>Hover me</Button>
      </AccessibleTooltip>
    );
    
    // Hover to show tooltip
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    // Check tooltip attributes
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('id', 'test-tooltip');
    
    // Check trigger attributes
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-describedby', 'test-tooltip');
  });

  it('should announce tooltip content to screen readers', async () => {
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
      <AccessibleTooltip 
        content="This is a tooltip" 
        delayShow={0} 
        announceToScreenReader
      >
        <Button>Hover me</Button>
      </AccessibleTooltip>
    );
    
    // Hover to show tooltip
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('This is a tooltip');
  });

  it('should show tooltip on focus', async () => {
    renderWithProviders(
      <AccessibleTooltip 
        content="This is a tooltip" 
        delayShow={0} 
        showOnFocus
      >
        <Button>Focus me</Button>
      </AccessibleTooltip>
    );
    
    // Focus to show tooltip
    fireEvent.focus(screen.getByRole('button'));
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    // Blur to hide tooltip
    fireEvent.blur(screen.getByRole('button'));
    
    // Wait for tooltip to disappear
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('should persist tooltip when clicked', async () => {
    renderWithProviders(
      <AccessibleTooltip 
        content="This is a tooltip" 
        delayShow={0} 
        persistOnClick
      >
        <Button>Click me</Button>
      </AccessibleTooltip>
    );
    
    // Click to show and persist tooltip
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    // Hover away
    fireEvent.mouseLeave(screen.getByRole('button'));
    
    // Tooltip should still be visible
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // Click again to hide tooltip
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for tooltip to disappear
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('should handle keyboard interaction for persistent tooltip', async () => {
    renderWithProviders(
      <AccessibleTooltip 
        content="This is a tooltip" 
        delayShow={0} 
        persistOnClick
      >
        <Button>Press Enter</Button>
      </AccessibleTooltip>
    );
    
    // Focus the button
    const button = screen.getByRole('button');
    button.focus();
    
    // Press Enter to show and persist tooltip
    fireEvent.keyDown(button, keyboardInteractions.enter);
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    // Press Escape to hide tooltip
    fireEvent.keyDown(button, keyboardInteractions.escape);
    
    // Wait for tooltip to disappear
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('should handle disabled state correctly', async () => {
    renderWithProviders(
      <AccessibleTooltip 
        content="This is a tooltip" 
        delayShow={0} 
        disabled
      >
        <Button>Hover me</Button>
      </AccessibleTooltip>
    );
    
    // Hover to try to show tooltip
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Tooltip should not appear
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should position tooltip correctly', async () => {
    renderWithProviders(
      <AccessibleTooltip 
        content="This is a tooltip" 
        delayShow={0} 
        position="top"
      >
        <Button>Hover me</Button>
      </AccessibleTooltip>
    );
    
    // Hover to show tooltip
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    // Check that the tooltip has a position style
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.style.top).toBeTruthy();
    expect(tooltip.style.left).toBeTruthy();
  });

  it('should show arrow when specified', async () => {
    renderWithProviders(
      <AccessibleTooltip 
        content="This is a tooltip" 
        delayShow={0} 
        showArrow
      >
        <Button>Hover me</Button>
      </AccessibleTooltip>
    );
    
    // Hover to show tooltip
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    // Check that the arrow is present
    const arrow = screen.getByRole('tooltip').querySelector('[aria-hidden="true"]');
    expect(arrow).toBeInTheDocument();
  });
});
