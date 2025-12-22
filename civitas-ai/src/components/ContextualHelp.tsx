/**
 * Contextual Help Component
 * 
 * Shows smart tips based on user state and behavior
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ContextualHelpProps {
    trigger: 'first-visit' | 'empty-input' | 'error' | 'no-results' | 'feature-discovery';
    message: string;
    suggestions?: string[];
    onDismiss?: () => void;
    onOpenFAQ?: () => void;
    onOpenPreferences?: () => void;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
    trigger,
    message,
    suggestions = [],
    onDismiss,
    onOpenFAQ,
    onOpenPreferences
}) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
        // Remember dismissal
        localStorage.setItem(`contextual-help-dismissed-${trigger}`, 'true');
    };

    // Check if already dismissed
    useEffect(() => {
        const dismissed = localStorage.getItem(`contextual-help-dismissed-${trigger}`);
        if (dismissed === 'true') {
            setIsVisible(false);
        }
    }, [trigger]);

    if (!isVisible) return null;

    const colors = {
        'first-visit': 'bg-blue-50 border-blue-200 text-blue-800',
        'empty-input': 'bg-purple-50 border-purple-200 text-purple-800',
        'error': 'bg-red-50 border-red-200 text-red-800',
        'no-results': 'bg-yellow-50 border-yellow-200 text-yellow-800',
        'feature-discovery': 'bg-indigo-50 border-indigo-200 text-indigo-800'
    };

    const icons = {
        'first-visit': '👋',
        'empty-input': '💡',
        'error': '⚠️',
        'no-results': '🔍',
        'feature-discovery': '✨'
    };

    return (
        <div className={`rounded-lg border p-4 ${colors[trigger]} relative animate-in fade-in slide-in-from-top-2 duration-300 mb-4`}>
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-current opacity-50 hover:opacity-100 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
                <span className="text-2xl flex-shrink-0">{icons[trigger]}</span>
                <div className="flex-1">
                    <p className="font-medium mb-2">{message}</p>

                    {suggestions.length > 0 && (
                        <div className="space-y-1 mb-3">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="text-sm opacity-90">
                                    • {suggestion}
                                </div>
                            ))}
                        </div>
                    )}

                    {(onOpenFAQ || onOpenPreferences) && (
                        <div className="flex gap-3 mt-2">
                            {onOpenFAQ && (
                                <button
                                    onClick={onOpenFAQ}
                                    className="text-xs font-semibold underline hover:no-underline opacity-80 hover:opacity-100"
                                >
                                    Open FAQ
                                </button>
                            )}
                            {onOpenPreferences && (
                                <button
                                    onClick={onOpenPreferences}
                                    className="text-xs font-semibold underline hover:no-underline opacity-80 hover:opacity-100"
                                >
                                    Settings
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Hook to manage contextual help triggers
 */
export const useContextualHelp = () => {
    const [showHelp, setShowHelp] = useState(false);
    const [helpConfig, setHelpConfig] = useState<ContextualHelpProps | null>(null);

    const showFirstVisitHelp = () => {
        const hasVisited = localStorage.getItem('civitas-has-visited');
        if (!hasVisited) {
            setHelpConfig({
                trigger: 'first-visit',
                message: 'Welcome to Vasthu! Try asking about properties in your favorite city.',
                suggestions: [
                    'Find STR properties in Austin under $400k',
                    'What\'s the market like in Phoenix?',
                    'Are short-term rentals allowed in Miami?'
                ]
            });
            setShowHelp(true);
        }
    };

    const showEmptyInputHelp = () => {
        setHelpConfig({
            trigger: 'empty-input',
            message: 'Not sure what to ask? Try one of these popular queries:',
            suggestions: [
                'Find 3-bedroom properties in Denver',
                'Compare STR vs LTR cash flow in Tampa',
                'What are the STR rules in Nashville?'
            ]
        });
        setShowHelp(true);
    };

    const showErrorHelp = (errorMessage?: string) => {
        setHelpConfig({
            trigger: 'error',
            message: errorMessage || 'Having trouble? Here are some tips:',
            suggestions: [
                'Check your internet connection',
                'Try rephrasing your question',
                'Browse our FAQ for common issues'
            ]
        });
        setShowHelp(true);
    };

    const showNoResultsHelp = () => {
        setHelpConfig({
            trigger: 'no-results',
            message: 'No results found. Try:',
            suggestions: [
                'Broadening your search criteria',
                'Checking spelling of city names',
                'Using different keywords',
                'Trying a different market'
            ]
        });
        setShowHelp(true);
    };

    const dismissHelp = () => {
        setShowHelp(false);
    };

    return {
        showHelp,
        helpConfig,
        showFirstVisitHelp,
        showEmptyInputHelp,
        showErrorHelp,
        showNoResultsHelp,
        dismissHelp
    };
};
