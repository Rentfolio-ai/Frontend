// FILE: src/services/v2PropertyApi.ts
/**
 * V2 Property API Service
 * 
 * Handles all V2 property intelligence endpoints with SSE streaming support.
 * Provides type-safe API calls for property search, analysis, and AI insights.
 */

import { apiLogger } from '@/utils/logger';

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;
const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const BACKEND_URL = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) 
  ? envApiUrl 
  : 'http://localhost:8000';

// ============================================================================
// Types
// ============================================================================

export interface PropertySearchQuery {
  location?: string;
  max_price?: number;
  min_price?: number;
  min_beds?: number;
  max_beds?: number;
  min_baths?: number;
  property_type?: string;
  limit?: number;
  include_ai?: boolean;
}

export interface CalculatedMetrics {
  monthly_mortgage: number;
  monthly_expenses: number;
  monthly_cash_flow: number;
  annual_noi: number;
  cap_rate: number;
  cash_on_cash_roi: number;
  total_roi: number;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  year_built?: number;
  property_type?: string;
  lot_size?: number;
  estimated_rent?: number;
  image_url?: string;
  calculated_metrics?: CalculatedMetrics;
}

export interface MarketContext {
  avg_price?: number;
  median_price?: number;
  avg_price_per_sqft?: number;
  property_count?: number;
  market_summary?: string;
}

export interface PropertySearchResponse {
  properties: Property[];
  total_found: number;
  market_context?: MarketContext;
  ai_insights?: string;
  has_ai: boolean;
  response_time_ms?: number;
}

export interface V2StreamEvent {
  type: 'thinking' | 'properties' | 'ai_chunk' | 'complete' | 'error';
  message?: string;
  progress?: number;
  timestamp?: number;
  
  // Properties event
  properties?: Property[];
  total_found?: number;
  market_context?: MarketContext;
  
  // AI chunk event
  text?: string;
}

export interface InsightsRequest {
  property_ids: string[];
  insight_type?: 'investment' | 'market' | 'comparative';
  context?: Record<string, any>;
}

export interface AIInsightsResponse {
  insights: string;
  model_used: string;
  cost_usd: number;
  confidence: number;
  response_time_ms: number;
  property_count: number;
}

// ============================================================================
// V2 Property API Service
// ============================================================================

export class V2PropertyApi {
  private baseUrl: string;
  private apiKey: string | undefined;

  constructor(baseUrl: string = BACKEND_URL, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || CIVITAS_API_KEY;
  }

  /**
   * Build headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
    };
  }

  /**
   * Search properties (non-streaming, fast)
   * 
   * Use this for quick property searches without AI insights.
   * Response time: ~500ms
   */
  async searchProperties(query: PropertySearchQuery): Promise<PropertySearchResponse> {
    const url = `${this.baseUrl}/v2/property/search`;
    const startedAt = performance.now();

    try {
      apiLogger.request({ method: 'POST', url, service: 'v2-property', payloadPreview: JSON.stringify(query).slice(0, 100) });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        const durationMs = performance.now() - startedAt;
        apiLogger.error({ method: 'POST', url, service: 'v2-property', status: response.status, durationMs, error: `HTTP ${response.status}` });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PropertySearchResponse = await response.json();
      apiLogger.response({ method: 'POST', url, service: 'v2-property', status: 200, durationMs: performance.now() - startedAt });

      return data;
    } catch (error) {
      apiLogger.error({ method: 'POST', url, service: 'v2-property', error });
      throw error;
    }
  }

  /**
   * Search properties with SSE streaming
   * 
   * Use this for real-time property searches with progressive loading and AI insights.
   * Provides thinking indicators, property results, and streaming AI text.
   * 
   * @param query - Property search parameters
   * @param handlers - Event handlers for stream events
   * @returns Promise that resolves when stream is complete
   */
  async searchPropertiesStream(
    query: PropertySearchQuery,
    handlers: {
      onThinking?: (message: string, progress: number) => void;
      onProperties?: (properties: Property[], totalFound: number, marketContext?: MarketContext) => void;
      onAIChunk?: (text: string, progress: number) => void;
      onComplete?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<void> {
    const url = `${this.baseUrl}/v2/property/search/stream`;
    const startedAt = performance.now();

    console.log('[v2PropertyApi] 🚀 searchPropertiesStream called!');
    console.log('[v2PropertyApi] 📍 URL:', url);
    console.log('[v2PropertyApi] 📊 Query:', query);

    try {
      apiLogger.request({ method: 'POST', url, service: 'v2-property-stream', payloadPreview: JSON.stringify(query).slice(0, 100) });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        const durationMs = performance.now() - startedAt;
        apiLogger.error({ method: 'POST', url, service: 'v2-property-stream', status: response.status, durationMs, error: `HTTP ${response.status}` });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          handlers.onComplete?.();
          apiLogger.response({ method: 'POST', url, service: 'v2-property-stream', status: 200, durationMs: performance.now() - startedAt });
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete events (separated by \n\n)
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event

        for (const event of events) {
          if (event.startsWith('data: ')) {
            try {
              const jsonStr = event.substring(6).trim();
              if (jsonStr === '[DONE]' || jsonStr === '') continue;

              const data: V2StreamEvent = JSON.parse(jsonStr);

              // Handle event based on type
              switch (data.type) {
                case 'thinking':
                  if (data.message && data.progress !== undefined) {
                    handlers.onThinking?.(data.message, data.progress);
                  }
                  break;

                case 'properties':
                  if (data.properties && data.total_found !== undefined) {
                    handlers.onProperties?.(data.properties, data.total_found, data.market_context);
                  }
                  break;

                case 'ai_chunk':
                  if (data.text && data.progress !== undefined) {
                    handlers.onAIChunk?.(data.text, data.progress);
                  }
                  break;

                case 'complete':
                  // Completion handled after loop
                  break;

                case 'error':
                  if (data.message) {
                    handlers.onError?.(data.message);
                  }
                  break;
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', event, e);
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Stream failed';
      apiLogger.error({ method: 'POST', url, service: 'v2-property-stream', error: errorMessage });
      handlers.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Generate AI insights for specific properties (background loading)
   * 
   * Use this to generate or regenerate AI insights for properties that are already displayed.
   * Useful for "Regenerate insights" buttons or background loading after initial results.
   */
  async generateInsights(request: InsightsRequest): Promise<AIInsightsResponse> {
    const url = `${this.baseUrl}/v2/property/insights`;
    const startedAt = performance.now();

    try {
      apiLogger.request({ method: 'POST', url, service: 'v2-insights', payloadPreview: JSON.stringify(request).slice(0, 100) });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const durationMs = performance.now() - startedAt;
        apiLogger.error({ method: 'POST', url, service: 'v2-insights', status: response.status, durationMs, error: `HTTP ${response.status}` });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AIInsightsResponse = await response.json();
      apiLogger.response({ method: 'POST', url, service: 'v2-insights', status: 200, durationMs: performance.now() - startedAt });

      return data;
    } catch (error) {
      apiLogger.error({ method: 'POST', url, service: 'v2-insights', error });
      throw error;
    }
  }

  /**
   * Health check for V2 endpoints
   */
  async healthCheck(): Promise<{ status: string; version: string; features: string[] }> {
    const url = `${this.baseUrl}/v2/property/health`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('V2 health check failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const v2PropertyApi = new V2PropertyApi();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse natural language query into PropertySearchQuery
 * 
 * Examples:
 * - "properties in Austin" → { location: "Austin" }
 * - "homes under $400k" → { max_price: 400000 }
 * - "3 bedroom houses in Dallas" → { location: "Dallas", min_beds: 3 }
 */
export function parsePropertyQuery(message: string): PropertySearchQuery | null {
  const query: PropertySearchQuery = { limit: 10 };
  let hasMatch = false;

  // Location
  const locationMatch = message.match(/\b(?:in|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (locationMatch) {
    query.location = locationMatch[1];
    hasMatch = true;
  }

  // Price
  const priceMatch = message.match(/under\s+\$?([\d,]+)k?/i);
  if (priceMatch) {
    const price = parseInt(priceMatch[1].replace(/,/g, ''));
    query.max_price = priceMatch[0].includes('k') ? price * 1000 : price;
    hasMatch = true;
  }

  // Bedrooms
  const bedroomMatch = message.match(/(\d+)\s+bed(?:room)?s?/i);
  if (bedroomMatch) {
    query.min_beds = parseInt(bedroomMatch[1]);
    hasMatch = true;
  }

  // Property type
  if (message.match(/\b(?:house|houses|home|homes|single.?family)\b/i)) {
    query.property_type = 'SFH';
    hasMatch = true;
  } else if (message.match(/\b(?:condo|condos|condominium)\b/i)) {
    query.property_type = 'CONDO';
    hasMatch = true;
  } else if (message.match(/\b(?:apartment|apartments)\b/i)) {
    query.property_type = 'MULTI';
    hasMatch = true;
  }

  return hasMatch ? query : null;
}

/**
 * Check if a message is a property search query
 */
export function isPropertyQuery(message: string): boolean {
  console.log('[isPropertyQuery] 🔍 Called with message:', message);
  
  const propertyKeywords = [
    'property', 'properties', 'home', 'homes', 'house', 'houses',
    'condo', 'condos', 'apartment', 'apartments',
    'real estate', 'for sale', 'listing', 'listings',
    'find', 'search', 'show me', 'looking for'
  ];

  const locationKeywords = [
    'in', 'near', 'around', 'austin', 'dallas', 'houston', 'san antonio',
    'texas', 'tx'
  ];

  const messageLower = message.toLowerCase();
  console.log('[isPropertyQuery] 📝 Lowercase:', messageLower);
  
  const hasPropertyKeyword = propertyKeywords.some(kw => messageLower.includes(kw));
  const hasLocationKeyword = locationKeywords.some(kw => messageLower.includes(kw));
  
  console.log('[isPropertyQuery] 🏠 hasPropertyKeyword:', hasPropertyKeyword);
  console.log('[isPropertyQuery] 📍 hasLocationKeyword:', hasLocationKeyword);
  
  const result = hasPropertyKeyword || hasLocationKeyword;
  console.log('[isPropertyQuery] ✅ RESULT:', result);

  return result;
}
