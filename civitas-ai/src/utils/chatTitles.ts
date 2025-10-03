// FILE: src/utils/chatTitles.ts

/**
 * Generates a meaningful chat title from the first user message
 * Similar to how ChatGPT and Gemini create conversation titles
 */
export function generateChatTitle(message: string): string {
  if (!message || typeof message !== 'string') {
    return 'New Chat';
  }

  // Clean and normalize the message
  const cleanMessage = message.trim();
  
  if (cleanMessage.length === 0) {
    return 'New Chat';
  }

  // Remove common filler words and normalize
  const normalized = cleanMessage
    .replace(/^(can you|could you|please|help me|i want to|i need to|i'd like to)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to create a contextual title based on content

  const lowerMessage = normalized.toLowerCase();
  
  // Check for specific real estate patterns
  if (lowerMessage.includes('property') && lowerMessage.includes('analyz')) {
    return extractLocationTitle(normalized) || 'Property Analysis';
  }
  
  if (lowerMessage.includes('market') && (lowerMessage.includes('trend') || lowerMessage.includes('data'))) {
    return extractLocationTitle(normalized) || 'Market Analysis';
  }
  
  if (lowerMessage.includes('investment') || lowerMessage.includes('roi')) {
    return extractLocationTitle(normalized) || 'Investment Analysis';
  }
  
  if (lowerMessage.includes('valuation') || lowerMessage.includes('value')) {
    return extractLocationTitle(normalized) || 'Property Valuation';
  }
  
  if (lowerMessage.includes('comparison') || lowerMessage.includes('compare')) {
    return extractLocationTitle(normalized) || 'Property Comparison';
  }

  // Extract location-based titles
  const locationTitle = extractLocationTitle(normalized);
  if (locationTitle) {
    return locationTitle;
  }

  // Try to extract the main subject/action
  const actionTitle = extractActionTitle(normalized);
  if (actionTitle) {
    return actionTitle;
  }

  // Fallback: create title from first few meaningful words
  const words = normalized.split(' ').filter(word => 
    word.length > 2 && 
    !['the', 'and', 'but', 'for', 'are', 'can', 'you', 'how', 'what', 'when', 'where', 'why'].includes(word.toLowerCase())
  );

  if (words.length === 0) {
    return 'New Chat';
  }

  // Limit to 3-5 key words for the title
  const titleWords = words.slice(0, 4);
  let title = titleWords.join(' ');

  // Capitalize first letter of each word for title case
  title = title.replace(/\b\w/g, l => l.toUpperCase());

  // Limit total length
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }

  return title || 'New Chat';
}

/**
 * Extract location-based title from message
 */
function extractLocationTitle(message: string): string | null {
  const locations = [
    'austin', 'dallas', 'houston', 'san antonio', 'texas', 'tx',
    'downtown', 'uptown', 'suburb', 'neighborhood', 'district',
    'east austin', 'west austin', 'north dallas', 'south dallas'
  ];

  const lowerMessage = message.toLowerCase();
  const foundLocation = locations.find(loc => lowerMessage.includes(loc));

  if (foundLocation) {
    // Try to determine the type of inquiry
    if (lowerMessage.includes('analyz') || lowerMessage.includes('evaluat')) {
      return `${capitalize(foundLocation)} Analysis`;
    }
    if (lowerMessage.includes('investment') || lowerMessage.includes('invest')) {
      return `${capitalize(foundLocation)} Investment`;
    }
    if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
      return `${capitalize(foundLocation)} Market`;
    }
    if (lowerMessage.includes('property') || lowerMessage.includes('properties')) {
      return `${capitalize(foundLocation)} Properties`;
    }
    
    return `${capitalize(foundLocation)} Search`;
  }

  return null;
}

/**
 * Extract action-based title from message
 */
function extractActionTitle(message: string): string | null {
  const actionPatterns = [
    { pattern: /calcul\w+\s+roi/i, title: 'ROI Calculation' },
    { pattern: /cap\s+rate/i, title: 'Cap Rate Analysis' },
    { pattern: /cash\s+flow/i, title: 'Cash Flow Analysis' },
    { pattern: /market\s+report/i, title: 'Market Report' },
    { pattern: /property\s+search/i, title: 'Property Search' },
    { pattern: /investment\s+calculator/i, title: 'Investment Calculator' },
    { pattern: /portfolio\s+review/i, title: 'Portfolio Review' },
    { pattern: /comparative\s+analysis/i, title: 'Comparative Analysis' },
    { pattern: /rental\s+yield/i, title: 'Rental Yield Analysis' }
  ];

  for (const { pattern, title } of actionPatterns) {
    if (pattern.test(message)) {
      return title;
    }
  }

  return null;
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a fallback title when the primary method fails
 */
export function generateFallbackTitle(messageCount: number = 0): string {
  const fallbacks = [
    'New Conversation',
    'Real Estate Chat',
    'Property Discussion',
    'Investment Chat',
    'Market Analysis'
  ];
  
  const index = messageCount % fallbacks.length;
  return fallbacks[index];
}