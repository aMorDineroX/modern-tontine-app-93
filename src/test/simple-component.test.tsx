import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Composant simple pour le test
const SimpleComponent = () => {
  return (
    <div>
      <h1>Simple Component</h1>
      <p>This is a simple component for testing.</p>
    </div>
  );
};

describe('SimpleComponent', () => {
  it('renders correctly', () => {
    render(<SimpleComponent />);
    
    expect(screen.getByText('Simple Component')).toBeInTheDocument();
    expect(screen.getByText('This is a simple component for testing.')).toBeInTheDocument();
  });
});
