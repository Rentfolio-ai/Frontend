// FILE: src/utils/messageHighlighter.ts

/**
 * Highlights key statistics and important information in AI messages
 * Returns HTML-safe highlighted text
 */

export interface HighlightPattern {
    regex: RegExp;
    className: string;
    title?: string;
}

// Define patterns to highlight with their respective styles
export const HIGHLIGHT_PATTERNS: HighlightPattern[] = [
    // Currency values
    {
        regex: /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?[KMB]?/g,
        className: 'highlight-currency',
        title: 'Currency value',
    },
    // Percentages
    {
        regex: /\b\d+(?:\.\d+)?%/g,
        className: 'highlight-percentage',
        title: 'Percentage',
    },
    // Numbers with units (sqft, beds, baths, etc.)
    {
        regex: /\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:sqft|sq\s*ft|beds?|baths?|units?|acres?|years?)\b/gi,
        className: 'highlight-metric',
        title: 'Property metric',
    },
    // Cap rate, ROI, IRR, etc. (financial metrics)
    {
        regex: /\b(?:cap rate|roi|irr|coc|dscr|ltv|noi|cash flow):\s*[\d.]+%?/gi,
        className: 'highlight-financial',
        title: 'Financial metric',
    },
    // Addresses (basic pattern)
    {
        regex: /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place)\b/g,
        className: 'highlight-address',
        title: 'Property address',
    },
    // ZIP codes
    {
        regex: /\b\d{5}(?:-\d{4})?\b/g,
        className: 'highlight-zip',
        title: 'ZIP code',
    },
    // Cities with state codes (e.g., "Austin, TX")
    {
        regex: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\b/g,
        className: 'highlight-location',
        title: 'Location',
    },
    // MLS numbers
    {
        regex: /\bMLS\s*#?\s*[\w-]+/gi,
        className: 'highlight-mls',
        title: 'MLS number',
    },
    // Years (in property context)
    {
        regex: /\b(?:built in|year built:?)\s*\d{4}\b/gi,
        className: 'highlight-year',
        title: 'Year built',
    },
];

/**
 * Apply highlighting to message content
 * Preserves markdown structure and only highlights within text nodes
 * @param content - Raw message content
 * @returns Content with highlight markers
 */
export function highlightKeyStats(content: string): string {
    let result = content;

    // Track positions to avoid overlapping highlights
    const highlightRanges: Array<{ start: number; end: number }> = [];

    // Apply each pattern
    HIGHLIGHT_PATTERNS.forEach(pattern => {
        const matches: Array<{ text: string; index: number }> = [];
        let match;

        // Find all matches
        while ((match = pattern.regex.exec(result)) !== null) {
            matches.push({
                text: match[0],
                index: match.index,
            });
        }

        // Apply highlights in reverse order to maintain indices
        matches.reverse().forEach(({ text, index }) => {
            const end = index + text.length;

            // Check if this range overlaps with existing highlights
            const overlaps = highlightRanges.some(
                range => (index >= range.start && index < range.end) ||
                    (end > range.start && end <= range.end)
            );

            if (!overlaps) {
                // Don't highlight if it's part of a markdown link or code block
                const before = result.substring(Math.max(0, index - 10), index);
                const after = result.substring(end, Math.min(result.length, end + 10));

                // Skip if within code blocks or links
                if (before.includes('`') && after.includes('`')) return;
                if (before.includes('[') && after.includes(']')) return;
                if (before.includes('(') && after.includes(')')) return;

                const highlighted = `<mark class="${pattern.className}" title="${pattern.title || ''}">${text}</mark>`;
                result = result.substring(0, index) + highlighted + result.substring(end);

                // Track this range (adjust for added markup)
                highlightRanges.push({
                    start: index,
                    end: index + highlighted.length,
                });
            }
        });
    });

    return result;
}

/**
 * Check if content contains highlightable stats
 */
export function hasHighlightableStats(content: string): boolean {
    return HIGHLIGHT_PATTERNS.some(pattern => pattern.regex.test(content));
}

/**
 * Extract all highlighted stats from content
 */
export function extractStats(content: string): Array<{ type: string; value: string }> {
    const stats: Array<{ type: string; value: string }> = [];

    HIGHLIGHT_PATTERNS.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.regex);
        while ((match = regex.exec(content)) !== null) {
            stats.push({
                type: pattern.title || 'stat',
                value: match[0],
            });
        }
    });

    return stats;
}
