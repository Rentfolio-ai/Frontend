/**
 * Report Type Selector — Redesigned with dark theme + mode-aware types
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Home, Layers, RefreshCw, FileText, Check,
  Briefcase, Target, BookOpen, Scale,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { InvestmentReportFormat } from '../../types/enums';

interface ReportTypeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  group: 'deal' | 'strategy' | 'research';
}

const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  // Deal Analysis (Hunter)
  { value: 'str', label: 'Short-Term Rental', description: 'Vacation rental / Airbnb analysis', icon: <Building2 className="w-4 h-4" />, color: 'text-amber-400', group: 'deal' },
  { value: 'ltr', label: 'Long-Term Rental', description: 'Traditional rental underwriting', icon: <Home className="w-4 h-4" />, color: 'text-emerald-400', group: 'deal' },
  { value: 'adu', label: 'ADU Analysis', description: 'Accessory dwelling unit strategy', icon: <Layers className="w-4 h-4" />, color: 'text-sky-400', group: 'deal' },
  { value: 'flip', label: 'Flip Analysis', description: 'Fix & flip ROI projection', icon: <RefreshCw className="w-4 h-4" />, color: 'text-orange-400', group: 'deal' },
  { value: 'full', label: 'Full Report', description: 'Comprehensive multi-strategy report', icon: <FileText className="w-4 h-4" />, color: 'text-violet-400', group: 'deal' },
  // Strategy (Strategist)
  { value: 'portfolio', label: 'Portfolio Strategy', description: 'Portfolio-level analysis & allocation', icon: <Briefcase className="w-4 h-4" />, color: 'text-purple-400', group: 'strategy' },
  { value: 'strategy', label: 'Investment Thesis', description: 'Buy box & target market rationale', icon: <Target className="w-4 h-4" />, color: 'text-indigo-400', group: 'strategy' },
  // Research
  { value: 'market', label: 'Market Research', description: 'Comprehensive market study', icon: <BookOpen className="w-4 h-4" />, color: 'text-cyan-400', group: 'research' },
  { value: 'comparison', label: 'Comparative Analysis', description: 'Side-by-side market comparison', icon: <Scale className="w-4 h-4" />, color: 'text-[#D4A27F]', group: 'research' },
];

const GROUP_LABELS: Record<string, string> = {
  deal: 'Deal Analysis',
  strategy: 'Strategy',
  research: 'Research',
};

interface ReportTypeSelectorProps {
  selectedType: InvestmentReportFormat | null;
  onSelect: (type: InvestmentReportFormat) => void;
  defaultType?: InvestmentReportFormat;
  inferredType?: InvestmentReportFormat;
  disabled?: boolean;
  compact?: boolean;
}

export const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({
  selectedType,
  onSelect,
  defaultType,
  inferredType,
  disabled = false,
  compact = false,
}) => {
  const effectiveDefault = defaultType || inferredType;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {REPORT_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedType === option.value;
          const isInferred = !selectedType && effectiveDefault === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value as InvestmentReportFormat)}
              disabled={disabled}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border',
                isSelected
                  ? 'bg-violet-500/15 text-violet-300 border-violet-500/25'
                  : isInferred
                  ? 'bg-black/[0.05] text-muted-foreground border-violet-500/15'
                  : 'bg-black/[0.02] text-muted-foreground/70 border-black/[0.06] hover:bg-black/[0.04] hover:text-foreground/55',
                disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              <span className={option.color}>{option.icon}</span>
              <span>{option.label}</span>
              {isInferred && !isSelected && (
                <span className="text-[9px] text-violet-400/60">(suggested)</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Grouped layout
  const groups = ['deal', 'strategy', 'research'] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-medium text-muted-foreground">Report Type</label>
        {inferredType && !selectedType && (
          <span className="text-[10px] text-muted-foreground/50">
            Auto-detected: {REPORT_TYPE_OPTIONS.find(o => o.value === inferredType)?.label}
          </span>
        )}
      </div>

      {groups.map(group => {
        const options = REPORT_TYPE_OPTIONS.filter(o => o.group === group);
        if (options.length === 0) return null;

        return (
          <div key={group}>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2 block">
              {GROUP_LABELS[group]}
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {options.map(option => {
                const isSelected = selectedType === option.value;
                const isInferred = !selectedType && effectiveDefault === option.value;

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => onSelect(option.value as InvestmentReportFormat)}
                    disabled={disabled}
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    className={cn(
                      'relative flex items-start gap-2.5 p-3 rounded-xl border transition-all text-left',
                      isSelected
                        ? 'bg-violet-500/10 border-violet-500/25 shadow-sm shadow-violet-500/5'
                        : isInferred
                        ? 'bg-black/[0.02] border-violet-500/15'
                        : 'bg-black/[0.02] border-black/[0.06] hover:bg-black/[0.03] hover:border-black/[0.08]',
                      disabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}

                    {isInferred && !isSelected && (
                      <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-[8px] font-semibold bg-violet-500/15 text-violet-400/70">
                        Suggested
                      </div>
                    )}

                    <div className={cn(
                      'p-1.5 rounded-lg flex-shrink-0',
                      isSelected ? 'bg-violet-500/20' : 'bg-black/[0.03]'
                    )}>
                      <span className={option.color}>{option.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-foreground/80">{option.label}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5 leading-tight">{option.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportTypeSelector;
