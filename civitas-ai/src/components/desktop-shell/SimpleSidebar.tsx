import React, { useState, useEffect, useRef } from 'react';
import { Menu, ChevronUp, Pin, Trash2, Plus } from 'lucide-react';
import { PropertyChatIcon, PropertyStackIcon, AnalyticsChartIcon } from '../icons';
import type { ChatSession } from '../../hooks/useDesktopShell';
import { useAuth } from '../../contexts/AuthContext';
import { designTokens } from '../../styles/design-tokens';
import { ProfileDropdown } from '../sidebar/ProfileDropdown';

interface SimpleSidebarProps {
    activeTab?: 'chat' | 'portfolio' | 'reports' | 'profile' | 'settings' | 'faq' | 'documentation' | 'billing' | 'contact' | 'privacy' | 'terms' | 'about';
    onTabChange?: (tab: 'chat' | 'portfolio' | 'reports' | 'profile' | 'settings' | 'faq' | 'documentation' | 'billing' | 'contact' | 'privacy' | 'terms' | 'about') => void;
    onNewChat: () => void;
    onChatClick: () => void;
    onAnalyticsClick: () => void;
    onReportsClick: () => void;
    onSearchClick?: () => void;
    onFilesClick?: (chatId: string) => void;
    chatHistory: ChatSession[];
    activeChatId: string;
    onLoadChat: (chatId: string) => void;
    onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
    onPinChat: (chatId: string, e: React.MouseEvent) => void;
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
    activeTab = 'chat',
    onTabChange,
    onNewChat,
    onChatClick,
    onAnalyticsClick,
    onReportsClick,
    chatHistory,
    activeChatId,
    onLoadChat,
    onDeleteChat,
    onPinChat,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user: currentUser } = useAuth();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const navItems = [
        { id: 'chat', label: 'Chat', icon: PropertyChatIcon, onClick: () => { onChatClick(); onTabChange?.('chat'); setIsOpen(false); } },
        { id: 'portfolio', label: 'Portfolio', icon: PropertyStackIcon, onClick: () => { onAnalyticsClick(); onTabChange?.('portfolio'); setIsOpen(false); } },
        { id: 'reports', label: 'Reports', icon: AnalyticsChartIcon, onClick: () => { onReportsClick(); onTabChange?.('reports'); setIsOpen(false); } },
    ];

    const handleLogout = () => {
        // Logout logic would be implemented here
        setIsOpen(false);
        setShowProfileMenu(false);
    };

    const handleProfileClick = () => {
        onTabChange?.('profile');
        setIsOpen(false);
    };

    const handleSettingsClick = () => {
        onTabChange?.('settings');
        setIsOpen(false);
    };

    const handleBillingClick = () => {
        onTabChange?.('billing');
        setIsOpen(false);
    };

    const handleFAQClick = () => {
        onTabChange?.('faq');
        setIsOpen(false);
    };

    const handleDocsClick = () => {
        onTabChange?.('documentation');
        setIsOpen(false);
    };

    const handleContactClick = () => {
        onTabChange?.('contact');
        setIsOpen(false);
    };

    const handlePrivacyClick = () => {
        onTabChange?.('privacy');
        setIsOpen(false);
    };

    const handleTermsClick = () => {
        onTabChange?.('terms');
        setIsOpen(false);
    };

    const handleAboutClick = () => {
        onTabChange?.('about');
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger Button - Always Visible */}
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    zIndex: 1000,
                    width: '44px',
                    height: '44px',
                    backgroundColor: designTokens.colors.sidebar.bg,
                    border: `1px solid ${designTokens.colors.sidebar.border}`,
                    borderRadius: designTokens.radius.md,
                    display: isOpen ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: `all ${designTokens.transition.normal}`,
                    boxShadow: designTokens.shadow.md,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.hover;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.bg;
                }}
            >
                <Menu size={20} style={{ color: designTokens.colors.text.primary }} />
            </button>

            {/* Backdrop Overlay */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1100,
                    }}
                />
            )}

            {/* Sidebar Pop-out */}
            <div
                ref={sidebarRef}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '280px',
                    backgroundColor: designTokens.colors.sidebar.bg,
                    zIndex: 1200,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: `transform ${designTokens.transition.normal}`,
                    boxShadow: isOpen ? designTokens.shadow.xl : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header Section - Brand */}
                <div style={{
                    padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
                    borderBottom: `1px solid ${designTokens.colors.sidebar.border}`,
                }}>
                    <h1 style={{
                        fontSize: '22px',
                        fontWeight: designTokens.typography.fontWeight.semibold,
                        color: designTokens.colors.text.primary,
                        letterSpacing: '-0.02em',
                        margin: 0,
                    }}>
                        Vasthu
                    </h1>
                </div>

                {/* Main Content Section - Scrollable */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                }}>
                    {/* Main Navigation Section */}
                    <nav style={{
                        padding: `${designTokens.spacing.lg} ${designTokens.spacing.md}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                    }}>
                        {/* New Chat Button */}
                        <button
                            onClick={() => {
                                onNewChat();
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: designTokens.spacing.sm,
                                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                                backgroundColor: 'transparent',
                                border: `1px solid ${designTokens.colors.sidebar.border}`,
                                borderRadius: designTokens.radius.md,
                                color: designTokens.colors.text.primary,
                                fontSize: '15px',
                                fontWeight: designTokens.typography.fontWeight.medium,
                                cursor: 'pointer',
                                transition: `all ${designTokens.transition.fast}`,
                                textAlign: 'left',
                                marginBottom: designTokens.spacing.md,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.surface;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <Plus size={20} style={{ flexShrink: 0 }} />
                            <span>New Chat</span>
                        </button>

                        {/* Main Menu Label */}
                        <div style={{
                            fontSize: designTokens.typography.fontSize.xs,
                            fontWeight: designTokens.typography.fontWeight.medium,
                            color: designTokens.colors.text.tertiary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                            marginBottom: designTokens.spacing.xs,
                        }}>
                            Menu
                        </div>

                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={item.onClick}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: designTokens.spacing.sm,
                                        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                                        backgroundColor: isActive ? designTokens.colors.sidebar.hover : 'transparent',
                                        border: 'none',
                                        borderRadius: designTokens.radius.md,
                                        color: isActive ? designTokens.colors.text.primary : designTokens.colors.text.secondary,
                                        fontSize: '15px',
                                        fontWeight: isActive ? designTokens.typography.fontWeight.semibold : designTokens.typography.fontWeight.medium,
                                        cursor: 'pointer',
                                        transition: `all ${designTokens.transition.fast}`,
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.surface;
                                            e.currentTarget.style.color = designTokens.colors.text.primary;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = designTokens.colors.text.secondary;
                                        }
                                    }}
                                >
                                    <Icon size={20} style={{ flexShrink: 0 }} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Recent Chats Section */}
                    {chatHistory.length > 0 && (
                        <div style={{
                            padding: `0 ${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                        }}>
                            <div style={{
                                fontSize: designTokens.typography.fontSize.xs,
                                fontWeight: designTokens.typography.fontWeight.medium,
                                color: designTokens.colors.text.tertiary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                                marginBottom: designTokens.spacing.xs,
                            }}>
                                Recent Chats
                            </div>

                            {chatHistory
                                .filter(chat => !chat.isArchived)
                                .sort((a, b) => {
                                    if (a.isPinned && !b.isPinned) return -1;
                                    if (!a.isPinned && b.isPinned) return 1;
                                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                                })
                                .slice(0, 10)
                                .map((chat) => {
                                    const isActive = activeChatId === chat.id;
                                    const [isHovered, setIsHovered] = useState(false);

                                    return (
                                        <div
                                            key={chat.id}
                                            style={{
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: designTokens.spacing.sm,
                                            }}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                        >
                                            <button
                                                onClick={() => {
                                                    onLoadChat(chat.id);
                                                    setIsOpen(false);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: designTokens.spacing.sm,
                                                    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                                                    backgroundColor: isActive ? designTokens.colors.sidebar.hover : 'transparent',
                                                    border: 'none',
                                                    borderRadius: designTokens.radius.md,
                                                    color: isActive ? designTokens.colors.text.primary : designTokens.colors.text.secondary,
                                                    fontSize: '14px',
                                                    fontWeight: designTokens.typography.fontWeight.regular,
                                                    cursor: 'pointer',
                                                    transition: `all ${designTokens.transition.fast}`,
                                                    textAlign: 'left',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {chat.isPinned && (
                                                    <Pin size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                                                )}
                                                <span style={{
                                                    flex: 1,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {chat.title || 'New Chat'}
                                                </span>
                                            </button>

                                            {/* Hover Actions */}
                                            {isHovered && (
                                                <div style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    display: 'flex',
                                                    gap: '4px',
                                                    backgroundColor: designTokens.colors.sidebar.bg,
                                                    padding: '2px',
                                                    borderRadius: '4px',
                                                }}>
                                                    <button
                                                        onClick={(e) => onPinChat(chat.id, e)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '24px',
                                                            height: '24px',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            transition: `all ${designTokens.transition.fast}`,
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.hover;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }}
                                                        title={chat.isPinned ? 'Unpin' : 'Pin'}
                                                    >
                                                        <Pin size={14} style={{ 
                                                            color: chat.isPinned ? designTokens.colors.semantic.success : designTokens.colors.text.tertiary 
                                                        }} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => onDeleteChat(chat.id, e)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '24px',
                                                            height: '24px',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            transition: `all ${designTokens.transition.fast}`,
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.hover;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} style={{ color: designTokens.colors.semantic.error }} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Footer Section - User Profile */}
                <div style={{
                    padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                    borderTop: `1px solid ${designTokens.colors.sidebar.border}`,
                }}>
                    {/* User Info Card - Clickable for Profile Menu */}
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: designTokens.spacing.sm,
                            padding: designTokens.spacing.sm,
                            marginBottom: designTokens.spacing.sm,
                            backgroundColor: showProfileMenu ? designTokens.colors.sidebar.hover : designTokens.colors.sidebar.surface,
                            borderRadius: designTokens.radius.md,
                            border: 'none',
                            cursor: 'pointer',
                            transition: `all ${designTokens.transition.fast}`,
                            textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                            if (!showProfileMenu) {
                                e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.hover;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showProfileMenu) {
                                e.currentTarget.style.backgroundColor = designTokens.colors.sidebar.surface;
                            }
                        }}
                    >
                        {/* Avatar with Online Indicator */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                backgroundColor: designTokens.colors.brand.subtle,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <span style={{
                                    fontSize: '15px',
                                    fontWeight: designTokens.typography.fontWeight.semibold,
                                    color: designTokens.colors.brand.light,
                                }}>
                                    {currentUser?.name
                                        ?.split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            {/* Online Status Dot */}
                            <div style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: designTokens.colors.semantic.success,
                                border: `2px solid ${designTokens.colors.sidebar.surface}`,
                            }} />
                        </div>

                        {/* User Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '15px',
                                fontWeight: designTokens.typography.fontWeight.semibold,
                                color: designTokens.colors.text.primary,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: '2px',
                            }}>
                                {currentUser?.name || 'User'}
                            </div>
                            <div style={{
                                fontSize: designTokens.typography.fontSize.xs,
                                color: designTokens.colors.text.tertiary,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {currentUser?.email || 'user@example.com'}
                            </div>
                        </div>

                        {/* Expand indicator */}
                        <ChevronUp 
                            size={18} 
                            style={{ 
                                color: designTokens.colors.text.tertiary,
                                flexShrink: 0,
                                transform: showProfileMenu ? 'rotate(0deg)' : 'rotate(180deg)',
                                transition: `transform ${designTokens.transition.fast}`,
                            }} 
                        />
                    </button>

                    {/* Profile Dropdown Menu */}
                    <ProfileDropdown
                        isOpen={showProfileMenu}
                        onClose={() => setShowProfileMenu(false)}
                        userName={currentUser?.name || 'User'}
                        userEmail={currentUser?.email || 'user@example.com'}
                        portfolioValue="$2.1M"
                        onProfileClick={handleProfileClick}
                        onSettingsClick={handleSettingsClick}
                        onBillingClick={handleBillingClick}
                        onFAQClick={handleFAQClick}
                        onDocsClick={handleDocsClick}
                        onContactClick={handleContactClick}
                        onPrivacyClick={handlePrivacyClick}
                        onTermsClick={handleTermsClick}
                        onAboutClick={handleAboutClick}
                        onLogout={handleLogout}
                    />

                    {/* Portfolio Value Badge */}
                    <div style={{
                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                        backgroundColor: `${designTokens.colors.brand.subtle}50`,
                        borderRadius: designTokens.radius.sm,
                        marginBottom: designTokens.spacing.sm,
                    }}>
                        <div style={{
                            fontSize: designTokens.typography.fontSize.xs,
                            color: designTokens.colors.text.tertiary,
                            marginBottom: '2px',
                        }}>
                            Portfolio Value
                        </div>
                        <div style={{
                            fontSize: '17px',
                            fontWeight: designTokens.typography.fontWeight.semibold,
                            color: designTokens.colors.brand.light,
                        }}>
                            $2.1M
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};
