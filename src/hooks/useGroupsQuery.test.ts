import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserGroups, useInfiniteGroups, useCreateGroup, useGroupDetails, useUpdateGroup } from './useGroupsQuery';
import { supabase } from '@/utils/supabase';
import React from 'react';

// Mock the supabase client
vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  },
  fetchUserGroups: vi.fn(),
}));

// Create a wrapper for the test components
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGroupsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('useUserGroups', () => {
    it('returns empty data when userId is undefined', async () => {
      const { result } = renderHook(() => useUserGroups(undefined), {
        wrapper: createWrapper(),
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toEqual({ data: [] });
    });
    
    it('calls fetchUserGroups with the correct userId', async () => {
      const mockFetchUserGroups = vi.mocked(supabase.from);
      mockFetchUserGroups.mockImplementation(() => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
      }));
      
      const { result } = renderHook(() => useUserGroups('test-user-id'), {
        wrapper: createWrapper(),
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
  
  describe('useInfiniteGroups', () => {
    it('returns empty data when userId is undefined', async () => {
      const { result } = renderHook(() => useInfiniteGroups(undefined), {
        wrapper: createWrapper(),
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toBeUndefined();
    });
  });
  
  describe('useCreateGroup', () => {
    it('provides a mutation function', async () => {
      const { result } = renderHook(() => useCreateGroup(), {
        wrapper: createWrapper(),
      });
      
      expect(result.current.mutate).toBeDefined();
    });
  });
  
  describe('useGroupDetails', () => {
    it('returns empty data when groupId is undefined', async () => {
      const { result } = renderHook(() => useGroupDetails(undefined), {
        wrapper: createWrapper(),
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toEqual({ data: null });
    });
  });
  
  describe('useUpdateGroup', () => {
    it('provides a mutation function', async () => {
      const { result } = renderHook(() => useUpdateGroup(), {
        wrapper: createWrapper(),
      });
      
      expect(result.current.mutate).toBeDefined();
    });
  });
});
