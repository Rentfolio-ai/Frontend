import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { DealsPipeline } from './DealsOverviewWidget';
import type { TeamsSummary } from './TeamsOverviewWidget';
import type { ReportsSummary } from './ReportsOverviewWidget';

interface PipelineStripProps {
  pipeline: DealsPipeline;
  teams: TeamsSummary;
  reports: ReportsSummary;
  watchlistCount: number;
  onNavigateToDeals?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToTeams?: () => void;
}

interface StripItem {
  label: string;
  value: number;
  onClick?: () => void;
}

export const PipelineStrip: React.FC<PipelineStripProps> = ({
  pipeline,
  teams,
  reports,
  watchlistCount,
  onNavigateToDeals,
  onNavigateToReports,
  onNavigateToTeams,
}) => {
  const items: StripItem[] = [
    { label: 'Active Deals', value: pipeline.active, onClick: onNavigateToDeals },
    { label: 'Under Contract', value: pipeline.under_contract, onClick: onNavigateToDeals },
    { label: 'Closed', value: pipeline.closed, onClick: onNavigateToDeals },
    { label: 'Reports', value: reports.totalReports, onClick: onNavigateToReports },
    { label: 'Partners', value: teams.partnerCount, onClick: onNavigateToTeams },
    { label: 'Watchlist', value: watchlistCount },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          disabled={!item.onClick}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-left
            hover:bg-white/[0.03]
            disabled:cursor-default disabled:hover:bg-transparent
            group transition-colors duration-100"
        >
          <span className="text-[18px] font-bold text-white/[0.92] tabular-nums leading-none">
            {item.value}
          </span>
          <span className="text-[12px] text-white/45 group-hover:text-white/60">
            {item.label}
          </span>
          {item.onClick && (
            <ArrowRight className="w-3 h-3 text-white/10 group-hover:text-[#C08B5C] transition-colors duration-100" />
          )}
        </button>
      ))}
    </div>
  );
};

export { PipelineStrip as HomeMetricsStrip };
