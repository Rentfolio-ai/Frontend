/**
 * Hook for fetching context-aware suggestions
 * Larry & Sergey: Fast. Simple. Cached.
 */

import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Suggestion, UserScreen } from '../types/context';

interface UseSuggestionsReturn {
  suggestions: Suggestion[];
  loading: boolean;
  error: Error | null;
}

export function useContextSuggestions(
  screen: UserScreen, 
  propertyId?: string
): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchSuggestions() {
      setLoading(true);
      setError(null);
      
      try {
        const { data } = await api.get('/api/context/suggestions', {
          params: { screen, property_id: propertyId }
        });
        
        if (mounted) {
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          // Fail gracefully - empty suggestions
          setSuggestions([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    fetchSuggestions();
    
    return () => { 
      mounted = false; 
    };
  }, [screen, propertyId]);

  return { suggestions, loading, error };
}
