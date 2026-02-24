import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trash2, Pin, Edit3, MoreVertical, Archive, Search, X, Ellipsis } from 'lucide-react';
import { SidebarMarketplaceIcon, SidebarReportsIcon } from '../ui/PremiumIcons';
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

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 260;

interface SimpleSidebarProps {
    onNewChat: () => void;
    onChatClick: () => void;
    onAnalyticsClick: () => void;
    onReportsClick: () => void;
    onSettingsClick?: () => void;
    onHelpClick?: () => void;
    onUpgradeClick?: () => void;
    onAboutClick?: () => void;
    onMarketplaceClick?: () => void;
    onSearchClick?: () => void;
    onFilesClick?: () => void;
    activeTab?: string;
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
    onAnalyticsClick: _onAnalyticsClick,
    onReportsClick,
    onMarketplaceClick,
    onSettingsClick,
    onHelpClick,
    onUpgradeClick,
    onAboutClick,
    activeTab = 'chat',
    chatHistory,
    activeChatId,
    onLoadChat,
    onDeleteChat,
    onPinChat,
    onArchiveChat,
    hideHamburger: _hideHamburger = false,
    isCurrentChatTemporary: _isCurrentChatTemporary = false,
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

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

    const UserAvatar = ({ size = 28 }: { size?: number }) => (
        <div
            className="rounded-full flex-shrink-0 overflow-hidden"
            style={{
                width: size, height: size,
                background: !(currentUser?.avatar && currentUser.avatar.length > 200)
                    ? 'linear-gradient(135deg, #555, #333)' : undefined
            }}
        >
            {currentUser?.avatar && currentUser.avatar.length > 200 ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-medium" style={{ fontSize: size * 0.4 }}>
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
            )}
        </div>
    );

    const renderChatItem = (chat: ChatSession) => {
        const isActive = chat.id === activeChatId;
        return (
            <div
                key={chat.id}
                onClick={() => { onLoadChat(chat.id); }}
                className="group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150"
                style={{ backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                {chat.isPinned && <Pin className="w-3 h-3 flex-shrink-0 text-white/25" />}
                <span
                    className="flex-1 truncate"
                    style={{ color: isActive ? '#ECECF1' : '#8e8ea0', fontSize: '14px', fontWeight: isActive ? 500 : 400 }}
                >
                    {chat.title || 'New conversation'}
                </span>
                <div className="hidden group-hover:flex items-center gap-0.5 relative flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === chat.id ? null : chat.id); }}
                        className="p-1 rounded-md transition-colors hover:bg-white/10 text-white/25"
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
                                style={{ backgroundColor: '#2a2a30', border: '1px solid rgba(255, 255, 255, 0.10)' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={(e) => { onPinChat(chat.id, e); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] text-white/70 hover:bg-white/5 transition-colors">
                                    <Pin size={14} />
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
            <div
                ref={sidebarRef}
                className={`fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden ${!isOpen ? 'items-center' : ''}`}
                style={{
                    width: isOpen ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
                    backgroundColor: '#222228',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'width 200ms ease-out',
                }}
            >
                {isOpen ? (
                    <>
                        {/* Header: Logo + New Chat pencil */}
                        <div className="flex items-center justify-between px-3 pt-3 pb-2 flex-shrink-0">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
                                title="Collapse sidebar"
                            >
                                <Logo showText={false} className="w-7 h-7" variant="light" />
                            </button>
                            <button
                                onClick={() => onNewChat()}
                                className="p-2 rounded-lg transition-colors hover:bg-white/[0.06] text-white/50 hover:text-white/80"
                                title="New chat"
                            >
                                <Edit3 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="px-2 pb-2 flex-shrink-0 space-y-0.5">
                            <button
                                onClick={() => onMarketplaceClick?.()}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[14px] ${
                                    activeTab === 'marketplace'
                                        ? 'bg-white/[0.08] text-white/90 font-medium'
                                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                    activeTab === 'marketplace'
                                        ? 'bg-white/[0.06]'
                                        : 'bg-white/[0.03]'
                                }`}>
                                    <SidebarMarketplaceIcon size={20} className={activeTab === 'marketplace' ? 'text-white/90' : 'text-white/40'} />
                                </div>
                                <span>Marketplace</span>
                            </button>
                            <button
                                onClick={() => onReportsClick()}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[14px] ${
                                    activeTab === 'reports'
                                        ? 'bg-white/[0.08] text-white/90 font-medium'
                                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                    activeTab === 'reports'
                                        ? 'bg-white/[0.06]'
                                        : 'bg-white/[0.03]'
                                }`}>
                                    <SidebarReportsIcon size={20} className={activeTab === 'reports' ? 'text-white/90' : 'text-white/40'} />
                                </div>
                                <span>Reports</span>
                            </button>
                        </div>

                        {/* Search bar */}
                        <AnimatePresence>
                            {isSearching && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="px-3 pb-2 overflow-hidden flex-shrink-0"
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

                        {/* Chat history */}
                        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
                            {/* Search toggle hint */}
                            {!isSearching && (
                                <button
                                    onClick={() => { setIsSearching(true); setSearchQuery(''); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 mb-1 rounded-lg text-white/25 hover:text-white/40 hover:bg-white/[0.03] transition-colors text-[12px]"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    <span>Search</span>
                                    <span className="ml-auto text-[10px] text-white/15">⌘K</span>
                                </button>
                            )}

                            {groupedChats.pinned.length > 0 && (
                                <div className="mb-1">
                                    <div className="px-3 py-1.5">
                                        <span className="text-[11px] font-medium text-white/20">Pinned</span>
                                    </div>
                                    {groupedChats.pinned.map(renderChatItem)}
                                </div>
                            )}

                            {groupedChats.orderedGroupNames.map(groupName => {
                                const chats = groupedChats.groups[groupName];
                                if (!chats || chats.length === 0) return null;
                                return (
                                    <div key={groupName} className="mb-1">
                                        <div className="px-3 py-1.5">
                                            <span className="text-[11px] font-medium text-white/20">{groupName}</span>
                                        </div>
                                        {chats.map(renderChatItem)}
                                    </div>
                                );
                            })}

                            {filteredChats.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="text-white/20 text-[13px]">
                                        {searchQuery ? 'No matching chats' : 'No conversations yet'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User profile */}
                        <div className="border-t px-2 pt-2 pb-2.5 flex-shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                            <button onClick={() => setShowProfileMenu(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors hover:bg-white/[0.04]">
                                <UserAvatar size={28} />
                                <span className="flex-1 truncate text-left text-[14px] font-medium text-white/60">{currentUser?.name || 'User'}</span>
                                <MoreVertical className="w-4 h-4 text-white/20" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Collapsed: Logo + Pencil + Nav */}
                        <div className="flex flex-col items-center pt-3 gap-2 flex-shrink-0 w-full">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
                                title="Expand sidebar"
                            >
                                <Logo showText={false} className="w-7 h-7" variant="light" />
                            </button>

                            {/* New chat */}
                            <button
                                onClick={() => onNewChat()}
                                className="p-2.5 rounded-lg transition-colors hover:bg-white/[0.06] text-white/50 hover:text-white/80"
                                title="New chat"
                            >
                                <Edit3 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                            </button>

                            {/* Divider */}
                            <div className="w-6 h-px bg-white/[0.06] my-0.5" />

                            {/* Nav icons */}
                            <button
                                onClick={() => onMarketplaceClick?.()}
                                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/[0.06]"
                                title="Marketplace"
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                    activeTab === 'marketplace'
                                        ? 'bg-white/[0.06]'
                                        : 'bg-white/[0.03]'
                                }`}>
                                    <SidebarMarketplaceIcon size={22} className={activeTab === 'marketplace' ? 'text-white/90' : 'text-white/40'} />
                                </div>
                            </button>
                            <button
                                onClick={() => onReportsClick()}
                                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/[0.06]"
                                title="Reports"
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                    activeTab === 'reports'
                                        ? 'bg-white/[0.06]'
                                        : 'bg-white/[0.03]'
                                }`}>
                                    <SidebarReportsIcon size={22} className={activeTab === 'reports' ? 'text-white/90' : 'text-white/40'} />
                                </div>
                            </button>
                        </div>

                        <div className="flex-1" />

                        {/* User avatar */}
                        <div className="flex flex-col items-center pb-3.5 flex-shrink-0 w-full">
                            <button onClick={() => setShowProfileMenu(true)} className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]" title={currentUser?.name || 'Profile'}>
                                <UserAvatar size={28} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <ProfileMenuModal
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                onSettingsClick={() => { setShowProfileMenu(false); onSettingsClick?.(); }}
                onHelpClick={() => { setShowProfileMenu(false); onHelpClick?.(); }}
                onUpgradeClick={() => { setShowProfileMenu(false); onUpgradeClick?.(); }}
                onAboutClick={() => { setShowProfileMenu(false); onAboutClick?.(); }}
            />
        </>
    );
};
