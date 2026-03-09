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
      <div className="rounded-xl bg-black/[0.02] border border-black/[0.04] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Handshake className="w-4 h-4 text-[#C08B5C]/50" />
          <h3 className="text-[13px] font-semibold text-foreground/80">Partners</h3>
        </div>
        <p className="text-[12px] text-muted-foreground/50 mb-3">No partners yet. Set up your team to collaborate on deals.</p>
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
    <div className="rounded-xl bg-black/[0.02] border border-black/[0.04] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Handshake className="w-4 h-4 text-[#C08B5C]/50" />
          <h3 className="text-[13px] font-semibold text-foreground/80">Partners</h3>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground">
          View teams <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className="text-[28px] font-semibold text-foreground">{summary.partnerCount}</div>
        <div className="flex -space-x-2 mb-1.5">
          {Array.from({ length: Math.min(summary.partnerCount, 3) }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-black/[0.06] border-2 border-background flex items-center justify-center"
            >
              <span className="text-[8px] font-bold text-muted-foreground/70">{String.fromCharCode(65 + i)}</span>
            </div>
          ))}
          {summary.partnerCount > 3 && (
            <div className="w-6 h-6 rounded-full bg-black/[0.04] border-2 border-background flex items-center justify-center">
              <span className="text-[8px] font-bold text-muted-foreground/50">+{summary.partnerCount - 3}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/50">Shared properties</span>
          <span className="text-[12px] font-semibold text-muted-foreground">{summary.sharedProperties}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/50">Unread messages</span>
          <span className={`text-[12px] font-semibold ${summary.unreadMessages > 0 ? 'text-[#C08B5C]' : 'text-muted-foreground'}`}>
            {summary.unreadMessages}
          </span>
        </div>
      </div>
    </div>
  );
};
