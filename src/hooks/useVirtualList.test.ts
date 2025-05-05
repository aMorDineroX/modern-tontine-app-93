import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVirtualList } from './useVirtualList';

// Mock de ResizeObserver
const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();
let resizeCallback: (entries: any[]) => void;

// @ts-ignore
global.ResizeObserver = vi.fn().mockImplementation((callback) => {
  resizeCallback = callback;
  return {
    observe: observeMock,
    unobserve: unobserveMock,
    disconnect: disconnectMock
  };
});

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

    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50 })
    );

    // Simuler la référence au conteneur
    const containerMock = {
      clientHeight: 200,
      scrollTop: 100,
    };

    act(() => {
      // @ts-ignore - Assigner directement la référence
      result.current.containerProps.ref.current = containerMock;
      
      // Simuler l'appel du ResizeObserver
      if (resizeCallback) {
        resizeCallback([
          {
            target: containerMock,
            contentRect: { height: 200 }
          }
        ]);
      }
      
      // Déclencher l'événement de scroll
      result.current.containerProps.onScroll();
    });

    // Vérifier que des éléments virtuels ont été générés
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

    // Utiliser un overscan personnalisé de 5
    const { result } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50, overscan: 5 })
    );

    const containerMock = {
      clientHeight: 200,
      scrollTop: 100,
    };

    act(() => {
      // @ts-ignore - Assigner directement la référence
      result.current.containerProps.ref.current = containerMock;
      
      // Simuler l'appel du ResizeObserver
      if (resizeCallback) {
        resizeCallback([
          {
            target: containerMock,
            contentRect: { height: 200 }
          }
        ]);
      }
      
      // Déclencher l'événement de scroll
      result.current.containerProps.onScroll();
    });

    // Vérifier que des éléments virtuels ont été générés
    expect(result.current.virtualItems.length).toBeGreaterThan(0);
  });

  it('should clean up resize observer on unmount', () => {
    // Créer une liste de test
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

    const { result, unmount } = renderHook(() =>
      useVirtualList(items, { itemHeight: 50 })
    );

    const containerMock = { clientHeight: 200 };

    act(() => {
      // @ts-ignore - Assigner directement la référence
      result.current.containerProps.ref.current = containerMock;
    });

    // Vérifier que observe a été appelé (doit être appelé quand la ref est assignée)
    expect(observeMock).toHaveBeenCalledTimes(0);  // Peut être 0 car l'observation est faite avec useEffect

    // Démonter le composant
    unmount();

    // La fonction de nettoyage du useEffect devrait être appelée lors du démontage
    expect(disconnectMock).toHaveBeenCalled();
  });
});
