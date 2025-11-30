// FILE: src/components/reports/ReportTypeSelector.tsx
/**
 * Report Type Selector Component
 * Allows users to select the format/type of investment report to generate
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Home,
  Layers,
  RefreshCw,
  FileText,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { InvestmentReportFormat } from '../../types/enums';

interface ReportTypeOption {
  value: InvestmentReportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  {
    value: 'str',
    label: 'Short-Term Rental',
    description: 'Vacation rental / Airbnb analysis',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    value: 'ltr',
    label: 'Long-Term Rental',
    description: 'Traditional rental analysis',
    icon: <Home className="w-5 h-5" />,
  },
  {
    value: 'adu',
    label: 'ADU Analysis',
    description: 'Accessory dwelling unit strategy',
    icon: <Layers className="w-5 h-5" />,
  },
  {
    value: 'flip',
    label: 'Flip Analysis',
    description: 'Fix & flip ROI projection',
    icon: <RefreshCw className="w-5 h-5" />,
  },
  {
    value: 'full',
    label: 'Full Report',
    description: 'Comprehensive multi-strategy report',
    icon: <FileText className="w-5 h-5" />,
  },
];

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
  // Use inferred type as visual hint
  const effectiveDefault = defaultType || inferredType;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {REPORT_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedType === option.value;
          const isInferred = !selectedType && effectiveDefault === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              disabled={disabled}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                'border',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isInferred
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-muted/50 text-foreground/70 border-border/50 hover:bg-muted hover:border-border',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.icon}
              <span>{option.label}</span>
              {isInferred && !isSelected && (
                <span className="text-[10px] opacity-70">(suggested)</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Report Type
        </label>
        {inferredType && !selectedType && (
          <span className="text-xs text-foreground/60">
            Auto-detected: {REPORT_TYPE_OPTIONS.find(o => o.value === inferredType)?.label}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORT_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedType === option.value;
          const isInferred = !selectedType && effectiveDefault === option.value;

          return (
            <motion.button
              key={option.value}
              onClick={() => onSelect(option.value)}
              disabled={disabled}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              className={cn(
                'relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left',
                isSelected
                  ? 'bg-primary/10 border-primary shadow-sm'
                  : isInferred
                  ? 'bg-muted/50 border-primary/30'
                  : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}

              {/* Inferred badge */}
              {isInferred && !isSelected && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/20 text-primary">
                  Suggested
                </div>
              )}

              <div
                className={cn(
                  'p-2 rounded-lg',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground/70'
                )}
              >
                {option.icon}
              </div>
              <div>
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-foreground/60">{option.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ReportTypeSelector;
