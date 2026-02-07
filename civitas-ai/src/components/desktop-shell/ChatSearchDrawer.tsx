import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Calendar, MapPin, TrendingUp } from 'lucide-react';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { formatChatDateCompact } from '../../utils/dateFormatters';

interface ChatSearchDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    chatHistory: ChatSession[];
    onLoadChat: (chatId: string) => void;
    activeChatId: string;
}

type FilterChip = 'today' | 'week' | 'month' | 'bookmarked' | 'analyzed';

export const ChatSearchDrawer: React.FC<ChatSearchDrawerProps> = ({
    isOpen,
    onClose,
    chatHistory,
    onLoadChat,
    activeChatId
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus search input when drawer opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Filter chats based on search query and active filters
    const filteredChats = chatHistory
        .filter(chat => !chat.isArchived)
        .filter(chat => {
            // Text search
            const matchesSearch = !searchQuery ||
                chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.messages?.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

            // Filter chips - Fix date parsing
            const now = new Date();

            // Try to get the most recent/accurate timestamp
            let chatTimestamp: Date;
            if (chat.timestamp) {
                chatTimestamp = new Date(chat.timestamp);
            } else if (chat.createdAt) {
                chatTimestamp = new Date(chat.createdAt);
            } else if (chat.messages && chat.messages.length > 0) {
                // Use the timestamp from the most recent message
                const lastMessage = chat.messages[chat.messages.length - 1];
                chatTimestamp = new Date(lastMessage.timestamp || new Date());
            } else {
                chatTimestamp = new Date();
            }

            // Validate the parsed date
            if (isNaN(chatTimestamp.getTime())) {
                console.warn('Invalid date for chat:', chat.id, chat.timestamp, chat.createdAt);
                chatTimestamp = new Date(); // Fallback to now
            }

            const matchesFilters = activeFilters.every(filter => {
                switch (filter) {
                    case 'today':
                        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
                        return chatTimestamp >= todayStart && chatTimestamp < todayEnd;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return chatTimestamp >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return chatTimestamp >= monthAgo;
                    case 'bookmarked':
                        return chat.isPinned;
                    case 'analyzed':
                        return chat.messages?.some(m => m.tools?.some((t: any) => t.name === 'analyze_property' || t.kind === 'deal_analyzer'));
                    default:
                        return true;
                }
            });

            return matchesSearch && matchesFilters;
        })
        .sort((a, b) => {
            // Sort: pinned first, then by date
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            // Get timestamps with fallback logic
            const getTimestamp = (chat: typeof a) => {
                if (chat.timestamp) return new Date(chat.timestamp).getTime();
                if (chat.createdAt) return new Date(chat.createdAt).getTime();
                if (chat.messages && chat.messages.length > 0) {
                    return new Date(chat.messages[chat.messages.length - 1].timestamp || 0).getTime();
                }
                return 0;
            };

            return getTimestamp(b) - getTimestamp(a);
        });

    const toggleFilter = (filter: FilterChip) => {
        setActiveFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const handleChatClick = (chatId: string, messageId?: string) => {
        onLoadChat(chatId);
        onClose();

        // If messageId provided, scroll to that message after a short delay
        if (messageId) {
            setTimeout(() => {
                const messageElement = document.getElementById(`message-${messageId}`);
                if (messageElement) {
                    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    messageElement.classList.add('message-jump-highlight');

                    // Remove highlight class after animation
                    setTimeout(() => {
                        messageElement.classList.remove('message-jump-highlight');
                    }, 2000);
                }
            }, 300);
        }
    };

    // Find matching messages in a chat
    const getMatchingMessages = (chat: ChatSession, query: string) => {
        if (!query || !chat.messages) return [];

        return chat.messages
            .filter(m => m.content.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 2); // Show max 2 matching messages per chat
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Compact Popover - Bottom Left (right of sidebar) */}
            <div className="fixed bottom-16 left-20 w-96 max-h-[calc(100vh-5rem)] bg-[#1a1a1a] border border-white/10 rounded-2xl z-50 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Search Chats</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white/70" />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by keyword, property, or topic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#C08B5C]/50 focus:ring-2 focus:ring-[#C08B5C]/20 transition-all"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        <button
                            onClick={() => toggleFilter('today')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilters.includes('today')
                                ? 'bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />
                            Today
                        </button>
                        <button
                            onClick={() => toggleFilter('week')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilters.includes('week')
                                ? 'bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => toggleFilter('bookmarked')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilters.includes('bookmarked')
                                ? 'bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            ⭐ Bookmarked
                        </button>
                        <button
                            onClick={() => toggleFilter('analyzed')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilters.includes('analyzed')
                                ? 'bg-[#C08B5C]/20 text-[#D4A27F] border border-[#C08B5C]/30'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                            Analyzed
                        </button>
                    </div>
                </div>

                {/* Results Header with Count */}
                {(searchQuery || activeFilters.length > 0) && (
                    <div className="px-6 py-3 border-b border-white/10 bg-white/5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-white/60 font-medium">
                                {filteredChats.length} {filteredChats.length === 1 ? 'chat' : 'chats'} found
                            </span>
                            {activeFilters.length > 0 && (
                                <button
                                    onClick={() => setActiveFilters([])}
                                    className="text-[#D4A27F] hover:text-[#D4A27F] transition-colors font-medium"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredChats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <Search className="w-12 h-12 text-white/20 mb-4" />
                            <p className="text-white/60 text-sm">
                                {searchQuery || activeFilters.length > 0
                                    ? 'No chats match your search'
                                    : 'Start typing to search your chats'}
                            </p>
                        </div>
                    ) : (
                        filteredChats.map((chat) => {
                            const isActive = chat.id === activeChatId;
                            const hasProperty = chat.messages?.some(m =>
                                m.tools?.some((t: any) => t.name === 'analyze_property' || t.kind === 'deal_analyzer')
                            );
                            const matchingMessages = searchQuery ? getMatchingMessages(chat, searchQuery) : [];

                            return (
                                <div key={chat.id} className="space-y-1">
                                    <button
                                        onClick={() => handleChatClick(chat.id)}
                                        className={`w-full p-4  rounded-lg text-left transition-all ${isActive
                                            ? 'bg-[#C08B5C]/10 border border-[#C08B5C]/30'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${hasProperty ? 'bg-[#C08B5C]/20' : 'bg-white/10'
                                                }`}>
                                                {hasProperty ? (
                                                    <MapPin className="w-5 h-5 text-[#D4A27F]" />
                                                ) : (
                                                    <span className="text-lg">💬</span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-white truncate flex-1">
                                                        {chat.title || 'Untitled Chat'}
                                                    </h3>
                                                    {chat.isPinned && (
                                                        <span className="text-yellow-400">⭐</span>
                                                    )}
                                                </div>

                                                {/* Preview text */}
                                                {chat.messages && chat.messages.length > 0 && !matchingMessages.length && (
                                                    <p className="text-sm text-white/50 truncate mb-2">
                                                        {chat.messages[chat.messages.length - 1]?.content.substring(0, 80)}...
                                                    </p>
                                                )}

                                                {/* Metadata */}
                                                <div className="flex items-center gap-2 text-xs text-white/40">
                                                    <span>{formatChatDateCompact(chat.timestamp || chat.createdAt)}</span>
                                                    {hasProperty && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-[#D4A27F]">Property Analysis</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Matching Messages */}
                                    {matchingMessages.length > 0 && (
                                        <div className="ml-14 space-y-1">
                                            {matchingMessages.map((msg: any) => {
                                                // Highlight search term in snippet
                                                const lowerContent = msg.content.toLowerCase();
                                                const lowerQuery = searchQuery.toLowerCase();
                                                const index = lowerContent.indexOf(lowerQuery);

                                                let snippet = '';
                                                if (index !== -1) {
                                                    const start = Math.max(0, index - 30);
                                                    const end = Math.min(msg.content.length, index + searchQuery.length + 50);
                                                    snippet = (start > 0 ? '...' : '') + msg.content.substring(start, end) + (end < msg.content.length ? '...' : '');
                                                } else {
                                                    snippet = msg.content.substring(0, 80) + '...';
                                                }

                                                return (
                                                    <button
                                                        key={msg.id}
                                                        onClick={() => handleChatClick(chat.id, msg.id)}
                                                        className="w-full px-3 py-2 text-left text-xs rounded bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-[#C08B5C]/30 transition-all group"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-[10px] text-white/30 mt-0.5">↳</span>
                                                            <p className="text-white/50 group-hover:text-white/70 line-clamp-2">
                                                                {snippet}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};
