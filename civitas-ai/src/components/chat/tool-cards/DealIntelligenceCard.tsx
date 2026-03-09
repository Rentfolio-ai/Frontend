/**
 * DealIntelligenceCard - Premium deal analysis card for chat messages.
 *
 * Replaces DealAnalyzerCard & FinancialAnalysisCard with a single, compact,
 * data-dense component that uses the copper/obsidian design system and
 * consumes the new AdvancedMetrics (IRR, NPV, sensitivity, break-even).
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Building2,
  Home,
  ArrowRight,
  Download,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type {
  PnLOutput,
  InvestmentStrategy,
  AdvancedMetrics,
  SensitivityScenario,
  ProjectionYear,
} from '../../../types/pnl';
import { formatCurrency, formatPercent } from '../../../types/pnl';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Hero metric – large number with label */
const HeroMetric: React.FC<{
  label: string;
  value: string;
  positive?: boolean;
  accent?: boolean;
  delay?: number;
}> = ({ label, value, positive, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex flex-col items-center text-center"
  >
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-0.5">
      {label}
    </span>
    <span
      className={cn(
        'text-lg font-bold leading-tight',
        accent
          ? 'text-[#D4A27F]'
          : positive === undefined
            ? 'text-foreground'
            : positive
              ? 'text-emerald-400'
              : 'text-rose-400'
      )}
    >
      {value}
    </span>
  </motion.div>
);

/** Compact metric tile for secondary metrics */
const SecondaryMetric: React.FC<{
  label: string;
  value: string;
  delay?: number;
}> = ({ label, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.25 }}
    className="flex flex-col items-center text-center"
  >
    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
      {label}
    </span>
    <span className="text-sm font-semibold text-foreground/80">{value}</span>
  </motion.div>
);

/** 3×3 sensitivity heatmap */
const SensitivityHeatmap: React.FC<{ scenarios: SensitivityScenario[] }> = ({
  scenarios,
}) => {
  if (!scenarios || scenarios.length === 0) return null;

  // Determine min/max for colour scale
  const values = scenarios.map((s) => s.monthlyCashflow);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const getCellColor = (v: number): string => {
    if (max === min) return 'bg-black/[0.03]';
    const ratio = (v - min) / (max - min); // 0..1
    if (v >= 0) {
      const alpha = Math.round(5 + ratio * 15); // 5-20
      return `bg-emerald-500/[0.${String(alpha).padStart(2, '0')}]`;
    }
    const alpha = Math.round(5 + (1 - ratio) * 15);
    return `bg-rose-500/[0.${String(alpha).padStart(2, '0')}]`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.3 }}
      className="mt-2"
    >
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-1.5">
        Sensitivity (Monthly CF)
      </div>
      <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden border border-black/[0.06]">
        {scenarios.slice(0, 9).map((s, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-1',
              getCellColor(s.monthlyCashflow)
            )}
          >
            <span
              className={cn(
                'text-xs font-semibold',
                s.monthlyCashflow >= 0 ? 'text-emerald-300' : 'text-rose-300'
              )}
            >
              ${Math.round(s.monthlyCashflow).toLocaleString()}
            </span>
            <span className="text-[8px] text-muted-foreground/50 leading-tight mt-0.5 whitespace-nowrap">
              {s.label
                .replace('Base Rent / Base Vac', 'Base')
                .replace(' / ', '\n')
                .split('\n')[0]}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/** Tiny SVG sparkline for 5-year cashflow projection */
const Sparkline: React.FC<{ projection: ProjectionYear[] }> = ({
  projection,
}) => {
  const points = useMemo(() => {
    if (!projection || projection.length < 2) return '';
    const values = projection.map((p) => p.cashflow);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 200;
    const height = 36;
    const padding = 2;

    return values
      .map((v, i) => {
        const x = padding + (i / (values.length - 1)) * (width - padding * 2);
        const y =
          height - padding - ((v - min) / range) * (height - padding * 2);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [projection]);

  if (!points) return null;

  const lastCf = projection[projection.length - 1]?.cashflow ?? 0;
  const firstCf = projection[0]?.cashflow ?? 0;
  const trending = lastCf >= firstCf;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="mt-2"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
          {projection.length}-Year Cashflow
        </span>
        <span
          className={cn(
            'text-[10px] font-medium',
            trending ? 'text-emerald-400/70' : 'text-rose-400/70'
          )}
        >
          Yr{projection.length}: ${Math.round(lastCf).toLocaleString()}
        </span>
      </div>
      <svg
        viewBox="0 0 200 36"
        className="w-full h-9"
        preserveAspectRatio="none"
      >
        <path
          d={points}
          fill="none"
          stroke={trending ? '#6ee7b7' : '#fda4af'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
    </motion.div>
  );
};

/** Horizontal stacked bar for income vs expenses */
const IncomeVsExpenseBar: React.FC<{
  income: number;
  expenses: number;
  debtService: number;
}> = ({ income, expenses, debtService }) => {
  const total = income || 1;
  const expPct = Math.min((expenses / total) * 100, 100);
  const debtPct = Math.min((debtService / total) * 100, 100 - expPct);
  const remainPct = Math.max(0, 100 - expPct - debtPct);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="mt-2"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
          Income Allocation
        </span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden border border-black/[0.06]">
        <div
          className="bg-emerald-500/60 transition-all"
          style={{ width: `${remainPct}%` }}
          title={`Cashflow: ${remainPct.toFixed(0)}%`}
        />
        <div
          className="bg-amber-500/50 transition-all"
          style={{ width: `${expPct}%` }}
          title={`Expenses: ${expPct.toFixed(0)}%`}
        />
        <div
          className="bg-rose-500/50 transition-all"
          style={{ width: `${debtPct}%` }}
          title={`Debt: ${debtPct.toFixed(0)}%`}
        />
      </div>
      <div className="flex items-center gap-3 mt-1">
        <span className="flex items-center gap-1 text-[8px] text-muted-foreground/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
          Cashflow
        </span>
        <span className="flex items-center gap-1 text-[8px] text-muted-foreground/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
          OpEx
        </span>
        <span className="flex items-center gap-1 text-[8px] text-muted-foreground/50">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
          Debt
        </span>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface DealIntelligenceData {
  propertyId?: string | null;
  propertyAddress?: string;
  strategy: InvestmentStrategy;
  fullOutput?: PnLOutput;
  // Direct fields when fullOutput is not available
  pnlSummary?: {
    monthlyCashflow: number;
    cashOnCash: number;
    capRate: number;
    noi: number;
    dscr?: number;
  };
}

interface DealIntelligenceCardProps {
  data: DealIntelligenceData;
  onOpenAnalyzer?: (
    propertyId: string | null,
    strategy: InvestmentStrategy
  ) => void;
}

export const DealIntelligenceCard: React.FC<DealIntelligenceCardProps> = ({
  data,
  onOpenAnalyzer,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Resolve metrics from fullOutput or pnlSummary
  const output = data.fullOutput;
  const year1 = output?.year1;
  const advanced: AdvancedMetrics | undefined = output?.advancedMetrics;
  const projection = output?.projection;

  const monthlyCashflow =
    year1?.monthlyCashflow ?? data.pnlSummary?.monthlyCashflow ?? 0;
  const capRate = (year1?.capRate ?? data.pnlSummary?.capRate ?? 0) * 100;
  const cashOnCash = (year1?.cashOnCash ?? data.pnlSummary?.cashOnCash ?? 0) * 100;
  const noi = year1?.noi ?? data.pnlSummary?.noi ?? 0;
  const totalIncome = year1?.income?.totalIncome ?? 0;
  const totalExpenses = year1?.expenses?.totalExpenses ?? 0;
  const debtService = year1?.annualDebtService ?? 0;

  const isPositive = monthlyCashflow >= 0;

  // Verdict logic
  const verdict: 'BUY' | 'HOLD' | 'PASS' = (() => {
    if (cashOnCash >= 8 && capRate >= 5 && monthlyCashflow > 0) return 'BUY';
    if (monthlyCashflow >= 0 && capRate >= 3) return 'HOLD';
    return 'PASS';
  })();

  const verdictConfig = {
    BUY: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    HOLD: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
    PASS: { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400' },
  };

  const strategyIcons: Record<string, React.ReactNode> = {
    STR: <Building2 className="w-3 h-3" />,
    LTR: <Home className="w-3 h-3" />,
  };

  const handleExport = () => {
    if (!output) return;
    const rows = [
      ['Metric', 'Value'],
      ['Monthly Cashflow', `$${Math.round(monthlyCashflow)}`],
      ['Cap Rate', `${capRate.toFixed(2)}%`],
      ['Cash-on-Cash', `${cashOnCash.toFixed(2)}%`],
      ['NOI', `$${Math.round(noi)}`],
      ['IRR', advanced?.irr != null ? `${(advanced.irr * 100).toFixed(2)}%` : 'N/A'],
      ['NPV', advanced?.npv != null ? `$${Math.round(advanced.npv)}` : 'N/A'],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal_${(data.propertyAddress || 'analysis').replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl bg-black/[0.02] border border-black/[0.06] backdrop-blur overflow-hidden"
    >
      {/* ---- Header strip ---- */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-md bg-[#C08B5C]/15">
            <BarChart3 className="w-3.5 h-3.5 text-[#D4A27F]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-foreground truncate">
              {data.propertyAddress || 'Deal Intelligence'}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Strategy badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#C08B5C]/15 text-[#D4A27F] border border-[#C08B5C]/20">
            {strategyIcons[data.strategy] || <Building2 className="w-3 h-3" />}
            {data.strategy}
          </span>
          {/* Verdict badge */}
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
              verdictConfig[verdict].bg,
              verdictConfig[verdict].border,
              verdictConfig[verdict].text
            )}
          >
            {verdict}
          </span>
        </div>
      </div>

      {/* ---- Hero metrics row (3 columns) ---- */}
      <div className="grid grid-cols-3 divide-x divide-black/[0.04] px-2 py-3">
        <HeroMetric
          label="Monthly CF"
          value={`${isPositive ? '+' : ''}$${Math.round(monthlyCashflow).toLocaleString()}`}
          positive={isPositive}
          delay={0.05}
        />
        <HeroMetric
          label="Cap Rate"
          value={`${capRate.toFixed(1)}%`}
          positive={capRate >= 5}
          delay={0.1}
        />
        <HeroMetric
          label="CoC"
          value={`${cashOnCash.toFixed(1)}%`}
          positive={cashOnCash >= 8}
          delay={0.15}
        />
      </div>

      {/* ---- Advanced metrics row (if available) ---- */}
      {advanced && (
        <div className="grid grid-cols-3 divide-x divide-black/[0.04] px-2 py-2 border-t border-black/[0.04]">
          <SecondaryMetric
            label="IRR"
            value={
              advanced.irr != null
                ? `${(advanced.irr * 100).toFixed(1)}%`
                : '—'
            }
            delay={0.2}
          />
          <SecondaryMetric
            label="NPV"
            value={
              advanced.npv != null
                ? formatCurrency(advanced.npv, true)
                : '—'
            }
            delay={0.25}
          />
          <SecondaryMetric
            label={
              data.strategy === 'STR' ? 'BE Occ' : 'BE Rent'
            }
            value={
              data.strategy === 'STR'
                ? advanced.breakEvenOccupancy != null
                  ? `${(advanced.breakEvenOccupancy * 100).toFixed(0)}%`
                  : '—'
                : advanced.breakEvenRent != null
                  ? `$${Math.round(advanced.breakEvenRent).toLocaleString()}`
                  : '—'
            }
            delay={0.3}
          />
        </div>
      )}

      {/* ---- Income vs Expense bar ---- */}
      {totalIncome > 0 && (
        <div className="px-4 pb-1">
          <IncomeVsExpenseBar
            income={totalIncome}
            expenses={totalExpenses}
            debtService={debtService}
          />
        </div>
      )}

      {/* ---- Expandable section: Sensitivity + Sparkline ---- */}
      <div className="px-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-2 text-[10px] font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <span>Details &amp; Scenarios</span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pb-3"
            >
              {advanced?.sensitivity && advanced.sensitivity.length > 0 && (
                <SensitivityHeatmap scenarios={advanced.sensitivity} />
              )}

              {projection && projection.length >= 2 && (
                <Sparkline projection={projection} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Footer: CTA + Export ---- */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-black/[0.04]">
        {onOpenAnalyzer && (
          <button
            onClick={() =>
              onOpenAnalyzer(data.propertyId || null, data.strategy)
            }
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#C08B5C]/15 text-[#D4A27F] border border-[#C08B5C]/20 hover:bg-[#C08B5C]/25 transition-colors"
          >
            Open Full Analyzer
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
        {output && (
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-black/[0.03] border border-black/[0.06] text-muted-foreground/70 hover:text-muted-foreground hover:bg-black/[0.05] transition-colors"
          >
            <Download className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DealIntelligenceCard;
