/**
 * CostBreakdown — Three-tier renovation cost display
 *
 * Shows Basic / Standard / Premium cost tiers with gradient
 * bar visualization and optional individual repair line items.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DollarSign } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────

interface RepairEstimate {
  category: string;
  repair_type: string;
  description: string;
  quantity: number;
  unit: string;
  basic_cost: number;
  standard_cost: number;
  premium_cost: number;
}

interface CostBreakdownProps {
  basicCost: number;
  standardCost: number;
  premiumCost: number;
  repairs?: RepairEstimate[];
  region?: string;
  /** Start expanded */
  defaultExpanded?: boolean;
  /** Compact mode for cards */
  compact?: boolean;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Cost Bar ───────────────────────────────────────────────

const CostBar: React.FC<{
  label: string;
  value: number;
  maxValue: number;
  color: string;
  delay: number;
}> = ({ label, value, maxValue, color, delay }) => {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/35 uppercase tracking-wider font-medium">
          {label}
        </span>
        <span className={`text-sm font-semibold ${color}`}>
          {formatCurrency(value)}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: [0.33, 1, 0.68, 1] }}
          className={`h-full rounded-full ${
            color.includes('blue') ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
            color.includes('violet') ? 'bg-gradient-to-r from-violet-600 to-violet-400' :
            'bg-gradient-to-r from-amber-600 to-amber-400'
          }`}
        />
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────

export const CostBreakdown: React.FC<CostBreakdownProps> = ({
  basicCost,
  standardCost,
  premiumCost,
  repairs = [],
  region,
  defaultExpanded = false,
  compact = false,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const maxCost = premiumCost || standardCost || basicCost || 1;

  if (compact) {
    // Compact inline: just the three values
    return (
      <div className={`grid grid-cols-3 gap-2 ${className}`}>
        {[
          { label: 'Basic', value: basicCost, color: 'text-blue-400' },
          { label: 'Standard', value: standardCost, color: 'text-violet-400' },
          { label: 'Premium', value: premiumCost, color: 'text-amber-400' },
        ].map(tier => (
          <div
            key={tier.label}
            className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.03]"
          >
            <div className="text-[10px] text-white/25 uppercase tracking-wider mb-1 font-medium">
              {tier.label}
            </div>
            <div className={`text-sm font-semibold ${tier.color}`}>
              {formatCurrency(tier.value)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-[#121216] rounded-2xl border border-white/[0.03] overflow-hidden ${className}`}>
      {/* Header — collapsible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.015] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-white/80">Renovation Costs</span>
            {region && (
              <span className="text-[10px] text-white/25 ml-2 uppercase tracking-wider">
                {region}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-violet-400">
            {formatCurrency(standardCost)}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-white/20" />
          </motion.div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Cost bars */}
              <div className="space-y-3">
                <CostBar label="Basic" value={basicCost} maxValue={maxCost} color="text-blue-400" delay={0} />
                <CostBar label="Standard" value={standardCost} maxValue={maxCost} color="text-violet-400" delay={0.1} />
                <CostBar label="Premium" value={premiumCost} maxValue={maxCost} color="text-amber-400" delay={0.2} />
              </div>

              {/* Individual repairs */}
              {repairs.length > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-white/[0.04]">
                  <div className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-2">
                    Repair breakdown
                  </div>
                  {repairs.map((repair, i) => (
                    <div key={i} className="flex justify-between items-center py-1">
                      <span className="text-xs text-white/40 truncate mr-4">{repair.description}</span>
                      <span className="text-xs text-white/60 font-medium whitespace-nowrap">
                        {formatCurrency(repair.standard_cost)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CostBreakdown;
