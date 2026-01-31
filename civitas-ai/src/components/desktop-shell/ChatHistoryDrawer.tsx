import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pin, Archive, Trash2, MessageSquare, ArrowLeft, MoreVertical } from 'lucide-react';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { formatChatDateCompact } from '../../utils/dateFormatters';

interface ChatHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    chatHistory: ChatSession[];
    activeChatId: string;
    onLoadChat: (chatId: string) => void;
    onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
    onPinChat: (chatId: string, e: React.MouseEvent) => void;
    onArchiveChat: (chatId: string, e: React.MouseEvent) => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
    isOpen,
    onClose,
    chatHistory,
    activeChatId,
    onLoadChat,
    onDeleteChat,
    onPinChat,
    onArchiveChat,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openMenuId]);

    // Filter chats
    const filteredChats = useMemo(() => {
        let chats = chatHistory;

        // Filter by archive status
        if (showArchived) {
            chats = chats.filter(c => c.isArchived);
        } else {
            chats = chats.filter(c => !c.isArchived); // Show active only by default
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            chats = chats.filter(c =>
                c.title?.toLowerCase().includes(query) ||
                c.messages.some(m => m.content.toLowerCase().includes(query))
            );
        }

        // Sort: Pinned first, then by date
        return chats.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
    }, [chatHistory, searchQuery, showArchived]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute top-0 left-[72px] bottom-0 w-80 bg-[#0A0A0A]/95 backdrop-blur-xl border-r border-white/[0.06] z-30 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06]">
                            <h2 className="text-sm font-semibold text-white/90 tracking-wide">
                                {showArchived ? 'Archived Chats' : 'Chat History'}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowArchived(!showArchived)}
                                    className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5"
                                >
                                    {showArchived ? <ArrowLeft size={12} /> : <Archive size={12} />}
                                    {showArchived ? 'Back' : 'Archive'}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                                    title="Close"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-white/[0.03]">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-9 pl-9 pr-3 bg-white/5 border border-white/5 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10 focus:border-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {filteredChats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-white/30 gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        {showArchived ? <Archive size={20} /> : <MessageSquare size={20} />}
                                    </div>
                                    <p className="text-sm">No chats found</p>
                                </div>
                            ) : (
                                filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => {
                                            onLoadChat(chat.id);
                                            if (window.innerWidth < 1024) onClose();
                                        }}
                                        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${activeChatId === chat.id
                                            ? 'bg-white/10 border-white/10 shadow-sm'
                                            : 'hover:bg-white/5 hover:border-white/5'
                                            }`}
                                    >
                                        {/* Title & Date */}
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-sm font-medium truncate pr-4 ${activeChatId === chat.id ? 'text-white' : 'text-white/80 group-hover:text-white'
                                                }`}>
                                                {chat.title || 'New Conversation'}
                                            </h3>
                                            {chat.isPinned && <Pin size={12} className="text-emerald-400 shrink-0 transform rotate-45" />}
                                        </div>

                                        <p className="text-xs text-white/40 group-hover:text-white/60 truncate transition-colors">
                                            {chat.messages[chat.messages.length - 1]?.content || 'Empty chat'}
                                        </p>

                                        <div className="flex items-center justify-between mt-2.5">
                                            <span className="text-[10px] text-white/30 font-medium tracking-wide">
                                                {formatChatDateCompact(chat.createdAt || new Date().toISOString())}
                                            </span>

                                            {/* Ellipsis Menu */}
                                            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                                                    }}
                                                    className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                                    title="More options"
                                                >
                                                    <MoreVertical size={14} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <AnimatePresence>
                                                    {openMenuId === chat.id && (
                                                        <motion.div
                                                            ref={menuRef}
                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            transition={{ duration: 0.1 }}
                                                            className="absolute right-0 top-8 w-40 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    onPinChat(chat.id, e);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
                                                            >
                                                                <Pin size={14} className={chat.isPinned ? 'text-emerald-400' : ''} />
                                                                <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    onArchiveChat(chat.id, e);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
                                                            >
                                                                <Archive size={14} />
                                                                <span>{showArchived ? 'Unarchive' : 'Archive'}</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    onDeleteChat(chat.id, e);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                                <span>Delete</span>
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/[0.06]">
                            {/* Could add 'Delete All' or stats here */}
                            <div className="text-[10px] text-center text-white/30">
                                {chatHistory.length} conversations stored locally
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
