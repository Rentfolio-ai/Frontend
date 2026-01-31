import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Pin, Menu, Home, TrendingUp, FileBarChart2, Plus, Edit3, MoreVertical, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileMenuModal } from '../modals/ProfileMenuModal';

// Custom Sidebar Toggle Icon
const SidebarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
);

interface SimpleSidebarProps {
    onNewChat: () => void;
    onChatClick: () => void;
    onAnalyticsClick: () => void;
    onReportsClick: () => void;
    onSettingsClick?: () => void;
    onHelpClick?: () => void;
    onUpgradeClick?: () => void;
    onAboutClick?: () => void;
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
    onSettingsClick,
    onHelpClick,
    onUpgradeClick,
    onAboutClick,
    chatHistory,
    activeChatId,
    onLoadChat,
    onDeleteChat,
    onPinChat,
    onArchiveChat,
    hideHamburger = false,
    isCurrentChatTemporary = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const { user: currentUser } = useAuth();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const activeChats = chatHistory.filter(c => !c.isArchived);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                const target = event.target as HTMLElement;
                if (!target.closest('[data-hamburger-button]')) {
                    setIsOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

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

    return (
        <>
            {/* Hamburger Button - ChatGPT Style */}
            {!isOpen && (
                <button
                    data-hamburger-button
                    onClick={() => setIsOpen(true)}
                    className="fixed left-4 top-4 z-50 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ECECF1',
                        opacity: hideHamburger ? 0 : 1,
                        transform: hideHamburger ? 'translateY(-10px)' : 'translateY(0)',
                        pointerEvents: hideHamburger ? 'none' : 'auto',
                    }}
                    onMouseEnter={(e) => {
                        if (!hideHamburger) {
                            e.currentTarget.style.backgroundColor = '#0F172A';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1E293B';
                    }}
                    aria-label="Open sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Panel - Compact ChatGPT/Claude Style */}
            <div
                ref={sidebarRef}
                className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    backgroundColor: '#334155',
                    width: '260px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}
                        >
                            <Home className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        </div>
                        <span style={{ color: '#ECECF1', fontSize: '14px', fontWeight: 600 }}>
                            Vasthu
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                        style={{ color: '#8E8EA0' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ECECF1'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#8E8EA0'}
                    >
                        <SidebarIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-2 pt-2 pb-2">
                    <button
                        onClick={() => {
                            onNewChat();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: '#ECECF1',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                    >
                        <Edit3 className="w-4 h-4" strokeWidth={2} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>New chat</span>
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="px-2 pb-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <button
                        onClick={() => {
                            onAnalyticsClick();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-sm"
                        style={{ color: '#8E8EA0' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ECECF1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#8E8EA0';
                        }}
                    >
                        <TrendingUp className="w-4 h-4" strokeWidth={2} />
                        <span>Portfolio</span>
                    </button>

                    <button
                        onClick={() => {
                            onReportsClick();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-sm"
                        style={{ color: '#8E8EA0' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ECECF1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#8E8EA0';
                        }}
                    >
                        <FileBarChart2 className="w-4 h-4" strokeWidth={2} />
                        <span>Reports</span>
                    </button>
                </div>

                {/* Chat History - Compact List */}
                <div className="flex-1 overflow-y-auto px-2 py-2">
                    {activeChats
                        .sort((a, b) => {
                            if (a.isPinned && !b.isPinned) return -1;
                            if (!a.isPinned && b.isPinned) return 1;
                            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                        })
                        .slice(0, 20)
                        .map((chat) => {
                            const isActive = chat.id === activeChatId;
                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => {
                                        onLoadChat(chat.id);
                                        setIsOpen(false);
                                    }}
                                    className="group relative flex items-center gap-2 px-2 py-2 mb-1 rounded-md cursor-pointer transition-colors"
                                    style={{
                                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {chat.isPinned && (
                                        <Pin className="w-3 h-3 flex-shrink-0" style={{ color: '#14B8A6' }} />
                                    )}
                                    <span
                                        style={{
                                            color: isActive ? '#ECECF1' : '#8E8EA0',
                                            fontSize: '13px',
                                            fontWeight: isActive ? 500 : 400,
                                        }}
                                        className="flex-1 truncate"
                                    >
                                        {chat.title || 'New conversation'}
                                    </span>
                                    
                                    {/* Ellipsis Menu */}
                                    <div className="hidden group-hover:flex items-center relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                                            }}
                                            className="p-1 rounded transition-colors"
                                            style={{ color: '#565869' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            title="More options"
                                        >
                                            <MoreVertical className="w-3.5 h-3.5" />
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
                                                    {onArchiveChat && (
                                                        <button
                                                            onClick={(e) => {
                                                                onArchiveChat(chat.id, e);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
                                                        >
                                                            <Archive size={14} />
                                                            <span>Archive</span>
                                                        </button>
                                                    )}
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
                            );
                        })}
                </div>

                {/* User Profile - Bottom */}
                <div className="border-t px-2 py-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <button
                        onClick={() => setShowProfileMenu(true)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors"
                        style={{ color: '#ECECF1' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #0D9488, #115E59)',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span
                            className="flex-1 truncate text-left"
                            style={{
                                color: '#ECECF1',
                                fontSize: '13px',
                                fontWeight: 500,
                            }}
                        >
                            {currentUser?.name || 'User'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Profile Menu Modal */}
            <ProfileMenuModal
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                onSettingsClick={() => {
                    setShowProfileMenu(false);
                    onSettingsClick?.();
                }}
                onHelpClick={() => {
                    setShowProfileMenu(false);
                    onHelpClick?.();
                }}
                onUpgradeClick={() => {
                    setShowProfileMenu(false);
                    onUpgradeClick?.();
                }}
                onAboutClick={() => {
                    setShowProfileMenu(false);
                    onAboutClick?.();
                }}
            />
        </>
    );
};
