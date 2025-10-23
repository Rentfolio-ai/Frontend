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
import { PropertiesTabView } from '../components/views/PropertiesTabView';
import { PortfolioTabView } from '../components/views/PortfolioTabView';
import { MarketTrendsTabView } from '../components/views/MarketTrendsTabView';
import { ReportsTabView } from '../components/views/ReportsTabView';

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
          ? `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`
          : 'linear-gradient(135deg, #0062E6 0%, #00C78C 50%, #10B981 100%)' // Blue → Teal → Green
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
              userName={user?.name?.split(' ')[0]}
              selectedState={selectedState}
              onSendMessage={handleSendMessage}
            />
          )}
          {activeTab === 'properties' && (
            <PropertiesTabView />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioTabView />
          )}

          {activeTab === 'market' && (
            <MarketTrendsTabView />
          )}

          {activeTab === 'reports' && (
            <ReportsTabView />
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
