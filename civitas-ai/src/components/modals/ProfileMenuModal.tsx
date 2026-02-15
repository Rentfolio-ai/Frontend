/**
 * Profile Menu Popover Component
 * 
 * Compact popover menu that appears next to the sidebar.
 * Includes inline language selector (like Claude's profile menu).
 */

import React, { useState } from 'react';
import { Settings, HelpCircle, Info, LogOut, ChevronRight, ChevronLeft, Globe, Check, ScanEye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { usePreferencesStore } from '../../stores/preferencesStore';

// ─── Language data ───────────────────────────────────────────────────────────

const LANGUAGES = [
    { value: 'en-US', label: 'English', flag: '🇺🇸' },
    { value: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { value: 'es-MX', label: 'Español (MX)', flag: '🇲🇽' },
    { value: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { value: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { value: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
    { value: 'nl-NL', label: 'Nederlands', flag: '🇳🇱' },
    { value: 'sv-SE', label: 'Svenska', flag: '🇸🇪' },
    { value: 'pl-PL', label: 'Polski', flag: '🇵🇱' },
    { value: 'uk-UA', label: 'Українська', flag: '🇺🇦' },
    { value: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
    { value: 'tr-TR', label: 'Türkçe', flag: '🇹🇷' },
    { value: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
    { value: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳' },
    { value: 'ks-IN', label: 'کٲشُر (Kashmiri)', flag: '🇮🇳' },
    { value: 'zh-CN', label: '中文（简体）', flag: '🇨🇳' },
    { value: 'zh-TW', label: '中文（繁體）', flag: '🇹🇼' },
    { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { value: 'ko-KR', label: '한국어', flag: '🇰🇷' },
    { value: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'th-TH', label: 'ไทย', flag: '🇹🇭' },
    { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
];

// Custom Billing Icon with modern design
const BillingIcon: React.FC<{ className?: string }> = ({ className }) => (
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
        {/* Credit card base */}
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        {/* Sparkle accents */}
        <circle cx="18" cy="15" r="0.5" fill="currentColor" />
        <circle cx="6" cy="15" r="0.5" fill="currentColor" />
        {/* Card chip/detail */}
        <rect x="6" y="13" width="3" height="2" rx="0.5" />
    </svg>
);

interface ProfileMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSettingsClick: () => void;
    onHelpClick: () => void;
    onUpgradeClick: () => void;
    onAboutClick: () => void;
    onVisionClick?: () => void;
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({
    isOpen,
    onClose,
    onSettingsClick,
    onHelpClick,
    onUpgradeClick,
    onAboutClick,
    onVisionClick,
}) => {
    const { user: currentUser, signOut } = useAuth();
    const { subscription } = useSubscription();
    const isPremium = subscription?.tier === 'pro' || subscription?.tier === 'enterprise';

    // Language sub-menu state
    const [showLangMenu, setShowLangMenu] = useState(false);
    const language = usePreferencesStore((s) => s.language);
    const setLanguage = usePreferencesStore((s) => s.setLanguage);
    const currentLang = LANGUAGES.find(l => l.value === language) || LANGUAGES[0];

    const handleLogout = async () => {
        onClose();
        await signOut();
    };

    // Reset sub-menu when modal closes
    const handleClose = () => {
        setShowLangMenu(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Transparent backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={handleClose}
                    />

                    {/* Compact Popover */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bottom-16 left-4 z-50 w-64 bg-[#1f1f1f] border border-white/10 
                       rounded-xl shadow-2xl overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {!showLangMenu ? (
                                /* ════════════════════════════════════════════ */
                                /* MAIN MENU                                    */
                                /* ════════════════════════════════════════════ */
                                <motion.div
                                    key="main"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.12 }}
                                >
                                    {/* Email Header */}
                                    <div className="px-3 py-1.5 border-b border-white/10">
                                        <div className="text-xs text-white/70 truncate">
                                            {currentUser?.email || 'user@example.com'}
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <MenuItem
                                            icon={Settings}
                                            label="Settings"
                                            shortcut="⌘,"
                                            onClick={() => {
                                                onSettingsClick();
                                                handleClose();
                                            }}
                                        />
                                        <MenuItem
                                            icon={HelpCircle}
                                            label="Get help"
                                            onClick={() => {
                                                onHelpClick();
                                                handleClose();
                                            }}
                                        />

                                        <div className="h-px bg-white/10 my-1 mx-2" />

                                        <MenuItem
                                            icon={BillingIcon}
                                            label="Billing & Subscriptions"
                                            badge={!isPremium ? "PRO" : undefined}
                                            onClick={() => {
                                                onUpgradeClick();
                                                handleClose();
                                            }}
                                        />

                                        {onVisionClick && (
                                            <>
                                                <div className="h-px bg-white/10 my-1 mx-2" />
                                                <MenuItem
                                                    icon={ScanEye}
                                                    label="Try Vasthu Vision"
                                                    badge="NEW"
                                                    hasArrow
                                                    onClick={() => {
                                                        onVisionClick();
                                                        handleClose();
                                                    }}
                                                />
                                            </>
                                        )}

                                        <div className="h-px bg-white/10 my-1 mx-2" />

                                        {/* Language selector — shows current language, opens sub-menu */}
                                        <button
                                            onClick={() => setShowLangMenu(true)}
                                            className="w-full flex items-center gap-2.5 px-3 py-1.5 transition-all group text-white/80 hover:text-white hover:bg-white/5"
                                        >
                                            <Globe className="w-4 h-4 flex-shrink-0" />
                                            <span className="flex-1 text-left text-sm">{currentLang.flag} {currentLang.label}</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50 transition-colors flex-shrink-0" />
                                        </button>

                                        <div className="h-px bg-white/10 my-1 mx-2" />

                                        <MenuItem
                                            icon={Info}
                                            label="Learn more"
                                            hasArrow
                                            onClick={() => {
                                                onAboutClick();
                                                handleClose();
                                            }}
                                        />

                                        <div className="h-px bg-white/10 my-1 mx-2" />

                                        <MenuItem
                                            icon={LogOut}
                                            label="Log out"
                                            onClick={handleLogout}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                /* ════════════════════════════════════════════ */
                                /* LANGUAGE SUB-MENU                            */
                                /* ════════════════════════════════════════════ */
                                <motion.div
                                    key="lang"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.12 }}
                                >
                                    {/* Back header */}
                                    <button
                                        onClick={() => setShowLangMenu(false)}
                                        className="w-full flex items-center gap-2 px-3 py-2 border-b border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="text-xs font-medium">Language</span>
                                    </button>

                                    {/* Language list */}
                                    <div className="py-1 max-h-[320px] overflow-y-auto scrollbar-hide">
                                        {LANGUAGES.map((lang) => {
                                            const selected = language === lang.value;
                                            return (
                                                <button
                                                    key={lang.value}
                                                    onClick={() => {
                                                        setLanguage(lang.value);
                                                        setShowLangMenu(false);
                                                    }}
                                                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 transition-all ${
                                                        selected
                                                            ? 'bg-white/[0.08] text-white'
                                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span className="text-sm flex-shrink-0">{lang.flag}</span>
                                                    <span className="flex-1 text-left text-sm">{lang.label}</span>
                                                    {selected && <Check className="w-3.5 h-3.5 text-[#C08B5C] flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

interface MenuItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    shortcut?: string;
    badge?: string;
    hasArrow?: boolean;
    className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon: Icon,
    label,
    onClick,
    shortcut,
    badge,
    hasArrow,
    className = "text-white/80 hover:text-white hover:bg-white/5"
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 transition-all group ${className}`}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left text-sm">{label}</span>
            {shortcut && (
                <span className="text-[10px] text-white/40 flex-shrink-0">{shortcut}</span>
            )}
            {badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded flex-shrink-0
                       bg-gradient-to-r from-[#C08B5C] to-purple-500 text-white">
                    {badge}
                </span>
            )}
            {hasArrow && (
                <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50 transition-colors flex-shrink-0" />
            )}
        </button>
    );
};
