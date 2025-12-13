import { useMemo, useState, useEffect } from 'react';
import type { Message } from '../types/chat';
import type { CompletedTool } from '../types/stream';

export interface SuggestionChip {
    id: string;
    label: string;
    icon?: string;
    query: string;
    category?: 'action' | 'analysis' | 'info';
}

interface UseSmartSuggestionsProps {
    messages: Message[];
    completedTools?: CompletedTool[];
    isLoading: boolean;
}

export const useSmartSuggestions = ({
    messages,
    completedTools = [],
    isLoading
}: UseSmartSuggestionsProps): SuggestionChip[] => {
    // State for dynamic welcome chips
    const [welcomeChips, setWelcomeChips] = useState<SuggestionChip[]>([]);

    // Fetch welcome chips on mount
    useEffect(() => {
        const fetchWelcomeChips = async () => {
            try {
                // Fetch from backend
                // In production, we'd use a typed API client and pass proper user context
                const response = await fetch('/api/suggestions/welcome');
                if (response.ok) {
                    const data = await response.json();
                    setWelcomeChips(data);
                } else {
                    // Fail silently effectively, just don't set chips or use valid defaults
                    console.warn("Failed to fetch welcome chips");
                }
            } catch (e) {
                console.error("Error fetching welcome suggestions:", e);
            }
        };

        // Only fetch if we don't have them yet (dedup)
        // Note: Real implementation might track if we've already tried to avoid continuous retries
        fetchWelcomeChips();
    }, []);

    return useMemo(() => {
        // 1. Loading State -> No suggestions? Or maybe "Stop generating"?
        if (isLoading) return [];

        // 2. Empty State -> Welcome Suggestions (Dynamic)
        if (messages.length === 0) {
            if (welcomeChips.length > 0) {
                return welcomeChips;
            }
            // Fallback while loading or on error
            return [
                {
                    id: 'search_start',
                    label: 'Find investment properties',
                    icon: '🏠',
                    query: 'Show me investment properties in Austin, TX under $500k',
                    category: 'action'
                },
                {
                    id: 'market_stats',
                    label: 'Check Market Stats',
                    icon: '📊',
                    query: 'What are the current market trends for 3-bedroom homes in Seattle?',
                    category: 'info'
                },
                {
                    id: 'analyze_start',
                    label: 'Analyze my property',
                    icon: '💰',
                    query: 'I have a property I want to analyze for rental cash flow.',
                    category: 'analysis'
                },
                {
                    id: 'help',
                    label: 'How does this work?',
                    icon: '❓',
                    query: 'Explain how you can help me invest in real estate.',
                    category: 'info'
                }
            ];
        }

        const lastMessage = messages[messages.length - 1];
        const isAssistant = lastMessage?.role === 'assistant';

        // 3. If user just spoke -> Wait for assistant (should allow loading state to handle)
        if (!isAssistant) return [];

        // 4. Analyze Context based on Tools used in the LAST turn
        // (We look at completedTools which accumulates, or check message content if tools aren't tracked per message yet)
        // For now, let's infer from the last assistant message content or global tool usage if available for the specific turn.
        // Ideally, we'd check the "tools" used to generate the last message.

        // Simple heuristic: Keyword matching in the last message content
        const content = lastMessage.content.toLowerCase();

        // CASE A: Search Results logic
        if (content.includes('found') && content.includes('properties') || content.includes('here are some')) {
            return [
                {
                    id: 'analyze_first',
                    label: 'Analyze the first one',
                    icon: '⚡',
                    query: 'Run a deep financial analysis on the first property in the list.',
                    category: 'analysis'
                },
                {
                    id: 'filter_price',
                    label: 'Filter by price',
                    icon: '📉',
                    query: 'Can you filter these to only show ones under $400k?',
                    category: 'action'
                },
                {
                    id: 'map_view',
                    label: 'Check Crime/Safety',
                    icon: '🛡️',
                    query: 'What are the crime rates and safety scores for these neighborhoods?',
                    category: 'info'
                }
            ];
        }

        // CASE B: Analysis/Financial Logic (P&L shown)
        if (content.includes(' cash flow ') || content.includes('cap rate') || content.includes('noi')) {
            return [
                {
                    id: 'compare_neighbors',
                    label: 'Compare with neighbors',
                    icon: '🏘️',
                    query: 'How does this compare to similar rental attributes in the immediate area?',
                    category: 'analysis'
                },
                {
                    id: 'stress_test',
                    label: 'Stress Test (Vacancy)',
                    icon: '📉',
                    query: 'What happens to my returns if vacancy rises to 15%?',
                    category: 'analysis'
                },
                {
                    id: 'generate_report',
                    label: 'Generate PDF Report',
                    icon: '📄',
                    query: 'Generate a comprehensive PDF report for this property.',
                    category: 'action'
                }
            ];
        }

        // CASE C: Market Stats Logic
        if (content.includes('market') && (content.includes('median') || content.includes('trend'))) {
            return [
                {
                    id: 'find_deals_here',
                    label: 'Find deals here',
                    icon: '🎯',
                    query: 'Based on these stats, find me the best investment opportunities in this market.',
                    category: 'action'
                },
                {
                    id: 'future_outlook',
                    label: 'Future Outlook',
                    icon: '🔮',
                    query: 'What is the 5-year appreciation forecast for this area?',
                    category: 'info'
                }
            ];
        }

        // Default Follow-ups
        return [
            {
                id: 'more_details',
                label: 'Tell me more',
                icon: '🔍',
                query: 'Can you provide more specific details on that?',
                category: 'info'
            },
            {
                id: 'new_search',
                label: 'New Search',
                icon: '🏠',
                query: 'Lets start a new search.',
                category: 'action'
            }
        ];

    }, [messages, isLoading, completedTools, welcomeChips]);
};
