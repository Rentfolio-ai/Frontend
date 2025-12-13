/**
 * Chat Title Generator
 * 
 * Automatically generates meaningful chat titles from the first user message
 */

/**
 * Extract a meaningful title from a chat message
 * Priority:
 * 1. Property address if found
 * 2. Property type + location
 * 3. Key action words + context
 * 4. First 50 characters
 */
export function generateChatTitle(message: string): string {
    if (!message || message.trim().length === 0) {
        return 'New Chat';
    }

    const cleaned = message.trim();

    // Try to extract property address (e.g., "123 Main St", "456 Oak Avenue")
    const addressPattern = /\b\d+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place)\b/i;
    const addressMatch = cleaned.match(addressPattern);
    if (addressMatch) {
        return addressMatch[0];
    }

    // Try to extract city + state (e.g., "Austin, TX", "San Francisco, CA")
    const cityStatePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/;
    const cityStateMatch = cleaned.match(cityStatePattern);

    // Try to extract property type keywords
    const propertyTypes = ['STR', 'LTR', 'flip', 'rental', 'investment', 'property', 'house', 'condo', 'apartment', 'duplex', 'triplex', 'fourplex'];
    const foundType = propertyTypes.find(type =>
        cleaned.toLowerCase().includes(type.toLowerCase())
    );

    // Combine property type + location if both found
    if (foundType && cityStateMatch) {
        return `${foundType.toUpperCase()} in ${cityStateMatch[1]}, ${cityStateMatch[2]}`;
    }

    // Just location if found
    if (cityStateMatch) {
        return `Properties in ${cityStateMatch[1]}, ${cityStateMatch[2]}`;
    }

    // Just property type if found
    if (foundType) {
        return `${foundType.toUpperCase()} Analysis`;
    }

    // Try to extract action-based context
    const actionPatterns = [
        { pattern: /analyz(e|ing)\s+(.{1,30})/i, prefix: 'Analyzing' },
        { pattern: /compar(e|ing)\s+(.{1,30})/i, prefix: 'Comparing' },
        { pattern: /find(ing)?\s+(.{1,30})/i, prefix: 'Finding' },
        { pattern: /search(ing)?\s+for\s+(.{1,30})/i, prefix: 'Searching for' },
        { pattern: /looking\s+for\s+(.{1,30})/i, prefix: 'Looking for' },
    ];

    for (const { pattern, prefix } of actionPatterns) {
        const match = cleaned.match(pattern);
        if (match) {
            const context = match[match.length - 1].trim();
            return `${prefix} ${context.charAt(0).toUpperCase() + context.slice(1)}`;
        }
    }

    // Fallback: Use first 50 characters
    if (cleaned.length <= 50) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return cleaned.substring(0, 47).trim() + '...';
}

/**
 * Validate and sanitize a user-provided chat title
 */
export function sanitizeChatTitle(title: string): string {
    const cleaned = title.trim();

    if (cleaned.length === 0) {
        return 'Untitled Chat';
    }

    // Limit to 100 characters
    if (cleaned.length > 100) {
        return cleaned.substring(0, 97) + '...';
    }

    return cleaned;
}
