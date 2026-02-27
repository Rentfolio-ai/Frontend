import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trash2, Pin, Edit3, Archive, Search, X, Ellipsis, ChevronDown, Home, Briefcase, Store, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileMenuModal } from '../modals/ProfileMenuModal';
import { Logo } from '../ui/Logo';

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

const COLLAPSED_WIDTH = 48;
const EXPANDED_WIDTH = 240;

interface SimpleSidebarProps {
    onNewChat: () => void;
    onChatClick: () => void;
    onHomeClick: () => void;
    onDealsClick: () => void;
    onAnalyticsClick: () => void;
    onReportsClick: () => void;
    onSettingsClick?: () => void;
    onHelpClick?: () => void;
    onUpgradeClick?: () => void;
    onAboutClick?: () => void;
    onTeamsClick?: () => void;
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

interface NavItemProps {
    icon: React.FC<{ size?: number; className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
    iconSize?: number;
}

const PencilNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
    <Edit3 size={size} className={className} strokeWidth={1.8} />
);

const HomeNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
    <Home size={size} className={className} strokeWidth={1.8} />
);

const DealsNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
    <Briefcase size={size} className={className} strokeWidth={1.8} />
);

const MarketplaceNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
    <Store size={size} className={className} strokeWidth={1.8} />
);

const ReportsNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
    <FileText size={size} className={className} strokeWidth={1.8} />
);

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick, iconSize = 16 }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-[13px] ${
            isActive
                ? 'bg-white/[0.06] text-white/90'
                : 'text-white/45 hover:text-white/70 hover:bg-white/[0.04]'
        }`}
    >
        <Icon size={iconSize} className={`flex-shrink-0 ${isActive ? 'text-white/90' : 'text-white/40'}`} />
        <span>{label}</span>
    </button>
);

const CollapsedNavItem: React.FC<{ icon: React.FC<{ size?: number; className?: string }>; isActive: boolean; onClick: () => void; title: string; iconSize?: number }> = ({ icon: Icon, isActive, onClick, title, iconSize = 18 }) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}`}
        title={title}
    >
        <Icon size={iconSize} className={isActive ? 'text-white/90' : 'text-white/40'} />
    </button>
);

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
    onNewChat: _onNewChat,
    onChatClick,
    onHomeClick,
    onDealsClick,
    onAnalyticsClick: _onAnalyticsClick,
    onReportsClick,
    onTeamsClick,
    onMarketplaceClick,
    onSettingsClick,
    onHelpClick,
    onUpgradeClick,
    onAboutClick,
    activeTab = 'home',
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
    const [chatHistoryExpanded, setChatHistoryExpanded] = useState(activeTab === 'chat');
    const { user: currentUser } = useAuth();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeTab === 'chat') setChatHistoryExpanded(true);
    }, [activeTab]);

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
        const isActive = chat.id === activeChatId && activeTab === 'chat';
        return (
            <div
                key={chat.id}
                onClick={() => { onLoadChat(chat.id); }}
                className="group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
                style={{ backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                {chat.isPinned && <Pin className="w-3 h-3 flex-shrink-0 text-white/25" />}
                <span
                    className="flex-1 truncate"
                    style={{ color: isActive ? '#ECECF1' : '#8e8ea0', fontSize: '13px', fontWeight: isActive ? 500 : 400 }}
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
                    backgroundColor: '#1e1e22',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'width 200ms ease-out',
                }}
            >
                {isOpen ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center px-2.5 pt-2.5 pb-1.5 flex-shrink-0">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md transition-colors hover:bg-white/[0.04]"
                                title="Collapse sidebar"
                            >
                                <Logo showText={false} className="w-6 h-6" variant="light" />
                            </button>
                        </div>

                        {/* Primary Navigation */}
                        <div className="px-1.5 pb-0.5 flex-shrink-0 space-y-px">
                            <NavItem icon={HomeNavIcon} label="Home" isActive={activeTab === 'home'} onClick={onHomeClick} />
                            <NavItem icon={DealsNavIcon} label="Deals" isActive={activeTab === 'deals'} onClick={onDealsClick} />
                            <NavItem icon={PencilNavIcon} label="Vasthu AI" isActive={activeTab === 'chat'} onClick={onChatClick} />
                        </div>

                        <div className="mx-3 my-1 h-px bg-white/[0.04]" />

                        {/* Secondary Navigation */}
                        <div className="px-1.5 pb-0.5 flex-shrink-0 space-y-px">
                            <NavItem icon={MarketplaceNavIcon} label="Marketplace" isActive={activeTab === 'marketplace'} onClick={() => onMarketplaceClick?.()} />
                            <NavItem icon={ReportsNavIcon} label="Reports" isActive={activeTab === 'reports'} onClick={onReportsClick} />
                        </div>

                        <div className="mx-3 my-1 h-px bg-white/[0.04]" />

                        {/* Chat History (collapsible) */}
                        <div className="flex-shrink-0 px-1.5">
                            <button
                                onClick={() => setChatHistoryExpanded(!chatHistoryExpanded)}
                                className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-white/25 hover:text-white/40 hover:bg-white/[0.03] transition-colors"
                            >
                                <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${chatHistoryExpanded ? '' : '-rotate-90'}`} />
                                <span className="text-[10px] font-medium uppercase tracking-wider">Chats</span>
                                {activeChats.length > 0 && (
                                    <span className="ml-auto text-[10px] text-white/15">{activeChats.length}</span>
                                )}
                            </button>
                        </div>

                        <AnimatePresence initial={false}>
                            {chatHistoryExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-1 overflow-hidden flex flex-col min-h-0"
                                >
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

                                    <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
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
                                                <div className="px-3 py-1">
                                                    <span className="text-[10px] font-medium text-white/20">Pinned</span>
                                                </div>
                                                {groupedChats.pinned.map(renderChatItem)}
                                            </div>
                                        )}

                                        {groupedChats.orderedGroupNames.map(groupName => {
                                            const chats = groupedChats.groups[groupName];
                                            if (!chats || chats.length === 0) return null;
                                            return (
                                                <div key={groupName} className="mb-1">
                                                    <div className="px-3 py-1">
                                                        <span className="text-[10px] font-medium text-white/20">{groupName}</span>
                                                    </div>
                                                    {chats.map(renderChatItem)}
                                                </div>
                                            );
                                        })}

                                        {filteredChats.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                                <div className="text-white/20 text-[12px]">
                                                    {searchQuery ? 'No matching chats' : 'No conversations yet'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Spacer when chat history is collapsed */}
                        {!chatHistoryExpanded && <div className="flex-1" />}

                        {/* User profile */}
                        <div className="border-t px-1.5 pt-1.5 pb-2 flex-shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
                            <button onClick={() => setShowProfileMenu(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-white/[0.04]">
                                <UserAvatar size={24} />
                                <span className="flex-1 truncate text-left text-[13px] text-white/50">{currentUser?.name || 'User'}</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Collapsed view */}
                        <div className="flex flex-col items-center pt-2.5 gap-1 flex-shrink-0 w-full">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="p-1 rounded-md transition-colors hover:bg-white/[0.04]"
                                title="Expand sidebar"
                            >
                                <Logo showText={false} className="w-6 h-6" variant="light" />
                            </button>

                            <div className="w-5 h-px bg-white/[0.04] my-0.5" />

                            <CollapsedNavItem icon={HomeNavIcon} isActive={activeTab === 'home'} onClick={onHomeClick} title="Home" />
                            <CollapsedNavItem icon={DealsNavIcon} isActive={activeTab === 'deals'} onClick={onDealsClick} title="Deals" />
                            <CollapsedNavItem icon={PencilNavIcon} isActive={activeTab === 'chat'} onClick={onChatClick} title="Vasthu AI" />

                            <div className="w-5 h-px bg-white/[0.04] my-0.5" />

                            <CollapsedNavItem icon={MarketplaceNavIcon} isActive={activeTab === 'marketplace'} onClick={() => onMarketplaceClick?.()} title="Marketplace" />
                            <CollapsedNavItem icon={ReportsNavIcon} isActive={activeTab === 'reports'} onClick={onReportsClick} title="Reports" />
                        </div>

                        <div className="flex-1" />

                        <div className="flex flex-col items-center pb-3 flex-shrink-0 w-full">
                            <button onClick={() => setShowProfileMenu(true)} className="p-1 rounded-md transition-colors hover:bg-white/[0.04]" title={currentUser?.name || 'Profile'}>
                                <UserAvatar size={24} />
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
