import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, FileText, Users } from 'lucide-react';
import { QuickActionsBar } from './QuickActionsBar';
import { PortfolioSummaryWidget } from './PortfolioSummaryWidget';
import { MarketAlertsWidget } from './MarketAlertsWidget';
import { RecentActivityWidget } from './RecentActivityWidget';
import { SavedPropertiesWidget } from './SavedPropertiesWidget';
import { TokenUsageWidget } from './TokenUsageWidget';
import { DealsOverviewWidget, type DealsPipeline } from './DealsOverviewWidget';
import { TeamsOverviewWidget, type TeamsSummary } from './TeamsOverviewWidget';
import { ReportsOverviewWidget, type ReportsSummary } from './ReportsOverviewWidget';
import { AmbientBackground } from '../ui/AmbientBackground';
import type { ChatSession } from '../../hooks/useDesktopShell';
import type { BookmarkedProperty } from '../../types/bookmarks';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface HomePageProps {
  userName?: string;
  chatHistory: ChatSession[];
  bookmarks: BookmarkedProperty[];
  dealsPipeline?: DealsPipeline;
  teamsSummary?: TeamsSummary;
  reportsSummary?: ReportsSummary;
  onNavigateToChat: () => void;
  onNavigateToDeals: () => void;
  onNavigateToReports: () => void;
  onNavigateToTeams: () => void;
  onNavigateToUpgrade: () => void;
  onNewChat: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userName,
  chatHistory,
  bookmarks,
  dealsPipeline,
  teamsSummary,
  reportsSummary,
  onNavigateToChat,
  onNavigateToDeals,
  onNavigateToReports,
  onNavigateToTeams,
  onNavigateToUpgrade,
  onNewChat,
}) => {
  const firstName = userName || 'there';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const defaultPipeline: DealsPipeline = { active: 0, under_contract: 0, closed: 0, lost: 0, total: 0 };
  const defaultTeams: TeamsSummary = { partnerCount: 0, sharedProperties: 0, unreadMessages: 0 };
  const defaultReports: ReportsSummary = { totalReports: 0, buySignals: 0 };
  const pipeline = dealsPipeline || defaultPipeline;
  const teams = teamsSummary || defaultTeams;
  const reports = reportsSummary || defaultReports;

  const contextHint = pipeline.total === 0
    ? 'Start by searching deals and save your first property.'
    : reports.totalReports === 0
      ? 'You have saved deals. Generate your first report to compare options.'
      : teams.partnerCount === 0
        ? 'Invite a partner to collaborate on live deals.'
        : 'You are all set. Continue from your top priority below.';

  return (
    <div className="h-full overflow-y-auto bg-[#161619] relative overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
      <AmbientBackground variant="home" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto px-6 py-6 space-y-6 relative z-10"
      >

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-lg font-bold gradient-text">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-[12px] text-white/35">{today}</p>
        </div>

        {/* Sticky Action Rail */}
        <div className="sticky top-0 z-20 pt-1">
          <div className="rounded-xl border border-white/[0.06] bg-[#1b1b20]/90 backdrop-blur-md px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={onNewChat}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C08B5C]/20 border border-[#C08B5C]/30 text-[#E2B491] text-[13px] font-semibold hover:bg-[#C08B5C]/25 transition-colors"
              >
                Start analysis <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={onNavigateToDeals}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Deals
                </button>
                <button
                  onClick={onNavigateToReports}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Reports
                </button>
                <button
                  onClick={onNavigateToTeams}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                >
                  <Users className="w-3.5 h-3.5" /> Teams
                </button>
              </div>
            </div>
            <p className="text-[11px] text-white/35 mt-2">{contextHint}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsBar
          onNewAnalysis={onNewChat}
          onSearchDeals={onNavigateToDeals}
          onGenerateReport={onNavigateToReports}
          onVoiceChat={onNavigateToChat}
        />

        {/* Today Overview */}
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] text-white/30 font-medium">Today overview</span>
            <span className="text-[10px] text-white/20 uppercase tracking-widest">Live</span>
          </div>
          <PortfolioSummaryWidget />
        </div>

        {/* Overview */}
        <div>
          <span className="text-[12px] text-white/30 font-medium">Overview</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            <DealsOverviewWidget pipeline={pipeline} onViewAll={onNavigateToDeals} />
            <TeamsOverviewWidget summary={teams} onViewAll={onNavigateToTeams} />
            <ReportsOverviewWidget summary={reports} onViewAll={onNavigateToReports} />
          </div>
        </div>

        {/* Activity */}
        <div>
          <span className="text-[12px] text-white/30 font-medium">Activity</span>
          <div className="mt-2">
            <RecentActivityWidget chatHistory={chatHistory} bookmarks={bookmarks} onViewAll={onNavigateToChat} />
          </div>
        </div>

        {/* Market */}
        <div>
          <span className="text-[12px] text-white/30 font-medium">Market</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <MarketAlertsWidget />
            <SavedPropertiesWidget bookmarks={bookmarks} onViewAll={onNavigateToDeals} />
          </div>
        </div>

        {/* Usage */}
        <div>
          <span className="text-[12px] text-white/30 font-medium">Usage</span>
          <div className="mt-2">
            <TokenUsageWidget onUpgrade={onNavigateToUpgrade} />
          </div>
        </div>

        <div className="h-8" />
      </motion.div>
    </div>
  );
};
