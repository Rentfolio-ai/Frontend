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

            // Filter chips
            const now = new Date();
            const chatDate = new Date(chat.timestamp || chat.createdAt || new Date());

            const matchesFilters = activeFilters.every(filter => {
                switch (filter) {
                    case 'today':
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        return chatDate >= today;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return chatDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return chatDate >= monthAgo;
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
            return new Date(b.timestamp || b.createdAt || 0).getTime() -
                new Date(a.timestamp || a.createdAt || 0).getTime();
        });

    const toggleFilter = (filter: FilterChip) => {
        setActiveFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const handleChatClick = (chatId: string) => {
        onLoadChat(chatId);
        onClose();
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
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        <button
                            onClick={() => toggleFilter('today')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilters.includes('today')
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />
                            Today
                        </button>
                        <button
                            onClick={() => toggleFilter('week')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilters.includes('week')
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => toggleFilter('bookmarked')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilters.includes('bookmarked')
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            ⭐ Bookmarked
                        </button>
                        <button
                            onClick={() => toggleFilter('analyzed')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilters.includes('analyzed')
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                            Analyzed
                        </button>
                    </div>
                </div>

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

                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => handleChatClick(chat.id)}
                                    className={`w-full p-4 rounded-lg text-left transition-all ${isActive
                                        ? 'bg-teal-500/10 border border-teal-500/30'
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${hasProperty ? 'bg-teal-500/20' : 'bg-white/10'
                                            }`}>
                                            {hasProperty ? (
                                                <MapPin className="w-5 h-5 text-teal-400" />
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
                                            {chat.messages && chat.messages.length > 0 && (
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
                                                        <span className="text-teal-400">Property Analysis</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};
