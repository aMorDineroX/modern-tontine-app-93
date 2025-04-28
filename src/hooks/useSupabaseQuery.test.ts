import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSupabaseQuery, invalidateCache } from './useSupabaseQuery';
import { supabase } from '@/utils/supabase';

// Mock de supabase
vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}));

describe('useSupabaseQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    const mockQuery = vi.fn().mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useSupabaseQuery(mockQuery));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should return data when query resolves', async () => {
    const mockData = [{ id: 1, name: 'Test Group' }];
    const mockQuery = vi.fn().mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useSupabaseQuery(mockQuery));

    // Vérifier l'état initial
    expect(result.current.loading).toBe(true);

    // Attendre que la requête soit terminée
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('should return error when query rejects', async () => {
    const mockError = new Error('Test error');
    const mockQuery = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useSupabaseQuery(mockQuery));

    // Attendre que la requête soit terminée
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toEqual(mockError);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('should use cached data for the same query', async () => {
    const mockData = [{ id: 1, name: 'Test Group' }];
    const mockQuery = vi.fn().mockResolvedValue({ data: mockData, error: null });

    // Premier rendu
    const { result: result1 } = renderHook(() =>
      useSupabaseQuery(mockQuery, [1])
    );

    // Attendre que la première requête soit terminée
    await vi.waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    expect(result1.current.data).toEqual(mockData);
    expect(mockQuery).toHaveBeenCalledTimes(1);

    // Deuxième rendu avec les mêmes dépendances
    const { result: result2 } = renderHook(() =>
      useSupabaseQuery(mockQuery, [1])
    );

    // Les données devraient être immédiatement disponibles depuis le cache
    expect(result2.current.data).toEqual(mockData);
    expect(result2.current.loading).toBe(false);

    // La requête ne devrait pas être appelée à nouveau
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('should refetch when dependencies change', async () => {
    const mockData1 = [{ id: 1, name: 'Test Group 1' }];
    const mockData2 = [{ id: 2, name: 'Test Group 2' }];

    const mockQuery = vi.fn()
      .mockResolvedValueOnce({ data: mockData1, error: null })
      .mockResolvedValueOnce({ data: mockData2, error: null });

    // Rendu initial avec dependency = 1
    const { result, rerender } = renderHook(
      ({ dependency }) => useSupabaseQuery(mockQuery, [dependency]),
      { initialProps: { dependency: 1 } }
    );

    // Attendre que la première requête soit terminée
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData1);
    expect(mockQuery).toHaveBeenCalledTimes(1);

    // Changer la dépendance
    rerender({ dependency: 2 });

    // Attendre que la deuxième requête soit terminée
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(mockQuery).toHaveBeenCalledTimes(2);
  });
});

describe('invalidateCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Remplir le cache avec des données de test
    const mockQuery1 = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
    const mockQuery2 = vi.fn().mockResolvedValue({ data: [{ id: 2 }], error: null });

    renderHook(() => useSupabaseQuery(mockQuery1, ['groups']));
    renderHook(() => useSupabaseQuery(mockQuery2, ['users']));
  });

  it('should invalidate specific cache entries', async () => {
    // Vérifier que le cache contient des données
    const mockQuery1 = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
    const { result: result1 } = renderHook(() =>
      useSupabaseQuery(mockQuery1, ['groups'])
    );

    // Attendre que la requête soit mise en cache
    await vi.waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    // La requête ne devrait être appelée qu'une fois car les données sont en cache
    expect(mockQuery1).toHaveBeenCalledTimes(1);

    // Invalider le cache pour 'groups'
    act(() => {
      invalidateCache('groups');
    });

    // Refaire la même requête
    const mockQuery1Again = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
    const { result: result2 } = renderHook(() =>
      useSupabaseQuery(mockQuery1Again, ['groups'])
    );

    // Attendre que la requête soit terminée
    await vi.waitFor(() => {
      expect(result2.current.loading).toBe(false);
    });

    // La requête devrait être appelée car le cache a été invalidé
    expect(mockQuery1Again).toHaveBeenCalledTimes(1);

    // Les requêtes pour 'users' devraient toujours être en cache
    const mockQuery2Again = vi.fn().mockResolvedValue({ data: [{ id: 2 }], error: null });
    renderHook(() => useSupabaseQuery(mockQuery2Again, ['users']));

    // La requête ne devrait pas être appelée car les données sont toujours en cache
    expect(mockQuery2Again).not.toHaveBeenCalled();
  });

  it('should invalidate all cache entries', async () => {
    // Invalider tout le cache
    act(() => {
      invalidateCache();
    });

    // Refaire les deux requêtes
    const mockQuery1Again = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
    const mockQuery2Again = vi.fn().mockResolvedValue({ data: [{ id: 2 }], error: null });

    const { result: result1 } = renderHook(() =>
      useSupabaseQuery(mockQuery1Again, ['groups'])
    );

    const { result: result2 } = renderHook(() =>
      useSupabaseQuery(mockQuery2Again, ['users'])
    );

    // Attendre que les requêtes soient terminées
    await vi.waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    // Les deux requêtes devraient être appelées car le cache a été complètement invalidé
    expect(mockQuery1Again).toHaveBeenCalledTimes(1);
    expect(mockQuery2Again).toHaveBeenCalledTimes(1);
  });
});
