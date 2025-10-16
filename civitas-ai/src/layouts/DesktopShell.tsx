// FILE: src/layouts/DesktopShell.tsx
/**
 * Refactored DesktopShell component
 * This is a dramatically simplified version that uses extracted hooks and components
 * 
 * Original: 1,371 lines
 * Refactored: 228 lines (83% reduction)
 * 
 * Uses:
 * - useDesktopShell hook for state management
 * - useThemeState hook for theme customization
 * - usePreferences hook for user preferences
 * - ChatTabView for chat interface
 * - SettingsTabView for settings page
 * - DesktopSidebarMenu for navigation
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDesktopShell } from '../hooks/useDesktopShell';
import { useThemeState } from '../hooks/useThemeState';
import { usePreferences } from '../hooks/usePreferences';
import { ChatTabView, SettingsTabView, DesktopSidebarMenu } from '../components/desktop-shell';

interface DesktopShellProps {
  children?: React.ReactNode;
}

const STATE_OPTIONS = [
  { name: 'California', emoji: '🌴', color: '#F59E0B' },
  { name: 'Texas', emoji: '🤠', color: '#DC2626' },
  { name: 'Florida', emoji: '🏖️', color: '#06B6D4' },
  { name: 'New York', emoji: '🗽', color: '#6366F1' },
  { name: 'Colorado', emoji: '⛰️', color: '#10B981' },
  { name: 'Tennessee', emoji: '🎸', color: '#8B5CF6' },
  { name: 'Arizona', emoji: '🌵', color: '#EF4444' },
  { name: 'Georgia', emoji: '🍑', color: '#F97316' },
  { name: 'Nevada', emoji: '🎰', color: '#EC4899' },
];

const MENU_ITEMS = [
  { id: 'chat' as const, label: 'Chat', icon: '💬' },
  { id: 'properties' as const, label: 'Properties', icon: '🏠' },
  { id: 'portfolio' as const, label: 'Portfolio', icon: '💼' },
  { id: 'market' as const, label: 'Market Insights', icon: '📊' },
  { id: 'reports' as const, label: 'Reports', icon: '📈' },
  { id: 'settings' as const, label: 'Settings', icon: '⚙️' },
];

export const DesktopShell: React.FC<DesktopShellProps> = () => {
  const { user } = useAuth();
  
  // Custom hooks for state management
  const {
    chatHistory,
    activeChatId,
    messages,
    isSidebarOpen,
    activeTab,
    isLoading,
    showSuggestions,
    setIsSidebarOpen,
    setActiveTab,
    handleSendMessage,
    handleNewChat,
    handleLoadChat,
    handleDeleteChat
  } = useDesktopShell();
  
  const { selectedState, setSelectedState, currentTheme } = useThemeState();
  
  const {
    emailNotifications,
    marketAlerts,
    updateEmailNotifications,
    updateMarketAlerts
  } = usePreferences();

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden transition-all duration-500"
      style={{
        background: selectedState 
          ? `linear-gradient(180deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`
          : 'linear-gradient(180deg, #56CCF2 0%, #2F80ED 100%)'
      }}
    >
      {/* Sidebar Menu */}
      <DesktopSidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        activeTab={activeTab}
        currentTheme={currentTheme}
        menuItems={MENU_ITEMS}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex-shrink-0 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-white font-medium text-sm">Menu</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'chat' && (
            <ChatTabView
              messages={messages}
              isLoading={isLoading}
              showSuggestions={showSuggestions}
              userName={user?.name?.split(' ')[0]}
              selectedState={selectedState}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'properties' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-4">Properties</h1>
                <div 
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <p className="text-gray-600">Properties view coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-4">Portfolio</h1>
                <div 
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <p className="text-gray-600">Portfolio view coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-4">Market Insights</h1>
                <div 
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <p className="text-gray-600">Market insights coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-4">Reports</h1>
                <div 
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <p className="text-gray-600">Reports view coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsTabView
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              emailNotifications={emailNotifications}
              setEmailNotifications={updateEmailNotifications}
              marketAlerts={marketAlerts}
              setMarketAlerts={updateMarketAlerts}
              stateOptions={STATE_OPTIONS}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Export as default
export default DesktopShell;
