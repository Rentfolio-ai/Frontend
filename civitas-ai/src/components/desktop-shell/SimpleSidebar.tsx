import React, { useState } from 'react';
import { Sparkles, BarChart3, FileText, Clock, Trash2, Pin, Search, Folder, Plus, MessageSquarePlus, History } from 'lucide-react';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { formatChatDateCompact } from '../../utils/dateFormatters';
import { PricingModal } from '../PricingModal';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileMenuModal } from '../modals/ProfileMenuModal';
import { AboutModal } from '../modals/AboutModal';
import { FAQModal } from '../FAQModal';
import { PreferencesModalSimplified } from '../PreferencesModalSimplified';

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
            className={`fixed left-0 top-0 h-full bg-[#0F0F0F] border-r border-white/[0.06] z-40 flex flex-col transition-all duration-200 ease-out ${isExpanded ? 'w-64' : 'w-14'
                }`}
        >
            {/* Logo - Clickable to toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-12 flex items-center px-3 flex-shrink-0 hover:bg-white/[0.03] transition-colors"
            >
                {isExpanded ? (
                    <div className="flex items-center gap-2.5 w-full">
                        <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
                            {/* Simplified minimal icon */}
                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                                <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" stroke="#A0A0A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-white/90">Vasthu</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded flex items-center justify-center">
                        {/* Simplified minimal icon */}
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                            <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" stroke="#A0A0A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                    </div>
                )}
            </button>

            {/* Nav Icons - Notion-style minimal */}
            <nav className="flex flex-col gap-0.5 p-1.5 mt-1 flex-shrink-0">
                <button
                    onClick={onNewChat}
                    className="group flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/[0.06] transition-colors"
                >
                    <div className="flex-shrink-0">
                        <MessageSquarePlus className="w-[18px] h-[18px] text-white/70 group-hover:text-white/90 transition-colors" />
                    </div>
                    {isExpanded && (
                        <span className="text-[13px] font-normal text-white/80 group-hover:text-white/95 transition-colors">
                            VasthuAI
                        </span>
                    )}
                </button>

                <button
                    onClick={() => {
                        if (activeChats.length > 0) {
                            onLoadChat(activeChats[0].id);
                        } else {
                            onChatClick();
                        }
                    }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                >
                    <History className="w-[18px] h-[18px] flex-shrink-0" />
                    {isExpanded && <span className="text-[13px] font-normal">Recent</span>}
                </button>

                <button
                    onClick={onAnalyticsClick}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                >
                    <BarChart3 className="w-[18px] h-[18px] flex-shrink-0" />
                    {isExpanded && <span className="text-[13px] font-normal">Portfolio</span>}
                </button>

                <button
                    onClick={onReportsClick}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                >
                    <FileText className="w-[18px] h-[18px] flex-shrink-0" />
                    {isExpanded && <span className="text-[13px] font-normal">Reports</span>}
                </button>

                <div className="h-px bg-white/[0.06] my-1" />

                <button
                    onClick={onSearchClick}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                >
                    <Search className="w-[18px] h-[18px] flex-shrink-0" />
                    {isExpanded && <span className="text-[13px] font-normal">Search</span>}
                </button>

                <button
                    onClick={onFilesClick}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                >
                    <Folder className="w-[18px] h-[18px] flex-shrink-0" />
                    {isExpanded && <span className="text-[13px] font-normal">Files</span>}
                </button>
            </nav>

            {/* Chat History Section - Minimal Notion-style */}
            <div className="flex-1 flex flex-col min-h-0 mt-2">
                {isExpanded && (
                    <>
                        <div className="px-3 py-1.5 flex-shrink-0">
                            <div className="text-[11px] text-white/40 font-medium">
                                Recent
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-1.5 pb-2">
                            {activeChats.length === 0 ? (
                                <div className="px-2 py-6 text-center text-[12px] text-white/30">
                                    No chats yet
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    {activeChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className={`group relative rounded-md px-2 py-1.5 cursor-pointer transition-colors ${chat.id === activeChatId
                                                ? 'bg-white/[0.08]'
                                                : 'hover:bg-white/[0.04]'
                                                }`}
                                            onClick={() => onLoadChat(chat.id)}
                                        >
                                            <div className="flex items-start gap-1.5">
                                                {chat.isPinned && (
                                                    <Pin className="w-3 h-3 text-white/50 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[12.5px] text-white/75 line-clamp-1 leading-tight">
                                                        {chat.title || 'Untitled Chat'}
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => onPinChat(chat.id, e)}
                                                        className="p-0.5 hover:bg-white/10 rounded"
                                                        title="Pin"
                                                    >
                                                        <Pin className="w-3 h-3 text-white/40" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => onDeleteChat(chat.id, e)}
                                                        className="p-0.5 hover:bg-white/10 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-white/40" />
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
            {/* User Profile Section - Minimal bottom */}
            <div className="border-t border-white/[0.06] flex-shrink-0">
                {isExpanded ? (
                    <div className="p-1.5">
                        <button
                            onClick={() => setShowProfileMenu(true)}
                            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md 
                                     text-white/70 hover:bg-white/[0.06] hover:text-white transition-all"
                        >
                            <div className="w-6 h-6 rounded-full bg-white/10
                                          flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-medium text-[11px]">
                                    {currentUser?.name
                                        ?.split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-[13px] font-normal text-white/80 truncate">
                                    {currentUser?.name || 'User'}
                                </div>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="p-1.5">
                        <button
                            onClick={() => setShowProfileMenu(true)}
                            className="w-6 h-6 rounded-full bg-white/10
                                     flex items-center justify-center hover:bg-white/[0.15] transition-colors"
                        >
                            <span className="text-white font-medium text-[11px]">
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
            <PreferencesModalSimplified isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <FAQModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </div >
    );
};
