import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { axe, toHaveNoViolations, JestAxeConfigureOptions } from 'jest-axe';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppProvider } from '@/contexts/AppContext';
import { TranslationProvider } from '@/contexts/TranslationContext';

// Add custom matchers
expect.extend(toHaveNoViolations);

// Mock framer-motion to avoid issues with animations in tests
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

/**
 * Custom render function that wraps components with necessary providers for accessibility testing
 *
 * @param ui - The component to render
 * @param options - Additional render options
 * @returns The rendered component with testing utilities
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider defaultTheme="light" storageKey="naat-theme">
      <TranslationProvider>
        <AccessibilityProvider>
          <AppProvider>{children}</AppProvider>
        </AccessibilityProvider>
      </TranslationProvider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Default axe configuration for accessibility testing
 */
export const axeConfig: JestAxeConfigureOptions = {
  rules: {
    // Add specific rule configurations here
    'color-contrast': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
  },
};

/**
 * Test a component for accessibility violations
 *
 * @param element - The rendered component
 * @param config - Optional axe configuration
 * @returns Promise that resolves when the test is complete
 */
export async function testAccessibility(
  element: Element | null,
  config?: JestAxeConfigureOptions
): Promise<void> {
  if (!element) {
    throw new Error('Element is null');
  }

  const results = await axe(element, config || axeConfig);
  expect(results).toHaveNoViolations();
}

/**
 * Create a standard accessibility test suite for a component
 *
 * @param Component - The component to test
 * @param defaultProps - Default props for the component
 * @param name - Optional name for the test suite
 */
export function createAccessibilityTests<P>(
  Component: React.ComponentType<P>,
  defaultProps: P,
  name?: string
): void {
  const componentName = name || Component.displayName || Component.name || 'Component';

  describe(`${componentName} Accessibility`, () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithProviders(<Component {...defaultProps} />);
      await testAccessibility(container);
    });

    it('should have no accessibility violations with different props', async () => {
      // Test with different props if applicable
      // This is a placeholder - customize for each component
      const { container } = renderWithProviders(<Component {...defaultProps} />);
      await testAccessibility(container);
    });
  });
}

/**
 * Test keyboard navigation for a component
 *
 * @param container - The container element
 * @param keyboardCommands - Array of keyboard commands to simulate
 * @param expectedFocusOrder - Array of selectors for elements that should receive focus
 */
export function testKeyboardNavigation(
  container: HTMLElement,
  keyboardCommands: { key: string; shiftKey?: boolean; ctrlKey?: boolean; altKey?: boolean }[],
  expectedFocusOrder: string[]
): void {
  // Set initial focus to the container
  container.focus();

  // Execute each keyboard command and check focus
  keyboardCommands.forEach((command, index) => {
    // Simulate the keyboard event
    const event = new KeyboardEvent('keydown', {
      key: command.key,
      shiftKey: command.shiftKey || false,
      ctrlKey: command.ctrlKey || false,
      altKey: command.altKey || false,
      bubbles: true,
    });

    // Dispatch the event
    document.activeElement?.dispatchEvent(event);

    // Check if the expected element is focused
    if (index < expectedFocusOrder.length) {
      const expectedElement = container.querySelector(expectedFocusOrder[index]);
      expect(document.activeElement).toBe(expectedElement);
    }
  });
}

/**
 * Test screen reader announcements
 *
 * @param announceFunction - Mock function for the announce function
 * @param actions - Array of functions that trigger announcements
 * @param expectedAnnouncements - Array of expected announcement strings
 */
export function testScreenReaderAnnouncements(
  announceFunction: jest.Mock,
  actions: (() => void)[],
  expectedAnnouncements: string[]
): void {
  // Execute each action and check announcements
  actions.forEach((action, index) => {
    // Reset the mock before each action
    announceFunction.mockClear();

    // Execute the action
    action();

    // Check if the expected announcement was made
    if (index < expectedAnnouncements.length) {
      expect(announceFunction).toHaveBeenCalledWith(
        expectedAnnouncements[index],
        expect.anything()
      );
    }
  });
}

/**
 * Test ARIA attributes for an element
 *
 * @param element - The element to test
 * @param expectedAttributes - Record of expected ARIA attributes and their values
 */
export function testAriaAttributes(
  element: HTMLElement,
  expectedAttributes: Record<string, string>
): void {
  // Check each expected attribute
  Object.entries(expectedAttributes).forEach(([attribute, value]) => {
    expect(element).toHaveAttribute(attribute, value);
  });
}

/**
 * Test focus management for a component
 *
 * @param container - The container element
 * @param focusableElements - Array of selectors for focusable elements
 * @param initialFocusSelector - Optional selector for the element that should receive initial focus
 */
export function testFocusManagement(
  container: HTMLElement,
  focusableElements: string[],
  initialFocusSelector?: string
): void {
  // Set initial focus
  if (initialFocusSelector) {
    const initialFocusElement = container.querySelector(initialFocusSelector);
    if (initialFocusElement instanceof HTMLElement) {
      initialFocusElement.focus();
    }
  }

  // Get all focusable elements
  const elements = focusableElements.map(selector =>
    container.querySelector(selector)
  ).filter(Boolean) as HTMLElement[];

  // Check if the focus order is correct
  elements.forEach((element, index) => {
    // Focus the element
    element.focus();

    // Check if the element is focused
    expect(document.activeElement).toBe(element);

    // Tab to the next element
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    });

    element.dispatchEvent(event);
  });
}

// Export all test utilities
export const accessibilityTestUtils = {
  renderWithProviders,
  testAccessibility,
  createAccessibilityTests,
  testKeyboardNavigation,
  testScreenReaderAnnouncements,
  testAriaAttributes,
  testFocusManagement,
};
