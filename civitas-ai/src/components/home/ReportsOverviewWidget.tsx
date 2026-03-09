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
    <div className="rounded-xl bg-black/[0.02] border border-black/[0.04] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C08B5C]/50" />
          <h3 className="text-[13px] font-semibold text-foreground/80">Reports</h3>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground">
          View reports <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="text-[28px] font-semibold text-foreground mb-3">{summary.totalReports}</div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/50">Total reports</span>
          <span className="text-[12px] font-semibold text-muted-foreground">{summary.totalReports}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/50">Buy signals</span>
          <span className="text-[12px] font-semibold text-emerald-400/70">{summary.buySignals}</span>
        </div>
      </div>
    </div>
  );
};
