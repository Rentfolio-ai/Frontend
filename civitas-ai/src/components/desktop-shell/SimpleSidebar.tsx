import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trash2, Pin, FileBarChart2, Edit3, MoreVertical, Archive, Search, X, Ellipsis, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileMenuModal } from '../modals/ProfileMenuModal';
import { Logo } from '../ui/Logo';

// --- Date grouping helpers ---
function getDateGroup(dateStr: string | undefined): string {
    if (!dateStr) return 'Older';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        if (date.toDateString() === now.toDateString()) return 'Today';
        return 'Yesterday';
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'Previous 7 Days';
    if (diffDays < 30) return 'Previous 30 Days';
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const year = date.getFullYear();
    const currentYear = now.getFullYear();
    if (year === currentYear) return months[date.getMonth()];
    return `${months[date.getMonth()]} ${year}`;
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days'];

// Width constants
const COLLAPSED_WIDTH = 56;  // px — icon rail, matches pl-14 in DesktopShell
const EXPANDED_WIDTH = 260;  // px — full chat list

interface SimpleSidebarProps {
    onNewChat: () => void;
    onChatClick: () => void;
    onAnalyticsClick: () => void;
    onReportsClick: () => void;
    onVoiceNotesClick?: () => void;
    onSettingsClick?: () => void;
    onHelpClick?: () => void;
    onUpgradeClick?: () => void;
    onAboutClick?: () => void;
    onVisionClick?: () => void;
    onSearchClick?: () => void;
    onFilesClick?: () => void;
    chatHistory: ChatSession[];
    activeChatId: string;
    onLoadChat: (chatId: string) => void;
    onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
    onPinChat: (chatId: string, e: React.MouseEvent) => void;
    onArchiveChat?: (chatId: string, e: React.MouseEvent) => void;
    hideHamburger?: boolean;
    isCurrentChatTemporary?: boolean;
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
    onNewChat,
    onAnalyticsClick,
    onReportsClick,
    onVoiceNotesClick,
    onSettingsClick,
    onHelpClick,
    onUpgradeClick,
    onAboutClick,
    onVisionClick,
    chatHistory,
    activeChatId,
    onLoadChat,
    onDeleteChat,
    onPinChat,
    onArchiveChat,
    hideHamburger = false,
    isCurrentChatTemporary = false,
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const { user: currentUser } = useAuth();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const activeChats = chatHistory.filter(c => !c.isArchived);

    const filteredChats = useMemo(() => {
        const sorted = [...activeChats].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        if (!searchQuery.trim()) return sorted;
        const q = searchQuery.toLowerCase();
        return sorted.filter(c => (c.title || '').toLowerCase().includes(q));
    }, [activeChats, searchQuery]);

    const groupedChats = useMemo(() => {
        const pinned = filteredChats.filter(c => c.isPinned);
        const unpinned = filteredChats.filter(c => !c.isPinned);
        const groups: Record<string, ChatSession[]> = {};
        unpinned.forEach(chat => {
            const group = getDateGroup(chat.createdAt);
            if (!groups[group]) groups[group] = [];
            groups[group].push(chat);
        });
        const orderedGroupNames = Object.keys(groups).sort((a, b) => {
            const aIdx = GROUP_ORDER.indexOf(a);
            const bIdx = GROUP_ORDER.indexOf(b);
            if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
            if (aIdx >= 0) return -1;
            if (bIdx >= 0) return 1;
            return 0;
        });
        return { pinned, groups, orderedGroupNames };
    }, [filteredChats]);

    // Close expanded sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close dropdown menu when clicking outside
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

    useEffect(() => {
        if (isSearching && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearching]);

    // User avatar (shared between collapsed and expanded)
    const UserAvatar = ({ size = 28 }: { size?: number }) => (
        <div
            className="rounded-full flex-shrink-0 overflow-hidden"
            style={{
                width: size, height: size,
                background: !(currentUser?.avatar && currentUser.avatar.length > 200)
                    ? 'linear-gradient(135deg, #C08B5C, #8A5D3B)' : undefined
            }}
        >
            {currentUser?.avatar && currentUser.avatar.length > 200 ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-semibold" style={{ fontSize: size * 0.4 }}>
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
            )}
        </div>
    );

    // Render a single chat item
    const renderChatItem = (chat: ChatSession) => {
        const isActive = chat.id === activeChatId;
        return (
            <div
                key={chat.id}
                onClick={() => { onLoadChat(chat.id); }}
                className="group relative flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150"
                style={{ backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                {chat.isPinned && <Pin className="w-3 h-3 flex-shrink-0" style={{ color: '#C08B5C' }} />}
                <span
                    className="flex-1 truncate"
                    style={{ color: isActive ? '#ECECF1' : '#9898A6', fontSize: '13px', fontWeight: isActive ? 500 : 400, letterSpacing: '-0.01em' }}
                >
                    {chat.title || 'New conversation'}
                </span>
                <div className="hidden group-hover:flex items-center gap-0.5 relative flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === chat.id ? null : chat.id); }}
                        className="p-1 rounded-md transition-colors hover:bg-white/10"
                        style={{ color: '#565869' }}
                        title="More options"
                    >
                        <Ellipsis className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                        {openMenuId === chat.id && (
                            <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 top-8 w-44 rounded-xl shadow-2xl z-[60] overflow-hidden"
                                style={{ backgroundColor: '#202024', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={(e) => { onPinChat(chat.id, e); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] text-white/70 hover:bg-white/5 transition-colors">
                                    <Pin size={14} className={chat.isPinned ? 'text-[#C08B5C]' : ''} />
                                    <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                                </button>
                                {onArchiveChat && (
                                    <button onClick={(e) => { onArchiveChat(chat.id, e); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] text-white/70 hover:bg-white/5 transition-colors">
                                        <Archive size={14} /><span>Archive</span>
                                    </button>
                                )}
                                <div className="border-t border-white/[0.05]" />
                                <button onClick={(e) => { onDeleteChat(chat.id, e); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] text-red-400/80 hover:bg-red-400/10 transition-colors">
                                    <Trash2 size={14} /><span>Delete</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* ══════ SINGLE SIDEBAR — collapsed = icon rail, expanded = full chat panel ══════ */}
            <div
                ref={sidebarRef}
                className={`fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden ${!isOpen ? 'items-center' : ''}`}
                style={{
                    width: isOpen ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
                    backgroundColor: '#171719',
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'width 200ms ease-out',
                }}
            >
                {/* ════════════════════════════════════════════════ */}
                {/* EXPANDED STATE                                  */}
                {/* ════════════════════════════════════════════════ */}
                {isOpen ? (
                    <>
                        {/* Header: Logo + Search + New Chat */}
                        <div className="flex items-center justify-between px-3 py-3 flex-shrink-0">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl transition-colors hover:bg-white/5"
                                title="Collapse sidebar"
                            >
                                <Logo showText={false} className="w-8 h-8" variant="light" />
                            </button>
                            <div className="flex items-center gap-0.5">
                                <button onClick={() => { setIsSearching(!isSearching); setSearchQuery(''); }} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Search chats">
                                    <Search className="w-4 h-4 text-white/40" />
                                </button>
                                <button onClick={() => onNewChat()} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="New chat">
                                    <Edit3 className="w-4 h-4 text-white/50" />
                                </button>
                            </div>
                        </div>

                        {/* Nav links — at the top, below header */}
                        <div className="px-2 pb-1.5 flex-shrink-0 space-y-0.5">
                            <button onClick={() => onReportsClick()} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.04]">
                                <FileBarChart2 className="w-4 h-4" strokeWidth={1.8} />
                                <span>Reports</span>
                            </button>
                            <button onClick={() => onVoiceNotesClick?.()} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.04]">
                                <Mic className="w-4 h-4" strokeWidth={1.8} />
                                <span>Voice Notes</span>
                            </button>
                        </div>

                        {/* Search bar (toggled) */}
                        <AnimatePresence>
                            {isSearching && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="px-3 pb-1 overflow-hidden flex-shrink-0"
                                >
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search chats..."
                                            className="w-full pl-8 pr-8 py-1.5 rounded-lg text-[13px] text-white/80 placeholder-white/25 bg-white/[0.04] border border-white/[0.06] focus:border-white/10 focus:outline-none transition-colors"
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10">
                                                <X className="w-3 h-3 text-white/30" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* "Your chats" section header + chat history */}
                        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
                            {/* Section label */}
                            <div className="px-2.5 pt-1 pb-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/20">Your chats</span>
                            </div>

                            {/* Pinned */}
                            {groupedChats.pinned.length > 0 && (
                                <div className="mb-1">
                                    <div className="px-2.5 py-1">
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/15">Pinned</span>
                                    </div>
                                    {groupedChats.pinned.map(renderChatItem)}
                                </div>
                            )}

                            {/* Date groups */}
                            {groupedChats.orderedGroupNames.map(groupName => {
                                const chats = groupedChats.groups[groupName];
                                if (!chats || chats.length === 0) return null;
                                return (
                                    <div key={groupName} className="mb-1">
                                        <div className="px-2.5 py-1">
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-white/15">{groupName}</span>
                                        </div>
                                        {chats.map(renderChatItem)}
                                    </div>
                                );
                            })}

                            {/* Empty state */}
                            {filteredChats.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="text-white/15 text-[13px]">
                                        {searchQuery ? 'No matching chats' : 'No conversations yet'}
                                    </div>
                                    {!searchQuery && (
                                        <button onClick={() => onNewChat()} className="mt-3 text-[12px] text-[#C08B5C]/60 hover:text-[#C08B5C] transition-colors">
                                            Start a new chat
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bottom: User only */}
                        <div className="border-t px-2 pt-1.5 pb-2 flex-shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                            <button onClick={() => setShowProfileMenu(true)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors hover:bg-white/[0.04]">
                                <UserAvatar size={24} />
                                <span className="flex-1 truncate text-left text-[13px] font-medium text-white/50">{currentUser?.name || 'User'}</span>
                                <MoreVertical className="w-3.5 h-3.5 text-white/15" />
                            </button>
                        </div>
                    </>
                ) : (
                    /* ════════════════════════════════════════════════ */
                    /* COLLAPSED STATE — icon rail                     */
                    /* ════════════════════════════════════════════════ */
                    <>
                        {/* Top: Logo + action icons stacked, centered horizontally */}
                        <div className="flex flex-col items-center pt-3 gap-1 flex-shrink-0 w-full">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="p-2 rounded-xl transition-colors hover:bg-white/5"
                                title="Expand sidebar"
                            >
                                <Logo showText={false} className="w-8 h-8" variant="light" />
                            </button>
                            <button onClick={() => onNewChat()} className="p-2.5 rounded-xl transition-colors hover:bg-white/5" title="New chat">
                                <Edit3 className="w-[18px] h-[18px] text-white/50" />
                            </button>
                            <button onClick={() => { setIsOpen(true); setIsSearching(true); setSearchQuery(''); }} className="p-2.5 rounded-xl transition-colors hover:bg-white/5" title="Search chats">
                                <Search className="w-[18px] h-[18px] text-white/50" />
                            </button>
                            <button onClick={() => onReportsClick()} className="p-2.5 rounded-xl transition-colors hover:bg-white/5" title="Reports">
                                <FileBarChart2 className="w-[18px] h-[18px] text-white/50" />
                            </button>
                            <button onClick={() => onVoiceNotesClick?.()} className="p-2.5 rounded-xl transition-colors hover:bg-white/5" title="Voice Notes">
                                <Mic className="w-[18px] h-[18px] text-white/50" />
                            </button>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Bottom: User avatar, centered */}
                        <div className="flex flex-col items-center pb-3 flex-shrink-0 w-full">
                            <button onClick={() => setShowProfileMenu(true)} className="p-1.5 rounded-xl transition-colors hover:bg-white/5" title={currentUser?.name || 'Profile'}>
                                <UserAvatar size={26} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Profile Menu Modal */}
            <ProfileMenuModal
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                onSettingsClick={() => { setShowProfileMenu(false); onSettingsClick?.(); }}
                onHelpClick={() => { setShowProfileMenu(false); onHelpClick?.(); }}
                onUpgradeClick={() => { setShowProfileMenu(false); onUpgradeClick?.(); }}
                onAboutClick={() => { setShowProfileMenu(false); onAboutClick?.(); }}
                onVisionClick={() => { setShowProfileMenu(false); onVisionClick?.(); }}
            />
        </>
    );
};
