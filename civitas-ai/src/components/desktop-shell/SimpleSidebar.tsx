import React, { useState } from 'react';
import { Sparkles, FileText, Clock, Trash2, Pin, Search, Folder, Brain } from 'lucide-react';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { formatChatDateCompact } from '../../utils/dateFormatters';
import { PricingModal } from '../PricingModal';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileMenuModal } from '../modals/ProfileMenuModal';
import { AboutModal } from '../modals/AboutModal';
import { FAQModal } from '../FAQModal';
import { PreferencesModal } from '../PreferencesModal';

interface SimpleSidebarProps {
    onNewChat: () => void;
    onChatClick: () => void;
    onAnalyticsClick: () => void;
    onReportsClick: () => void;
    onSearchClick: () => void;
    onFilesClick: () => void;
    chatHistory: ChatSession[];
    activeChatId: string;
    onLoadChat: (chatId: string) => void;
    onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
    onPinChat: (chatId: string, e: React.MouseEvent) => void;
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
    onNewChat,
    onChatClick,
    onAnalyticsClick,
    onReportsClick,
    onSearchClick,
    onFilesClick,
    chatHistory,
    activeChatId,
    onLoadChat,
    onDeleteChat,
    onPinChat
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const { subscription, loading } = useSubscription();
    const { user: currentUser } = useAuth();

    // Filter and sort chats
    const activeChats = chatHistory
        .filter(c => !c.isArchived)
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

    return (
        <div
            className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'
                }`}
            style={{
                background: 'var(--color-bg-secondary)',
                borderRight: '1px solid var(--color-border-default)'
            }}
            data-simple-sidebar
        >
            {/* Header with Logo and Alerts */}
            <div className="h-14 flex items-center justify-between px-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                {/* Logo - Clickable to toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center hover:opacity-80 transition-opacity flex-1"
                >
                    {isExpanded ? (
                        <div className="flex items-center gap-2 w-full">
                            <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0">
                                {/* Custom Vasthu geometric icon */}
                                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                                    {/* Outer circle - sacred geometry */}
                                    <circle cx="16" cy="16" r="14" stroke="url(#vasthuGradient)" strokeWidth="1.5" opacity="0.8" />

                                    {/* Inner geometric pattern - represents building/structure */}
                                    <path d="M16 6L24 12V20L16 26L8 20V12L16 6Z" stroke="url(#vasthuGradient)" strokeWidth="2" fill="none" strokeLinejoin="round" />

                                    {/* Center V for Vasthu */}
                                    <path d="M13 13L16 19L19 13" stroke="url(#vasthuGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Gradient definition */}
                                    <defs>
                                        <linearGradient id="vasthuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#14B8A6" />
                                            <stop offset="100%" stopColor="#10B981" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold text-white">Vasthu</span>
                                    <span className="text-xs text-white/40">1.0</span>
                                </div>
                                {!loading && subscription && (
                                    <div className="mt-0.5">
                                        {subscription.tier === 'pro' ? (
                                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded text-white" style={{ background: 'var(--gradient-brand)' }}>
                                                PRO
                                            </span>
                                        ) : (
                                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-medium rounded" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-tertiary)' }}>
                                                FREE
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded flex items-center justify-center">
                            {/* Custom Vasthu geometric icon */}
                            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                                <circle cx="16" cy="16" r="14" stroke="url(#vasthuGradientCollapsed)" strokeWidth="1.5" opacity="0.8" />
                                <path d="M16 6L24 12V20L16 26L8 20V12L16 6Z" stroke="url(#vasthuGradientCollapsed)" strokeWidth="2" fill="none" strokeLinejoin="round" />
                                <path d="M13 13L16 19L19 13" stroke="url(#vasthuGradientCollapsed)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="vasthuGradientCollapsed" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#14B8A6" />
                                        <stop offset="100%" stopColor="#10B981" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    )}
                </button>
            </div>

            {/* Nav Icons */}
            <nav className="flex flex-col gap-2 p-2 mt-4 flex-shrink-0">
                <button
                    onClick={onNewChat}
                    className={`group flex items-center gap-3 py-2.5 transition-colors relative ${isExpanded ? 'px-3' : 'justify-center px-0'}`}
                    style={{
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--gradient-card-hover)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gradient-card-hover)'}
                >
                    {/* Icon container */}
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)' }}>
                        <Brain className="w-5 h-5 text-white" />
                    </div>

                    {isExpanded && (
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            New chat
                        </span>
                    )}
                </button>

                <button
                    onClick={() => {
                        // Load most recent chat if available, otherwise just navigate
                        if (activeChats.length > 0) {
                            onLoadChat(activeChats[0].id);
                        } else {
                            onChatClick();
                        }
                    }}
                    className={`flex items-center gap-3 py-2.5 transition-colors ${isExpanded ? 'px-3' : 'justify-center px-0'}`}
                    style={{ borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-elevated)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
                        <Sparkles className="w-4 h-4" />
                    </div>
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">AI Assistant</span>}
                </button>

                <button
                    onClick={onAnalyticsClick}
                    className={`flex items-center gap-3 py-2.5 transition-colors ${isExpanded ? 'px-3' : 'justify-center px-0'}`}
                    style={{ borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-elevated)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                >
                    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
                        <svg viewBox="0 0 32 32" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4.5" y="8" width="19" height="13" rx="3" />
                            <rect x="10" y="6" width="8" height="3" rx="1.2" />
                            <path d="M4.5 13c3.5 2 7.5 3 12 3" />
                            <circle cx="24" cy="22" r="5" strokeWidth="2" />
                            <path d="M24 19v3l2 1" strokeWidth="2" />
                        </svg>
                    </div>
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Portfolio</span>}
                </button>

                <button
                    onClick={onReportsClick}
                    className={`flex items-center gap-3 py-2.5 transition-colors ${isExpanded ? 'px-3' : 'justify-center px-0'}`}
                    style={{ borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-elevated)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
                        <FileText className="w-4 h-4" />
                    </div>
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Reports</span>}
                </button>

                <button
                    onClick={onSearchClick}
                    className={`flex items-center gap-3 py-2.5 transition-colors ${isExpanded ? 'px-3' : 'justify-center px-0'}`}
                    style={{ borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-elevated)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
                        <Search className="w-4 h-4" />
                    </div>
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Search Chats</span>}
                </button>

                <button
                    onClick={onFilesClick}
                    className={`flex items-center gap-3 py-2.5 transition-colors ${isExpanded ? 'px-3' : 'justify-center px-0'}`}
                    style={{ borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-elevated)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
                        <Folder className="w-4 h-4" />
                    </div>
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Files</span>}
                </button>

            </nav>

            {/* Chat History Section - Spacer to push profile to bottom */}
            <div className="flex-1 flex flex-col min-h-0">
                {isExpanded && (
                    <>
                        <div className="px-4 py-2 border-t border-white/5 flex-shrink-0">
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="uppercase tracking-wider">Recent Chats</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 pb-4">
                            {activeChats.length === 0 ? (
                                <div className="px-3 py-8 text-center text-xs text-white/30">
                                    No chat history yet
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {activeChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className={`group relative rounded-lg px-3 py-2 cursor-pointer transition-colors ${chat.id === activeChatId
                                                ? 'bg-white/10'
                                                : 'hover:bg-white/5'
                                                }`}
                                            onClick={() => onLoadChat(chat.id)}
                                        >
                                            <div className="flex items-start gap-2">
                                                {chat.isPinned && (
                                                    <Pin className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                                                        {chat.title || 'Untitled Chat'}
                                                    </div>
                                                    <div className="text-[10px] text-white/30 mt-1">
                                                        {formatChatDateCompact(chat.createdAt || new Date().toISOString())}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5">
                                                    <button
                                                        onClick={(e) => onPinChat(chat.id, e)}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                        title="Pin"
                                                    >
                                                        <Pin className="w-3 h-3 text-white/50" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => onDeleteChat(chat.id, e)}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-white/50" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {/* User Profile Section - Bottom of sidebar */}
            <div className="border-t border-white/5 flex-shrink-0">
                {isExpanded ? (
                    <div className="p-2">
                        {/* Profile Button - Click to open modal */}
                        <button
                            onClick={() => setShowProfileMenu(true)}
                            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg 
                                     text-white/70 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 
                                          flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/40">
                                <span className="text-white font-semibold text-sm">
                                    {currentUser?.name
                                        ?.split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-sm font-semibold text-white truncate">
                                    {currentUser?.name || 'User'}
                                </div>
                                <div className="text-xs text-white/50 truncate">
                                    {currentUser?.email || 'user@example.com'}
                                </div>
                            </div>
                        </button>
                    </div>
                ) : (
                    /* Collapsed state - just show avatar */
                    <div className="p-2">
                        <button
                            onClick={() => setShowProfileMenu(true)}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 
                                     flex items-center justify-center hover:scale-110 transition-transform
                                     shadow-lg shadow-black/40"
                        >
                            <span className="text-white font-semibold text-xs">
                                {currentUser?.name
                                    ?.split(' ')
                                    .map((n: string) => n[0])
                                    .join('')
                                    .toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ProfileMenuModal
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                onSettingsClick={() => setShowSettings(true)}
                onHelpClick={() => setShowHelp(true)}
                onUpgradeClick={() => setShowPricing(true)}
                onAboutClick={() => setShowAbout(true)}
            />
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
            <PreferencesModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <FAQModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </div >
    );
};
