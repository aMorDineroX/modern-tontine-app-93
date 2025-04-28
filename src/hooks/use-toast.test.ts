import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useToast, reducer } from './use-toast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return toast function and empty toasts array by default', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
    expect(typeof result.current.toast).toBe('function');
    expect(typeof result.current.dismiss).toBe('function');
  });

  it('should add a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      });
    });
    
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].description).toBe('This is a test toast');
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('should dismiss a toast when dismiss function is called', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    
    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      });
      toastId = id;
    });
    
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].open).toBe(true);
    
    act(() => {
      result.current.dismiss(toastId);
    });
    
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].open).toBe(false);
    
    // After the remove delay, the toast should be removed
    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current.toasts.length).toBe(0);
  });

  it('should update a toast when update function is called', () => {
    const { result } = renderHook(() => useToast());
    
    let toastUpdate: (props: any) => void;
    
    act(() => {
      const { update } = result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      });
      toastUpdate = update;
    });
    
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    
    act(() => {
      toastUpdate({
        title: 'Updated Toast',
        description: 'This toast has been updated',
      });
    });
    
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].title).toBe('Updated Toast');
    expect(result.current.toasts[0].description).toBe('This toast has been updated');
  });

  it('should respect toast limit', () => {
    const { result } = renderHook(() => useToast());
    
    // Add multiple toasts
    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
      result.current.toast({ title: 'Toast 3' });
    });
    
    // Only the most recent toast should be kept (limit is 1)
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].title).toBe('Toast 3');
  });

  it('should dismiss all toasts when dismiss is called without id', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });
    
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].open).toBe(true);
    
    act(() => {
      result.current.dismiss();
    });
    
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].open).toBe(false);
    
    // After the remove delay, all toasts should be removed
    act(() => {
      vi.runAllTimers();
    });
    
    expect(result.current.toasts.length).toBe(0);
  });
});

describe('reducer', () => {
  it('should handle ADD_TOAST action', () => {
    const initialState = { toasts: [] };
    const toast = { id: '1', title: 'Test Toast', open: true };
    
    const newState = reducer(initialState, {
      type: 'ADD_TOAST',
      toast,
    });
    
    expect(newState.toasts.length).toBe(1);
    expect(newState.toasts[0]).toEqual(toast);
  });

  it('should handle UPDATE_TOAST action', () => {
    const initialState = {
      toasts: [{ id: '1', title: 'Test Toast', open: true }],
    };
    
    const newState = reducer(initialState, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated Toast' },
    });
    
    expect(newState.toasts.length).toBe(1);
    expect(newState.toasts[0].title).toBe('Updated Toast');
    expect(newState.toasts[0].open).toBe(true);
  });

  it('should handle DISMISS_TOAST action for a specific toast', () => {
    const initialState = {
      toasts: [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true },
      ],
    };
    
    const newState = reducer(initialState, {
      type: 'DISMISS_TOAST',
      toastId: '1',
    });
    
    expect(newState.toasts.length).toBe(2);
    expect(newState.toasts[0].open).toBe(false);
    expect(newState.toasts[1].open).toBe(true);
  });

  it('should handle DISMISS_TOAST action for all toasts', () => {
    const initialState = {
      toasts: [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true },
      ],
    };
    
    const newState = reducer(initialState, {
      type: 'DISMISS_TOAST',
    });
    
    expect(newState.toasts.length).toBe(2);
    expect(newState.toasts[0].open).toBe(false);
    expect(newState.toasts[1].open).toBe(false);
  });

  it('should handle REMOVE_TOAST action for a specific toast', () => {
    const initialState = {
      toasts: [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true },
      ],
    };
    
    const newState = reducer(initialState, {
      type: 'REMOVE_TOAST',
      toastId: '1',
    });
    
    expect(newState.toasts.length).toBe(1);
    expect(newState.toasts[0].id).toBe('2');
  });

  it('should handle REMOVE_TOAST action for all toasts', () => {
    const initialState = {
      toasts: [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true },
      ],
    };
    
    const newState = reducer(initialState, {
      type: 'REMOVE_TOAST',
    });
    
    expect(newState.toasts.length).toBe(0);
  });
});
