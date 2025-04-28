import { describe, it, expect } from 'vitest';

describe('Basic Test', () => {
  it('passes a simple test', () => {
    // Arrange
    const value = 1 + 1;
    
    // Assert
    expect(value).toBe(2);
  });
});
