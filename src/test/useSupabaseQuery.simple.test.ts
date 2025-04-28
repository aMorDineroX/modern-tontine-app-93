import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';

// Mock du module supabase
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  }
}));

describe('useSupabaseQuery Simple Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', async () => {
    // Créer une fonction de requête mock qui retourne une promesse
    const mockQuery = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Test Group' }],
      error: null
    });

    const { result } = renderHook(() => useSupabaseQuery(mockQuery));

    // Vérifier l'état initial
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Attendre que la requête soit terminée
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Vérifier que les données sont chargées
    expect(result.current.data).toEqual([{ id: 1, name: 'Test Group' }]);
    expect(result.current.error).toBeNull();
  });
});
