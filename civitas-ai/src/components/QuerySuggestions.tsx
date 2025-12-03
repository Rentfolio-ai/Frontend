/**
 * Query Suggestions Component
 * 
 * Displays intelligent query suggestions as user types
 */

import React from 'react';

interface QuerySuggestion {
    query: string;
    category: 'property' | 'market' | 'compliance' | 'analysis';
    icon: string;
}

interface QuerySuggestionsProps {
    suggestions: QuerySuggestion[];
    onSelect: (query: string) => void;
}

export const QuerySuggestions: React.FC<QuerySuggestionsProps> = ({ suggestions, onSelect }) => {
    if (suggestions.length === 0) return null;

    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
            <div className="p-2">
                <div className="text-xs text-gray-500 px-2 py-1 font-medium">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(suggestion.query)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-2 group"
                    >
                        <span className="text-lg flex-shrink-0">{suggestion.icon}</span>
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 line-clamp-2">
                            {suggestion.query}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
