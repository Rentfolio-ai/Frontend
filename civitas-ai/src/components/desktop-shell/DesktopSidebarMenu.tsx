// FILE: src/components/desktop-shell/DesktopSidebarMenu.tsx
import React from 'react';
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
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 50%, rgba(241, 245, 249, 0.92) 100%)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.1), 0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* New Chat Button */}
        <div className="p-4 pb-3 border-b" style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}>
          <button
            onClick={() => {
              onNewChat();
              onTabChange('chat');
              onClose();
            }}
            className="w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg group"
            style={{
              background: currentTheme.gradient,
              boxShadow: `0px 4px 12px ${currentTheme.primary}55, 0px 2px 6px ${currentTheme.secondary}33`,
            }}
          >
            <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold text-sm text-white tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              New Chat
            </span>
          </button>
        </div>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(148, 163, 184, 0.12)' }}>
            <h3 
              className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
              style={{ color: '#64748b', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}
            >
              Recent Chats
            </h3>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {chatHistory.slice(0, 10).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onLoadChat(chat.id)}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-all duration-300 hover:translate-x-1 hover:shadow-md"
                  style={{
                    background: activeChatId === chat.id 
                      ? `linear-gradient(135deg, ${currentTheme.primary}20 0%, ${currentTheme.secondary}12 100%)`
                      : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: activeChatId === chat.id 
                      ? `1.5px solid ${currentTheme.primary}50`
                      : '1px solid rgba(148, 163, 184, 0.15)',
                    boxShadow: activeChatId === chat.id 
                      ? `0 2px 8px ${currentTheme.primary}25`
                      : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className="flex-1 min-w-0 text-left">
                    <p 
                      className="text-sm font-medium truncate"
                      style={{ 
                        color: activeChatId === chat.id ? '#1e40af' : '#334155',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      {chat.title || 'Untitled Chat'}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: '#94a3b8' }}>
                      {chat.timestamp}
                    </p>
                  </div>
                  {chatHistory.length > 1 && (
                    <button
                      onClick={(e) => onDeleteChat(chat.id, e)}
                      className="p-1 rounded hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className="group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 relative overflow-hidden"
                style={{
                  background: activeTab === item.id 
                    ? `linear-gradient(135deg, ${currentTheme.primary}20 0%, ${currentTheme.secondary}12 100%)`
                    : 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(12px)',
                  border: activeTab === item.id 
                    ? `1.5px solid ${currentTheme.primary}50` 
                    : '1px solid rgba(148, 163, 184, 0.15)',
                  boxShadow: activeTab === item.id
                    ? `0 2px 8px ${currentTheme.primary}20`
                    : '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                {activeTab === item.id && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ 
                      background: currentTheme.gradient,
                      boxShadow: `0 0 8px ${currentTheme.primary}80`
                    }}
                  />
                )}
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500"
                  style={{
                    background: activeTab === item.id
                      ? currentTheme.gradient
                      : 'rgba(255, 255, 255, 0.6)',
                    boxShadow: activeTab === item.id
                      ? `0 3px 10px ${currentTheme.primary}55`
                      : '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <span className={activeTab === item.id ? 'filter brightness-0 invert' : ''}>
                    {item.icon}
                  </span>
                </div>
                <span 
                  className="font-medium text-sm"
                  style={{ 
                    color: activeTab === item.id ? '#1e40af' : '#475569',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}>
          <div 
            className="rounded-xl p-3"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ background: currentTheme.gradient }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div 
                  className="text-sm font-semibold truncate"
                  style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}
                >
                  {user?.name || 'User'}
                </div>
                <div className="text-xs truncate" style={{ color: '#64748b' }}>
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full p-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-red-50 hover:scale-[1.02]"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
              title="Sign Out"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
