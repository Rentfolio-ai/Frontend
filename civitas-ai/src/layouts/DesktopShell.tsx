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

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// PortfolioProvider removed - not needed without portfolio views
// import { PortfolioProvider } from '../contexts/PortfolioContext';
import { useDesktopShell, type TabType } from '../hooks/useDesktopShell';
import { useThemeState } from '../hooks/useThemeState';
import { usePreferences } from '../hooks/usePreferences';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/primitives/Toast';
import { ChatTabView, SettingsTabView, DesktopSidebarMenu } from '../components/desktop-shell';
import { GradientBackground } from '../components/GradientBackground';

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

// Menu items - Portfolio removed (feature stickiness needs evaluation)
const MENU_ITEMS: Array<{ id: TabType; label: string; icon: string }> = [
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export const DesktopShell: React.FC<DesktopShellProps> = () => {
  const { user } = useAuth();
  const { toasts, closeToast } = useToast();
  
  // Custom hooks for state management
  const {
    chatHistory,
    activeChatId,
    messages,
    isSidebarOpen,
    activeTab,
    isLoading,
    setIsSidebarOpen,
    setActiveTab,
    handleSendMessage,
    handleNewChat,
    handleLoadChat,
    handleDeleteChat,
    handleAction,
    attachment,
    setAttachment
  } = useDesktopShell();
  
  const { selectedState, setSelectedState, currentTheme } = useThemeState();
  
  const {
    emailNotifications,
    marketAlerts,
    updateEmailNotifications,
    updateMarketAlerts
  } = usePreferences();
  
  // Listen for navigation events from chat
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { tab } = event.detail as { tab?: string };
      const targetTab: TabType = tab === 'settings' ? 'settings' : 'chat';
      console.log(`🚀 Navigating to: ${targetTab}`);
      setActiveTab(targetTab);
    };
    
    window.addEventListener('navigate-to-tab', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate as EventListener);
  }, [setActiveTab]);
  
  return (
    <GradientBackground variant="modern">
      <div className="h-screen flex flex-col overflow-hidden relative">
        {/* Content layer */}
        <div className="relative z-10 h-full flex flex-col">
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
        {/* Minimal Professional Header */}
        <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="group px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden backdrop-blur-xl bg-white/90 border border-blue-900/10 shadow-lg shadow-blue-900/5"
          >
            <svg 
              className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90 text-blue-900" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span 
              className="font-semibold text-sm relative z-10 text-blue-900"
            >
              Menu
            </span>
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
              onAction={handleAction}
              onAttach={file => setAttachment(file)}
              attachment={attachment}
              onClearAttachment={() => setAttachment(null)}
            />
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
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={closeToast} />
      
        </div>
      </div>
    </GradientBackground>
  );
};

// Export as default
export default DesktopShell;
