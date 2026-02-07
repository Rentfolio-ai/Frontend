import { useMemo, useState, useEffect } from 'react';
import type { Message, AgentMode } from '../types/chat';
import type { CompletedTool } from '../types/stream';

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

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
    mode?: AgentMode;
}

// Mode-specific welcome suggestions
const MODE_WELCOME_CHIPS: Record<AgentMode, SuggestionChip[]> = {
    hunter: [
        {
            id: 'hunt_deals',
            label: 'Hunt deals in a city',
            icon: '🎯',
            query: 'Find me the best investment deals in Austin, TX under $500k',
            category: 'action'
        },
        {
            id: 'analyze_address',
            label: 'Analyze a specific address',
            icon: '⚡',
            query: 'Analyze 1234 Main St, Austin TX — is it a good deal?',
            category: 'analysis'
        },
        {
            id: 'deal_killers',
            label: 'Check for deal killers',
            icon: '🚨',
            query: 'What are the most common deal killers I should watch for in rental properties?',
            category: 'info'
        },
    ],
    research: [
        {
            id: 'market_deep_dive',
            label: 'Deep dive into a market',
            icon: '📊',
            query: 'Give me a comprehensive analysis of the Austin, TX rental market — trends, rents, supply/demand',
            category: 'info'
        },
        {
            id: 'learn_concept',
            label: 'Explain an investing concept',
            icon: '🎓',
            query: 'Explain the BRRRR strategy — how does it work, what are the risks, and when should I use it?',
            category: 'info'
        },
        {
            id: 'compare_markets',
            label: 'Compare two markets',
            icon: '⚖️',
            query: 'Compare Austin vs Dallas for long-term rental investing — which market is stronger right now?',
            category: 'analysis'
        },
    ],
    strategist: [
        {
            id: 'build_strategy',
            label: 'Build my investment strategy',
            icon: '🗺️',
            query: 'Help me build a real estate investment strategy — I have $150k to start',
            category: 'action'
        },
        {
            id: 'portfolio_review',
            label: 'Review my portfolio',
            icon: '🛡️',
            query: 'Analyze my current portfolio and tell me where I have gaps or risk exposure',
            category: 'analysis'
        },
        {
            id: 'define_buy_box',
            label: 'Define my buy box',
            icon: '📋',
            query: 'Help me define my buy box — what criteria should I set for my next investment property?',
            category: 'action'
        },
    ],
};

// Mode-specific contextual follow-ups after property search results
const MODE_POST_SEARCH_CHIPS: Record<AgentMode, SuggestionChip[]> = {
    hunter: [
        {
            id: 'analyze_first',
            label: 'Deep-dive the top pick',
            icon: '⚡',
            query: 'Run a full deal analysis on the #1 ranked property — P&L, comps, and deal killers.',
            category: 'analysis'
        },
        {
            id: 'offer_strategy',
            label: 'Generate offer strategy',
            icon: '🎯',
            query: 'What should I offer on the best property? Give me a negotiation strategy.',
            category: 'action'
        },
        {
            id: 'filter_cashflow',
            label: 'Show only cash-flow positive',
            icon: '💰',
            query: 'Filter to only properties with positive monthly cash flow after all expenses.',
            category: 'action'
        }
    ],
    research: [
        {
            id: 'neighborhood_trends',
            label: 'Neighborhood deep dive',
            icon: '📊',
            query: 'Tell me more about the neighborhoods these properties are in — trends, development, trajectory.',
            category: 'info'
        },
        {
            id: 'market_context',
            label: 'Market context',
            icon: '📈',
            query: 'How do these properties compare to the broader market? Are they above or below median?',
            category: 'info'
        },
        {
            id: 'rental_analysis',
            label: 'Rental demand analysis',
            icon: '🏠',
            query: 'What does rental demand look like in these areas? Vacancy rates, rent growth trends?',
            category: 'analysis'
        }
    ],
    strategist: [
        {
            id: 'portfolio_fit',
            label: 'How does this fit my portfolio?',
            icon: '🛡️',
            query: 'Which of these properties best fits my overall portfolio strategy and risk profile?',
            category: 'analysis'
        },
        {
            id: 'scenario_model',
            label: 'Model scenarios',
            icon: '⚖️',
            query: 'Model three scenarios: best case, worst case, and base case for the top property over 5 years.',
            category: 'analysis'
        },
        {
            id: 'tax_implications',
            label: 'Tax strategy',
            icon: '📋',
            query: 'What are the tax implications of purchasing one of these? Depreciation, write-offs, 1031 potential?',
            category: 'info'
        }
    ],
};

export const useSmartSuggestions = ({
    messages,
    completedTools = [],
    isLoading,
    mode = 'hunter'
}: UseSmartSuggestionsProps): SuggestionChip[] => {
    // State for dynamic welcome chips
    const [welcomeChips, setWelcomeChips] = useState<SuggestionChip[]>([]);

    // Fetch welcome chips on mount
    useEffect(() => {
        const fetchWelcomeChips = async () => {
            try {
                const response = await fetch('/api/suggestions/welcome', {
                    headers: {
                        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setWelcomeChips(data);
                } else {
                    console.warn("Failed to fetch welcome chips");
                }
            } catch (e) {
                console.error("Error fetching welcome suggestions:", e);
            }
        };
        fetchWelcomeChips();
    }, []);

    return useMemo(() => {
        if (isLoading) return [];

        // Empty state — use mode-specific welcome suggestions
        if (messages.length === 0) {
            if (welcomeChips.length > 0) {
                return welcomeChips;
            }
            return MODE_WELCOME_CHIPS[mode] || MODE_WELCOME_CHIPS.hunter;
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

        // CASE A: Search Results logic — mode-aware follow-ups
        if (content.includes('found') && content.includes('properties') || content.includes('here are some')) {
            return MODE_POST_SEARCH_CHIPS[mode] || MODE_POST_SEARCH_CHIPS.hunter;
        }

        // CASE B: Analysis/Financial Logic (P&L shown) — mode-aware
        if (content.includes(' cash flow ') || content.includes('cap rate') || content.includes('noi')) {
            if (mode === 'hunter') {
                return [
                    { id: 'comps_intel', label: 'Pull comps & negotiate', icon: '🎯', query: 'Pull comparable sales and give me negotiation leverage points for this property.', category: 'action' },
                    { id: 'deal_killer_check', label: 'Deal killer scan', icon: '🚨', query: 'Run a deal killer analysis — what red flags should I know about?', category: 'analysis' },
                    { id: 'offer_strategy', label: 'Draft an offer', icon: '💰', query: 'What should I offer? Give me a negotiation strategy with a target price.', category: 'action' },
                ];
            } else if (mode === 'strategist') {
                return [
                    { id: 'stress_test', label: 'Stress test scenarios', icon: '⚖️', query: 'Stress test this deal — what happens with 15% vacancy, 2% higher rates, and 10% expense increase?', category: 'analysis' },
                    { id: 'portfolio_impact', label: 'Portfolio impact', icon: '🛡️', query: 'How would adding this property change my portfolio risk profile and cash flow?', category: 'analysis' },
                    { id: 'exit_strategy', label: 'Plan exit strategies', icon: '🗺️', query: 'What are my exit strategies for this property? Hold, sell, 1031 exchange, or refinance?', category: 'info' },
                ];
            } else {
                return [
                    { id: 'explain_numbers', label: 'Break down the math', icon: '🎓', query: 'Walk me through these numbers step by step — explain each line item and what makes this a good or bad deal.', category: 'info' },
                    { id: 'market_comparison', label: 'How does this compare?', icon: '📊', query: 'How do these returns compare to typical investments in this market? Am I above or below average?', category: 'analysis' },
                    { id: 'sensitivity', label: 'Sensitivity analysis', icon: '📈', query: 'Show me how the returns change with different rent levels, vacancy rates, and interest rates.', category: 'analysis' },
                ];
            }
        }

        // CASE C: Market Stats Logic — mode-aware
        if (content.includes('market') && (content.includes('median') || content.includes('trend'))) {
            if (mode === 'hunter') {
                return [
                    { id: 'find_deals_here', label: 'Hunt deals in this market', icon: '🎯', query: 'Based on these stats, find me the best investment deals in this market.', category: 'action' },
                    { id: 'undervalued', label: 'Find undervalued areas', icon: '💰', query: 'Which neighborhoods in this market are undervalued relative to their fundamentals?', category: 'action' },
                ];
            } else if (mode === 'strategist') {
                return [
                    { id: 'market_fit', label: 'Does this fit my strategy?', icon: '⚖️', query: 'Based on these market stats, does this market fit my investment strategy and buy box?', category: 'analysis' },
                    { id: 'compare_alternative', label: 'Compare to another market', icon: '🗺️', query: 'How does this market compare to other markets I should consider for my portfolio?', category: 'analysis' },
                ];
            } else {
                return [
                    { id: 'deeper_trends', label: 'Dig deeper into trends', icon: '📊', query: 'Show me the 3-year and 5-year trends for this market — price appreciation, rent growth, and inventory.', category: 'info' },
                    { id: 'supply_demand', label: 'Supply & demand drivers', icon: '🎓', query: 'What are the key supply and demand drivers in this market? Job growth, population trends, new construction?', category: 'info' },
                ];
            }
        }

        // Default follow-ups — mode-aware
        if (mode === 'hunter') {
            return [
                { id: 'new_search', label: 'New deal search', icon: '🎯', query: 'Let\'s search a new market for deals.', category: 'action' },
                { id: 'dig_deeper', label: 'Dig deeper', icon: '⚡', query: 'Can you analyze that in more detail with numbers?', category: 'analysis' },
            ];
        } else if (mode === 'strategist') {
            return [
                { id: 'refine_strategy', label: 'Refine my strategy', icon: '🗺️', query: 'Let\'s refine my investment strategy based on what we\'ve discussed.', category: 'action' },
                { id: 'more_context', label: 'More context', icon: '⚖️', query: 'Can you expand on that with more portfolio-level context?', category: 'info' },
            ];
        } else {
            return [
                { id: 'learn_more', label: 'Explain further', icon: '🎓', query: 'Can you explain that in more detail? I want to understand the fundamentals.', category: 'info' },
                { id: 'related_topic', label: 'Related topics', icon: '📊', query: 'What related concepts or topics should I also understand?', category: 'info' },
            ];
        }

    }, [messages, isLoading, completedTools, welcomeChips, mode]);
};
