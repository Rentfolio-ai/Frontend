// FILE: src/components/chat/InConversationSearch.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Message } from '../../types/chat';

interface InConversationSearchProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onNavigateToMatch: (messageId: string, matchIndex: number) => void;
}

export const InConversationSearch: React.FC<InConversationSearchProps> = ({
    isOpen,
    onClose,
    messages,
    onNavigateToMatch,
}) => {
    const [query, setQuery] = useState('');
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [matches, setMatches] = useState<Array<{ messageId: string; messageIndex: number; content: string }>>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    // Find matches when query changes
    useEffect(() => {
        if (!query.trim()) {
            setMatches([]);
            setCurrentMatchIndex(0);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const foundMatches: Array<{ messageId: string; messageIndex: number; content: string }> = [];

        messages.forEach((msg, index) => {
            const lowerContent = msg.content.toLowerCase();
            if (lowerContent.includes(lowerQuery)) {
                foundMatches.push({
                    messageId: msg.id,
                    messageIndex: index,
                    content: msg.content,
                });
            }
        });

        setMatches(foundMatches);
        setCurrentMatchIndex(foundMatches.length > 0 ? 0 : -1);
    }, [query, messages]);

    // Navigate to current match
    useEffect(() => {
        if (matches.length > 0 && currentMatchIndex >= 0) {
            const match = matches[currentMatchIndex];
            onNavigateToMatch(match.messageId, currentMatchIndex);
        }
    }, [currentMatchIndex, matches, onNavigateToMatch]);

    const handlePrevious = () => {
        if (matches.length === 0) return;
        setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
    };

    const handleNext = () => {
        if (matches.length === 0) return;
        setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                handlePrevious();
            } else {
                handleNext();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-0 left-0 right-0 z-30 bg-[#1a1a1a] border-b border-white/10 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 px-4 py-3">
                {/* Search Icon */}
                <Search className="w-4 h-4 text-white/40 flex-shrink-0" />

                {/* Search Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search in conversation..."
                    className="flex-1 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
                />

                {/* Match Counter */}
                <div className="flex items-center gap-2 text-xs text-white/60">
                    {matches.length > 0 ? (
                        <span className="font-medium">
                            {currentMatchIndex + 1} of {matches.length}
                        </span>
                    ) : query.trim() ? (
                        <span className="text-white/40">No matches</span>
                    ) : null}

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePrevious}
                            disabled={matches.length === 0}
                            className={cn(
                                "p-1 rounded hover:bg-white/10 transition-colors",
                                matches.length === 0 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
                            )}
                            title="Previous match (Shift+Enter)"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={matches.length === 0}
                            className={cn(
                                "p-1 rounded hover:bg-white/10 transition-colors",
                                matches.length === 0 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
                            )}
                            title="Next match (Enter)"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                    title="Close (Esc)"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="px-4 pb-2 text-[10px] text-white/30">
                <span className="mr-3">⏎ Next</span>
                <span className="mr-3">⇧⏎ Previous</span>
                <span>Esc Close</span>
            </div>
        </div>
    );
};
