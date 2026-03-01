import React from 'react';
import type { DealsPipeline } from './DealsOverviewWidget';
import type { TeamsSummary } from './TeamsOverviewWidget';
import type { ReportsSummary } from './ReportsOverviewWidget';

interface HomeMetricsStripProps {
  pipeline: DealsPipeline;
  teams: TeamsSummary;
  reports: ReportsSummary;
  watchlistCount: number;
}

interface MetricItem {
  label: string;
  value: string;
}

export const HomeMetricsStrip: React.FC<HomeMetricsStripProps> = ({
  pipeline,
  teams,
  reports,
  watchlistCount,
}) => {
  const metrics: MetricItem[] = [
    { label: 'Pipeline', value: String(pipeline.total) },
    { label: 'Reports', value: String(reports.totalReports) },
    { label: 'Partners', value: String(teams.partnerCount) },
    { label: 'Watchlist', value: String(watchlistCount) },
  ];

  return (
    <div className="flex items-baseline gap-8 flex-wrap">
      {metrics.map((m) => (
        <div key={m.label} className="flex items-baseline gap-2.5">
          <span className="text-[22px] font-semibold text-white/88 tabular-nums leading-none">
            {m.value}
          </span>
          <span className="text-[12px] text-white/35">{m.label}</span>
        </div>
      ))}
    </div>
  );
};
