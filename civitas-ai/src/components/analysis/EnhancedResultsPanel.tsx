/**
 * EnhancedResultsPanel - Visual hierarchy results display
 * Features: hero metrics, benchmark grid, expandable breakdowns, 5-year projections
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle,
  Info,
  DollarSign,
  Percent,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeroMetricProps {
  label: string;
  value: number;
  format?: 'currency' | 'percentage' | 'number';
  size?: 'lg' | 'xl' | '2xl';
  trend?: { value: number; label: string };
  interpretation?: string;
}

const HeroMetric: React.FC<HeroMetricProps> = ({
  label,
  value,
  format = 'currency',
  size = '2xl',
  trend,
  interpretation,
}) => {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return `$${Math.abs(value).toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getSentiment = () => {
    if (format === 'currency') {
      if (value > 500) return 'positive';
      if (value > 0) return 'neutral';
      if (value > -500) return 'warning';
      return 'negative';
    }
    return 'neutral';
  };

  const sentiment = getSentiment();
  const sentimentColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    warning: 'text-yellow-400',
    neutral: 'text-slate-300',
  };

  const sizeClasses = {
    lg: 'text-4xl',
    xl: 'text-5xl',
    '2xl': 'text-6xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl"
    >
      <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
        {label}
      </div>
      <div className={cn('font-bold tracking-tight mb-2', sizeClasses[size], sentimentColors[sentiment])}>
        {value < 0 && format === 'currency' && '-'}
        {formatValue()}
        {format === 'currency' && <span className="text-2xl text-slate-500 ml-2">/mo</span>}
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          {trend.value > 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span>{trend.label}</span>
        </div>
      )}
      
      {interpretation && (
        <div className="text-sm text-slate-300 bg-white/5 px-4 py-3 rounded-lg">
          {interpretation}
        </div>
      )}
    </motion.div>
  );
};

interface MetricTileProps {
  label: string;
  value: string;
  benchmark?: { target: number; min: number };
  explanation?: string;
  alert?: string;
  icon?: React.ReactNode;
}

const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  benchmark,
  explanation,
  alert,
  icon,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const getBenchmarkStatus = () => {
    if (!benchmark) return 'neutral';
    const numValue = parseFloat(value);
    if (numValue >= benchmark.target) return 'positive';
    if (numValue >= benchmark.min) return 'warning';
    return 'negative';
  };

  const status = getBenchmarkStatus();
  const statusColors = {
    positive: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    negative: 'border-red-500/30 bg-red-500/5',
    neutral: 'border-white/10 bg-white/5',
  };

  const statusIcons = {
    positive: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    negative: <AlertTriangle className="w-5 h-5 text-red-400" />,
    neutral: null,
  };

  return (
    <div className={cn('p-5 rounded-xl border backdrop-blur-xl relative', statusColors[status])}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-sm font-medium text-slate-400">{label}</div>
        </div>
        {statusIcons[status]}
      </div>
      
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      
      {benchmark && (
        <div className="text-xs text-slate-500">
          Target: {benchmark.target}% • Min: {benchmark.min}%
        </div>
      )}
      
      {alert && (
        <div className="mt-3 text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {alert}
        </div>
      )}
      
      {explanation && (
        <div
          className="absolute top-3 right-3"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info className="w-4 h-4 text-slate-500 cursor-help" />
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-full mt-2 w-64 p-3 rounded-lg bg-slate-800 border border-white/10 shadow-xl text-xs text-slate-300 z-50"
              >
                {explanation}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  defaultOpen = false,
  children,
  badge,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl bg-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-md bg-[#C08B5C]/20 text-[#D4A27F] text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-white/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DataRow {
  label: string;
  value: number | string;
  sublabel?: string;
}

interface DataTableProps {
  data: DataRow[];
  showTotal?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ data, showTotal = false }) => {
  const total = showTotal 
    ? data.reduce((sum, row) => sum + (typeof row.value === 'number' ? row.value : 0), 0)
    : 0;

  return (
    <div className="space-y-2">
      {data.map((row, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
        >
          <div>
            <div className="text-sm text-slate-300">{row.label}</div>
            {row.sublabel && (
              <div className="text-xs text-slate-500 mt-0.5">{row.sublabel}</div>
            )}
          </div>
          <div className="text-sm font-medium text-white">
            {typeof row.value === 'number' 
              ? `$${row.value.toLocaleString()}`
              : row.value
            }
          </div>
        </div>
      ))}
      
      {showTotal && (
        <div className="flex items-center justify-between pt-3 border-t-2 border-white/20 font-bold">
          <div className="text-sm text-white">Total</div>
          <div className="text-lg text-white">${total.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};

interface EnhancedResultsPanelProps {
  pnlOutput: any;
  className?: string;
}

export const EnhancedResultsPanel: React.FC<EnhancedResultsPanelProps> = ({
  pnlOutput,
  className,
}) => {
  if (!pnlOutput) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-slate-500 text-center">
          <div className="text-2xl mb-2">🏠</div>
          <div>Adjust assumptions to see results</div>
        </div>
      </div>
    );
  }

  const year1 = pnlOutput.year1 || {};
  const cashflow = year1.cashflowBeforeTaxes || 0;
  const monthlyFlow = year1.monthlyCashflow || cashflow / 12;
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Hero Metric - Monthly Cashflow */}
      <HeroMetric
        label="Monthly Cashflow"
        value={monthlyFlow}
        size="2xl"
        format="currency"
        trend={{ value: 12, label: '+12% from base scenario' }}
        interpretation={
          monthlyFlow > 500 ? '💪 Strong positive cashflow - excellent deal!' :
          monthlyFlow > 0 ? '👍 Modest positive cashflow' :
          monthlyFlow > -500 ? '⚠️ Near breakeven - consider optimizations' :
          '⛔ Significantly negative - requires changes'
        }
      />
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <MetricTile
          label="Cap Rate"
          value={`${((year1.capRate || 0) * 100).toFixed(2)}%`}
          benchmark={{ target: 8, min: 5 }}
          explanation="Net Operating Income ÷ Purchase Price"
          icon={<Percent className="w-4 h-4 text-slate-400" />}
        />
        <MetricTile
          label="Cash-on-Cash"
          value={`${((year1.cashOnCash || 0) * 100).toFixed(2)}%`}
          benchmark={{ target: 10, min: 8 }}
          explanation="Annual Cashflow ÷ Total Cash Invested"
          icon={<DollarSign className="w-4 h-4 text-slate-400" />}
        />
        <MetricTile
          label="DSCR"
          value={(year1.noi && year1.annualDebtService ? (year1.noi / year1.annualDebtService) : 0).toFixed(2)}
          benchmark={{ target: 1.25, min: 1.0 }}
          alert={(year1.noi && year1.annualDebtService && (year1.noi / year1.annualDebtService) < 1.25) ? 'Below lender minimum' : undefined}
          explanation="Debt Service Coverage Ratio"
          icon={<TrendingUp className="w-4 h-4 text-slate-400" />}
        />
      </div>
      
      {/* Income Breakdown */}
      <AccordionSection title="Income Breakdown" badge={`$${year1.income?.totalIncome?.toLocaleString() || 0}`}>
        <DataTable
          data={[
            { label: 'Gross Potential Income', value: year1.income?.grossPotentialIncome || 0 },
            { label: 'Vacancy Loss', value: -(year1.income?.vacancyLoss || 0), sublabel: 'Deducted from gross' },
            { label: 'Effective Gross Income', value: year1.income?.effectiveGrossIncome || 0 },
            { label: 'Other Income', value: year1.income?.otherIncome || 0 },
          ].filter(row => row.value !== 0)}
          showTotal
        />
      </AccordionSection>
      
      {/* Expense Breakdown */}
      <AccordionSection title="Expense Breakdown" badge={`$${year1.expenses?.totalExpenses?.toLocaleString() || 0}`}>
        <DataTable
          data={[
            { label: 'Property Tax', value: year1.expenses?.propertyTax || 0 },
            { label: 'Insurance', value: year1.expenses?.insurance || 0 },
            { label: 'HOA Fees', value: year1.expenses?.hoa || 0 },
            { label: 'Maintenance', value: year1.expenses?.maintenance || 0 },
            { label: 'Property Management', value: year1.expenses?.propertyManagement || 0 },
            { label: 'Utilities', value: year1.expenses?.utilities || 0 },
            { label: 'Internet', value: year1.expenses?.internet || 0 },
            { label: 'CapEx Reserve', value: year1.expenses?.capexReserve || 0 },
            { label: 'Cleaning Costs', value: year1.expenses?.cleaningCosts || 0 },
            { label: 'Platform Fees', value: year1.expenses?.platformFees || 0 },
            { label: 'Other Operating', value: year1.expenses?.otherOperating || 0 },
          ].filter(row => row.value > 0)}
          showTotal
        />
      </AccordionSection>
      
      {/* NOI Calculation */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#C08B5C]/10 to-[#A8734A]/5 border border-[#C08B5C]/30">
        <div className="text-sm font-medium text-[#D4A27F] mb-4">Net Operating Income</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Total Income</span>
            <span className="text-white font-medium">${year1.income?.totalIncome?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Total Expenses</span>
            <span className="text-red-400">-${year1.expenses?.totalExpenses?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Debt Service</span>
            <span className="text-red-400">-${year1.annualDebtService?.toLocaleString() || 0}</span>
          </div>
          <div className="h-px bg-white/20 my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span className="text-white">Net Operating Income</span>
            <span className="text-[#D4A27F]">${year1.noi?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
      
      {/* 5-Year Projection Button */}
      <button className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#C08B5C]/50 hover:bg-white/10 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#D4A27F]" />
            <span className="text-sm font-semibold text-white">View 5-Year Projection</span>
          </div>
          <motion.div
            className="text-slate-400 group-hover:text-[#D4A27F] transition-colors"
            whileHover={{ x: 5 }}
          >
            →
          </motion.div>
        </div>
      </button>
    </div>
  );
};
