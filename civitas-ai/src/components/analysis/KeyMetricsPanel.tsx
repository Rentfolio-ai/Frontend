/**
 * KeyMetricsPanel - Floating metrics sidebar with glassmorphism design
 * Displays key financial metrics in an always-visible panel
 */
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  value: string;
  label: string;
  size?: 'small' | 'medium' | 'large';
  sentiment?: 'positive' | 'negative' | 'neutral' | 'warning';
  trend?: string;
  benchmark?: string;
  tooltip?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  size = 'medium',
  sentiment = 'neutral',
  trend,
  benchmark,
  tooltip,
  onClick,
}) => {
  const sentimentColors = {
    positive: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    negative: 'from-red-500/20 to-rose-500/20 border-red-500/30',
    warning: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    neutral: 'from-slate-500/20 to-gray-500/20 border-slate-500/30',
  };

  const sentimentTextColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    warning: 'text-yellow-400',
    neutral: 'text-slate-300',
  };

  const sizeStyles = {
    small: 'p-3 text-lg',
    medium: 'p-4 text-2xl',
    large: 'p-6 text-4xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl backdrop-blur-xl border cursor-pointer group',
        'bg-gradient-to-br shadow-lg hover:shadow-xl transition-shadow',
        sentimentColors[sentiment],
        sizeStyles[size]
      )}
      title={tooltip}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        {/* Value */}
        <div className={cn('font-bold tracking-tight', sentimentTextColors[sentiment])}>
          {value}
        </div>
        
        {/* Label */}
        <div className="text-sm font-medium text-slate-400 mt-1">
          {label}
        </div>
        
        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            {sentiment === 'positive' ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : sentiment === 'negative' ? (
              <TrendingDown className="w-3 h-3 text-red-400" />
            ) : null}
            <span>{trend}</span>
          </div>
        )}
        
        {/* Benchmark */}
        {benchmark && (
          <div className="text-xs text-slate-500 mt-1">
            {benchmark}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface DataSourceBadgeProps {
  source: string;
  status: 'active' | 'limited' | 'inactive';
}

const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ source, status }) => {
  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    limited: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    inactive: { icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  };

  const { icon: Icon, color, bg } = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg', bg)}>
      <Icon className={cn('w-3.5 h-3.5', color)} />
      <span className={cn('text-xs font-medium', color)}>
        {source}
      </span>
    </div>
  );
};

interface ScenarioDropdownProps {
  active: string;
  scenarios: string[];
  onChange: (scenario: string) => void;
}

const ScenarioDropdown: React.FC<ScenarioDropdownProps> = ({ active, scenarios, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-left"
      >
        <div className="text-xs text-slate-500 mb-0.5">Scenario</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{active}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Info className="w-4 h-4 text-slate-400" />
          </motion.div>
        </div>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl bg-slate-800 border border-white/10 shadow-xl z-50"
        >
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              onClick={() => {
                onChange(scenario);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors',
                active === scenario ? 'text-[#D4A27F] font-medium' : 'text-slate-300'
              )}
            >
              {scenario}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

interface KeyMetricsPanelProps {
  cashflow: number;
  capRate: number;
  cocReturn: number;
  dataSources: Array<{ name: string; status: 'active' | 'limited' | 'inactive' }>;
  confidence: 'high' | 'medium' | 'low';
  activeScenario: string;
  scenarios: string[];
  onScenarioChange: (scenario: string) => void;
  onMetricClick?: (metric: string) => void;
}

export const KeyMetricsPanel: React.FC<KeyMetricsPanelProps> = ({
  cashflow,
  capRate,
  cocReturn,
  dataSources,
  confidence,
  activeScenario,
  scenarios,
  onScenarioChange,
  onMetricClick,
}) => {
  const getCashflowSentiment = () => {
    if (cashflow > 500) return 'positive';
    if (cashflow > 0) return 'neutral';
    if (cashflow > -500) return 'warning';
    return 'negative';
  };

  const getCapRateSentiment = () => {
    if (capRate >= 8) return 'positive';
    if (capRate >= 5) return 'neutral';
    return 'warning';
  };

  const getCoCReturnSentiment = () => {
    if (cocReturn >= 10) return 'positive';
    if (cocReturn >= 8) return 'neutral';
    if (cocReturn >= 0) return 'warning';
    return 'negative';
  };

  const confidenceColors = {
    high: 'text-emerald-400',
    medium: 'text-yellow-400',
    low: 'text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-6 top-24 w-72 space-y-3 z-30"
    >
      {/* Primary Metric - Monthly Cashflow */}
      <MetricCard
        value={`$${Math.abs(cashflow).toLocaleString()}`}
        label="Monthly Cashflow"
        size="large"
        sentiment={getCashflowSentiment()}
        trend={cashflow > 0 ? '+12% from base' : undefined}
        onClick={() => onMetricClick?.('cashflow')}
      />
      
      {/* Secondary Metrics */}
      <MetricCard
        value={`${capRate.toFixed(2)}%`}
        label="Cap Rate"
        size="medium"
        sentiment={getCapRateSentiment()}
        benchmark="Target: >8%"
        onClick={() => onMetricClick?.('capRate')}
      />
      
      <MetricCard
        value={`${cocReturn.toFixed(2)}%`}
        label="Cash-on-Cash"
        size="medium"
        sentiment={getCoCReturnSentiment()}
        onClick={() => onMetricClick?.('cocReturn')}
      />
      
      {/* Scenario Selector */}
      <ScenarioDropdown
        active={activeScenario}
        scenarios={scenarios}
        onChange={onScenarioChange}
      />
      
      {/* Data Sources */}
      <div className="p-4 rounded-2xl bg-white/3 backdrop-blur-xl border border-white/10">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Data Sources
        </div>
        <div className="space-y-2">
          {dataSources.map((source) => (
            <DataSourceBadge
              key={source.name}
              source={source.name}
              status={source.status}
            />
          ))}
        </div>
        
        {/* Confidence Indicator */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Confidence</span>
            <span className={cn('text-xs font-bold uppercase', confidenceColors[confidence])}>
              {confidence}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
