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
 * - DealAnalyzerDrawer for P&L analysis
 */

import React, { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// PortfolioProvider removed - not needed without portfolio views
// import { PortfolioProvider } from '../contexts/PortfolioContext';
import { useDesktopShell, type TabType } from '../hooks/useDesktopShell';
import { useThemeState } from '../hooks/useThemeState';
import { usePreferences } from '../hooks/usePreferences';
import { useToast } from '../hooks/useToast';
import { usePropertyBookmarks } from '../hooks/usePropertyBookmarks';
import { useSavedReports } from '../hooks/useSavedReports';
import { ToastContainer } from '../components/primitives/Toast';
import { ChatTabView, SettingsTabView, ReportsTabView, PortfolioTabView, DesktopSidebarMenu } from '../components/desktop-shell';
import { DealAnalyzerDrawer } from '../components/analysis';
import { ReportDrawer } from '../components/reports';
import { OnboardingTour } from '../components/onboarding';
import { hasCompletedOnboarding } from '../services/onboardingApi';
import type { ScoutedProperty } from '../types/backendTools';

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

// Menu items
const MENU_ITEMS: Array<{ id: TabType; label: string; icon: string }> = [
  { id: 'portfolio', label: 'Portfolio', icon: '📊' },
  { id: 'reports', label: 'Reports', icon: '📄' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const ONBOARDING_STORAGE_KEY = 'prophetatlas-onboarding-completed';

export const DesktopShell: React.FC<DesktopShellProps> = () => {
  const { user } = useAuth();
  const { toasts, closeToast } = useToast();

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    sendMessageWithStream,
    handleNewChat,
    handleLoadChat,
    handleDeleteChat,
    handleAction,
    attachment,
    setAttachment,
    dealAnalyzer,
    openDealAnalyzer,
    closeDealAnalyzer,
    reportDrawer,
    closeReportDrawer,
    generateReportWithType,
    // Thinking state
    thinking,
    completedTools,
  } = useDesktopShell();

  const { selectedState, setSelectedState, currentTheme } = useThemeState();

  const {
    emailNotifications,
    marketAlerts,
    updateEmailNotifications,
    updateMarketAlerts
  } = usePreferences();

  // Property bookmarks
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    findMatchingBookmark,
  } = usePropertyBookmarks();

  // Saved reports - now fetches from backend API
  const {
    refreshReports,
  } = useSavedReports();

  // Toggle bookmark handler
  const handleToggleBookmark = useCallback((property: ScoutedProperty) => {
    console.log('[DesktopShell] handleToggleBookmark called', { property });
    try {
      const existingBookmark = findMatchingBookmark(property);
      console.log('[DesktopShell] Existing bookmark found:', existingBookmark);
      if (existingBookmark) {
        console.log('[DesktopShell] Removing bookmark:', existingBookmark.id);
        removeBookmark(existingBookmark.id);
      } else {
        console.log('[DesktopShell] Adding bookmark');
        const newBookmark = addBookmark(property);
        console.log('[DesktopShell] Bookmark added:', newBookmark);
      }
    } catch (error) {
      console.error('[DesktopShell] Error in handleToggleBookmark:', error);
    }
  }, [findMatchingBookmark, removeBookmark, addBookmark]);

  // Refresh reports when navigating to reports tab (reports are auto-saved on backend)
  const handleNavigateToReportsAndRefresh = useCallback(() => {
    setActiveTab('reports');
    refreshReports();
  }, [setActiveTab, refreshReports]);




  // Check if onboarding should be shown
  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const checkOnboardingStatus = async () => {
      if (!user) return;

      const userId = user.id || user.email || undefined;
      const status = await hasCompletedOnboarding(userId);

      if (!isMounted) return;

      // Skip showing onboarding if backend is unavailable
      if (!status.backendAvailable) {
        console.warn('Onboarding backend unavailable; skipping tour display.');
        return;
      }

      if (status.completed) {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        return;
      }

      // Small delay to let the UI render first
      timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
    };

    checkOnboardingStatus();

    return () => {
      isMounted = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [user]);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback((redirectTab?: TabType) => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
    // Navigate to the tab specified by backend (defaults to 'chat')
    if (redirectTab) {
      setActiveTab(redirectTab);
    }
  }, [setActiveTab]);

  // Handle onboarding skip
  const handleOnboardingSkip = useCallback((redirectTab?: TabType) => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
    // Navigate to the tab specified by backend (defaults to 'chat')
    if (redirectTab) {
      setActiveTab(redirectTab);
    }
  }, [setActiveTab]);

  // Listen for navigation events from chat
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { tab } = event.detail as { tab?: string };
      let targetTab: TabType = 'chat';
      if (tab === 'settings') targetTab = 'settings';
      else if (tab === 'reports') targetTab = 'reports';
      console.log(`🚀 Navigating to: ${targetTab}`);
      setActiveTab(targetTab);
    };

    window.addEventListener('navigate-to-tab', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate as EventListener);
  }, [setActiveTab]);

  return (
    <div className="h-screen w-full relative overflow-hidden dark bg-background">
      {/* Immersive gradient background */}
      <div className="absolute inset-0 bg-gradient-animated" />
      <div className="absolute inset-0 bg-mesh" />

      {/* Content layer */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Sidebar Menu (slides over) */}
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
          bookmarks={bookmarks}
          onRemoveBookmark={removeBookmark}
          onBookmarkClick={(bookmark) => {
            // When bookmark is clicked, start a new chat and analyze the property
            handleNewChat();
            const propertyAddress = bookmark.property.address;
            const message = `Analyze this property: ${propertyAddress}`;
            setTimeout(() => {
              handleSendMessage(message);
            }, 100);
          }}
        />

        {/* Main Content Area - Full height */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Back to Chat Button - Shows when not on chat tab */}
          {activeTab !== 'chat' && (
            <button
              onClick={() => setActiveTab('chat')}
              className="absolute top-4 left-4 z-20 px-4 py-2.5 rounded-xl glass-card hover:bg-white/[0.08] transition-all duration-300 group flex items-center gap-2.5"
              aria-label="Back to chat"
            >
              <svg className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Back to Chat
              </span>
            </button>
          )}

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'chat' && (
              <ChatTabView
                messages={messages}
                isLoading={isLoading}
                userName={user?.name?.split(' ')[0]}
                selectedState={selectedState}
                onSendMessage={sendMessageWithStream}
                onAction={handleAction}
                onAttach={file => setAttachment(file)}
                attachment={attachment}
                onClearAttachment={() => setAttachment(null)}
                onOpenDealAnalyzer={openDealAnalyzer}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                onNavigateToReports={handleNavigateToReportsAndRefresh}
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onNewChat={handleNewChat}
                thinking={thinking}
                completedTools={completedTools}
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
            {activeTab === 'reports' && (
              <ReportsTabView />
            )}
            {activeTab === 'portfolio' && (
              <PortfolioTabView />
            )}
          </div>
        </div>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={closeToast} />

        {/* Deal Analyzer Drawer */}
        <DealAnalyzerDrawer
          isOpen={dealAnalyzer.isOpen}
          onClose={closeDealAnalyzer}
          propertyId={dealAnalyzer.propertyId}
          initialPurchasePrice={dealAnalyzer.purchasePrice}
          initialStrategy={dealAnalyzer.strategy}
          propertyAddress={dealAnalyzer.propertyAddress}
        />

        {/* Report Drawer */}
        <ReportDrawer
          isOpen={reportDrawer.isOpen}
          onClose={closeReportDrawer}
          report={reportDrawer.report}
          isLoading={reportDrawer.isLoading}
          error={reportDrawer.error}
          onGenerateReport={generateReportWithType}
          inferredStrategy={reportDrawer.inferredStrategy}
          propertyAddress={reportDrawer.propertyAddress}
        />

        {/* Onboarding Tour */}
        <OnboardingTour
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          currentTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

// Export as default
export default DesktopShell;
