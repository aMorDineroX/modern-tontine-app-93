import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const cache = new Map();

/**
 * Hook personnalisé pour effectuer des requêtes Supabase avec mise en cache
 * 
 * @param {Function} query - Fonction qui retourne une promesse de requête Supabase
 * @param {Array} dependencies - Tableau de dépendances pour déclencher la requête
 * @returns {Object} { data, error, loading } - Résultats de la requête
 * 
 * @example
 * const { data, error, loading } = useSupabaseQuery(
 *   () => supabase.from('tontine_groups').select('*'),
 *   [userId]
 * );
 */
export function useSupabaseQuery(query, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const cacheKey = JSON.stringify({ query: query.toString(), dependencies });
  
  useEffect(() => {
    const fetchData = async () => {
      // Vérifier si les données sont en cache
      if (cache.has(cacheKey)) {
        setData(cache.get(cacheKey));
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const result = await query();
        setData(result.data);
        // Mettre en cache les résultats
        cache.set(cacheKey, result.data);
        setError(null);
      } catch (error) {
        setError(error);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, dependencies);
  
  return { data, error, loading };
}

/**
 * Fonction pour invalider le cache
 * 
 * @param {string} pattern - Motif pour invalider des clés spécifiques (optionnel)
 */
export function invalidateCache(pattern = null) {
  if (pattern) {
    // Invalider les clés qui correspondent au motif
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    // Invalider tout le cache
    cache.clear();
  }
}
