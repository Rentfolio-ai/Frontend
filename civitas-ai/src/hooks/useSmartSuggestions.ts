/**
 * Context-Aware Smart Suggestions Hook
 *
 * Drives suggestion chips from the backend, passing full user context:
 *   - Welcome chips: user profile (strategy, budget, markets, location, mode)
 *   - Contextual chips: conversation messages, tools used, turn depth
 *   - Click tracking: fire-and-forget POST on chip click
 *
 * Keeps hardcoded fallbacks for offline / error scenarios.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, AgentMode } from '../types/chat';
import type { CompletedTool } from '../types/stream';
import { usePreferencesStore } from '../stores/preferencesStore';
import { API_BASE_URL, API_KEY } from '../services/apiConfig';

const headers = (): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SuggestionChip {
    id: string;
    label: string;
    icon?: string;
    query: string;
    category?: 'action' | 'analysis' | 'info';
    target_mode?: 'hunter' | 'research' | 'strategist';
}

interface UseSmartSuggestionsProps {
    messages: Message[];
    completedTools?: CompletedTool[];
    isLoading: boolean;
    mode?: AgentMode;
}

interface UseSmartSuggestionsReturn {
    suggestions: SuggestionChip[];
    trackClick: (chip: SuggestionChip) => void;
}

// ── Hardcoded fallbacks (offline / error) ─────────────────────────────────────

const FALLBACK_WELCOME: Record<AgentMode, SuggestionChip[]> = {
    hunter: [
        { id: 'hunt_deals', label: 'Hunt deals in a city', icon: '🎯', query: 'Find me the best investment deals in Austin, TX under $500k', category: 'action' },
        { id: 'analyze_address', label: 'Analyze a specific address', icon: '⚡', query: 'Analyze 1234 Main St, Austin TX — is it a good deal?', category: 'analysis' },
        { id: 'deal_killers', label: 'Check for deal killers', icon: '🚨', query: 'What are the most common deal killers I should watch for in rental properties?', category: 'info' },
    ],
    research: [
        { id: 'market_deep_dive', label: 'Deep dive into a market', icon: '📊', query: 'Give me a comprehensive analysis of the Austin, TX rental market — trends, rents, supply/demand', category: 'info' },
        { id: 'learn_concept', label: 'Explain an investing concept', icon: '🎓', query: 'Explain the BRRRR strategy — how does it work, what are the risks, and when should I use it?', category: 'info' },
        { id: 'compare_markets', label: 'Compare two markets', icon: '⚖️', query: 'Compare Austin vs Dallas for long-term rental investing — which market is stronger right now?', category: 'analysis' },
    ],
    strategist: [
        { id: 'build_strategy', label: 'Build my investment strategy', icon: '🗺️', query: 'Help me build a real estate investment strategy — I have $150k to start', category: 'action' },
        { id: 'portfolio_review', label: 'Review my portfolio', icon: '🛡️', query: 'Analyze my current portfolio and tell me where I have gaps or risk exposure', category: 'analysis' },
        { id: 'define_buy_box', label: 'Define my buy box', icon: '📋', query: 'Help me define my buy box — what criteria should I set for my next investment property?', category: 'action' },
    ],
};

const FALLBACK_POST_SEARCH: SuggestionChip[] = [
    { id: 'analyze_first', label: 'Deep-dive the top pick', icon: '⚡', query: 'Run a full deal analysis on the #1 ranked property — P&L, comps, and deal killers.', category: 'analysis' },
    { id: 'offer_strategy', label: 'Generate offer strategy', icon: '🎯', query: 'What should I offer on the best property? Give me a negotiation strategy.', category: 'action' },
    { id: 'dig_deeper', label: 'Dig deeper', icon: '💰', query: 'Can you analyze that in more detail with numbers?', category: 'analysis' },
];

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useSmartSuggestions = ({
    messages,
    completedTools = [],
    isLoading,
    mode = 'hunter',
}: UseSmartSuggestionsProps): UseSmartSuggestionsReturn => {
    const [welcomeChips, setWelcomeChips] = useState<SuggestionChip[]>([]);
    const [contextualChips, setContextualChips] = useState<SuggestionChip[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastFetchedMsgCount = useRef(0);

    // Read user context from preferences store
    const userId = usePreferencesStore(s => s.user_id);
    const defaultStrategy = usePreferencesStore(s => s.defaultStrategy);
    const budgetRange = usePreferencesStore(s => s.budgetRange);
    const favoriteMarkets = usePreferencesStore(s => s.favoriteMarkets);
    const lastSearchCity = usePreferencesStore(s => s.lastSearchCity);
    const recentSearches = usePreferencesStore(s => s.recentSearches);
    const clientLocation = usePreferencesStore(s => s.clientLocation);

    // ── Fetch welcome suggestions (on mount + mode change) ────────────────────
    useEffect(() => {
        const fetchWelcome = async () => {
            try {
                const params = new URLSearchParams();
                if (userId && userId !== 'default') params.set('user_id', userId);
                if (defaultStrategy) params.set('strategy', defaultStrategy);
                if (budgetRange?.min) params.set('budget_min', String(budgetRange.min));
                if (budgetRange?.max) params.set('budget_max', String(budgetRange.max));
                if (mode) params.set('mode', mode);
                if (clientLocation?.cityName) params.set('location_city', clientLocation.cityName);
                else if (lastSearchCity) params.set('location_city', lastSearchCity);

                const res = await fetch(
                    `${API_BASE_URL}/api/suggestions/welcome?${params.toString()}`,
                    { headers: headers() },
                );
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setWelcomeChips(data);
                        return;
                    }
                }
                console.warn('[useSmartSuggestions] Welcome fetch failed, using fallbacks');
            } catch (e) {
                console.error('[useSmartSuggestions] Welcome fetch error:', e);
            }
            // Fallback
            setWelcomeChips(FALLBACK_WELCOME[mode] || FALLBACK_WELCOME.hunter);
        };

        fetchWelcome();
    }, [mode, userId, defaultStrategy, budgetRange?.min, budgetRange?.max, clientLocation?.cityName, lastSearchCity]);

    // ── Fetch contextual suggestions after each assistant response ─────────────
    useEffect(() => {
        if (isLoading || messages.length === 0) {
            setContextualChips([]);
            return;
        }

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role !== 'assistant') {
            setContextualChips([]);
            return;
        }

        // Avoid re-fetching for the same message count
        if (messages.length === lastFetchedMsgCount.current) return;

        // Debounce to avoid rapid calls
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            lastFetchedMsgCount.current = messages.length;

            try {
                // Build last 3 messages payload
                const lastMessages = messages.slice(-3).map(m => ({
                    role: m.role,
                    content: m.content.slice(0, 500), // Truncate to keep payload small
                }));

                // Extract tool names from completedTools
                const toolNames = completedTools.map(t => t.tool);

                const body = {
                    user_id: userId || 'default',
                    mode,
                    last_messages: lastMessages,
                    completed_tools: toolNames,
                    turn_count: Math.floor(messages.length / 2),
                    strategy: defaultStrategy || undefined,
                    budget_min: budgetRange?.min || undefined,
                    budget_max: budgetRange?.max || undefined,
                    favorite_markets: favoriteMarkets || [],
                    recent_searches: recentSearches?.slice(0, 5) || [],
                };

                const res = await fetch(`${API_BASE_URL}/api/suggestions/contextual`, {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify(body),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setContextualChips(data);
                        return;
                    }
                }
                console.warn('[useSmartSuggestions] Contextual fetch failed, using fallback');
            } catch (e) {
                console.error('[useSmartSuggestions] Contextual fetch error:', e);
            }

            // Fallback: simple content-based detection
            const content = lastMessage.content.toLowerCase();
            if (
                (content.includes('found') && content.includes('propert')) ||
                content.includes('here are some')
            ) {
                setContextualChips(FALLBACK_POST_SEARCH);
            } else {
                setContextualChips([
                    { id: 'dig_deeper', label: 'Dig deeper', icon: '⚡', query: 'Can you analyze that in more detail with numbers?', category: 'analysis' },
                    { id: 'new_search', label: 'New search', icon: '🎯', query: "Let's search a new market for deals.", category: 'action' },
                ]);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [messages, isLoading, completedTools, mode, userId, defaultStrategy, budgetRange, favoriteMarkets, recentSearches]);

    // ── Click tracking (fire-and-forget) ──────────────────────────────────────
    const trackClick = useCallback(
        (chip: SuggestionChip) => {
            try {
                fetch(`${API_BASE_URL}/api/suggestions/track`, {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify({
                        user_id: userId || 'default',
                        suggestion_id: chip.id,
                        suggestion_query: chip.query,
                        category: chip.category || 'action',
                        mode,
                        turn_count: Math.floor(messages.length / 2),
                    }),
                }).catch(() => { /* tracking is best-effort */ });
            } catch {
                /* ignore */
            }
        },
        [userId, mode, messages.length],
    );

    // ── Resolve which chips to return ─────────────────────────────────────────
    const suggestions: SuggestionChip[] =
        isLoading
            ? []
            : messages.length === 0
                ? welcomeChips
                : contextualChips;

    return { suggestions, trackClick };
};
