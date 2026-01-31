// FILE: src/hooks/useChatRouter.ts
/**
 * Chat Router Hook
 * 
 * Routes messages to appropriate handler:
 * - Property queries → V2 streaming endpoint
 * - Other queries → V1 chat endpoint (fallback)
 * 
 * This allows gradual migration from V1 to V2.
 */

import { useCallback, useState } from 'react';
import { isPropertyQuery, parsePropertyQuery } from '../services/v2PropertyApi';
import type { Message } from '../types/chat';

// ============================================================================
// Types
// ============================================================================

export interface ChatRouterOptions {
  onV1Message?: (message: string) => void;
  onV2PropertyQuery?: (query: string) => void;
  enableV2?: boolean; // Feature flag
}

export interface ChatRouterState {
  useV2ForCurrentMessage: boolean;
  currentMessageType: 'v1' | 'v2-property' | null;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Route chat messages to V1 or V2 based on content
 */
export function useChatRouter(options: ChatRouterOptions) {
  const [state, setState] = useState<ChatRouterState>({
    useV2ForCurrentMessage: false,
    currentMessageType: null,
  });

  /**
   * Send message - routes to V1 or V2 automatically
   */
  const sendMessage = useCallback((message: string) => {
    // Feature flag check
    if (!options.enableV2) {
      setState({
        useV2ForCurrentMessage: false,
        currentMessageType: 'v1',
      });
      options.onV1Message?.(message);
      return;
    }

    // Detect property query
    const isProperty = isPropertyQuery(message);
    const hasValidQuery = parsePropertyQuery(message) !== null;

    if (isProperty && hasValidQuery) {
      // Route to V2
      setState({
        useV2ForCurrentMessage: true,
        currentMessageType: 'v2-property',
      });
      options.onV2PropertyQuery?.(message);
    } else {
      // Route to V1 (fallback)
      setState({
        useV2ForCurrentMessage: false,
        currentMessageType: 'v1',
      });
      options.onV1Message?.(message);
    }
  }, [options]);

  /**
   * Check if a message would use V2 (without sending)
   */
  const wouldUseV2 = useCallback((message: string): boolean => {
    if (!options.enableV2) return false;
    const isProperty = isPropertyQuery(message);
    const hasValidQuery = parsePropertyQuery(message) !== null;
    return isProperty && hasValidQuery;
  }, [options.enableV2]);

  return {
    ...state,
    sendMessage,
    wouldUseV2,
  };
}

// ============================================================================
// Helper: Convert V2 property result to Message format
// ============================================================================

/**
 * Convert V2 property streaming state to chat Message format
 * 
 * This allows V2 results to be displayed in the existing chat UI.
 */
export function v2PropertyToMessage(
  properties: any[],
  aiInsights: string,
  isComplete: boolean
): Partial<Message> {
  const propertiesText = properties.length > 0
    ? `Found ${properties.length} properties:\n\n` +
      properties
        .slice(0, 5)
        .map(p => `- ${p.address}, ${p.city}: $${p.price.toLocaleString()}`)
        .join('\n')
    : '';

  const insightsText = aiInsights 
    ? `\n\n🤖 **AI Analysis**\n\n${aiInsights}`
    : '';

  return {
    role: 'assistant',
    content: propertiesText + insightsText,
    // Can add tool results here if needed for backward compatibility
  };
}
