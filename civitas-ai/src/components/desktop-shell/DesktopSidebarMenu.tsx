// FILE: src/components/desktop-shell/DesktopSidebarMenu.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { ChatSession, TabType } from '../../hooks/useDesktopShell';
import { useAuth } from '../../contexts/AuthContext';

interface DesktopSidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatSession[];
  activeChatId: string;
  activeTab: TabType;
  currentTheme: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  menuItems: Array<{ id: TabType; label: string; icon: string }>;
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  onTabChange: (tab: TabType) => void;
}

export const DesktopSidebarMenu: React.FC<DesktopSidebarMenuProps> = ({
  isOpen,
  onClose,
  chatHistory,
  activeChatId,
  activeTab,
  currentTheme,
  menuItems,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onTabChange
}) => {
  const { user, signOut } = useAuth();
  
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div 
        className="fixed left-0 top-0 h-full w-80 z-50 flex flex-col shadow-2xl animate-slide-in-left"
        style={{
          background: 'linear-gradient(180deg, rgba(71, 85, 105, 0.35) 0%, rgba(100, 116, 139, 0.32) 50%, rgba(148, 163, 184, 0.30) 100%)',
          backdropFilter: 'blur(48px) saturate(200%)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.18), 0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* New Chat Button */}
        <div className="p-4 pb-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
          <motion.button
            onClick={() => {
              onNewChat();
              onTabChange('chat');
              onClose();
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3.5 rounded-xl flex items-center justify-center gap-2.5 group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.25) 0%, rgba(96, 165, 250, 0.22) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(103, 232, 249, 0.5)',
              boxShadow: '0 4px 28px rgba(103, 232, 249, 0.3), 0 0 56px rgba(96, 165, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            <motion.svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              whileHover={{ rotate: 90 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </motion.svg>
            <span 
              className="font-bold text-sm tracking-wide relative z-10" 
              style={{ 
                fontFamily: 'Inter Tight, sans-serif',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(103, 232, 249, 0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 8px rgba(103, 232, 249, 0.5))'
              }}
            >
              New Chat
            </span>
          </motion.button>
        </div>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
            <motion.h3 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
              style={{ 
                background: 'linear-gradient(90deg, rgba(203, 213, 225, 0.9) 0%, rgba(226, 232, 240, 1) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Inter, sans-serif', 
                letterSpacing: '0.1em',
                filter: 'drop-shadow(0 0 6px rgba(203, 213, 225, 0.4))'
              }}
            >
              Recent Chats
            </motion.h3>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {chatHistory.slice(0, 10).map((chat, index) => (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05, type: 'spring', stiffness: 100 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onLoadChat(chat.id)}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 relative overflow-hidden group"
                  style={{
                    background: activeChatId === chat.id 
                      ? 'linear-gradient(135deg, rgba(103, 232, 249, 0.22) 0%, rgba(96, 165, 250, 0.18) 100%)'
                      : 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: activeChatId === chat.id 
                      ? '1px solid rgba(103, 232, 249, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: activeChatId === chat.id 
                      ? '0 2px 20px rgba(103, 232, 249, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                      : '0 1px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                  }}
                >
                  {/* Hover gradient effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${currentTheme.primary}10 50%, transparent 100%)`,
                    }}
                    initial={false}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                  
                  <div className="flex-1 min-w-0 text-left relative z-10">
                    <p 
                      className="text-sm font-medium truncate"
                      style={{ 
                        color: activeChatId === chat.id ? 'rgba(103, 232, 249, 1)' : 'rgba(241, 245, 249, 0.95)',
                        fontFamily: 'Inter, sans-serif',
                        textShadow: activeChatId === chat.id ? '0 0 8px rgba(103, 232, 249, 0.5)' : 'none'
                      }}
                    >
                      {chat.title || 'Untitled Chat'}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(203, 213, 225, 0.8)' }}>
                      {chat.timestamp}
                    </p>
                  </div>
                  {chatHistory.length > 1 && (
                    <motion.button
                      onClick={(e) => onDeleteChat(chat.id, e)}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 rounded-lg transition-colors flex-shrink-0 relative z-10"
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-4 space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05, type: 'spring' }}
                whileHover={{ scale: 1.03, x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className="group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 relative overflow-hidden"
                style={{
                  background: activeTab === item.id 
                    ? 'linear-gradient(135deg, rgba(103, 232, 249, 0.22) 0%, rgba(96, 165, 250, 0.18) 100%)'
                    : 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: activeTab === item.id 
                    ? '1px solid rgba(103, 232, 249, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: activeTab === item.id
                    ? '0 2px 20px rgba(103, 232, 249, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    : '0 1px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                }}
              >
                {/* Active indicator bar */}
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ 
                      background: currentTheme.gradient,
                      boxShadow: `0 0 8px ${currentTheme.primary}80`
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Hover shimmer effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${currentTheme.primary}08 50%, transparent 100%)`,
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
                  style={{
                    background: activeTab === item.id
                      ? 'linear-gradient(135deg, rgba(103, 232, 249, 0.3) 0%, rgba(96, 165, 250, 0.28) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.15) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: activeTab === item.id
                      ? '1px solid rgba(103, 232, 249, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: activeTab === item.id
                      ? '0 4px 20px rgba(103, 232, 249, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                      : '0 2px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <span style={{ 
                    fontSize: '1.25rem',
                    filter: activeTab === item.id ? 'drop-shadow(0 0 6px rgba(103, 232, 249, 0.6))' : 'none'
                  }}>
                    {item.icon}
                  </span>
                </motion.div>
                <span 
                  className="font-medium text-sm relative z-10"
                  style={{ 
                    color: activeTab === item.id ? 'rgba(103, 232, 249, 1)' : 'rgba(241, 245, 249, 0.95)',
                    fontFamily: 'Inter, sans-serif',
                    textShadow: activeTab === item.id ? '0 0 8px rgba(103, 232, 249, 0.5)' : 'none'
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-4 pb-4 pt-3 border-t" 
          style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-xl p-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.12) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 2px 16px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Background gradient glow */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              animate={{ 
                background: [
                  `radial-gradient(circle at 0% 0%, ${currentTheme.primary}10 0%, transparent 50%)`,
                  `radial-gradient(circle at 100% 100%, ${currentTheme.secondary}10 0%, transparent 50%)`,
                  `radial-gradient(circle at 0% 0%, ${currentTheme.primary}10 0%, transparent 50%)`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ 
                  background: currentTheme.gradient,
                  boxShadow: `0 4px 12px ${currentTheme.primary}40`
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div 
                  className="text-sm font-semibold truncate"
                  style={{ 
                    color: 'rgba(248, 250, 252, 1)', 
                    fontFamily: 'Inter, sans-serif',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {user?.name || 'User'}
                </div>
                <div className="text-xs truncate" style={{ color: 'rgba(203, 213, 225, 0.9)' }}>
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => {
                signOut();
                onClose();
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full p-2.5 rounded-lg flex items-center justify-center gap-2 relative z-10 overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.12) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              }}
              title="Sign Out"
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.15) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              <svg className="w-5 h-5 text-red-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium text-red-600 relative z-10">Sign Out</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};
