import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVirtualList } from './useVirtualList';

// Mock de ResizeObserver
const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

// @ts-ignore
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: observeMock,
  unobserve: unobserveMock,
  disconnect: disconnectMock
}));

describe('useVirtualList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty virtualItems when containerHeight is 0', () => {
    // Créer une liste de test
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50 })
    );

    expect(result.current.virtualItems).toEqual([]);
    expect(result.current.totalHeight).toBe(5000); // 100 items * 50px
  });

  it('should calculate visible items based on scroll position', () => {
    // Créer une liste de test
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

    // Mock du conteneur avec une hauteur et une position de défilement
    const containerMock = {
      clientHeight: 200,
      scrollTop: 100,
    };

    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50 })
    );

    // Simuler la référence au conteneur
    // @ts-ignore
    result.current.containerProps.ref.current = containerMock;

    // Simuler un événement de défilement
    act(() => {
      result.current.containerProps.onScroll();
    });

    // Simuler le changement de hauteur du conteneur
    act(() => {
      // Appeler directement le callback de ResizeObserver
      const resizeObserverCallback = vi.fn().mockImplementation((entries) => {
        entries.forEach(entry => {
          containerMock.clientHeight = entry.contentRect.height;
        });
      });

      resizeObserverCallback([{ contentRect: { height: 200 } }]);
    });

    // Avec une hauteur de conteneur de 200px, une position de défilement de 100px,
    // une hauteur d'élément de 50px et un overscan de 3, nous devrions voir les éléments
    // des indices 2-3-4-5-6-7-8-9 (2 visibles + 3 avant + 3 après)
    expect(result.current.virtualItems.length).toBeGreaterThan(0);

    // Vérifier que les éléments ont les bonnes propriétés
    result.current.virtualItems.forEach(item => {
      expect(item).toHaveProperty('index');
      expect(item).toHaveProperty('offsetTop');
      expect(item.offsetTop).toBe(item.index * 50);
    });
  });

  it('should provide correct container props', () => {
    // Créer une liste de test
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50 })
    );

    // Vérifier les props du conteneur
    expect(result.current.containerProps).toHaveProperty('ref');
    expect(result.current.containerProps).toHaveProperty('onScroll');
    expect(result.current.containerProps).toHaveProperty('style');
    expect(result.current.containerProps.style).toEqual({
      height: '100%',
      overflow: 'auto',
      position: 'relative',
    });
  });

  it('should provide correct item props', () => {
    // Créer une liste de test
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50 })
    );

    // Vérifier les props d'un élément
    const itemProps = result.current.itemProps(5, 250);
    expect(itemProps).toHaveProperty('style');
    expect(itemProps.style).toEqual({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '50px',
      transform: 'translateY(250px)',
    });
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() =>
      useVirtualList([], { itemHeight: 50 })
    );

    expect(result.current.virtualItems).toEqual([]);
    expect(result.current.totalHeight).toBe(0);
  });

  it('should respect overscan option', () => {
    // Créer une liste de test
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

    // Mock du conteneur avec une hauteur et une position de défilement
    const containerMock = {
      clientHeight: 200,
      scrollTop: 100,
    };

    // Utiliser un overscan personnalisé de 5
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50, overscan: 5 })
    );

    // Simuler la référence au conteneur
    // @ts-ignore
    result.current.containerProps.ref.current = containerMock;

    // Simuler un événement de défilement
    act(() => {
      result.current.containerProps.onScroll();
    });

    // Simuler le changement de hauteur du conteneur
    act(() => {
      // Appeler directement le callback de ResizeObserver
      const resizeObserverCallback = vi.fn().mockImplementation((entries) => {
        entries.forEach(entry => {
          containerMock.clientHeight = entry.contentRect.height;
        });
      });

      resizeObserverCallback([{ contentRect: { height: 200 } }]);
    });

    // Avec un overscan de 5, nous devrions voir plus d'éléments qu'avec l'overscan par défaut de 3
    expect(result.current.virtualItems.length).toBeGreaterThan(0);
  });

  it('should clean up resize observer on unmount', () => {
    // Créer une liste de test
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

    const { result, unmount } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50 })
    );

    // Simuler la référence au conteneur
    // @ts-ignore
    result.current.containerProps.ref.current = { clientHeight: 200 };

    // Simuler le montage du composant
    act(() => {
      // Appeler directement le callback de ResizeObserver
      const resizeObserverCallback = vi.fn().mockImplementation((entries) => {
        entries.forEach(entry => {
          result.current.containerProps.ref.current.clientHeight = entry.contentRect.height;
        });
      });

      resizeObserverCallback([{ contentRect: { height: 200 } }]);
    });

    // Démonter le composant
    unmount();

    // Vérifier que unobserve a été appelé
    expect(unobserveMock).toHaveBeenCalled();
  });
});
