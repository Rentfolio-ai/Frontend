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

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDesktopShell, type TabType } from '../hooks/useDesktopShell';
import { useThemeState } from '../hooks/useThemeState';

import { useToast } from '../hooks/useToast';
import { usePropertyBookmarks } from '../hooks/usePropertyBookmarks';
import { useSavedReports } from '../hooks/useSavedReports';
import { ToastContainer } from '../components/primitives/Toast';
import { ReportsPage } from '../components/reports/ReportsPage';

import { CommandCenterChatView } from '../components/desktop-shell/CommandCenterChatView';
import { SimpleSidebar } from '../components/desktop-shell/SimpleSidebar';
import { CommandSearch } from '../components/desktop-shell/CommandSearch';
import { FloatingAIChat } from '../components/common/FloatingAIChat';
import { PropertyAnalysisPage } from '../components/pages/PropertyAnalysisPage';
import { DealAnalyzerDrawer } from '../components/analysis';
import { ReportDrawer } from '../components/reports';
import { ReportBillingModal } from '../components/reports/ReportBillingModal';
import { useSubscription } from '../hooks/useSubscription';
import { OnboardingTour } from '../components/onboarding';
import { hasCompletedOnboarding } from '../services/onboardingApi';
import type { ScoutedProperty } from '../types/backendTools';
import type { PageContextData } from '../types/chat';
import { FilesPage } from '../components/files/FilesPage';
import { SettingsPage } from '../components/pages/SettingsPage';
import { HelpPopup } from '../components/help/HelpPopup';
import { UpgradePage } from '../components/pages/UpgradePage';
import { AboutPage } from '../components/pages/AboutPage';
import { ProfilePage } from '../components/pages/ProfilePage';
import { NotificationsPage } from '../components/pages/NotificationsPage';
import { AppearancePage } from '../components/pages/AppearancePage';
import { LanguageRegionPage } from '../components/pages/LanguageRegionPage';
import { InvestmentPreferencesPage } from '../components/pages/InvestmentPreferencesPage';
// ContactSupportPage replaced by HelpPopup
import { PrivacySecurityPage } from '../components/pages/PrivacySecurityPage';
import { IntegrationsPage } from '../components/pages/IntegrationsPage';
import { MarketplacePage } from '@/components/marketplace/MarketplacePage';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { usePreferencesStore } from '../stores/preferencesStore';
import { subscriptionService } from '../services/subscriptionService';
import { HomePage } from '../components/home/HomePage';
import { DealsPage } from '../components/deals/DealsPage';
import { TeamsPage } from '../components/teams/TeamsPage';
import { InboxPage } from '../components/inbox/InboxPage';
import { useAutopilotWand } from '../hooks/useAutopilotWand';
import { useAppStateBridge } from '../hooks/useAppStateBridge';
import { WandCursorOverlay } from '../components/wand/WandCursorOverlay';

interface DesktopShellProps {
  children?: React.ReactNode;
}




const ONBOARDING_STORAGE_KEY = 'vasthu-onboarding-completed';
const JUST_LOGGED_IN_KEY = 'vasthu-just-logged-in';


export const DesktopShell: React.FC<DesktopShellProps> = () => {
  const { user } = useAuth();
  const { toasts, closeToast, success, error } = useToast();
  const { isPro, isFree, remaining } = useSubscription();

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [showIntegrationsPopup, setShowIntegrationsPopup] = useState(false);

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
    openReportDrawer: _openReportDrawer,
    closeReportDrawer,
    generateReportWithType,
    reportBilling,
    confirmReportBilling,
    cancelReportBilling,
    // Thinking state
    thinking,
    completedTools,
    reasoningSteps,
    nativeThinkingText,
    reasoningText,
    thinkingQueue,
    activeModelLabel,
    reasoningEffort,
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
    // Model selection
    selectedModel,
    setSelectedModel,
    // Voice mode
    handleVoiceTurn,
    handleVoiceStart,
    // Communication
    handleSendComplete,
  } = useDesktopShell();

  // Preferred start page: set active tab on first mount based on user preference (or force home after just logged in)
  const preferredStartPage = usePreferencesStore(s => s.preferredStartPage);
  const startPageAppliedRef = React.useRef(false);
  useEffect(() => {
    if (!startPageAppliedRef.current) {
      const justLoggedIn = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(JUST_LOGGED_IN_KEY);
      if (justLoggedIn) {
        sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
        setActiveTab('home');
        startPageAppliedRef.current = true;
        return;
      }
      if (preferredStartPage) {
        const validPages: TabType[] = ['home', 'deals', 'chat', 'marketplace'];
        if (validPages.includes(preferredStartPage as TabType)) {
          setActiveTab(preferredStartPage as TabType);
        }
      }
      startPageAppliedRef.current = true;
    }
  }, [preferredStartPage, setActiveTab]);

  console.log('[DesktopShell] Render state:', {
    activeTab,
    hasActiveProperty: !!activeProperty,
    hasPinHandler: !!handlePinChat,
    hasArchiveHandler: !!handleArchiveChat
  });

  const { selectedState } = useThemeState();

  // Track focused block/item for contextual AI (Notion-style)
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  // Track scroll direction for hamburger button visibility
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  // Toggle temporary chat mode
  const handleToggleTemporary = useCallback(() => {
    setIsCurrentChatTemporary(prev => !prev);
  }, [setIsCurrentChatTemporary]);

  // Token pack purchase (Pro users only)
  const handleBuyTokenPack = useCallback(async () => {
    try {
      await subscriptionService.purchaseTokenPack();
    } catch (err) {
      console.error('[DesktopShell] Token pack purchase failed:', err);
      error('Failed to start token pack purchase. Please try again.');
    }
  }, [error]);

  // Handle Stripe return URL params (token pack success / subscription success)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'token_pack_success') {
      success('Token pack purchased! Your balance has been updated.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'success') {
      success('Subscription activated! Welcome to Pro.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [success]);

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

  // Saved reports - now fetches from backend API (must be above wand hook)
  const {
    reports: savedReports,
    refreshReports,
  } = useSavedReports();

  // App State Bridge for Wand
  const { getSnapshot, getUserPreferences } = useAppStateBridge({
    activeTab,
    currentMode,
    isStreaming: isLoading,
    messages,
    bookmarkCount: bookmarks.length,
    reportsCount: savedReports.length,
  });

  // Wand: readDeals — summarize bookmarks as deals
  const wandReadDeals = useCallback(() => {
    const pipeline = { active: 0, under_contract: 0, closed: 0, lost: 0 };
    const deals = bookmarks.map(b => {
      const s = b.dealStatus || 'active';
      if (s in pipeline) pipeline[s as keyof typeof pipeline]++;
      return { name: b.displayName, price: b.property.price || 0, status: s };
    });
    return { total: bookmarks.length, ...pipeline, deals };
  }, [bookmarks]);

  // Wand: readPortfolio — surface portfolio dashboard metrics
  const wandReadPortfolio = useCallback(() => {
    return { totalValue: 0, cashflow: 0, capRate: 0, propertyCount: bookmarks.length };
  }, [bookmarks]);

  // Autopilot Wand — chat-only (no direct API calls)
  const { wand: wandState, activateWand, deactivateWand } = useAutopilotWand({
    userId: user?.id || user?.email || 'dev-user-123',
    mode: currentMode,
    sendMessage: sendMessageWithStream,
    setActiveTab,
    setCurrentMode,
    handleNewChat,
    isStreaming: isLoading,
    messages,
    bookmarkCount: bookmarks.length,
    getSnapshot,
    getUserPreferences,
    // Tier 4: Read local state
    readDeals: wandReadDeals,
    readPortfolio: wandReadPortfolio,
    savedReports: savedReports.map(r => ({
      report_id: r.report_id || '',
      property_address: r.property_address || '',
      recommendation: r.recommendation || '',
      report_type: r.report_type || '',
    })),
  });

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

  // Compute summary data for Home page overview widgets
  const dealsPipeline = useMemo(() => {
    const pipeline = { active: 0, under_contract: 0, closed: 0, lost: 0, total: bookmarks.length };
    for (const b of bookmarks) {
      const status = b.dealStatus || 'active';
      if (status in pipeline) pipeline[status as keyof typeof pipeline]++;
    }
    return pipeline;
  }, [bookmarks]);

  const reportsSummary = useMemo(() => {
    const buySignals = savedReports.filter(r =>
      r.recommendation?.toLowerCase().includes('buy')
    ).length;
    return { totalReports: savedReports.length, buySignals };
  }, [savedReports]);

  const teamsSummary = useMemo(() => ({
    partnerCount: 0,
    sharedProperties: 0,
    unreadMessages: 0,
  }), []);





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
    setActiveTab(redirectTab || 'home');
  }, [setActiveTab]);

  // Handle onboarding skip
  const handleOnboardingSkip = useCallback((redirectTab?: TabType) => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
    setActiveTab(redirectTab || 'home');
  }, [setActiveTab]);

  // Listen for navigation events from chat
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { tab } = event.detail as { tab?: string };
      let targetTab: TabType = 'home';
      if (tab === 'reports') targetTab = 'reports';
      else if (tab === 'chat') targetTab = 'chat';
      else if (tab === 'deals') targetTab = 'deals';
      else if (tab === 'inbox') targetTab = 'inbox';
      else if (tab === 'home') targetTab = 'home';
      setActiveTab(targetTab);
    };

    window.addEventListener('navigate-to-tab', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate as EventListener);
  }, [setActiveTab]);

  // Listen for block-level focus events for contextual AI
  useEffect(() => {
    const handleFocusItem = (event: CustomEvent) => {
      const { id } = event.detail as { id: string | null };
      setFocusedItemId(id);
    };

    window.addEventListener('set-focus-item', handleFocusItem as EventListener);
    return () => window.removeEventListener('set-focus-item', handleFocusItem as EventListener);
  }, []);

  // Navigation menu items - Always include Property Analysis

  // Build rich context payload for the global floating AI chat
  const buildPageContext = (): PageContextData => {
    let data: Record<string, unknown> = {};
    switch (activeTab) {
      case 'home':
        data = { pipelineStats: dealsPipeline };
        break;
      case 'deals':
        data = { bookmarkedDeals: bookmarks };
        break;
      case 'analysis':
        data = { activeProperty: activeProperty };
        break;
      case 'portfolio':
        data = {
          totalProperties: bookmarks.length,
          dealsPipeline,
          topStatus: Object.entries(dealsPipeline)
            .filter(([k]) => k !== 'total')
            .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'none',
        };
        break;
      case 'marketplace':
        data = {
          summary: 'User is browsing the marketplace for off-market and listed properties.',
        };
        break;
      case 'reports':
        data = {
          totalReports: savedReports.length,
          buySignals: reportsSummary.buySignals,
          recentReports: savedReports.slice(0, 5).map(r => ({
            title: r.property_address || 'Untitled',
            date: r.created_at,
            recommendation: r.recommendation,
          })),
        };
        break;
      case 'teams':
        data = {
          partnerCount: teamsSummary.partnerCount,
          sharedProperties: teamsSummary.sharedProperties,
          unreadMessages: teamsSummary.unreadMessages,
        };
        break;
    }

    return {
      page: activeTab,
      focusedItemId: focusedItemId || undefined,
      data,
    };
  };

  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Simple Left Sidebar with integrated chat history */}
      <SimpleSidebar
        onNewChat={() => {
          handleNewChat();
          setActiveTab('chat');
        }}
        onHomeClick={() => setActiveTab('home')}
        onDealsClick={() => setActiveTab('deals')}
        onTeamsClick={() => setActiveTab('teams')}
        onInboxClick={() => setActiveTab('inbox')}
        onChatClick={() => { handleNewChat(); setActiveTab('chat'); }}
        onMarketplaceClick={() => setActiveTab('marketplace')}
        onAnalyticsClick={() => setActiveTab('portfolio')}
        onReportsClick={() => setActiveTab('reports')}
        onSettingsClick={() => setActiveTab('settings')}
        onHelpClick={() => setShowHelpPopup(true)}
        onUpgradeClick={() => setActiveTab('upgrade')}
        onAboutClick={() => setActiveTab('about')}
        activeTab={activeTab}
        chatHistory={chatHistory}
        activeChatId={activeChatId || ''}
        onLoadChat={handleLoadChat}
        onDeleteChat={(id: string, e: React.MouseEvent) => {
          e.stopPropagation();
          handleDeleteChat(id);
        }}
        onPinChat={(id: string, e: React.MouseEvent) => {
          e.stopPropagation();
          handlePinChat(id);
        }}
        onArchiveChat={(id: string, e: React.MouseEvent) => {
          e.stopPropagation();
          handleArchiveChat(id);
        }}
        hideHamburger={activeTab === 'chat' && isScrollingDown}
        isCurrentChatTemporary={isCurrentChatTemporary}
      />

      {/* Content layer with left padding for sidebar */}
      <div className="relative z-10 h-full flex flex-col pl-12">

        {/* Main Content Area - Full height */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'home' && (
              <ErrorBoundary pageName="Home">
                <HomePage
                  userName={user?.name?.split(' ')[0]}
                  chatHistory={chatHistory}
                  bookmarks={bookmarks}
                  dealsPipeline={dealsPipeline}
                  teamsSummary={teamsSummary}
                  reportsSummary={reportsSummary}
                  onNavigateToChat={() => setActiveTab('chat')}
                  onNavigateToDeals={() => setActiveTab('deals')}
                  onNavigateToReports={handleNavigateToReportsAndRefresh}
                  onNavigateToTeams={() => setActiveTab('teams')}
                  onNavigateToUpgrade={() => setActiveTab('upgrade')}
                  onNewChat={() => { handleNewChat(); setActiveTab('chat'); }}
                />
              </ErrorBoundary>
            )}
            {activeTab === 'deals' && (
              <ErrorBoundary pageName="Deals">
                <DealsPage
                  bookmarks={bookmarks}
                  onViewProperty={(property) => {
                    handleViewPropertyDetails(property);
                    setActiveTab('analysis');
                  }}
                  onAnalyzeProperty={(property) => {
                    setActiveTab('chat');
                    setTimeout(() => {
                      sendMessageWithStream(
                        `Analyze this investment property for deal viability:\n\nAddress: ${property.address}\nCity: ${property.city}, ${property.state}\nPrice: $${property.price.toLocaleString()}${property.bedrooms ? `\nBedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms}` : ''}\n\nRun full hunter pipeline: check deal killers, comparable sales, cash flow analysis, and give me a Buy/Negotiate/Pass verdict.`
                      );
                    }, 150);
                  }}
                  onBookmarkProperty={handleToggleBookmark}
                  onBack={() => setActiveTab('home')}
                />
              </ErrorBoundary>
            )}
            {activeTab === 'teams' && (
              <ErrorBoundary pageName="Teams">
                <TeamsPage onBack={() => setActiveTab('home')} />
              </ErrorBoundary>
            )}
            {activeTab === 'inbox' && (
              <ErrorBoundary pageName="Inbox">
                <InboxPage onBack={() => setActiveTab('home')} />
              </ErrorBoundary>
            )}
            {activeTab === 'chat' && (() => {
              const activeChat = chatHistory.find(c => c.id === activeChatId);
              return (
                <CommandCenterChatView
                  messages={messages}
                  isLoading={isLoading}
                  userName={user?.name?.split(' ')[0]}
                  userAvatar={user?.avatar}
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
                  onNavigateToUpgrade={() => setActiveTab('upgrade')}
                  onOpenSidebar={() => setIsSidebarOpen(true)}
                  onNewChat={handleNewChat}
                  thinking={thinking}
                  completedTools={completedTools}
                  reasoningSteps={reasoningSteps}
                  thinkingSteps={thinkingQueue?.steps}
                  thinkingIsActive={thinkingQueue?.isActive}
                  thinkingIsDone={thinkingQueue?.isDone}
                  thinkingElapsed={thinkingQueue?.elapsedSeconds}
                  nativeThinkingText={nativeThinkingText}
                  reasoningText={reasoningText}
                  activeModelLabel={activeModelLabel}
                  reasoningEffort={reasoningEffort}
                  onRefresh={handleRegenerate}
                  onViewDetails={handleViewPropertyDetails}
                  onCancel={cancelStream}
                  error={streamError}
                  onEditMessage={handleEditMessage}
                  onNavigateBranch={handleNavigateBranch}
                  chatTitle={activeChat?.title}
                  chatId={activeChatId || undefined}
                  onPinChat={(chatId) => handlePinChat(chatId)}
                  onArchiveChat={(chatId) => handleArchiveChat(chatId)}
                  onDeleteChat={(chatId) => handleDeleteChat(chatId)}
                  isPinned={activeChat?.isPinned}
                  onScrollDirectionChange={setIsScrollingDown}
                  isTemporary={isCurrentChatTemporary}
                  onToggleTemporary={handleToggleTemporary}
                  onNavigateToTeams={() => setActiveTab('teams')}
                  commandCenter={commandCenter}
                  selectProperty={selectProperty}
                  addToComparisonDock={addToComparisonDock}
                  removeFromComparisonDock={removeFromComparisonDock}
                  clearComparisonDock={clearComparisonDock}
                  startComparison={startComparison}
                  togglePanePin={togglePanePin}
                  currentMode={currentMode}
                  onModeChange={setCurrentMode}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  onVoiceTurn={handleVoiceTurn}
                  onVoiceStart={handleVoiceStart}
                  conversationId={activeChatId || undefined}
                  onOpenIntegrations={() => setShowIntegrationsPopup(true)}
                  onSendComplete={handleSendComplete}
                  onBuyTokenPack={handleBuyTokenPack}
                  wandState={wandState}
                  onActivateWand={activateWand}
                  onDeactivateWand={deactivateWand}
                />
              );
            })()}
            {activeTab === 'marketplace' && (
              <ErrorBoundary pageName="Marketplace">
                <MarketplacePage
                  onStartChat={(context: { name: string; specialty: string; category: string } | null) => {
                    setActiveTab('chat');
                    if (context) {
                      setTimeout(() => {
                        sendMessageWithStream(`I'd like to connect with ${context.name} (${context.specialty})`);
                      }, 150);
                    }
                  }}
                  onStartVoice={() => {
                    setActiveTab('chat');
                  }}
                  onStartEmail={(ctx: { name: string; email: string; category: string; specialty: string }) => {
                    setActiveTab('chat');
                    setTimeout(() => {
                      sendMessageWithStream(
                        `Draft an email to ${ctx.name} (${ctx.email}), a ${ctx.category.replace(/_/g, ' ')} specializing in ${ctx.specialty}. Keep it professional and concise.`
                      );
                    }, 150);
                  }}
                  onStartText={(ctx: { name: string; phone: string; category: string; specialty: string }) => {
                    setActiveTab('chat');
                    setTimeout(() => {
                      sendMessageWithStream(
                        `Draft a text message to ${ctx.name} at ${ctx.phone}, a ${ctx.category.replace(/_/g, ' ')} specializing in ${ctx.specialty}. Keep it brief and friendly.`
                      );
                    }, 150);
                  }}
                  onStartCall={(professional: { name: string; phone?: string; category: string }) => {
                    setActiveTab('chat');
                    setTimeout(() => {
                      sendMessageWithStream(
                        `I'd like to make a voice call to ${professional.name} at ${professional.phone}. They're a ${professional.category.replace(/_/g, ' ')}. Please help me prepare talking points.`
                      );
                    }, 150);
                  }}
                  onBack={() => setActiveTab('home')}
                />
              </ErrorBoundary>
            )}
            {activeTab === 'reports' && (
              <ErrorBoundary pageName="Reports">
                <ReportsPage onNavigateToChat={() => setActiveTab('chat')} onBack={() => setActiveTab('home')} />
              </ErrorBoundary>
            )}

            {activeTab === 'files' && (
              <ErrorBoundary pageName="Files">
                <FilesPage />
              </ErrorBoundary>
            )}
            {activeTab === 'settings' && (
              <ErrorBoundary pageName="Settings">
                <SettingsPage
                  onBack={() => setActiveTab('home')}
                  onNavigateToProfile={() => setActiveTab('profile')}
                  onNavigateToNotifications={() => setActiveTab('notifications')}
                  onNavigateToAppearance={() => setActiveTab('appearance')}
                  onNavigateToLanguageRegion={() => setActiveTab('language_region')}
                  onNavigateToInvestmentPreferences={() => setActiveTab('investment_preferences')}
                  onNavigateToPrivacySecurity={() => setActiveTab('privacy_security')}
                />
              </ErrorBoundary>
            )}
            {activeTab === 'profile' && (
              <ErrorBoundary pageName="Profile">
                <ProfilePage onBack={() => setActiveTab('settings')} />
              </ErrorBoundary>
            )}
            {activeTab === 'notifications' && (
              <ErrorBoundary pageName="Notifications">
                <NotificationsPage onBack={() => setActiveTab('settings')} />
              </ErrorBoundary>
            )}
            {activeTab === 'appearance' && (
              <ErrorBoundary pageName="Appearance">
                <AppearancePage onBack={() => setActiveTab('settings')} />
              </ErrorBoundary>
            )}
            {activeTab === 'language_region' && (
              <ErrorBoundary pageName="Language & Region">
                <LanguageRegionPage onBack={() => setActiveTab('settings')} />
              </ErrorBoundary>
            )}
            {activeTab === 'investment_preferences' && (
              <ErrorBoundary pageName="Investment Preferences">
                <InvestmentPreferencesPage onBack={() => setActiveTab('settings')} />
              </ErrorBoundary>
            )}
            {activeTab === 'privacy_security' && (
              <ErrorBoundary pageName="Privacy & Security">
                <PrivacySecurityPage onBack={() => setActiveTab('settings')} />
              </ErrorBoundary>
            )}
            {/* Integrations + Help rendered as overlays below */}
            {activeTab === 'upgrade' && (
              <ErrorBoundary pageName="Upgrade">
                <UpgradePage onBack={() => setActiveTab('home')} />
              </ErrorBoundary>
            )}
            {activeTab === 'about' && (
              <ErrorBoundary pageName="About">
                <AboutPage onBack={() => setActiveTab('home')} />
              </ErrorBoundary>
            )}
            {activeTab === 'analysis' && activeProperty && (
              <ErrorBoundary pageName="Property Analysis">
                <PropertyAnalysisPage
                  property={activeProperty}
                  onBack={() => setActiveTab('deals')}
                />
              </ErrorBoundary>
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

        {/* Report Billing Confirmation */}
        {reportBilling.isOpen && (
          <ReportBillingModal
            isPro={isPro}
            isFree={isFree}
            onConfirm={confirmReportBilling}
            onClose={cancelReportBilling}
            onUpgrade={() => { cancelReportBilling(); setActiveTab('upgrade'); }}
            freeReportsRemaining={remaining('reports')}
          />
        )}

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

        {/* Help Popup */}
        <HelpPopup
          isOpen={showHelpPopup}
          onClose={() => setShowHelpPopup(false)}
        />

        {/* Integrations Popup */}
        <IntegrationsPage
          isOpen={showIntegrationsPopup}
          onClose={() => setShowIntegrationsPopup(false)}
        />


        {/* Universal Floating AI Chat for Non-Chat Pages */}
        {activeTab !== 'chat' && (
          <FloatingAIChat
            pageContext={buildPageContext()}
            onExpandToFullChat={(query) => {
              setActiveTab('chat');
              if (query) {
                setTimeout(() => sendMessageWithStream(query), 300);
              }
            }}
            messages={messages}
            isStreaming={isLoading}
            thinking={thinking}
            error={streamError}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onSendMessage={sendMessageWithStream}
            onNewChat={handleNewChat}
            completedTools={completedTools}
            thinkingSteps={thinkingQueue?.steps}
            thinkingIsActive={thinkingQueue?.isActive}
            thinkingIsDone={thinkingQueue?.isDone}
            thinkingElapsed={thinkingQueue?.elapsedSeconds}
            nativeThinkingText={nativeThinkingText}
            reasoningText={reasoningText}
            onAction={handleAction}
          />
        )}

        {/* Floating Search Button */}
      </div>

      {/* Wand Cursor Overlay — rendered at root level to float over entire app */}
      {wandState.isActive && (
        <WandCursorOverlay
          targetElementId={wandState.targetElementId}
          actionLabel={wandState.statusText}
          status={wandState.status}
          isVisible={wandState.isActive}
          confidence={wandState.confidence}
          currentStep={wandState.currentStep}
          estimatedTotal={wandState.estimatedTotal}
        />
      )}
    </div>
  );
};

// Export as default
export default DesktopShell;
