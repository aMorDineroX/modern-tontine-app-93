import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Performance Test Example', () => {
  it('should measure rendering performance', () => {
    // Fonction pour mesurer le temps d'exécution
    const measurePerformance = (fn: () => void): number => {
      const start = performance.now();
      fn();
      const end = performance.now();
      return end - start;
    };
    
    // Composant simple pour le test
    const SimpleComponent = () => (
      <div>
        {Array.from({ length: 100 }).map((_, i) => (
          <p key={i}>Item {i}</p>
        ))}
      </div>
    );
    
    // Mesurer le temps de rendu
    const renderTime = measurePerformance(() => {
      render(<SimpleComponent />);
    });
    
    console.log(`Render time: ${renderTime}ms`);
    
    // Le temps de rendu devrait être raisonnable
    expect(renderTime).toBeLessThan(500);
  });
});
