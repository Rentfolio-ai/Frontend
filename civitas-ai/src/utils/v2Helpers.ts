// V2 Property Query Helpers
// Separated to avoid React hooks issues

export function parsePropertyQuery(msg: string, userPrefs?: any, mode?: string): any {
  const query: any = {
    limit: 7,
    include_ai: true,
    property_types: ["SFH"],
    mode: mode || 'hunter',
  };

  // Simple location extraction
  const msgLower = msg.toLowerCase();
  const locationMatch = msg.match(/\b(austin|dallas|houston|san antonio|fort worth|el paso)[,\s]?/i);
  query.location = locationMatch ? locationMatch[1] : "Austin, TX";

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
    msgLower.includes('house') || msgLower.includes('houses')
  );
  const hasLocationKeyword = (
    msgLower.includes('austin') || msgLower.includes('dallas') ||
    msgLower.includes('houston') || msgLower.includes('in ')
  );
  return hasPropertyKeyword || hasLocationKeyword || msgLower.includes('show me');
}
