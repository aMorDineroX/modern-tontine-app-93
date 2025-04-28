import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VirtualizedList from '@/components/VirtualizedList';

describe('VirtualizedList Performance', () => {
  // Fonction pour mesurer le temps d'exécution
  const measurePerformance = (fn: () => void): number => {
    const start = performance.now();
    fn();
    const end = performance.now();
    return end - start;
  };
  
  // Fonction pour générer un grand nombre d'éléments
  const generateItems = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`
    }));
  };
  
  it('renders large lists efficiently', () => {
    // Générer 10000 éléments
    const items = generateItems(10000);
    
    // Mesurer le temps de rendu
    const renderTime = measurePerformance(() => {
      render(
        <VirtualizedList
          items={items}
          height={500}
          itemHeight={50}
          renderItem={(item) => (
            <div key={item.id} data-testid={`item-${item.id}`}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          )}
        />
      );
    });
    
    console.log(`Render time for 10000 items: ${renderTime}ms`);
    
    // Vérifier que seuls les éléments visibles sont rendus
    const renderedItems = document.querySelectorAll('[data-testid^="item-"]');
    
    // Avec une hauteur de 500px et des éléments de 50px, on devrait avoir environ 10 éléments visibles
    // plus quelques éléments supplémentaires pour l'overscan (par défaut 5)
    expect(renderedItems.length).toBeLessThanOrEqual(20);
    
    // Le temps de rendu devrait être raisonnable (moins de 500ms)
    expect(renderTime).toBeLessThan(500);
  });
  
  it('compares performance with regular list rendering', () => {
    // Générer 1000 éléments (moins que le test précédent pour éviter de bloquer le navigateur)
    const items = generateItems(1000);
    
    // Mesurer le temps de rendu avec VirtualizedList
    const virtualizedRenderTime = measurePerformance(() => {
      render(
        <VirtualizedList
          items={items}
          height={500}
          itemHeight={50}
          renderItem={(item) => (
            <div key={item.id} data-testid={`virtual-item-${item.id}`}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          )}
        />
      );
    });
    
    // Nettoyer le DOM
    document.body.innerHTML = '';
    
    // Mesurer le temps de rendu avec une liste régulière
    const regularRenderTime = measurePerformance(() => {
      render(
        <div style={{ height: '500px', overflow: 'auto' }}>
          {items.map(item => (
            <div key={item.id} style={{ height: '50px' }} data-testid={`regular-item-${item.id}`}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      );
    });
    
    console.log(`Virtualized render time for 1000 items: ${virtualizedRenderTime}ms`);
    console.log(`Regular render time for 1000 items: ${regularRenderTime}ms`);
    
    // La liste virtualisée devrait être plus rapide
    expect(virtualizedRenderTime).toBeLessThan(regularRenderTime);
    
    // Vérifier que tous les éléments sont rendus dans la liste régulière
    const regularItems = document.querySelectorAll('[data-testid^="regular-item-"]');
    expect(regularItems.length).toBe(1000);
  });
});
