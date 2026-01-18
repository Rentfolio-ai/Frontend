/**
 * Streaming configuration
 * 
 * Controls which SSE streaming implementation to use.
 * Set VITE_USE_SSE_V2=true to enable the new production-grade implementation.
 */

export const STREAMING_CONFIG = {
  // Use SSE v2 (production-grade) or v1 (legacy)
  useV2: import.meta.env.VITE_USE_SSE_V2 === 'true',
  
  // Endpoints
  v1Endpoint: '/api/stream',
  v2Endpoint: '/api/stream/v2',
  
  // Get active endpoint
  get endpoint() {
    return this.useV2 ? this.v2Endpoint : this.v1Endpoint;
  },
  
  // V2-specific settings
  v2: {
    heartbeatTimeout: Number(import.meta.env.VITE_SSE_HEARTBEAT_TIMEOUT) || 30000,
    maxReconnectAttempts: Number(import.meta.env.VITE_SSE_MAX_RECONNECT_ATTEMPTS) || 3,
    reconnectDelay: 2000
  }
} as const;

export type StreamingVersion = 'v1' | 'v2';
