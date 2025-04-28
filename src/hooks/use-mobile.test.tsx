import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restaurer les valeurs originales
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should return true when screen width is less than mobile breakpoint', () => {
    // Simuler un écran mobile (moins de 768px)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 500,
    });

    // Mock de matchMedia
    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return false when screen width is greater than or equal to mobile breakpoint', () => {
    // Simuler un écran desktop (768px ou plus)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    // Mock de matchMedia
    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should update when window size changes', () => {
    // Simuler un écran desktop initialement
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    // Créer un mock pour matchMedia avec un événement change
    let changeListener: Function | null = null;
    
    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (event: string, listener: Function) => {
        if (event === 'change') {
          changeListener = listener;
        }
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useIsMobile());
    
    // Initialement, devrait être false pour un écran desktop
    expect(result.current).toBe(false);
    
    // Simuler un changement de taille d'écran vers mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      });
      
      // Déclencher l'événement change
      if (changeListener) {
        changeListener();
      }
    });
    
    // Après le changement, devrait être true pour un écran mobile
    expect(result.current).toBe(true);
  });

  it('should clean up event listener on unmount', () => {
    // Mock de matchMedia avec des fonctions espion
    const addEventListenerSpy = vi.fn();
    const removeEventListenerSpy = vi.fn();
    
    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { unmount } = renderHook(() => useIsMobile());
    
    // Vérifier que addEventListener a été appelé
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    
    // Démonter le hook
    unmount();
    
    // Vérifier que removeEventListener a été appelé
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
