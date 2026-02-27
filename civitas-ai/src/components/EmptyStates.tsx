/**
 * Empty State Components
 * 
 * Helpful empty states for various scenarios
 */

import React from 'react';
import { MessageSquare, Search, Bookmark } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actions?: Array<{
        label: string;
        onClick: () => void;
        primary?: boolean;
    }>;
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actions = [],
    suggestions = [],
    onSuggestionClick
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && (
                <div className="mb-4 text-gray-400">
                    {icon}
                </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-md">{description}</p>

            {suggestions.length > 0 && (
                <div className="mb-6 space-y-2 w-full max-w-md">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSuggestionClick?.(suggestion)}
                            className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-left"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {actions.length > 0 && (
                <div className="flex gap-3">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${action.primary
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Empty Chat State
 */
export const EmptyChat: React.FC<{ onSuggestionClick?: (query: string) => void }> = ({
    onSuggestionClick
}) => {
    return (
        <EmptyState
            icon={<MessageSquare className="w-16 h-16" />}
            title="No messages yet"
            description="Start by asking a question or try one of these popular queries"
            suggestions={[
                'Find STR properties in Austin under $400k',
                'What\'s the average cap rate in Phoenix?',
                'Are short-term rentals allowed in Miami?',
                'Compare LTR vs STR cash flow in Denver'
            ]}
            onSuggestionClick={onSuggestionClick}
        />
    );
};

/**
 * Empty Search State
 */
export const EmptySearch: React.FC<{ onClearFilters?: () => void }> = ({
    onClearFilters
}) => {
    return (
        <EmptyState
            icon={<Search className="w-16 h-16" />}
            title="No results found"
            description="Try adjusting your search criteria or browse our suggestions"
            actions={[
                {
                    label: 'Clear Filters',
                    onClick: onClearFilters || (() => { }),
                    primary: true
                }
            ]}
            suggestions={[
                'Broaden your search criteria',
                'Check spelling of city names',
                'Try a different market',
                'Use different keywords'
            ]}
        />
    );
};

/**
 * Empty Bookmarks State
 */
export const EmptyBookmarks: React.FC<{ onBrowseProperties?: () => void }> = ({
    onBrowseProperties
}) => {
    return (
        <EmptyState
            icon={<Bookmark className="w-16 h-16" />}
            title="No saved items"
            description="Save properties and searches to access them quickly later"
            actions={[
                {
                    label: 'Browse Properties',
                    onClick: onBrowseProperties || (() => { }),
                    primary: true
                }
            ]}
        />
    );
};

interface HomePanelEmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const HomePanelEmptyState: React.FC<HomePanelEmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-8 text-center">
        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] mx-auto mb-3 flex items-center justify-center text-white/25">
            {icon}
        </div>
        <div className="text-[13px] text-white/45">{title}</div>
        <div className="text-[11px] text-white/25 mt-1">{description}</div>
        {actionLabel && onAction && (
            <button
                onClick={onAction}
                className="mt-3 text-[12px] font-medium text-[#C08B5C] hover:text-[#D4A27F] transition-colors"
            >
                {actionLabel}
            </button>
        )}
    </div>
);
