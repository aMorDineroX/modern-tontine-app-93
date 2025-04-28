import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

/**
 * Test simple pour vérifier que les tests fonctionnent
 */
describe('Basic Test', () => {
  it('passes a simple test', () => {
    // Arrange
    const value = 1 + 1;

    // Assert
    expect(value).toBe(2);
  });
});
