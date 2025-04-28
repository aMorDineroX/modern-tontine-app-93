import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('should pass a simple test', () => {
    // Arrange
    render(<div data-testid="test-element">Test Content</div>);
    
    // Act
    const element = screen.getByTestId('test-element');
    
    // Assert
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Test Content');
  });
});
