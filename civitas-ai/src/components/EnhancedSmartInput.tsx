/**
 * Enhanced Smart Input with Suggestions
 * 
 * Smart input component with query suggestions
 */

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X } from 'lucide-react';
import { useQuerySuggestions } from '../hooks/useQuerySuggestions';
import { QuerySuggestions } from './QuerySuggestions';
import { usePreferencesStore } from '../stores/preferencesStore';

interface EnhancedSmartInputProps {
    onSubmit: (query: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    maxLength?: number;
    minLength?: number;
}

export interface EnhancedSmartInputHandle {
    focus: () => void;
}

export const EnhancedSmartInput = forwardRef<EnhancedSmartInputHandle, EnhancedSmartInputProps>(({
    onSubmit,
    placeholder = "Ask me anything about real estate...",
    autoFocus = true,
    maxLength = 500,
    minLength = 3
}, ref) => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { addRecentSearch } = usePreferencesStore();

    // Get suggestions
    const suggestions = useQuerySuggestions(query);

    // Expose focus method to parent
    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        }
    }));

    // Auto-focus on mount
    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);

    // Show/hide suggestions
    useEffect(() => {
        setShowSuggestions(suggestions.length > 0 && query.length >= 2);
    }, [suggestions, query]);

    const isValid = query.trim().length >= minLength && query.length <= maxLength;
    const remaining = maxLength - query.length;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Cmd/Ctrl + Enter to submit
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (isValid) {
                handleSubmit();
            }
        }

        // Escape to hide suggestions
        if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleSubmit = () => {
        if (isValid) {
            const trimmed = query.trim();
            addRecentSearch(trimmed);
            onSubmit(trimmed);
            setQuery('');
            setShowSuggestions(false);
            inputRef.current?.focus();
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    return (
        <div className="w-full relative">
            {/* Suggestions */}
            {showSuggestions && (
                <QuerySuggestions
                    suggestions={suggestions}
                    onSelect={handleSelectSuggestion}
                />
            )}

            {/* Input */}
            <div className="relative">
                <textarea
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className={`w-full p-4 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors ${query.length > 0 && !isValid
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    rows={3}
                    maxLength={maxLength}
                />

                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-gray-600 transition-colors"
                        title="Clear (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono">⌘↵</kbd> to send
                    </span>

                    <span className={remaining < 50 ? 'text-orange-500 font-medium' : ''}>
                        {remaining} characters remaining
                    </span>
                </div>

                {query.length > 0 && query.trim().length < minLength && (
                    <div className="text-xs text-red-500">
                        Minimum {minLength} characters required
                    </div>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={!isValid}
                className={`mt-3 w-full px-6 py-3 rounded-lg font-medium transition-all ${isValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                {isValid ? 'Send Message' : 'Enter your question'}
            </button>
        </div>
    );
});

EnhancedSmartInput.displayName = 'EnhancedSmartInput';
