// FILE: src/components/chat/tool-cards/DealAnalyzerCard.tsx
/**
 * Deal Analyzer Card Component
 * Displays P&L summary in chat messages with option to open full analyzer
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Building2,
  Home,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type {
  PnLOutput,
  InvestmentStrategy,
  PresentationBundle,
  PresentationKPI,
  PresentationInsight,
  TrendDirection,
  Sentiment,
} from '../../../types/pnl';
import { formatCurrency, formatPercent } from '../../../types/pnl';
import { MarkdownRenderer } from '../../common/MarkdownRenderer';

export interface DealAnalyzerData {
  propertyId?: string | null;
  propertyAddress?: string;
  strategy: InvestmentStrategy;
  pnlSummary: {
    monthlyCashflow: number;
    annualCashflow?: number;
    cashOnCash: number;
    capRate: number;
    noi: number;
    dscr?: number;
    grossRevenue?: number;
    totalInvestment?: number;
    purchasePrice?: number;
  };
  financingSummary?: {
    purchasePrice: number;
    downPayment: number;
    loanAmount: number;
    closingCosts: number;
    totalCashInvested: number;
    monthlyMortgage: number;
  };
  flipMetrics?: {
    arv: number;
    totalProjectCost: number;
    grossProfit: number;
    netProfit: number;
    roiPct: number;
    holdTimeMonths: number;
    annualizedRoi?: number;
  };
  recommendation?: {
    verdict: 'BUY' | 'NEGOTIATE' | 'PASS';
    summary: string;
    pros?: string[];
    cons?: string[];
  };
  fullOutput?: PnLOutput;
  presentation?: PresentationBundle;
  // New fields for validated PNL results
  isValidated?: boolean;
  // Legacy recommendation fields (from validated PNL)
  summary?: string;
  pros?: string[];
  cons?: string[];
  // Error fields for failed validation
  validationError?: {
    error?: string;
    missingFields?: string[];
    validationMessage?: string;
    message?: string;
  };
}

const sentimentClasses: Record<Sentiment | 'neutral', string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral: 'text-foreground',
};

const trendIconMap: Record<TrendDirection, React.ReactNode> = {
  up: <ArrowUpRight className="w-3 h-3" />,
  down: <ArrowDownRight className="w-3 h-3" />,
  flat: <Minus className="w-3 h-3" />,
};

const PresentationPreview: React.FC<{ bundle: PresentationBundle }> = ({ bundle }) => {
  const { headline, markdown, kpis = [], insights = [] } = bundle;
  const topKpis = kpis.slice(0, 2);
  const topInsights = insights.slice(0, 2);

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        AI Deal Brief
      </div>
      {headline && (
        <p className="text-sm font-semibold text-foreground">{headline}</p>
      )}
      {markdown && (
        <MarkdownRenderer
          content={markdown}
          className="prose-xs text-foreground/80 line-clamp-4"
        />
      )}

      {topKpis.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {topKpis.map((kpi: PresentationKPI) => (
            <div key={kpi.key} className="p-2 rounded-lg bg-muted/60 border border-border/40">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-foreground/60">
                <span>{kpi.label}</span>
                {kpi.trend && <span className="text-foreground/70">{trendIconMap[kpi.trend]}</span>}
              </div>
              <p className={cn('text-lg font-semibold', sentimentClasses[kpi.sentiment || 'neutral'])}>
                {kpi.value}
              </p>
              {kpi.helperText && (
                <p className="text-[11px] text-foreground/50">{kpi.helperText}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {topInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-foreground/60 uppercase tracking-wide mb-1">
            <Lightbulb className="w-3 h-3" />
            Insights
          </div>
          <div className="space-y-1.5">
            {topInsights.map((insight: PresentationInsight) => (
              <div key={insight.id} className="text-xs text-foreground/80 flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className={sentimentClasses[insight.sentiment || 'neutral']}>
                  {insight.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface DealAnalyzerCardProps {
  data: DealAnalyzerData;
  onOpenAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy) => void;
}

export const DealAnalyzerCard: React.FC<DealAnalyzerCardProps> = ({
  data,
  onOpenAnalyzer,
}) => {
  const { propertyAddress, strategy, pnlSummary, flipMetrics, recommendation } = data;
  const presentation = data.presentation || data.fullOutput?.presentation;
  const isFlip = strategy === 'Flip';
  const isPositiveCashflow = isFlip ? (flipMetrics?.netProfit ?? 0) > 0 : pnlSummary.monthlyCashflow >= 0;
  const isGoodDeal = isFlip 
    ? (flipMetrics?.roiPct ?? 0) >= 15 
    : pnlSummary.cashOnCash >= 8 && pnlSummary.capRate >= 5;

  const handleOpenAnalyzer = () => {
    if (onOpenAnalyzer) {
      onOpenAnalyzer(data.propertyId || null, strategy);
    }
  };

  // Strategy badge colors
  const strategyColors: Record<string, string> = {
    STR: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    LTR: 'bg-green-500/20 text-green-700 dark:text-green-400',
    Flip: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
    ADU: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
    MF: 'bg-teal-500/20 text-teal-700 dark:text-teal-400',
  };

  // Recommendation badge colors
  const verdictColors: Record<string, string> = {
    BUY: 'bg-success/10 border-success/30 text-success',
    NEGOTIATE: 'bg-warning/10 border-warning/30 text-warning',
    PASS: 'bg-danger/10 border-danger/30 text-danger',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-gradient-to-br from-blue-50/50 to-teal-50/50 dark:from-blue-950/30 dark:to-teal-950/30 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">
              {isFlip ? 'Flip Analysis' : 'P&L Analysis'}
            </h4>
            {propertyAddress && (
              <p className="text-xs text-foreground/60 line-clamp-1">{propertyAddress}</p>
            )}
          </div>
        </div>
        <div className={cn(
          'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5',
          strategyColors[strategy] || strategyColors.LTR
        )}>
          {strategy === 'STR' ? <Building2 className="w-3 h-3" /> : <Home className="w-3 h-3" />}
          {strategy}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Primary Metric - Conditional on Flip vs Rental */}
        {isFlip && flipMetrics ? (
          <>
            {/* Net Profit - Primary for Flip */}
            <div className={cn(
              'col-span-2 p-3 rounded-lg border',
              isPositiveCashflow 
                ? 'bg-success/10 border-success/30' 
                : 'bg-danger/10 border-danger/30'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground/60">Net Profit</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    isPositiveCashflow ? 'text-success' : 'text-danger'
                  )}>
                    {formatCurrency(flipMetrics.netProfit)}
                  </p>
                </div>
                {isPositiveCashflow ? (
                  <TrendingUp className="w-8 h-8 text-success/50" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-danger/50" />
                )}
              </div>
            </div>

            {/* Flip ROI */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-foreground/60">Flip ROI</p>
              <p className={cn(
                'text-xl font-bold',
                flipMetrics.roiPct >= 15 ? 'text-success' : 'text-foreground'
              )}>
                {formatPercent(flipMetrics.roiPct)}
              </p>
            </div>

            {/* Hold Time */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-foreground/60">Hold Time</p>
              <p className="text-xl font-bold text-foreground">
                {flipMetrics.holdTimeMonths} mo
              </p>
            </div>

            {/* ARV */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-foreground/60">ARV</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(flipMetrics.arv, true)}
              </p>
            </div>

            {/* Total Project Cost */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-foreground/60">Total Cost</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(flipMetrics.totalProjectCost, true)}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Monthly Cashflow - Primary metric for rentals */}
            <div className={cn(
              'col-span-2 p-3 rounded-lg border',
              isPositiveCashflow 
                ? 'bg-success/10 border-success/30' 
                : 'bg-danger/10 border-danger/30'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground/60">Monthly Cashflow</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    isPositiveCashflow ? 'text-success' : 'text-danger'
                  )}>
                    {formatCurrency(pnlSummary.monthlyCashflow)}
                  </p>
                </div>
                {isPositiveCashflow ? (
                  <TrendingUp className="w-8 h-8 text-success/50" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-danger/50" />
                )}
              </div>
            </div>

            {/* Cash-on-Cash */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-foreground/60">Cash-on-Cash</p>
              <p className={cn(
                'text-xl font-bold',
                pnlSummary.cashOnCash >= 8 ? 'text-success' : 'text-foreground'
              )}>
                {formatPercent(pnlSummary.cashOnCash)}
              </p>
            </div>

            {/* Cap Rate */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-foreground/60">Cap Rate</p>
              <p className={cn(
                'text-xl font-bold',
                pnlSummary.capRate >= 6 ? 'text-success' : 'text-foreground'
              )}>
                {formatPercent(pnlSummary.capRate)}
              </p>
            </div>

            {/* NOI */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-foreground/60">Annual NOI</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(pnlSummary.noi, true)}
              </p>
            </div>

            {/* DSCR or Total Investment */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-foreground/60">
                {pnlSummary.dscr ? 'DSCR' : 'Cash Required'}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {pnlSummary.dscr 
                  ? pnlSummary.dscr.toFixed(2)
                  : formatCurrency(pnlSummary.totalInvestment ?? data.financingSummary?.totalCashInvested ?? 0, true)
                }
              </p>
            </div>
          </>
        )}
      </div>

      {/* Recommendation Badge */}
      {recommendation && (
        <div className="px-4 pb-3">
          <div className={cn(
            'px-3 py-2 rounded-lg border flex items-center gap-2',
            verdictColors[recommendation.verdict] || verdictColors.NEGOTIATE
          )}>
            <span className="text-sm font-bold">{recommendation.verdict}</span>
            <span className="text-xs opacity-80">{recommendation.summary}</span>
          </div>
        </div>
      )}

      {/* Deal Quality Indicator (if no recommendation) */}
      {!recommendation && isGoodDeal && (
        <div className="px-4 pb-3">
          <div className="px-3 py-2 rounded-lg bg-success/10 border border-success/30 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <p className="text-xs font-medium text-success">
              {isFlip 
                ? 'Strong flip opportunity with high ROI potential'
                : 'Strong investment opportunity with above-market returns'
              }
            </p>
          </div>
        </div>
      )}

        {presentation && (
          <div className="px-4 pb-4">
            <PresentationPreview bundle={presentation} />
          </div>
        )}

      {/* CTA Button */}
      {onOpenAnalyzer && (
        <div className="px-4 pb-4">
          <button
            onClick={handleOpenAnalyzer}
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Open Full Deal Analyzer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Convert PnLOutput to DealAnalyzerData for the card
 */
export function pnlOutputToCardData(
  output: PnLOutput,
  propertyId?: string | null,
  propertyAddress?: string
): DealAnalyzerData {
  return {
    propertyId,
    propertyAddress,
    strategy: output.meta.strategy,
    presentation: output.presentation,
    pnlSummary: {
      monthlyCashflow: output.year1.monthlyCashflow,
      cashOnCash: output.year1.cashOnCash,
      capRate: output.year1.capRate,
      noi: output.year1.noi,
      totalInvestment: output.financingSummary.totalInvestment,
      purchasePrice: output.financingSummary.downPayment + output.financingSummary.loanAmount,
    },
    fullOutput: output,
  };
}

export default DealAnalyzerCard;
