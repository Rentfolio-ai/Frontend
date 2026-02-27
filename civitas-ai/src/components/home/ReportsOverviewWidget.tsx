import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';

export interface ReportsSummary {
  totalReports: number;
  buySignals: number;
}

interface ReportsOverviewWidgetProps {
  summary: ReportsSummary;
  onViewAll: () => void;
}

export const ReportsOverviewWidget: React.FC<ReportsOverviewWidgetProps> = ({ summary, onViewAll }) => {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C08B5C]/50" />
          <h3 className="text-[13px] font-semibold text-white/80">Reports</h3>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50">
          View reports <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="text-[28px] font-semibold text-white/90 mb-3">{summary.totalReports}</div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/30">Total reports</span>
          <span className="text-[12px] font-semibold text-white/60">{summary.totalReports}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/30">Buy signals</span>
          <span className="text-[12px] font-semibold text-emerald-400/70">{summary.buySignals}</span>
        </div>
      </div>
    </div>
  );
};
