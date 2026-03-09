// FILE: src/components/chat/tool-cards/VisionAnalysisCard.tsx
import React, { useState } from 'react';
import {
  AlertCircle, DollarSign, CheckCircle, ChevronDown, ChevronUp,
  Wrench, Eye, Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalyzePropertyImageOutput } from '../../../types/backendTools';

export interface VisionAnalysisData extends Partial<AnalyzePropertyImageOutput> {
  summary?: string;
  analysis_type?: string;
  room_type?: string;
}

interface VisionAnalysisCardProps {
  data: VisionAnalysisData;
}

const conditionStyles: Record<string, { bg: string; text: string; border: string }> = {
  excellent: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  good: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  fair: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  poor: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export const VisionAnalysisCard: React.FC<VisionAnalysisCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  // Handle error case
  if (data.success === false) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 my-2">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium text-sm">Analysis Failed</span>
        </div>
        {data.error && <p className="mt-1 text-xs text-red-400/70">{String(data.error)}</p>}
      </div>
    );
  }

  const condition = data.condition;
  const overallCondition = condition?.overall || 'unknown';
  const style = conditionStyles[overallCondition] || { bg: 'bg-black/5', text: 'text-muted-foreground', border: 'border-black/8' };
  const costs = data.renovation_costs;
  const hasValidCosts = costs && (
    (costs.basic_refresh?.total && costs.basic_refresh.total > 0) ||
    (costs.standard_rental?.total && costs.standard_rental.total > 0) ||
    (costs.premium_upgrade?.total && costs.premium_upgrade.total > 0)
  );

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4 my-2 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${style.bg}`}>
            <Camera className={`w-4 h-4 ${style.text}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Property Vision Analysis</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${style.bg} ${style.text} ${style.border}`}>
                <CheckCircle className="w-3 h-3" />
                {overallCondition}
              </span>
              {data.room_type && data.room_type !== 'auto' && (
                <span className="text-[11px] text-muted-foreground/70 capitalize">{data.room_type.replace('_', ' ')}</span>
              )}
              {data.analysis_type && (
                <span className="text-[11px] text-muted-foreground/50 capitalize">{data.analysis_type}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <p className="text-sm text-foreground/70 leading-relaxed">{data.summary}</p>
      )}

      {/* Cost Tiers */}
      {hasValidCosts && (
        <div className="grid grid-cols-3 gap-2">
          {costs!.basic_refresh?.total > 0 && (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-center">
              <p className="text-[10px] font-medium text-emerald-400/60 uppercase">Basic</p>
              <p className="text-sm font-bold text-emerald-400">${costs!.basic_refresh.total.toLocaleString()}</p>
            </div>
          )}
          {costs!.standard_rental?.total > 0 && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/15 text-center">
              <p className="text-[10px] font-medium text-amber-400/60 uppercase">Standard</p>
              <p className="text-sm font-bold text-amber-400">${costs!.standard_rental.total.toLocaleString()}</p>
            </div>
          )}
          {costs!.premium_upgrade?.total > 0 && (
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/15 text-center">
              <p className="text-[10px] font-medium text-violet-400/60 uppercase">Premium</p>
              <p className="text-sm font-bold text-violet-400">${costs!.premium_upgrade.total.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs font-medium text-[#C08B5C] hover:text-[#C08B5C]/80 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        {expanded ? 'Hide Details' : 'Show Details'}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Issues */}
            {condition && (
              <div className="space-y-2">
                {condition.structural_issues && condition.structural_issues.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1">Structural Issues</p>
                    {condition.structural_issues.map((issue: any, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        {issue.issue || issue.description}
                      </div>
                    ))}
                  </div>
                )}
                {condition.cosmetic_issues && condition.cosmetic_issues.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1">Cosmetic Issues</p>
                    {condition.cosmetic_issues.map((issue: any, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {issue.issue || issue.description}
                      </div>
                    ))}
                  </div>
                )}
                {condition.safety_concerns && condition.safety_concerns.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1">Safety Concerns</p>
                    {condition.safety_concerns.map((c: any, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        {c.concern || c.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cost Breakdown */}
            {hasValidCosts && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Cost Breakdown
                </p>
                {['basic_refresh', 'standard_rental', 'premium_upgrade'].map(tier => {
                  const tierData = costs![tier as keyof typeof costs] as any;
                  if (!tierData?.breakdown?.length) return null;
                  return (
                    <div key={tier} className="rounded-lg border border-black/[0.06] bg-black/[0.02] p-2.5">
                      <p className="text-[10px] font-medium text-muted-foreground/50 uppercase mb-1">{tier.replace('_', ' ')}</p>
                      {tierData.breakdown.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-muted-foreground">{item.category || item.description}</span>
                          <span className="text-foreground/70 font-medium">${(item.cost || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommendations */}
            {data.recommendations && data.recommendations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  Recommendations
                </p>
                {data.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      rec.priority === 'high' || rec.priority === 'critical' ? 'bg-red-400'
                        : rec.priority === 'medium' ? 'bg-amber-400'
                        : 'bg-green-400'
                    }`} />
                    <span className="text-muted-foreground">
                      {rec.action}
                      {rec.estimated_cost > 0 && (
                        <span className="text-muted-foreground/70 ml-1">(~${rec.estimated_cost.toLocaleString()})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
