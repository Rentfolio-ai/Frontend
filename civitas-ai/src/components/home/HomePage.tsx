import React from 'react';
import { ArrowRight } from 'lucide-react';
import { QuickActionsBar } from './QuickActionsBar';
import { PortfolioSummaryWidget } from './PortfolioSummaryWidget';
import { MarketAlertsWidget } from './MarketAlertsWidget';
import { RecentActivityWidget } from './RecentActivityWidget';
import { SavedPropertiesWidget } from './SavedPropertiesWidget';
import { TokenUsageWidget } from './TokenUsageWidget';
import { DealsOverviewWidget, type DealsPipeline } from './DealsOverviewWidget';
import { TeamsOverviewWidget, type TeamsSummary } from './TeamsOverviewWidget';
import { ReportsOverviewWidget, type ReportsSummary } from './ReportsOverviewWidget';
import { HomeGuideRail } from './HomeGuideRail';
import { HomeMetricsStrip } from './HomeMetricsStrip';
import { buildHomePriorityQueue, type HomePriorityTarget } from './homePriority';
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
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const defaultPipeline: DealsPipeline = { active: 0, under_contract: 0, closed: 0, lost: 0, total: 0 };
  const defaultTeams: TeamsSummary = { partnerCount: 0, sharedProperties: 0, unreadMessages: 0 };
  const defaultReports: ReportsSummary = { totalReports: 0, buySignals: 0 };
  const pipeline = dealsPipeline || defaultPipeline;
  const teams = teamsSummary || defaultTeams;
  const reports = reportsSummary || defaultReports;

  const priorities = buildHomePriorityQueue({
    pipeline,
    teams,
    reports,
    bookmarksCount: bookmarks.length,
    chatCount: chatHistory.length,
  }).slice(0, 3);

  const targetHandlers: Record<HomePriorityTarget, () => void> = {
    chat: onNavigateToChat,
    deals: onNavigateToDeals,
    reports: onNavigateToReports,
    teams: onNavigateToTeams,
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[#161619] overflow-x-hidden"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
    >
      <div className="max-w-[780px] mx-auto px-6 md:px-8 py-10 space-y-8">

        {/* ── Greeting ── */}
        <div>
          <h1 className="text-[28px] font-semibold text-white/92 leading-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-[13px] text-white/35 mt-1">{today}</p>
        </div>

        {/* ── Shortcuts ── */}
        <QuickActionsBar
          onNewAnalysis={onNewChat}
          onSearchDeals={onNavigateToDeals}
          onGenerateReport={onNavigateToReports}
          onVoiceChat={onNavigateToChat}
        />

        {/* ── Divider ── */}
        <div className="border-b border-white/[0.04]" />

        {/* ── Key Metrics ── */}
        <div>
          <HomeMetricsStrip
            pipeline={pipeline}
            teams={teams}
            reports={reports}
            watchlistCount={bookmarks.length}
          />
        </div>

        <div className="border-b border-white/[0.04]" />

        {/* ── Today Focus ── */}
        <div>
          <h2 className="text-[14px] font-medium text-white/50 mb-4">Today</h2>
          <div className="space-y-1">
            {priorities.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-2.5 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      item.urgency === 'high'
                        ? 'bg-red-400/70'
                        : item.urgency === 'medium'
                          ? 'bg-amber-400/70'
                          : 'bg-white/20'
                    }`}
                  />
                  <span className="text-[13px] text-white/75 truncate">{item.title}</span>
                </div>
                <button
                  onClick={targetHandlers[item.target]}
                  className="flex-shrink-0 inline-flex items-center gap-1 text-[12px] text-white/30 hover:text-[#C08B5C] whitespace-nowrap"
                >
                  {item.ctaLabel}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-white/[0.04]" />

        {/* ── Recent Activity ── */}
        <div>
          <h2 className="text-[14px] font-medium text-white/50 mb-4">Recent activity</h2>
          <RecentActivityWidget
            chatHistory={chatHistory}
            bookmarks={bookmarks}
            onViewAll={onNavigateToChat}
            showHeader={false}
          />
        </div>

        <div className="border-b border-white/[0.04]" />

        {/* ── Portfolio ── */}
        <div>
          <h2 className="text-[14px] font-medium text-white/50 mb-4">Portfolio</h2>
          <PortfolioSummaryWidget />
        </div>

        {/* ── Operations (compact) ── */}
        <div>
          <h2 className="text-[14px] font-medium text-white/50 mb-4">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <DealsOverviewWidget pipeline={pipeline} onViewAll={onNavigateToDeals} />
            <TeamsOverviewWidget summary={teams} onViewAll={onNavigateToTeams} />
            <ReportsOverviewWidget summary={reports} onViewAll={onNavigateToReports} />
          </div>
        </div>

        {/* ── Market ── */}
        <div>
          <h2 className="text-[14px] font-medium text-white/50 mb-4">Market pulse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MarketAlertsWidget />
            <SavedPropertiesWidget bookmarks={bookmarks} onViewAll={onNavigateToDeals} />
          </div>
        </div>

        <div className="border-b border-white/[0.04]" />

        {/* ── Learn ── */}
        <HomeGuideRail />

        <div className="border-b border-white/[0.04]" />

        {/* ── Usage ── */}
        <TokenUsageWidget onUpgrade={onNavigateToUpgrade} />

        <div className="h-6" />
      </div>
    </div>
  );
};
