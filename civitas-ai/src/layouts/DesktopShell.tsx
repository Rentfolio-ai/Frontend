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

import { useToast } from '../hooks/useToast';
import { usePropertyBookmarks } from '../hooks/usePropertyBookmarks';
import { useSavedReports } from '../hooks/useSavedReports';
import { ToastContainer } from '../components/primitives/Toast';
import { PortfolioTabView } from '../components/desktop-shell';
import { ReportsPage } from '../components/reports/ReportsPage';
import { CommandCenterChatView } from '../components/desktop-shell/CommandCenterChatView';
import { SimpleSidebar } from '../components/desktop-shell/SimpleSidebar';
import { CommandSearch } from '../components/desktop-shell/CommandSearch';
import { PropertyAnalysisPage } from '../components/pages/PropertyAnalysisPage';
import { DealAnalyzerDrawer } from '../components/analysis';
import { ReportDrawer } from '../components/reports';
import { OnboardingTour } from '../components/onboarding';
import { hasCompletedOnboarding } from '../services/onboardingApi';
import type { ScoutedProperty } from '../types/backendTools';
import { FilesPage } from '../components/files/FilesPage';
import { SettingsPage } from '../components/pages/SettingsPage';
import { HelpPage } from '../components/pages/HelpPage';
import { UpgradePage } from '../components/pages/UpgradePage';
import { AboutPage } from '../components/pages/AboutPage';
import { ProfilePage } from '../components/pages/ProfilePage';
import { NotificationsPage } from '../components/pages/NotificationsPage';
import { AppearancePage } from '../components/pages/AppearancePage';
import { LanguageRegionPage } from '../components/pages/LanguageRegionPage';
import { InvestmentPreferencesPage } from '../components/pages/InvestmentPreferencesPage';
import { DealAnalyzerPage } from '../components/pages/DealAnalyzerPage';

interface DesktopShellProps {
  children?: React.ReactNode;
}




const ONBOARDING_STORAGE_KEY = 'prophetatlas-onboarding-completed';


export const DesktopShell: React.FC<DesktopShellProps> = () => {
  const { user } = useAuth();
  const { toasts, closeToast, success, error } = useToast();

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global ⌘K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Custom hooks for state management
  const {
    chatHistory,
    activeChatId,
    messages,
    activeTab,
    isLoading,
    setIsSidebarOpen,
    setActiveTab,
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
    reasoningSteps, // 🚀 NEW: Real-time reasoning steps
    handleRegenerate,
    activeProperty,
    handleViewPropertyDetails,
    // Stream control
    streamError,
    cancelStream,
    // Chat management
    handlePinChat,
    handleArchiveChat,
    handleNavigateBranch,
    handleEditMessage,
    // Command Center
    commandCenter,
    selectProperty,
    addToComparisonDock,
    removeFromComparisonDock,
    clearComparisonDock,
    startComparison,
    togglePanePin,
    // Temporary chat
    isCurrentChatTemporary,
    setIsCurrentChatTemporary,
    // Agent Mode
    currentMode,
    setCurrentMode,
  } = useDesktopShell();

  console.log('[DesktopShell] Render state:', {
    activeTab,
    hasActiveProperty: !!activeProperty,
    hasPinHandler: !!handlePinChat,
    hasArchiveHandler: !!handleArchiveChat
  });

  const { selectedState } = useThemeState();

  // Track scroll direction for hamburger button visibility
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  // Toggle temporary chat mode
  const handleToggleTemporary = useCallback(() => {
    setIsCurrentChatTemporary(prev => !prev);
  }, [setIsCurrentChatTemporary]);

  // Preferences hook removed as settings tab is removed
  // const {
  //   emailNotifications,
  //   marketAlerts,
  //   updateEmailNotifications,
  //   updateMarketAlerts
  // } = usePreferences();

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
        success('Property removed from bookmarks');
      } else {
        console.log('[DesktopShell] Adding bookmark');
        const newBookmark = addBookmark(property);
        console.log('[DesktopShell] Bookmark added:', newBookmark);
        success('Property bookmarked!');
      }
    } catch (err) {
      console.error('[DesktopShell] Error in handleToggleBookmark:', err);
      error('Failed to update bookmark');
    }
  }, [findMatchingBookmark, removeBookmark, addBookmark, success, error]);

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
      if (tab === 'reports') targetTab = 'reports';
      console.log(`🚀 Navigating to: ${targetTab}`);
      setActiveTab(targetTab);
    };

    window.addEventListener('navigate-to-tab', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate as EventListener);
  }, [setActiveTab]);

  // Navigation menu items - Always include Property Analysis


  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#334155' }}>
      {/* Simple Left Sidebar with integrated chat history */}
      <SimpleSidebar
        onNewChat={() => {
          handleNewChat();
          setActiveTab('chat');
        }}
        onChatClick={() => setActiveTab('chat')}
        onAnalyticsClick={() => setActiveTab('portfolio')}
        onReportsClick={() => setActiveTab('reports')}
        onSettingsClick={() => setActiveTab('settings')}
        onHelpClick={() => setActiveTab('help')}
        onUpgradeClick={() => setActiveTab('upgrade')}
        onAboutClick={() => setActiveTab('about')}
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onPinChat={handlePinChat}
        onArchiveChat={handleArchiveChat}
        hideHamburger={activeTab === 'chat' && isScrollingDown}
        isCurrentChatTemporary={isCurrentChatTemporary}
      />

      {/* Content layer with left padding for sidebar */}
      <div className="relative z-10 h-full flex flex-col pl-14">

        {/* Main Content Area - Full height */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'chat' && (() => {
              const activeChat = chatHistory.find(c => c.id === activeChatId);
              return (
                <CommandCenterChatView
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
                  onNavigateToInvestmentPreferences={() => setActiveTab('investment_preferences')}
                  onOpenSidebar={() => setIsSidebarOpen(true)}
                  onNewChat={handleNewChat}
                  thinking={thinking}
                  completedTools={completedTools}
                  reasoningSteps={reasoningSteps} // 🚀 NEW: Real-time reasoning steps
                  onRefresh={handleRegenerate}
                  onViewDetails={handleViewPropertyDetails}
                  onCancel={cancelStream}
                  error={streamError}
                  onEditMessage={handleEditMessage}
                  onNavigateBranch={handleNavigateBranch}
                  // Chat management props
                  chatTitle={activeChat?.title}
                  chatId={activeChatId || undefined}
                  onPinChat={(chatId) => handlePinChat(chatId)}
                  onArchiveChat={(chatId) => handleArchiveChat(chatId)}
                  onDeleteChat={(chatId) => handleDeleteChat(chatId)}
                  isPinned={activeChat?.isPinned}
                  onScrollDirectionChange={setIsScrollingDown}
                  isTemporary={isCurrentChatTemporary}
                  onToggleTemporary={handleToggleTemporary}
                  // Command Center props
                  commandCenter={commandCenter}
                  selectProperty={selectProperty}
                  addToComparisonDock={addToComparisonDock}
                  removeFromComparisonDock={removeFromComparisonDock}
                  clearComparisonDock={clearComparisonDock}
                  startComparison={startComparison}
                  togglePanePin={togglePanePin}
                  currentMode={currentMode}
                  onModeChange={setCurrentMode}
                />
              );
            })()}
            {activeTab === 'reports' && (
              <ReportsPage />
            )}
            {activeTab === 'portfolio' && (
              <PortfolioTabView />
            )}
            {activeTab === 'files' && (
              <FilesPage />
            )}
            {activeTab === 'settings' && (
              <SettingsPage
                onBack={() => setActiveTab('chat')}
                onNavigateToProfile={() => setActiveTab('profile')}
                onNavigateToNotifications={() => setActiveTab('notifications')}
                onNavigateToAppearance={() => setActiveTab('appearance')}
                onNavigateToLanguageRegion={() => setActiveTab('language_region')}
                onNavigateToInvestmentPreferences={() => setActiveTab('investment_preferences')}
              />
            )}
            {activeTab === 'profile' && (
              <ProfilePage onBack={() => setActiveTab('settings')} />
            )}
            {activeTab === 'notifications' && (
              <NotificationsPage onBack={() => setActiveTab('settings')} />
            )}
            {activeTab === 'appearance' && (
              <AppearancePage onBack={() => setActiveTab('settings')} />
            )}
            {activeTab === 'language_region' && (
              <LanguageRegionPage onBack={() => setActiveTab('settings')} />
            )}
            {activeTab === 'investment_preferences' && (
              <InvestmentPreferencesPage onBack={() => setActiveTab('settings')} />
            )}
            {activeTab === 'help' && (
              <HelpPage onBack={() => setActiveTab('chat')} />
            )}
            {activeTab === 'upgrade' && (
              <UpgradePage onBack={() => setActiveTab('chat')} />
            )}
            {activeTab === 'about' && (
              <AboutPage onBack={() => setActiveTab('chat')} />
            )}
            {activeTab === 'analysis' && activeProperty && (
              <PropertyAnalysisPage
                property={activeProperty}
                onBack={() => setActiveTab('chat')}
              />
            )}
            {/* Deal Analyzer now only uses Drawer - no duplicate page */}
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

        {/* Command Search */}
        <CommandSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          chatHistory={chatHistory}
          onLoadChat={(chatId) => {
            handleLoadChat(chatId);
            setActiveTab('chat');
          }}
          activeChatId={activeChatId || ''}
        />

        {/* Floating Search Button */}
      </div>
    </div>
  );
};

// Export as default
export default DesktopShell;
