import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ServiceResponse } from '@/services';

/**
 * Hook personnalisé pour effectuer des requêtes de service avec React Query
 * 
 * @param queryKey - Clé de la requête pour React Query
 * @param queryFn - Fonction qui effectue la requête de service
 * @param options - Options supplémentaires pour useQuery
 * @returns Résultat de useQuery
 */
export function useServiceQuery<TData, TError = any>(
  queryKey: unknown[],
  queryFn: () => Promise<ServiceResponse<TData>>,
  options?: Omit<UseQueryOptions<TData, TError, TData, unknown[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const { success, data, error } = await queryFn();
      
      if (!success) {
        throw error;
      }
      
      return data as TData;
    },
    ...options
  });
}

/**
 * Hook personnalisé pour effectuer des mutations de service avec React Query
 * 
 * @param mutationFn - Fonction qui effectue la mutation de service
 * @param options - Options supplémentaires pour useMutation
 * @returns Résultat de useMutation
 */
export function useServiceMutation<TData, TVariables, TError = any>(
  mutationFn: (variables: TVariables) => Promise<ServiceResponse<TData>>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
    invalidateQueries?: unknown[][];
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const { success, data, error } = await mutationFn(variables);
      
      if (!success) {
        throw error;
      }
      
      return data as TData;
    },
    onSuccess: (data, variables) => {
      // Invalider les requêtes spécifiées
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Appeler le callback onSuccess
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
    onSettled: options?.onSettled as any
  });
}

/**
 * Hook personnalisé pour précharger des données de service avec React Query
 * 
 * @param queryKey - Clé de la requête pour React Query
 * @param queryFn - Fonction qui effectue la requête de service
 */
export function prefetchServiceQuery<TData, TError = any>(
  queryKey: unknown[],
  queryFn: () => Promise<ServiceResponse<TData>>
) {
  const queryClient = useQueryClient();
  
  return queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => {
      const { success, data, error } = await queryFn();
      
      if (!success) {
        throw error;
      }
      
      return data as TData;
    }
  });
}
