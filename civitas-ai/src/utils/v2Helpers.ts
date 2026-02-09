// V2 Query Helpers
// Separated to avoid React hooks issues
//
// Two query builders:
// - parsePropertyQuery  → for hunter mode  (/v2/property/search/stream)
// - parseChatQuery      → for research/strategist mode (/v2/chat/stream)
//
// Location extraction is handled by the backend LLM.

/**
 * Build request body for hunter mode (property search).
 */
export function parsePropertyQuery(msg: string, userPrefs?: any, mode?: string): any {
  const query: any = {
    limit: 7,
    include_ai: true,
    property_types: ["SFH"],
    mode: mode || 'hunter',
    raw_query: msg, // Let the backend LLM extract the location
  };

  // Use user budget if available
  if (userPrefs?.budgetRange?.max) {
    query.max_price = userPrefs.budgetRange.max;
  }

  // Include language preference so AI responds in the correct language
  if (userPrefs?.language && userPrefs.language !== 'en-US') {
    query.response_language = userPrefs.language;
  }

  console.log('[v2Helpers] Parsed hunter query:', query);
  return query;
}

/**
 * Build request body for research/strategist mode (conversational AI).
 * Includes thread_id for multi-turn conversation memory.
 */
export function parseChatQuery(msg: string, mode: 'research' | 'strategist', threadId?: string, language?: string): any {
  const query: any = {
    query: msg,
    mode: mode,
  };

  if (threadId) {
    query.thread_id = threadId;
  }

  // Include language preference so AI responds in the correct language
  if (language && language !== 'en-US') {
    query.response_language = language;
  }

  console.log('[v2Helpers] Parsed chat query:', query);
  return query;
}

/**
 * @deprecated All queries now route via V2; mode determines the endpoint.
 */
export function isPropertyQuery(msg: string): boolean {
  const msgLower = msg.toLowerCase();

  if (
    msgLower.includes('research') ||
    msgLower.includes('market') ||
    msgLower.includes('stats') ||
    msgLower.includes('trends') ||
    msgLower.includes('analyze') ||
    msgLower.includes('analysis')
  ) {
    return false;
  }

  const hasPropertyKeyword = (
    msgLower.includes('property') || msgLower.includes('properties') ||
    msgLower.includes('home') || msgLower.includes('homes') ||
    msgLower.includes('house') || msgLower.includes('houses') ||
    msgLower.includes('rental') || msgLower.includes('rentals') ||
    msgLower.includes('investment') || msgLower.includes('condo') ||
    msgLower.includes('apartment')
  );

  const hasLocationPreposition = /\b(?:in|near|around)\s+[A-Z]/.test(msg);

  const hasSearchIntent = (
    msgLower.includes('find') ||
    msgLower.includes('search') ||
    msgLower.includes('show me') ||
    msgLower.includes('looking for')
  );

  return hasPropertyKeyword || (hasSearchIntent && hasLocationPreposition) || msgLower.includes('show me');
}
