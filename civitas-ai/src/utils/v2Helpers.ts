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
 * Passes full investment preferences so the backend can personalise scoring.
 */
export function parsePropertyQuery(msg: string, userPrefs?: any, mode?: string, modelId?: string): any {
  const query: any = {
    limit: 100,
    include_ai: true,
    mode: mode || 'hunter',
    raw_query: msg,
  };

  if (modelId) query.model_id = modelId;

  // Budget
  if (userPrefs?.budgetRange?.max) {
    query.max_price = userPrefs.budgetRange.max;
  }
  if (userPrefs?.budgetRange?.min) {
    query.min_price = userPrefs.budgetRange.min;
  }

  // Strategy (STR / LTR / FLIP)
  if (userPrefs?.defaultStrategy) {
    query.strategy = userPrefs.defaultStrategy;
  }

  // Preferred bedrooms
  if (userPrefs?.preferredBedrooms) {
    query.min_beds = userPrefs.preferredBedrooms;
  }

  // Property types from preferences (only filter if user has set them)
  if (userPrefs?.preferredPropertyTypes?.length) {
    query.property_types = userPrefs.preferredPropertyTypes;
  }

  // Favorite markets for prioritization
  if (userPrefs?.favoriteMarkets?.length) {
    query.preferred_markets = userPrefs.favoriteMarkets;
  }

  // User ID so backend can fetch financial DNA and full criteria
  if (userPrefs?.user_id) {
    query.user_id = userPrefs.user_id;
  }

  // Language preference
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
export function parseChatQuery(
  msg: string,
  mode: 'research' | 'strategist',
  threadId?: string,
  language?: string,
  propertyContext?: any,
  userIdentity?: { id?: string; name?: string; email?: string; phone?: string },
  conversationHistory?: Array<{ role: string; content: string; tools?: any[] }>,
  professionalContext?: { name?: string; email?: string; phone?: string; category?: string; id?: string },
  userPreferences?: {
    budgetRange?: { min?: number; max?: number };
    defaultStrategy?: string;
    favoriteMarkets?: string[];
    financialDna?: any;
    clientLocation?: any;
  },
  modelId?: string,
  isTemporary?: boolean,
): any {
  const query: any = {
    query: msg,
    mode: mode,
  };

  if (modelId) query.model_id = modelId;
  if (isTemporary) query.is_temporary = true;

  if (threadId) {
    query.thread_id = threadId;
  }

  if (language && language !== 'en-US') {
    query.response_language = language;
  }

  if (propertyContext) {
    query.property_context = propertyContext;
  }

  if (userIdentity?.id) query.user_id = userIdentity.id;
  if (userIdentity?.name) query.user_name = userIdentity.name;
  if (userIdentity?.email) query.user_email = userIdentity.email;
  if (userIdentity?.phone) query.user_phone = userIdentity.phone;

  if (conversationHistory && conversationHistory.length > 0) {
    query.conversation_history = conversationHistory;
  }

  if (professionalContext) {
    query.professional_context = professionalContext;
  }

  if (userPreferences) {
    query.user_preferences = userPreferences;
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
