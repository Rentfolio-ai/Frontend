// V2 Property Query Helpers
// Separated to avoid React hooks issues
//
// Location extraction is handled by the backend LLM — the frontend
// just passes the raw user query and optional budget/preferences.

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

  console.log('[v2Helpers] Parsed query:', query, 'mode:', mode);
  return query;
}

export function isPropertyQuery(msg: string): boolean {
  const msgLower = msg.toLowerCase();

  // Explicitly EXCLUDE research/market analysis queries which should go to the Agent
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

  // Generic location preposition pattern (e.g. "in San Francisco", "near Denver")
  const hasLocationPreposition = /\b(?:in|near|around)\s+[A-Z]/.test(msg);

  // "find" / "search" / "show me" intent
  const hasSearchIntent = (
    msgLower.includes('find') ||
    msgLower.includes('search') ||
    msgLower.includes('show me') ||
    msgLower.includes('looking for')
  );

  return hasPropertyKeyword || (hasSearchIntent && hasLocationPreposition) || msgLower.includes('show me');
}
