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
import { PortfolioProvider } from '../contexts/PortfolioContext';
import { useDesktopShell } from '../hooks/useDesktopShell';
import { useThemeState } from '../hooks/useThemeState';
import { usePreferences } from '../hooks/usePreferences';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/primitives/Toast';
import { ChatTabView, SettingsTabView, DesktopSidebarMenu } from '../components/desktop-shell';
import { PropertiesTabView } from '../components/views/PropertiesTabView';
import { PortfolioTabView } from '../components/views/PortfolioTabView';
import { MarketTrendsTabView } from '../components/views/MarketTrendsTabView_NEW';
import { ReportsTabView } from '../components/views/ReportsTabView_NEW';

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

// Dev mode - shows experimental features
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV;

const BASE_MENU_ITEMS = [
  { id: 'market' as const, label: 'Market Insights', icon: '📊' },
  { id: 'reports' as const, label: 'Reports', icon: '📈' },
  { id: 'settings' as const, label: 'Settings', icon: '⚙️' },
];

const DEV_MENU_ITEMS = [
  { id: 'properties' as const, label: 'Properties 🧪', icon: '🏠' }, // Experimental
  { id: 'portfolio' as const, label: 'Portfolio 🧪', icon: '💼' }, // Experimental
];

const MENU_ITEMS = DEV_MODE 
  ? [...DEV_MENU_ITEMS, ...BASE_MENU_ITEMS]
  : BASE_MENU_ITEMS;

export const DesktopShell: React.FC<DesktopShellProps> = () => {
  const { user } = useAuth();
  const { toasts, success, closeToast } = useToast();
  
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
    handleAction
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
      const { tab } = event.detail;
      if (tab === 'market-insights' || tab === 'market') {
        setActiveTab('market');
      } else if (tab === 'reports') {
        setActiveTab('reports');
      }
    };
    
    window.addEventListener('navigate-to-tab', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate as EventListener);
  }, [setActiveTab]);
  
  // Listen for success events (report saved, analysis complete)
  useEffect(() => {
    const handleReportSaved = () => {
      success('Report saved successfully!', {
        label: 'View',
        onClick: () => setActiveTab('reports')
      });
    };
    
    const handleMarketAnalysis = () => {
      success('Market analysis complete!', {
        label: 'View Insights',
        onClick: () => setActiveTab('market')
      });
    };
    
    window.addEventListener('report-saved', handleReportSaved as EventListener);
    window.addEventListener('market-analysis-saved', handleMarketAnalysis as EventListener);
    
    return () => {
      window.removeEventListener('report-saved', handleReportSaved as EventListener);
      window.removeEventListener('market-analysis-saved', handleMarketAnalysis as EventListener);
    };
  }, [success, setActiveTab]);

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* STR Investment Platform - Professional Clean Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Clean professional gradient - Investment blue theme */}
        <div 
          className="absolute inset-0"
          style={{
            background: selectedState 
              ? `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`
              : 'linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #0891b2 100%)'
          }}
        />
        
        {/* Subtle grid pattern - Data/analytics context */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Property location markers - Static STR context */}
        <div className="absolute inset-0 opacity-[0.025]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {/* Map pin markers at key locations */}
            <g fill="white" opacity="0.6">
              <circle cx="15%" cy="25%" r="4" />
              <circle cx="35%" cy="15%" r="3" />
              <circle cx="55%" cy="30%" r="5" />
              <circle cx="75%" cy="20%" r="3.5" />
              <circle cx="85%" cy="40%" r="4" />
              <circle cx="25%" cy="60%" r="3" />
              <circle cx="60%" cy="70%" r="4.5" />
              <circle cx="80%" cy="75%" r="3" />
            </g>
            {/* Connecting lines - Market connectivity */}
            <g stroke="white" strokeWidth="0.5" opacity="0.3">
              <line x1="15%" y1="25%" x2="35%" y2="15%" />
              <line x1="35%" y1="15%" x2="55%" y2="30%" />
              <line x1="55%" y1="30%" x2="75%" y2="20%" />
              <line x1="75%" y1="20%" x2="85%" y2="40%" />
            </g>
          </svg>
        </div>
        
        {/* Subtle corner accents - Premium feel */}
        <div 
          className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.3) 0%, transparent 60%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.25) 0%, transparent 60%)'
          }}
        />
      </div>
      
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
        {/* Top Bar */}
        <div className="flex-shrink-0 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="group px-3 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.10) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Hover gradient effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(96, 165, 250, 0.12) 100%)'
              }}
            />
            
            <svg 
              className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span 
              className="font-medium text-sm relative z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                fontFamily: 'Inter Tight, sans-serif'
              }}
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
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={closeToast} />
      </div>
    </div>
  );
};

// Export as default
export default DesktopShell;
