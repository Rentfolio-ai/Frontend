// FILE: src/hooks/useV2PropertyStream.ts
/**
 * Hook for V2 Property Streaming
 * 
 * Provides real-time property search with SSE streaming:
 * - Thinking indicators (like ChatGPT)
 * - Progressive property loading (fast!)
 * - Token-by-token AI streaming
 * - Progress tracking
 */

import { useState, useCallback, useRef } from 'react';
import {
  v2PropertyApi,
  type PropertySearchQuery,
  type Property,
  type MarketContext,
} from '../services/v2PropertyApi';

// ============================================================================
// Types
// ============================================================================

export interface V2PropertyStreamState {
  // Loading states
  isSearching: boolean;
  isStreamingAI: boolean;
  isComplete: boolean;
  
  // Thinking indicator
  thinkingMessage: string | null;
  progress: number;
  
  // Property results
  properties: Property[];
  totalFound: number;
  marketContext?: MarketContext;
  
  // AI insights
  aiInsights: string;
  
  // Error handling
  error: string | null;
}

interface UseV2PropertyStreamOptions {
  onPropertiesLoaded?: (properties: Property[], totalFound: number) => void;
  onAIComplete?: (insights: string) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useV2PropertyStream(options: UseV2PropertyStreamOptions = {}) {
  const [state, setState] = useState<V2PropertyStreamState>({
    isSearching: false,
    isStreamingAI: false,
    isComplete: true,
    thinkingMessage: null,
    progress: 0,
    properties: [],
    totalFound: 0,
    aiInsights: '',
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const aiTextRef = useRef<string>('');

  /**
   * Reset state before new search
   */
  const resetState = useCallback(() => {
    aiTextRef.current = '';
    setState({
      isSearching: true,
      isStreamingAI: false,
      isComplete: false,
      thinkingMessage: 'Starting search...',
      progress: 0,
      properties: [],
      totalFound: 0,
      aiInsights: '',
      error: null,
    });
  }, []);

  /**
   * Search properties with streaming
   */
  const searchProperties = useCallback(async (query: PropertySearchQuery) => {
    // Cancel any existing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state
    resetState();
    aiTextRef.current = '';

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      await v2PropertyApi.searchPropertiesStream(query, {
        // Thinking indicators
        onThinking: (message, progress) => {
          setState(prev => ({
            ...prev,
            thinkingMessage: message,
            progress,
            isSearching: progress < 0.5,
            isStreamingAI: progress >= 0.6,
          }));
        },

        // Property results (fast! ~500ms)
        onProperties: (properties, totalFound, marketContext) => {
          setState(prev => ({
            ...prev,
            properties,
            totalFound,
            marketContext,
            thinkingMessage: null, // Hide thinking, show results
            isSearching: false,
            progress: 0.5,
          }));

          // Callback
          options.onPropertiesLoaded?.(properties, totalFound);
        },

        // AI streaming (word by word)
        onAIChunk: (text, progress) => {
          aiTextRef.current += text;
          
          setState(prev => ({
            ...prev,
            aiInsights: aiTextRef.current,
            progress,
            isStreamingAI: true,
          }));
        },

        // Complete
        onComplete: () => {
          setState(prev => ({
            ...prev,
            thinkingMessage: null,
            isSearching: false,
            isStreamingAI: false,
            isComplete: true,
            progress: 1.0,
          }));

          // Callback
          if (aiTextRef.current) {
            options.onAIComplete?.(aiTextRef.current);
          }
        },

        // Error
        onError: (error) => {
          setState(prev => ({
            ...prev,
            error,
            thinkingMessage: null,
            isSearching: false,
            isStreamingAI: false,
            isComplete: true,
          }));

          // Callback
          options.onError?.(error);
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        thinkingMessage: null,
        isSearching: false,
        isStreamingAI: false,
        isComplete: true,
      }));

      options.onError?.(errorMessage);
    }
  }, [resetState, options]);

  /**
   * Cancel ongoing search
   */
  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      thinkingMessage: null,
      isSearching: false,
      isStreamingAI: false,
      isComplete: true,
    }));
  }, []);

  /**
   * Regenerate AI insights for current properties
   */
  const regenerateInsights = useCallback(async () => {
    if (state.properties.length === 0) {
      return;
    }

    setState(prev => ({
      ...prev,
      isStreamingAI: true,
      thinkingMessage: '🤖 Regenerating AI insights...',
      aiInsights: '',
      error: null,
    }));

    aiTextRef.current = '';

    try {
      const propertyIds = state.properties.map(p => p.id);
      
      const response = await v2PropertyApi.generateInsights({
        property_ids: propertyIds,
        insight_type: 'investment',
      });

      aiTextRef.current = response.insights;

      setState(prev => ({
        ...prev,
        aiInsights: response.insights,
        isStreamingAI: false,
        thinkingMessage: null,
      }));

      options.onAIComplete?.(response.insights);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate insights';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isStreamingAI: false,
        thinkingMessage: null,
      }));

      options.onError?.(errorMessage);
    }
  }, [state.properties, options]);

  return {
    // State
    ...state,
    
    // Actions
    searchProperties,
    cancelSearch,
    regenerateInsights,
  };
}

// ============================================================================
// Helper Hook: Parse query from natural language
// ============================================================================

/**
 * Hook to parse natural language into property search query
 * 
 * Usage:
 * const { parseQuery } = usePropertyQueryParser();
 * const query = parseQuery("Show me 3 bedroom homes in Austin under $400k");
 */
export function usePropertyQueryParser() {
  const parseQuery = useCallback((message: string): PropertySearchQuery => {
    const query: PropertySearchQuery = { limit: 10 };

    // Location
    const locationMatch = message.match(/\b(?:in|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (locationMatch) {
      query.location = locationMatch[1];
    }

    // Price
    const priceMatch = message.match(/under\s+\$?([\d,]+)k?/i);
    if (priceMatch) {
      const price = parseInt(priceMatch[1].replace(/,/g, ''));
      query.max_price = priceMatch[0].toLowerCase().includes('k') ? price * 1000 : price;
    }

    // Bedrooms
    const bedroomMatch = message.match(/(\d+)\s+bed(?:room)?s?/i);
    if (bedroomMatch) {
      query.min_beds = parseInt(bedroomMatch[1]);
    }

    // Bathrooms
    const bathroomMatch = message.match(/(\d+(?:\.\d+)?)\s+bath(?:room)?s?/i);
    if (bathroomMatch) {
      query.min_baths = parseFloat(bathroomMatch[1]);
    }

    // Property type
    if (message.match(/\b(?:house|houses|home|homes|single.?family)\b/i)) {
      query.property_type = 'SFH';
    } else if (message.match(/\b(?:condo|condos|condominium)\b/i)) {
      query.property_type = 'CONDO';
    } else if (message.match(/\b(?:apartment|apartments|multi.?family)\b/i)) {
      query.property_type = 'MULTI';
    }

    return query;
  }, []);

  return { parseQuery };
}
