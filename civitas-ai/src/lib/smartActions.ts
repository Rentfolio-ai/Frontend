// FILE: src/lib/smartActions.ts

export interface ActionChip {
    label: string;
    action: string; // The message to send to the AI
    icon?: string;
}

const ADDRESS_REGEX = /\b\d+\s+[A-Za-z]+\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court)\b/i;
const CALCULATE_REGEX = /\b(calculate|compute|estimate)\b.*\b(return|roi|yield|cap rate|cashflow)\b/i;
const SEARCH_INTENT_REGEX = /\b(find|search|look for|show me)\b.*\b(house|property|home|deal|str|ltr)\b/i;

export const detectSmartActions = (content: string): ActionChip[] => {
    const actions: ActionChip[] = [];

    // 1. Address detected -> Run Deal Analysis
    if (ADDRESS_REGEX.test(content)) {
        actions.push({
            label: "Analyze This Property",
            action: "Run a deep deal analysis on this address.",
            icon: "bar-chart"
        });
        actions.push({
            label: "Check Permits",
            action: "Check permit history for this address.",
            icon: "file-text"
        });
    }

    // 2. Financial discussion -> Detailed Pro Forma
    if (CALCULATE_REGEX.test(content)) {
        actions.push({
            label: "Show Spreadsheet",
            action: "Can you breakout these numbers into a full pro forma table?",
            icon: "table"
        });
    }

    // 3. Search intent -> Save Criteria
    if (SEARCH_INTENT_REGEX.test(content)) {
        actions.push({
            label: "Save This Search",
            action: "Save these search criteria to my buying profile.",
            icon: "bookmark"
        });
    }

    return actions;
};
