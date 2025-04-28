// src/hooks/useSupabaseQuery.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const cache = new Map();

export function useSupabaseQuery(query, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const cacheKey = JSON.stringify({ query, dependencies });
  
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