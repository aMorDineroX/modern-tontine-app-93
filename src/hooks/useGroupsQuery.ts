import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase, fetchUserGroups } from '@/utils/supabase';
import { Group } from '@/types/group';

/**
 * Custom hook for fetching user groups with React Query
 * 
 * @param userId - The user ID to fetch groups for
 * @param options - Additional options for the query
 * @returns Query result with groups data
 */
export function useUserGroups(userId: string | undefined, options?: { 
  enabled?: boolean,
  staleTime?: number,
  onSuccess?: (data: any) => void
}) {
  return useQuery({
    queryKey: ['groups', userId],
    queryFn: async () => {
      if (!userId) {
        return { data: [] };
      }
      
      const result = await fetchUserGroups(userId);
      return result;
    },
    enabled: !!userId && (options?.enabled !== false),
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes by default
    onSuccess: options?.onSuccess,
  });
}

/**
 * Custom hook for fetching paginated groups with infinite loading
 * 
 * @param userId - The user ID to fetch groups for
 * @param pageSize - Number of groups to fetch per page
 * @param options - Additional options for the query
 * @returns Infinite query result with paginated groups data
 */
export function useInfiniteGroups(userId: string | undefined, pageSize: number = 10, options?: {
  enabled?: boolean,
  staleTime?: number,
  onSuccess?: (data: any) => void
}) {
  return useInfiniteQuery({
    queryKey: ['infiniteGroups', userId, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) {
        return { data: [], nextPage: null };
      }
      
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;
      
      // Fetch user's groups with pagination
      const { data: createdGroups, error: createdError } = await supabase
        .from('tontine_groups')
        .select('*')
        .eq('created_by', userId)
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (createdError) throw createdError;
      
      // Fetch groups the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);
      
      if (membershipError) throw membershipError;
      
      // If user is a member of any groups, fetch those groups
      let memberGroups = [];
      if (memberships && memberships.length > 0) {
        const groupIds = memberships.map(m => m.group_id);
        
        const { data: groups, error: groupsError } = await supabase
          .from('tontine_groups')
          .select('*')
          .in('id', groupIds)
          .range(from, to)
          .order('created_at', { ascending: false });
        
        if (groupsError) throw groupsError;
        memberGroups = groups || [];
      }
      
      // Combine created groups and member groups, remove duplicates
      const allGroups = [...(createdGroups || []), ...memberGroups];
      const uniqueGroups = Array.from(new Map(allGroups.map(g => [g.id, g])).values());
      
      // Determine if there are more pages
      const hasMore = uniqueGroups.length === pageSize;
      
      return { 
        data: uniqueGroups, 
        nextPage: hasMore ? pageParam + 1 : null 
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId && (options?.enabled !== false),
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes by default
    onSuccess: options?.onSuccess,
  });
}

/**
 * Custom hook for creating a new group with React Query
 * 
 * @returns Mutation function and state for creating a group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupData: any) => {
      const { data, error } = await supabase
        .from('tontine_groups')
        .insert(groupData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate groups queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteGroups'] });
    },
  });
}

/**
 * Custom hook for fetching a single group by ID
 * 
 * @param groupId - The group ID to fetch
 * @param options - Additional options for the query
 * @returns Query result with group data
 */
export function useGroupDetails(groupId: string | number | undefined, options?: {
  enabled?: boolean,
  staleTime?: number,
  onSuccess?: (data: any) => void
}) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) {
        return { data: null };
      }
      
      const { data, error } = await supabase
        .from('tontine_groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (error) throw error;
      return { data };
    },
    enabled: !!groupId && (options?.enabled !== false),
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes by default
    onSuccess: options?.onSuccess,
  });
}

/**
 * Custom hook for updating a group
 * 
 * @returns Mutation function and state for updating a group
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string | number, data: Partial<Group> }) => {
      const { data: updatedData, error } = await supabase
        .from('tontine_groups')
        .update(data)
        .eq('id', groupId)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific group query
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
      // Invalidate groups list queries
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteGroups'] });
    },
  });
}
