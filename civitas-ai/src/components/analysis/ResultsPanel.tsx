// FILE: src/components/analysis/ResultsPanel.tsx
/**
 * Results Panel Component
 * Displays P&L calculation results, metrics, and projections
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  PieChart,
  BarChart3,
  Loader2,
  Hammer,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type {
  PnLOutput,
  InvestmentStrategy,
  FinancingSummary,
} from '../../types/pnl';
import { formatCurrency, formatPercent } from '../../types/pnl';
import { PresentationSummary } from '../common/PresentationSummary';
import type { PresentationBundle } from '../../types/pnl';

interface ResultsPanelProps {
  pnlOutput: PnLOutput | null;
  strategy: InvestmentStrategy;
  isLoading?: boolean;
  financingSummary?: FinancingSummary;
}

const PresentationSection: React.FC<{ bundle: PresentationBundle }> = ({ bundle }) => (
  <PresentationSummary presentation={bundle} />
);

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  highlight?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend = 'neutral',
  icon,
  highlight = false,
}) => {
  const trendColor = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-foreground',
  }[trend];

  const trendBg = {
    positive: 'bg-success/10 border-success/30',
    negative: 'bg-danger/10 border-danger/30',
    neutral: 'bg-muted border-border/50',
  }[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-xl border transition-all',
        highlight ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10' : trendBg
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{label}</p>
          <p className={cn('text-2xl font-bold mt-1', highlight ? 'text-primary' : trendColor)}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-foreground/50 mt-0.5">{subValue}</p>
          )}
        </div>
        {icon && (
          <div className={cn('p-2 rounded-lg', highlight ? 'bg-primary/20' : 'bg-muted')}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface LineItemProps {
  label: string;
  value: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isNegative?: boolean;
}

const LineItem: React.FC<LineItemProps> = ({
  label,
  value,
  isSubtotal = false,
  isTotal = false,
  isNegative = false,
}) => (
  <div className={cn(
    'flex items-center justify-between py-1.5',
    isTotal && 'border-t-2 border-foreground/20 pt-2 mt-2',
    isSubtotal && 'border-t border-border/50 pt-2 font-medium'
  )}>
    <span className={cn(
      'text-sm',
      isTotal ? 'font-bold text-foreground' : isSubtotal ? 'font-medium text-foreground/80' : 'text-foreground/60'
    )}>
      {label}
    </span>
    <span className={cn(
      'text-sm tabular-nums',
      isTotal ? 'font-bold' : isSubtotal ? 'font-medium' : '',
      isNegative && value !== 0 ? 'text-danger' : isTotal && value > 0 ? 'text-success' : 'text-foreground'
    )}>
      {isNegative && value > 0 ? '-' : ''}{formatCurrency(Math.abs(value))}
    </span>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-foreground/60">Calculating...</p>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <BarChart3 className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
      <p className="text-sm text-foreground/60">Enter a purchase price to see results</p>
    </div>
  </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  pnlOutput,
  strategy,
  isLoading = false,
  financingSummary,
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!pnlOutput) {
    return <EmptyState />;
  }

  const { year1, projection, presentation } = pnlOutput;
  const monthlyCashflow = year1.monthlyCashflow;
  const isPositiveCashflow = monthlyCashflow >= 0;

  return (
    <div className="p-6 space-y-6">
      {presentation && <PresentationSection bundle={presentation} />}

      {/* Key Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Monthly Cashflow"
            value={formatCurrency(monthlyCashflow)}
            subValue={`${formatCurrency(year1.cashflowBeforeTaxes)}/year`}
            trend={isPositiveCashflow ? 'positive' : 'negative'}
            icon={isPositiveCashflow 
              ? <TrendingUp className="w-5 h-5 text-success" />
              : <TrendingDown className="w-5 h-5 text-danger" />
            }
            highlight={isPositiveCashflow && monthlyCashflow > 500}
          />
          <MetricCard
            label="Cash-on-Cash"
            value={formatPercent(year1.cashOnCash)}
            subValue="Return on investment"
            trend={year1.cashOnCash >= 8 ? 'positive' : year1.cashOnCash >= 5 ? 'neutral' : 'negative'}
            icon={<Percent className="w-5 h-5 text-primary" />}
          />
          <MetricCard
            label="Cap Rate"
            value={formatPercent(year1.capRate)}
            subValue="NOI / Purchase Price"
            trend={year1.capRate >= 6 ? 'positive' : year1.capRate >= 4 ? 'neutral' : 'negative'}
            icon={<PieChart className="w-5 h-5 text-primary" />}
          />
        </div>
      </div>

      {/* Flip Summary */}
      {year1.flip && (
        <div>
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Hammer className="w-4 h-4 text-primary" /> Flip Economics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="After Repair Value"
              value={formatCurrency(year1.flip.afterRepairValue)}
              icon={<Hammer className="w-5 h-5 text-primary" />}
            />
            <MetricCard
              label="Rehab Budget"
              value={formatCurrency(year1.flip.rehabBudget)}
              trend="negative"
            />
            <MetricCard
              label="Projected Profit"
              value={formatCurrency(year1.flip.projectedProfit)}
              trend={year1.flip.projectedProfit >= 0 ? 'positive' : 'negative'}
              highlight={year1.flip.projectedProfit >= 50000}
            />
            <MetricCard
              label="Hold ROI / Annualized"
              value={`${formatPercent(year1.flip.holdRoi)} / ${formatPercent(year1.flip.annualizedRoi)}`}
              trend={year1.flip.holdRoi >= 15 ? 'positive' : 'neutral'}
            />
          </div>
        </div>
      )}

      {/* Financing Summary */}
      {financingSummary && (
        <div>
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
            Investment Summary
          </h3>
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2">
            <LineItem label="Down Payment" value={financingSummary.downPayment} />
            <LineItem label="Closing Costs" value={financingSummary.closingCosts} />
            {financingSummary.rehabBudget > 0 && (
              <LineItem label="Rehab Budget" value={financingSummary.rehabBudget} />
            )}
            <LineItem label="Total Cash Required" value={financingSummary.totalInvestment} isSubtotal />
            {financingSummary.loanAmount > 0 && (
              <>
                <div className="border-t border-border/50 my-2" />
                <LineItem label="Loan Amount" value={financingSummary.loanAmount} />
                <LineItem label="Monthly Payment (P&I)" value={financingSummary.monthlyPayment} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Year 1 P&L Statement */}
      <div>
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
          Year 1 P&L Statement
        </h3>
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
          {/* Income Section */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-success uppercase tracking-wider mb-2">Income</p>
            <LineItem label="Gross Potential Income" value={year1.income.grossPotentialIncome} />
            <LineItem label={strategy === 'STR' ? 'Platform Fees / Vacancy' : 'Vacancy Loss'} value={year1.income.vacancyLoss} isNegative />
            <LineItem label="Effective Gross Income" value={year1.income.effectiveGrossIncome} isSubtotal />
          </div>

          {/* Expenses Section */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-danger uppercase tracking-wider mb-2">Operating Expenses</p>
            <LineItem label="Property Tax" value={year1.expenses.propertyTax} isNegative />
            <LineItem label="Insurance" value={year1.expenses.insurance} isNegative />
            {year1.expenses.hoa > 0 && (
              <LineItem label="HOA" value={year1.expenses.hoa} isNegative />
            )}
            <LineItem label="Utilities" value={year1.expenses.utilities} isNegative />
            {year1.expenses.internet > 0 && (
              <LineItem label="Internet" value={year1.expenses.internet} isNegative />
            )}
            <LineItem label="Property Management" value={year1.expenses.propertyManagement} isNegative />
            <LineItem label="Maintenance" value={year1.expenses.maintenance} isNegative />
            <LineItem label="CapEx Reserve" value={year1.expenses.capexReserve} isNegative />
            {strategy === 'STR' && year1.expenses.cleaningCosts > 0 && (
              <LineItem label="Cleaning Costs" value={year1.expenses.cleaningCosts} isNegative />
            )}
            {year1.expenses.otherOperating > 0 && (
              <LineItem label="Other" value={year1.expenses.otherOperating} isNegative />
            )}
            <LineItem label="Total Operating Expenses" value={year1.expenses.totalExpenses} isSubtotal isNegative />
          </div>

          {/* NOI & Cashflow */}
          <div className="pt-2 border-t border-border/50">
            <LineItem label="Net Operating Income (NOI)" value={year1.noi} isSubtotal />
            {year1.annualDebtService > 0 && (
              <LineItem label="Annual Debt Service" value={year1.annualDebtService} isNegative />
            )}
            <LineItem label="Annual Cashflow (Before Taxes)" value={year1.cashflowBeforeTaxes} isTotal />
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      {projection && projection.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
            {projection.length}-Year Projection
          </h3>
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
            {/* Simple bar chart representation */}
            <div className="space-y-3">
              {projection.map((year) => {
                const maxCashflow = Math.max(...projection.map(p => Math.abs(p.cashflow)));
                const barWidth = maxCashflow > 0 ? (Math.abs(year.cashflow) / maxCashflow) * 100 : 0;
                const isPositive = year.cashflow >= 0;
                
                return (
                  <div key={year.year} className="flex items-center gap-3">
                    <span className="text-xs text-foreground/60 w-16">Year {year.year}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, delay: year.year * 0.1 }}
                        className={cn(
                          'h-full rounded-full',
                          isPositive ? 'bg-success' : 'bg-danger'
                        )}
                      />
                    </div>
                    <span className={cn(
                      'text-xs font-medium w-20 text-right',
                      isPositive ? 'text-success' : 'text-danger'
                    )}>
                      {formatCurrency(year.cashflow, true)}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Summary row */}
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className="text-sm text-foreground/60">Cumulative Cashflow</span>
              <span className={cn(
                'text-sm font-bold',
                projection[projection.length - 1].cumulativeCashflow >= 0 ? 'text-success' : 'text-danger'
              )}>
                {formatCurrency(projection[projection.length - 1].cumulativeCashflow)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-foreground/60">Projected Property Value</span>
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(projection[projection.length - 1].propertyValue)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
          Additional Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-foreground/60">Gross Yield</p>
            <p className="text-lg font-semibold text-foreground">{formatPercent(year1.grossYield)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-foreground/60">Expense Ratio</p>
            <p className="text-lg font-semibold text-foreground">
              {formatPercent((year1.expenses.totalExpenses / year1.income.effectiveGrossIncome) * 100)}
            </p>
          </div>
          {year1.annualDebtService > 0 && (
            <>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs text-foreground/60">Debt Service Coverage</p>
                <p className={cn(
                  'text-lg font-semibold',
                  year1.noi / year1.annualDebtService >= 1.25 ? 'text-success' : 'text-warning'
                )}>
                  {(year1.noi / year1.annualDebtService).toFixed(2)}x
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs text-foreground/60">Monthly Payment</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(year1.annualDebtService / 12)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
