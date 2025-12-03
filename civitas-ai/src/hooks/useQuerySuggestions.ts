/**
 * Query Suggestions Hook
 * 
 * Provides intelligent query suggestions based on user input
 */

import { useState, useEffect } from 'react';
import { usePreferencesStore } from '../stores/preferencesStore';

interface QuerySuggestion {
    query: string;
    category: 'property' | 'market' | 'compliance' | 'analysis';
    icon: string;
}

const POPULAR_QUERIES: QuerySuggestion[] = [
    { query: 'Find STR properties under $400k', category: 'property', icon: '🏠' },
    { query: 'What\'s the average cap rate', category: 'market', icon: '📊' },
    { query: 'Are short-term rentals allowed', category: 'compliance', icon: '✅' },
    { query: 'Calculate ROI for a property', category: 'analysis', icon: '💰' }
];

export const useQuerySuggestions = (input: string) => {
    const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([]);
    const { recentSearches, favoriteMarkets, lastSearchCity } = usePreferencesStore();

    useEffect(() => {
        if (!input || input.length < 2) {
            setSuggestions([]);
            return;
        }

        const lowerInput = input.toLowerCase();
        const newSuggestions: QuerySuggestion[] = [];

        // Check for city mentions
        const mentionedCity = favoriteMarkets.find((city: string) =>
            lowerInput.includes(city.toLowerCase())
        );

        // Property search suggestions
        if (lowerInput.includes('find') || lowerInput.includes('search') || lowerInput.includes('properties')) {
            const city = mentionedCity || lastSearchCity || 'Austin';
            newSuggestions.push(
                { query: `Find STR properties in ${city} under $400k`, category: 'property', icon: '🏠' },
                { query: `Find 3-bedroom houses in ${city}`, category: 'property', icon: '🔍' },
                { query: `What are the best deals in ${city}?`, category: 'property', icon: '💎' }
            );
        }

        // Market analysis suggestions
        if (lowerInput.includes('market') || lowerInput.includes('cap rate') || lowerInput.includes('trends')) {
            const city = mentionedCity || lastSearchCity || 'Phoenix';
            newSuggestions.push(
                { query: `What's the average cap rate in ${city}?`, category: 'market', icon: '📊' },
                { query: `Compare ${city} vs Dallas for STR investments`, category: 'market', icon: '⚖️' },
                { query: `Show me rental trends in ${city}`, category: 'market', icon: '📈' }
            );
        }

        // Compliance suggestions
        if (lowerInput.includes('str') || lowerInput.includes('short-term') || lowerInput.includes('allowed') || lowerInput.includes('rules')) {
            const city = mentionedCity || lastSearchCity || 'Miami';
            newSuggestions.push(
                { query: `Are short-term rentals allowed in ${city}?`, category: 'compliance', icon: '✅' },
                { query: `What are the STR rules in ${city}?`, category: 'compliance', icon: '📋' },
                { query: `Do I need a permit for Airbnb in ${city}?`, category: 'compliance', icon: '🎫' }
            );
        }

        // Analysis suggestions
        if (lowerInput.includes('calculate') || lowerInput.includes('roi') || lowerInput.includes('cash flow')) {
            const city = mentionedCity || lastSearchCity || 'Tampa';
            newSuggestions.push(
                { query: `Calculate ROI for a $300k property in ${city}`, category: 'analysis', icon: '💰' },
                { query: `Compare LTR vs STR cash flow in ${city}`, category: 'analysis', icon: '🔄' },
                { query: `What's the break-even occupancy for STR in ${city}?`, category: 'analysis', icon: '📉' }
            );
        }

        // Add recent searches that match
        const matchingRecent = recentSearches
            .filter((search: string) => search.toLowerCase().includes(lowerInput))
            .slice(0, 2)
            .map((query: string) => ({ query, category: 'property' as const, icon: '🕐' }));

        newSuggestions.push(...matchingRecent);

        // If no specific suggestions, show popular queries
        if (newSuggestions.length === 0) {
            const matching = POPULAR_QUERIES.filter(q =>
                q.query.toLowerCase().includes(lowerInput)
            );
            newSuggestions.push(...matching);
        }

        setSuggestions(newSuggestions.slice(0, 5));
    }, [input, recentSearches, favoriteMarkets, lastSearchCity]);

    return suggestions;
};
