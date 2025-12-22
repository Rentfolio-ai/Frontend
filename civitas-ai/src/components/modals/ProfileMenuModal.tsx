/**
 * Profile Menu Popover Component
 * 
 * Compact popover menu that appears next to the sidebar
 */

import React from 'react';
import { Settings, HelpCircle, Zap, Info, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';

interface ProfileMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSettingsClick: () => void;
    onHelpClick: () => void;
    onUpgradeClick: () => void;
    onAboutClick: () => void;
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({
    isOpen,
    onClose,
    onSettingsClick,
    onHelpClick,
    onUpgradeClick,
    onAboutClick,
}) => {
    const { user: currentUser, signOut } = useAuth();
    const { subscription } = useSubscription();
    const isPremium = subscription?.tier === 'pro' || subscription?.tier === 'enterprise';

    const handleLogout = async () => {
        onClose();
        await signOut();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Transparent backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={onClose}
                    />

                    {/* Compact Popover - smaller and closer to profile */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bottom-16 left-4 z-50 w-64 bg-[#1f1f1f] border border-white/10 
                       rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Email Header - compact */}
                        <div className="px-3 py-1.5 border-b border-white/10">
                            <div className="text-xs text-white/70 truncate">
                                {currentUser?.email || 'user@example.com'}
                            </div>
                        </div>

                        {/* Menu Items - compact spacing */}
                        <div className="py-1">
                            <MenuItem
                                icon={Settings}
                                label="Settings"
                                shortcut="⌘,"
                                onClick={() => {
                                    onSettingsClick();
                                    onClose();
                                }}
                            />
                            <MenuItem
                                icon={HelpCircle}
                                label="Get help"
                                onClick={() => {
                                    onHelpClick();
                                    onClose();
                                }}
                            />

                            <div className="h-px bg-white/10 my-1 mx-2" />

                            <MenuItem
                                icon={Zap}
                                label="Upgrade plan"
                                badge={!isPremium ? "PRO" : undefined}
                                onClick={() => {
                                    onUpgradeClick();
                                    onClose();
                                }}
                            />

                            <div className="h-px bg-white/10 my-1 mx-2" />

                            <MenuItem
                                icon={Info}
                                label="Learn more"
                                hasArrow
                                onClick={() => {
                                    onAboutClick();
                                    onClose();
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
                       bg-gradient-to-r from-teal-500 to-purple-500 text-white">
                    {badge}
                </span>
            )}
            {hasArrow && (
                <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50 transition-colors flex-shrink-0" />
            )}
        </button>
    );
};
