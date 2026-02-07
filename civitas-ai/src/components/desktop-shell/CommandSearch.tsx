/**
 * Command Search - Notion-Inspired Search Overlay
 * Full-screen, keyboard-first search experience
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, TrendingUp, Star, Home, DollarSign } from 'lucide-react';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { cn } from '../../lib/utils';

interface CommandSearchProps {
    isOpen: boolean;
    onClose: () => void;
    chatHistory: ChatSession[];
    onLoadChat: (chatId: string, messageId?: string) => void;
    activeChatId: string;
}

interface GroupedChats {
    label: string;
    chats: ChatSession[];
}

const RECENT_SEARCHES_KEY = 'civitas-recent-searches';
const MAX_RECENT_SEARCHES = 10;

// Helper to format dates
const formatChatTime = (timestamp: string | undefined) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // Today - show time
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

// Helper to get chat timestamp
const getChatTimestamp = (chat: ChatSession): Date => {
    if (chat.timestamp) return new Date(chat.timestamp);
    if (chat.createdAt) return new Date(chat.createdAt);
    if (chat.messages && chat.messages.length > 0) {
        return new Date(chat.messages[chat.messages.length - 1].timestamp || new Date());
    }
    return new Date();
};

// Helper to group chats by date
const groupChatsByDate = (chats: ChatSession[]): GroupedChats[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: GroupedChats[] = [
        { label: 'TODAY', chats: [] },
        { label: 'YESTERDAY', chats: [] },
        { label: 'THIS WEEK', chats: [] },
        { label: 'THIS MONTH', chats: [] },
        { label: 'OLDER', chats: [] },
    ];

    chats.forEach(chat => {
        const timestamp = getChatTimestamp(chat);
        
        if (timestamp >= today) {
            groups[0].chats.push(chat);
        } else if (timestamp >= yesterday) {
            groups[1].chats.push(chat);
        } else if (timestamp >= weekAgo) {
            groups[2].chats.push(chat);
        } else if (timestamp >= monthAgo) {
            groups[3].chats.push(chat);
        } else {
            groups[4].chats.push(chat);
        }
    });

    // Filter out empty groups
    return groups.filter(group => group.chats.length > 0);
};

// Helper to get matching snippet
const getMatchingSnippet = (content: string, query: string): string => {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) return content.substring(0, 80) + '...';
    
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + query.length + 50);
    
    return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
};

// Helper to check if chat has property analysis
const hasPropertyAnalysis = (chat: ChatSession): boolean => {
    return chat.messages?.some(m => 
        m.tools?.some((t: any) => 
            t.name === 'analyze_property' || 
            t.kind === 'deal_analyzer' ||
            t.name === 'search_properties'
        )
    ) || false;
};

// Helper to get strategy tag
const getStrategyTag = (chat: ChatSession): string | null => {
    const messages = chat.messages || [];
    for (const msg of messages) {
        const content = msg.content.toLowerCase();
        if (content.includes('str') || content.includes('short-term')) return 'STR';
        if (content.includes('ltr') || content.includes('long-term')) return 'LTR';
        if (content.includes('flip') || content.includes('fix and flip')) return 'FLIP';
    }
    return null;
};

export const CommandSearch: React.FC<CommandSearchProps> = ({
    isOpen,
    onClose,
    chatHistory,
    onLoadChat,
    activeChatId
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Load recent searches
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                setRecentSearches(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Failed to load recent searches:', err);
        }
    }, []);

    // Save search to recent
    const saveRecentSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) return;
        
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s !== searchQuery);
            const updated = [searchQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);
            
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch (err) {
                console.error('Failed to save recent search:', err);
            }
            
            return updated;
        });
    }, []);

    // Clear recent searches
    const clearRecentSearches = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    }, []);

    // Filter and search chats
    const filteredChats = chatHistory
        .filter(chat => !chat.isArchived)
        .filter(chat => {
            if (!query) return true;
            
            const lowerQuery = query.toLowerCase();
            
            // Search title
            if (chat.title?.toLowerCase().includes(lowerQuery)) return true;
            
            // Search messages
            if (chat.messages?.some(m => m.content.toLowerCase().includes(lowerQuery))) return true;
            
            return false;
        })
        .sort((a, b) => {
            // Pinned first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            // Then by timestamp
            return getChatTimestamp(b).getTime() - getChatTimestamp(a).getTime();
        });

    // Group results
    const groupedResults = query ? groupChatsByDate(filteredChats) : [];
    
    // Flatten for keyboard navigation
    const flatResults = groupedResults.flatMap(g => g.chats);

    // Auto-focus input
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (flatResults[selectedIndex]) {
                        saveRecentSearch(query);
                        onLoadChat(flatResults[selectedIndex].id);
                        onClose();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, flatResults, selectedIndex, query, onClose, onLoadChat, saveRecentSearch]);

    // Scroll selected into view
    useEffect(() => {
        if (resultsRef.current && flatResults.length > 0) {
            const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex, flatResults.length]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChatClick = (chatId: string) => {
        saveRecentSearch(query);
        onLoadChat(chatId);
        onClose();
    };

    const handleRecentSearchClick = (searchQuery: string) => {
        setQuery(searchQuery);
        inputRef.current?.focus();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="absolute inset-0" 
                onClick={onClose}
            />

            {/* Search Panel */}
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/[0.10] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Search Input */}
                <div className="p-6 border-b border-white/[0.05]">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search chats..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-20 bg-white/[0.05] border border-white/[0.10] rounded-lg text-lg text-white/90 placeholder-white/40 focus:outline-none focus:border-white/[0.20] focus:ring-2 focus:ring-white/[0.10] transition-all"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/[0.05] rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-white/40" />
                            </button>
                        )}
                        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-white/40 bg-white/[0.03] border border-white/[0.08] rounded">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Results */}
                <div ref={resultsRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                    {!query && recentSearches.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Recent Searches</h3>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-white/40 hover:text-white/60 transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="space-y-1">
                                {recentSearches.map((search, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleRecentSearchClick(search)}
                                        className="w-full px-3 py-2 text-left text-sm text-white/70 hover:text-white/90 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-all"
                                    >
                                        <Search className="w-3.5 h-3.5 inline mr-2 text-white/40" />
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!query && recentSearches.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Search className="w-12 h-12 text-white/20 mb-4" />
                            <p className="text-white/60 text-sm mb-2">Search your conversations</p>
                            <p className="text-white/40 text-xs">
                                Try searching for property locations, strategies, or topics
                            </p>
                        </div>
                    )}

                    {query && flatResults.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Search className="w-12 h-12 text-white/20 mb-4" />
                            <p className="text-white/60 text-sm mb-2">No chats found for "{query}"</p>
                            <p className="text-white/40 text-xs">
                                Try different keywords or check your spelling
                            </p>
                        </div>
                    )}

                    {query && groupedResults.map((group, groupIdx) => {
                        const groupStartIndex = groupedResults
                            .slice(0, groupIdx)
                            .reduce((sum, g) => sum + g.chats.length, 0);

                        return (
                            <div key={group.label} className="space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                                    {group.label}
                                    <span className="text-white/30">({group.chats.length})</span>
                                </h3>
                                <div className="space-y-1">
                                    {group.chats.map((chat, chatIdx) => {
                                        const index = groupStartIndex + chatIdx;
                                        const isSelected = index === selectedIndex;
                                        const isActive = chat.id === activeChatId;
                                        const hasAnalysis = hasPropertyAnalysis(chat);
                                        const strategy = getStrategyTag(chat);
                                        
                                        // Get matching message snippet
                                        const matchingMessage = chat.messages?.find(m => 
                                            m.content.toLowerCase().includes(query.toLowerCase())
                                        );
                                        const snippet = matchingMessage ? getMatchingSnippet(matchingMessage.content, query) : null;

                                        return (
                                            <button
                                                key={chat.id}
                                                data-index={index}
                                                onClick={() => handleChatClick(chat.id)}
                                                className={cn(
                                                    'w-full p-3 rounded-lg text-left transition-all border',
                                                    isActive && 'bg-[#C08B5C]/[0.10] border-[#C08B5C]/[0.30]',
                                                    !isActive && isSelected && 'bg-white/[0.08] border-white/[0.15]',
                                                    !isActive && !isSelected && 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Icon */}
                                                    <div className={cn(
                                                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg',
                                                        hasAnalysis ? 'bg-[#C08B5C]/20' : 'bg-white/[0.08]'
                                                    )}>
                                                        {hasAnalysis ? <MapPin className="w-4 h-4 text-[#D4A27F]" /> : '💬'}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium text-sm text-white/90 truncate flex-1">
                                                                {chat.title || 'Untitled Chat'}
                                                            </h4>
                                                            <span className="text-xs text-white/40 flex-shrink-0">
                                                                {formatChatTime(chat.timestamp || chat.createdAt)}
                                                            </span>
                                                        </div>

                                                        {/* Snippet */}
                                                        {snippet && (
                                                            <p className="text-xs text-white/50 mb-2 line-clamp-2 flex items-start gap-1">
                                                                <span className="text-white/30">↳</span>
                                                                {snippet}
                                                            </p>
                                                        )}

                                                        {/* Tags */}
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {strategy && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/[0.05] border border-white/[0.10] rounded-full text-[10px] font-medium text-white/60">
                                                                    <DollarSign className="w-2.5 h-2.5" />
                                                                    {strategy}
                                                                </span>
                                                            )}
                                                            {hasAnalysis && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#C08B5C]/10 border border-[#C08B5C]/20 rounded-full text-[10px] font-medium text-[#D4A27F]">
                                                                    <TrendingUp className="w-2.5 h-2.5" />
                                                                    Analysis
                                                                </span>
                                                            )}
                                                            {chat.isPinned && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] font-medium text-yellow-400">
                                                                    <Star className="w-2.5 h-2.5 fill-current" />
                                                                    Pinned
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-white/[0.05] bg-white/[0.02]">
                    <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                        <span>↑↓ Navigate</span>
                        <span>•</span>
                        <span>↵ Open</span>
                        <span>•</span>
                        <span>Esc Close</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

