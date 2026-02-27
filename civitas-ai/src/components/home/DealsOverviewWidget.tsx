import React from 'react';
import { CircleDot, ArrowRight } from 'lucide-react';

export interface DealsPipeline {
  active: number;
  under_contract: number;
  closed: number;
  lost: number;
  total: number;
}

interface DealsOverviewWidgetProps {
  pipeline: DealsPipeline;
  onViewAll: () => void;
}

const STATUS_CONFIG = [
  { key: 'active', label: 'Active', color: 'text-blue-400', dot: 'bg-blue-400' },
  { key: 'under_contract', label: 'Under Contract', color: 'text-amber-400', dot: 'bg-amber-400' },
  { key: 'closed', label: 'Closed', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  { key: 'lost', label: 'Lost', color: 'text-red-400/60', dot: 'bg-red-400/60' },
] as const;

export const DealsOverviewWidget: React.FC<DealsOverviewWidgetProps> = ({ pipeline, onViewAll }) => {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-[#C08B5C]/50" />
          <h3 className="text-[13px] font-semibold text-white/80">Deal Pipeline</h3>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="text-[28px] font-semibold text-white/90 mb-3">{pipeline.total}</div>

      <div className="grid grid-cols-2 gap-2">
        {STATUS_CONFIG.map(({ key, label, color, dot }) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-[11px] text-white/30">{label}</span>
            <span className={`text-[12px] font-semibold ml-auto ${color}`}>
              {pipeline[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
