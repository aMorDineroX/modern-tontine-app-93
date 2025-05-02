import React from 'react';
import { Button } from '@/components/ui/button';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';
import { screen, fireEvent } from '@testing-library/react';

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <Button>Click me</Button>
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations with different variants', async () => {
    const { container } = renderWithProviders(
      <>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </>
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations when disabled', async () => {
    const { container } = renderWithProviders(
      <Button disabled>Disabled</Button>
    );
    await testAccessibility(container);
  });

  it('should be keyboard navigable', () => {
    const handleClick = jest.fn();
    renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>
    );
    
    const button = screen.getByRole('button', { name: 'Click me' });
    
    // Focus the button
    button.focus();
    expect(document.activeElement).toBe(button);
    
    // Press Enter to activate the button
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Press Space to activate the button
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA attributes when loading', () => {
    renderWithProviders(
      <Button isLoading>Loading</Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });
});
