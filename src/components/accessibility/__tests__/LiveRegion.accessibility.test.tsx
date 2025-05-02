import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LiveRegion, { StatusMessage, AlertMessage, ProgressMessage, LogMessage } from '@/components/accessibility/LiveRegion';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';

// Mock the useAccessibility hook
jest.mock('@/contexts/AccessibilityContext', () => ({
  useAccessibility: () => ({
    announce: jest.fn(),
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
  }),
}));

describe('LiveRegion Accessibility', () => {
  it('should have no accessibility violations with polite politeness', async () => {
    const { container } = renderWithProviders(
      <LiveRegion politeness="polite">
        This is a polite announcement
      </LiveRegion>
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations with assertive politeness', async () => {
    const { container } = renderWithProviders(
      <LiveRegion politeness="assertive">
        This is an assertive announcement
      </LiveRegion>
    );
    await testAccessibility(container);
  });

  it('should have proper ARIA attributes for polite announcements', () => {
    render(
      <LiveRegion politeness="polite">
        This is a polite announcement
      </LiveRegion>
    );
    
    const liveRegion = screen.getByText('This is a polite announcement');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('role', 'status');
  });

  it('should have proper ARIA attributes for assertive announcements', () => {
    render(
      <LiveRegion politeness="assertive">
        This is an assertive announcement
      </LiveRegion>
    );
    
    const liveRegion = screen.getByText('This is an assertive announcement');
    expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    expect(liveRegion).toHaveAttribute('role', 'alert');
  });

  it('should use custom role when provided', () => {
    render(
      <LiveRegion politeness="polite" role="log">
        This is a log message
      </LiveRegion>
    );
    
    const liveRegion = screen.getByText('This is a log message');
    expect(liveRegion).toHaveAttribute('role', 'log');
  });

  it('should clear content after specified time', async () => {
    render(
      <LiveRegion politeness="polite" clearAfter={100}>
        This will be cleared
      </LiveRegion>
    );
    
    // Content should be present initially
    expect(screen.getByText('This will be cleared')).toBeInTheDocument();
    
    // Content should be cleared after the specified time
    await waitFor(() => {
      expect(screen.queryByText('This will be cleared')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('should update content when children change', () => {
    const { rerender } = render(
      <LiveRegion politeness="polite">
        Initial content
      </LiveRegion>
    );
    
    // Initial content should be present
    expect(screen.getByText('Initial content')).toBeInTheDocument();
    
    // Update the content
    rerender(
      <LiveRegion politeness="polite">
        Updated content
      </LiveRegion>
    );
    
    // Updated content should be present
    expect(screen.getByText('Updated content')).toBeInTheDocument();
  });

  it('should be visually hidden by default', () => {
    render(
      <LiveRegion politeness="polite">
        This is visually hidden
      </LiveRegion>
    );
    
    const liveRegion = screen.getByText('This is visually hidden').closest('div');
    expect(liveRegion).toHaveClass('sr-only');
  });

  it('should be visible when visuallyHidden is false', () => {
    render(
      <LiveRegion politeness="polite" visuallyHidden={false}>
        This is visible
      </LiveRegion>
    );
    
    const liveRegion = screen.getByText('This is visible').closest('div');
    expect(liveRegion).not.toHaveClass('sr-only');
  });
});

describe('LiveRegion Variants', () => {
  it('should render StatusMessage with correct attributes', () => {
    render(
      <StatusMessage>
        Status message
      </StatusMessage>
    );
    
    const statusMessage = screen.getByText('Status message');
    expect(statusMessage).toHaveAttribute('aria-live', 'polite');
    expect(statusMessage).toHaveAttribute('role', 'status');
  });

  it('should render AlertMessage with correct attributes', () => {
    render(
      <AlertMessage>
        Alert message
      </AlertMessage>
    );
    
    const alertMessage = screen.getByText('Alert message');
    expect(alertMessage).toHaveAttribute('aria-live', 'assertive');
    expect(alertMessage).toHaveAttribute('role', 'alert');
  });

  it('should render ProgressMessage with correct attributes', () => {
    render(
      <ProgressMessage value={50} max={100}>
        50% complete
      </ProgressMessage>
    );
    
    const progressMessage = screen.getByText('50% complete');
    expect(progressMessage).toHaveAttribute('role', 'progressbar');
    expect(progressMessage).toHaveAttribute('aria-valuenow', '50');
    expect(progressMessage).toHaveAttribute('aria-valuemin', '0');
    expect(progressMessage).toHaveAttribute('aria-valuemax', '100');
  });

  it('should render LogMessage with correct attributes', () => {
    render(
      <LogMessage>
        Log message
      </LogMessage>
    );
    
    const logMessage = screen.getByText('Log message');
    expect(logMessage).toHaveAttribute('role', 'log');
    expect(logMessage).toHaveAttribute('aria-relevant', 'additions');
  });
});
