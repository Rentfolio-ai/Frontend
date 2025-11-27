// FILE: src/components/chat/tool-cards/ValuationCard.tsx
/**
 * Valuation Card Component
 * Displays valuation metrics with real-time calculator integration,
 * compliance context, appreciation trends, and risk scoring
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  Activity,
  DollarSign,
  Percent,
  Home,
  MapPin,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { RiskLevel } from '../../../types/compliance';
import type { InvestmentStrategy } from '../../../types/pnl';

/* -------------------------------------------------------------------------- */
/*                              Type Definitions                              */
/* -------------------------------------------------------------------------- */

export interface ValuationExpenseBreakdown {
  cleaning: number;
  platform_fees: number;
  utilities: number;
  maintenance: number;
  property_management: number;
  insurance: number;
  property_tax: number;
}

export interface AppreciationData {
  years: number;
  percent: number;
  source?: string;
  vintage?: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface ValuationRiskFactors {
  negative_cashflow?: boolean;
  low_dscr?: boolean;
  regulatory_risk?: boolean;
  high_expense_ratio?: boolean;
  custom?: string[];
}

export interface ValuationData {
  property_address?: string;
  strategy?: InvestmentStrategy;
  property_tier?: 'A' | 'B' | 'C' | 'D';

  // Core ROI metrics (same as P&L KPIs)
  cash_on_cash_roi: number;
  cap_rate: number;
  monthly_cash_flow: number;
  flip_roi?: number;

  // Additional valuation data
  annual_revenue?: number;
  monthly_revenue?: number;
  operating_expenses?: number;
  adr?: number;
  occupancy?: number;
  noi?: number;
  total_investment?: number;
  purchase_price?: number;
  expense_breakdown?: ValuationExpenseBreakdown;

  // Appreciation data for sparkline
  appreciation?: AppreciationData;

  // Risk factors for scoring
  risk_factors?: ValuationRiskFactors;
  overall_risk_level?: RiskLevel;

  // Compliance summary (inline context)
  compliance_summary?: {
    overall_risk_level: RiskLevel;
    key_issues?: string[];
    permits_required?: number;
  };
}

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value: number, compact = false): string => {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const riskBadgeStyles: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  high: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30' },
};

const riskIcons: Record<RiskLevel, React.ReactNode> = {
  low: <CheckCircle2 className="w-3.5 h-3.5" />,
  medium: <AlertTriangle className="w-3.5 h-3.5" />,
  high: <XCircle className="w-3.5 h-3.5" />,
};

const tierColors: Record<string, string> = {
  A: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  B: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  C: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
  D: 'bg-red-500/20 text-red-700 dark:text-red-400',
};

/* -------------------------------------------------------------------------- */
/*                             Sub-Components                                 */
/* -------------------------------------------------------------------------- */

/** Appreciation Sparkline Badge */
const AppreciationBadge: React.FC<{ data: AppreciationData }> = ({ data }) => {
  const isPositive = data.percent > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="relative group">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        )}
      >
        <Activity className="w-3 h-3" />
        <span>{data.years}yr</span>
        <TrendIcon className="w-3 h-3" />
        <span>{isPositive ? '+' : ''}{formatPercent(data.percent)}</span>
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
        <p className="text-xs text-foreground font-medium">
          {data.years}-Year Appreciation: {isPositive ? '+' : ''}{formatPercent(data.percent)}
        </p>
        {data.source && (
          <p className="text-[10px] text-foreground/60 mt-0.5">
            Source: {data.source} {data.vintage && `(${data.vintage})`}
          </p>
        )}
      </div>
    </div>
  );
};

/** Risk Scoring Pill with Tooltip */
const RiskScoringPill: React.FC<{
  riskLevel: RiskLevel;
  factors?: ValuationRiskFactors;
}> = ({ riskLevel, factors }) => {
  const styles = riskBadgeStyles[riskLevel];
  const icon = riskIcons[riskLevel];

  const riskMessages: string[] = useMemo(() => {
    if (!factors) return [];
    const msgs: string[] = [];
    if (factors.negative_cashflow) msgs.push('Negative cashflow projected');
    if (factors.low_dscr) msgs.push('DSCR below 1.1 threshold');
    if (factors.regulatory_risk) msgs.push('Regulatory restrictions apply');
    if (factors.high_expense_ratio) msgs.push('High expense ratio (>45%)');
    if (factors.custom) msgs.push(...factors.custom);
    return msgs;
  }, [factors]);

  return (
    <div className="relative group">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
          styles.bg,
          styles.text,
          styles.border
        )}
      >
        {icon}
        <span className="capitalize">{riskLevel} Risk</span>
      </div>
      {/* Tooltip */}
      {riskMessages.length > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[200px]">
          <p className="text-xs font-semibold text-foreground mb-1">Risk Factors</p>
          <ul className="space-y-0.5">
            {riskMessages.map((msg, i) => (
              <li key={i} className="text-[11px] text-foreground/70 flex items-start gap-1.5">
                <span className={cn('mt-1 h-1.5 w-1.5 rounded-full', styles.bg)} />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/** Compliance Context Summary */
const ComplianceSummary: React.FC<{
  summary: NonNullable<ValuationData['compliance_summary']>;
}> = ({ summary }) => {
  const styles = riskBadgeStyles[summary.overall_risk_level];

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-2.5 rounded-lg border',
        styles.bg,
        styles.border
      )}
    >
      <Shield className={cn('w-4 h-4 mt-0.5 shrink-0', styles.text)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium', styles.text)}>
            Compliance: {summary.overall_risk_level.charAt(0).toUpperCase() + summary.overall_risk_level.slice(1)} Risk
          </span>
          {summary.permits_required !== undefined && summary.permits_required > 0 && (
            <span className="text-[10px] text-foreground/60">
              {summary.permits_required} permit{summary.permits_required > 1 ? 's' : ''} required
            </span>
          )}
        </div>
        {summary.key_issues && summary.key_issues.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {summary.key_issues.slice(0, 2).map((issue, i) => (
              <li key={i} className="text-[11px] text-foreground/70 truncate">
                • {issue}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/** KPI Tile (reusable metric display) */
const KpiTile: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: 'positive' | 'negative' | 'neutral';
  large?: boolean;
}> = ({ label, value, icon, highlight = 'neutral', large = false }) => {
  const highlightClass =
    highlight === 'positive'
      ? 'text-success'
      : highlight === 'negative'
      ? 'text-danger'
      : 'text-foreground';

  return (
    <div
      className={cn(
        'p-3 rounded-lg bg-muted/50 border border-border/50',
        large && 'col-span-2'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-foreground/60">{label}</p>
          <p
            className={cn(
              'font-bold',
              large ? 'text-2xl' : 'text-xl',
              highlightClass
            )}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={cn(
              'w-8 h-8 flex items-center justify-center',
              highlightClass,
              'opacity-50'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             Main Component                                 */
/* -------------------------------------------------------------------------- */

interface ValuationCardProps {
  data: ValuationData;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy) => void;
}

export const ValuationCard: React.FC<ValuationCardProps> = ({
  data,
  onOpenDealAnalyzer,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const isPositiveCashflow = data.monthly_cash_flow >= 0;
  const cashflowHighlight = isPositiveCashflow ? 'positive' : 'negative';
  const cocHighlight = data.cash_on_cash_roi >= 8 ? 'positive' : 'neutral';
  const capHighlight = data.cap_rate >= 6 ? 'positive' : 'neutral';

  // Compute risk level if not provided
  const computedRiskLevel = useMemo<RiskLevel>(() => {
    if (data.overall_risk_level) return data.overall_risk_level;
    const factors = data.risk_factors;
    if (!factors) return 'low';
    const hasNegativeCashflow = factors.negative_cashflow;
    const hasLowDscr = factors.low_dscr;
    const hasRegulatory = factors.regulatory_risk;
    const hasHighExpense = factors.high_expense_ratio;
    const flagCount = [hasNegativeCashflow, hasLowDscr, hasRegulatory, hasHighExpense].filter(Boolean).length;
    if (flagCount >= 2 || hasNegativeCashflow) return 'high';
    if (flagCount === 1) return 'medium';
    return 'low';
  }, [data.overall_risk_level, data.risk_factors]);

  const strategy = data.strategy || 'STR';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              Valuation Analysis
              {data.property_tier && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold',
                    tierColors[data.property_tier] || tierColors.C
                  )}
                >
                  Tier {data.property_tier}
                </span>
              )}
            </h4>
            {data.property_address && (
              <p className="text-xs text-foreground/60 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {data.property_address}
              </p>
            )}
          </div>
        </div>

        {/* Strategy Badge */}
        <div
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shrink-0',
            strategy === 'STR'
              ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
              : 'bg-green-500/20 text-green-700 dark:text-green-400'
          )}
        >
          {strategy === 'STR' ? <Building2 className="w-3 h-3" /> : <Home className="w-3 h-3" />}
          {strategy}
        </div>
      </div>

      {/* Badges Row: Appreciation + Risk */}
      <div className="px-4 pt-3 flex items-center gap-2 flex-wrap">
        {data.appreciation && <AppreciationBadge data={data.appreciation} />}
        <RiskScoringPill riskLevel={computedRiskLevel} factors={data.risk_factors} />
      </div>

      {/* Primary KPI Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Monthly Cashflow - Primary */}
        <KpiTile
          label="Monthly Cashflow"
          value={formatCurrency(data.monthly_cash_flow)}
          icon={isPositiveCashflow ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
          highlight={cashflowHighlight}
          large
        />

        {/* Cash-on-Cash ROI */}
        <KpiTile
          label="Cash-on-Cash ROI"
          value={formatPercent(data.cash_on_cash_roi)}
          icon={<Percent className="w-5 h-5" />}
          highlight={cocHighlight}
        />

        {/* Cap Rate */}
        <KpiTile
          label="Cap Rate"
          value={formatPercent(data.cap_rate)}
          icon={<DollarSign className="w-5 h-5" />}
          highlight={capHighlight}
        />

        {/* Flip ROI (if available) */}
        {data.flip_roi !== undefined && (
          <KpiTile
            label="Flip ROI"
            value={formatPercent(data.flip_roi)}
            icon={<Sparkles className="w-5 h-5" />}
            highlight={data.flip_roi >= 15 ? 'positive' : 'neutral'}
          />
        )}
      </div>

      {/* Compliance Context */}
      {data.compliance_summary && (
        <div className="px-4 pb-3">
          <ComplianceSummary summary={data.compliance_summary} />
        </div>
      )}

      {/* Expandable Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {/* Revenue & Expenses Row */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {data.annual_revenue !== undefined && (
                  <div>
                    <p className="text-xs text-foreground/60">Annual Revenue</p>
                    <p className="font-semibold">{formatCurrency(data.annual_revenue, true)}</p>
                  </div>
                )}
                {data.operating_expenses !== undefined && (
                  <div>
                    <p className="text-xs text-foreground/60">Operating Expenses</p>
                    <p className="font-semibold">{formatCurrency(data.operating_expenses, true)}</p>
                  </div>
                )}
                {data.noi !== undefined && (
                  <div>
                    <p className="text-xs text-foreground/60">Annual NOI</p>
                    <p className="font-semibold">{formatCurrency(data.noi, true)}</p>
                  </div>
                )}
                {data.total_investment !== undefined && (
                  <div>
                    <p className="text-xs text-foreground/60">Cash Required</p>
                    <p className="font-semibold">{formatCurrency(data.total_investment, true)}</p>
                  </div>
                )}
              </div>

              {/* STR-specific metrics */}
              {(data.adr !== undefined || data.occupancy !== undefined) && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {data.adr !== undefined && (
                    <div>
                      <p className="text-xs text-foreground/60">ADR</p>
                      <p className="font-semibold">{formatCurrency(data.adr)}</p>
                    </div>
                  )}
                  {data.occupancy !== undefined && (
                    <div>
                      <p className="text-xs text-foreground/60">Occupancy</p>
                      <p className="font-semibold">{formatPercent(data.occupancy * 100)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Expense Breakdown */}
              {data.expense_breakdown && (
                <div className="rounded-lg bg-muted/30 border border-border/40 p-3">
                  <p className="text-xs font-medium text-foreground/70 mb-2">Expense Breakdown</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Cleaning</span>
                      <span>{formatCurrency(data.expense_breakdown.cleaning)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Platform Fees</span>
                      <span>{formatCurrency(data.expense_breakdown.platform_fees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Utilities</span>
                      <span>{formatCurrency(data.expense_breakdown.utilities)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Maintenance</span>
                      <span>{formatCurrency(data.expense_breakdown.maintenance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Management</span>
                      <span>{formatCurrency(data.expense_breakdown.property_management)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Insurance</span>
                      <span>{formatCurrency(data.expense_breakdown.insurance)}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-foreground/60">Property Tax</span>
                      <span>{formatCurrency(data.expense_breakdown.property_tax)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-sm font-medium text-foreground/80 hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Details
            </>
          )}
        </button>
        {onOpenDealAnalyzer && (
          <button
            onClick={() => onOpenDealAnalyzer(null, strategy)}
            className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Open Full Analyzer
          </button>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Convert ValuationResponse from agentsApi to ValuationData for the card
 */
export function valuationResponseToCardData(
  response: {
    cash_on_cash_roi: number;
    cap_rate: number;
    monthly_cash_flow: number;
    annual_revenue?: number;
    monthly_revenue?: number;
    operating_expenses?: number;
    property_tier?: 'A' | 'B' | 'C' | 'D';
    adr?: number;
    occupancy?: number;
    expense_breakdown?: ValuationExpenseBreakdown;
    [key: string]: unknown;
  },
  options?: {
    property_address?: string;
    strategy?: InvestmentStrategy;
    flip_roi?: number;
    noi?: number;
    total_investment?: number;
    purchase_price?: number;
    appreciation?: AppreciationData;
    risk_factors?: ValuationRiskFactors;
    overall_risk_level?: RiskLevel;
    compliance_summary?: ValuationData['compliance_summary'];
  }
): ValuationData {
  // Derive risk factors from the data if not provided
  const derivedRiskFactors: ValuationRiskFactors = options?.risk_factors || {};
  if (response.monthly_cash_flow < 0) {
    derivedRiskFactors.negative_cashflow = true;
  }
  if (response.operating_expenses && response.annual_revenue) {
    const expenseRatio = response.operating_expenses / response.annual_revenue;
    if (expenseRatio > 0.45) {
      derivedRiskFactors.high_expense_ratio = true;
    }
  }

  return {
    property_address: options?.property_address,
    strategy: options?.strategy || 'STR',
    property_tier: response.property_tier,
    cash_on_cash_roi: response.cash_on_cash_roi,
    cap_rate: response.cap_rate,
    monthly_cash_flow: response.monthly_cash_flow,
    flip_roi: options?.flip_roi,
    annual_revenue: response.annual_revenue,
    monthly_revenue: response.monthly_revenue,
    operating_expenses: response.operating_expenses,
    adr: response.adr,
    occupancy: response.occupancy,
    noi: options?.noi,
    total_investment: options?.total_investment,
    purchase_price: options?.purchase_price,
    expense_breakdown: response.expense_breakdown,
    appreciation: options?.appreciation,
    risk_factors: derivedRiskFactors,
    overall_risk_level: options?.overall_risk_level,
    compliance_summary: options?.compliance_summary,
  };
}

export default ValuationCard;
