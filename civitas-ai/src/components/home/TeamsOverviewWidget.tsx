import React from 'react';
import { Handshake, ArrowRight } from 'lucide-react';

export interface TeamsSummary {
  partnerCount: number;
  sharedProperties: number;
  unreadMessages: number;
}

interface TeamsOverviewWidgetProps {
  summary: TeamsSummary;
  onViewAll: () => void;
}

export const TeamsOverviewWidget: React.FC<TeamsOverviewWidgetProps> = ({ summary, onViewAll }) => {
  const hasTeamData = summary.partnerCount > 0;

  if (!hasTeamData) {
    return (
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Handshake className="w-4 h-4 text-[#C08B5C]/50" />
          <h3 className="text-[13px] font-semibold text-white/80">Partners</h3>
        </div>
        <p className="text-[12px] text-white/30 mb-3">No partners yet. Set up your team to collaborate on deals.</p>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1.5 text-[12px] font-medium text-[#C08B5C]/70 hover:text-[#C08B5C]"
        >
          Set up your team <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Handshake className="w-4 h-4 text-[#C08B5C]/50" />
          <h3 className="text-[13px] font-semibold text-white/80">Partners</h3>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50">
          View teams <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className="text-[28px] font-semibold text-white/90">{summary.partnerCount}</div>
        <div className="flex -space-x-2 mb-1.5">
          {Array.from({ length: Math.min(summary.partnerCount, 3) }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-white/[0.08] border-2 border-[#1E1C1A] flex items-center justify-center"
            >
              <span className="text-[8px] font-bold text-white/40">{String.fromCharCode(65 + i)}</span>
            </div>
          ))}
          {summary.partnerCount > 3 && (
            <div className="w-6 h-6 rounded-full bg-white/[0.05] border-2 border-[#1E1C1A] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white/25">+{summary.partnerCount - 3}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/30">Shared properties</span>
          <span className="text-[12px] font-semibold text-white/60">{summary.sharedProperties}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/30">Unread messages</span>
          <span className={`text-[12px] font-semibold ${summary.unreadMessages > 0 ? 'text-[#C08B5C]' : 'text-white/60'}`}>
            {summary.unreadMessages}
          </span>
        </div>
      </div>
    </div>
  );
};
