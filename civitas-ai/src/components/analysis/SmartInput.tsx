/**
 * SmartInput - Intelligent input field with auto-formatting, data sources, and keyboard shortcuts
 * Features: currency formatting, data source indicators, override tracking, quick increments
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, RotateCcw, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SmartInputProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  
  // Formatting
  format?: 'currency' | 'percentage' | 'number';
  prefix?: string;
  suffix?: string;
  
  // Smart features
  suggestions?: number[];
  dataSource?: string;
  confidence?: 'high' | 'medium' | 'low';
  defaultValue?: number | string;
  
  // Help & Context
  tooltip?: string;
  placeholder?: string;
  helpText?: string;
  
  // Validation
  min?: number;
  max?: number;
  error?: string;
  
  // Keyboard shortcuts
  shortcuts?: {
    up?: number | string;
    down?: number | string;
    shift_up?: number | string;
    shift_down?: number | string;
  };
  
  // Style
  className?: string;
  disabled?: boolean;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  label,
  value,
  onChange,
  format = 'number',
  prefix,
  suffix,
  suggestions = [],
  dataSource,
  confidence,
  defaultValue,
  tooltip,
  placeholder,
  helpText,
  min,
  max,
  error,
  shortcuts = {},
  className,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const isOverridden = defaultValue !== undefined && value !== defaultValue;

  // Format display value
  const formatValue = (val: number | string): string => {
    if (val === '' || val === null || val === undefined) return '';
    
    const numVal = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
    if (isNaN(numVal)) return String(val);
    
    switch (format) {
      case 'currency':
        return numVal.toLocaleString('en-US', { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        });
      case 'percentage':
        return numVal.toFixed(2);
      case 'number':
      default:
        return numVal.toLocaleString('en-US');
    }
  };

  // Parse input value
  const parseValue = (input: string): number => {
    const cleaned = input.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Handle increment/decrement
  const handleIncrement = (amount: number) => {
    const numVal = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    const newVal = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, numVal + amount));
    onChange(newVal);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'ArrowUp' && shortcuts.up) {
      e.preventDefault();
      const amount = typeof shortcuts.up === 'number' ? shortcuts.up : parseValue(shortcuts.up);
      if (e.shiftKey && shortcuts.shift_up) {
        const shiftAmount = typeof shortcuts.shift_up === 'number' ? shortcuts.shift_up : parseValue(shortcuts.shift_up);
        handleIncrement(shiftAmount);
      } else {
        handleIncrement(amount);
      }
    } else if (e.key === 'ArrowDown' && shortcuts.down) {
      e.preventDefault();
      const amount = typeof shortcuts.down === 'number' ? shortcuts.down : parseValue(shortcuts.down);
      if (e.shiftKey && shortcuts.shift_down) {
        const shiftAmount = typeof shortcuts.shift_down === 'number' ? shortcuts.shift_down : parseValue(shortcuts.shift_down);
        handleIncrement(shiftAmount);
      } else {
        handleIncrement(amount);
      }
    }
  };

  // Handle reset to default
  const handleReset = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    }
  };

  // Confidence indicator colors
  const confidenceColors = {
    high: 'text-emerald-400 border-emerald-500/30',
    medium: 'text-yellow-400 border-yellow-500/30',
    low: 'text-red-400 border-red-500/30',
  };

  const confidenceIcons = {
    high: CheckCircle,
    medium: AlertTriangle,
    low: AlertTriangle,
  };

  const ConfidenceIcon = confidence ? confidenceIcons[confidence] : null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label with data source indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-200">
            {label}
          </label>
          {tooltip && (
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-lg bg-slate-800 border border-white/10 shadow-xl text-xs text-slate-300 z-50"
                  >
                    {tooltip}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        {/* Data source & confidence */}
        <div className="flex items-center gap-2">
          {confidence && ConfidenceIcon && (
            <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-md border', confidenceColors[confidence])}>
              <ConfidenceIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{dataSource}</span>
            </div>
          )}
        </div>
      </div>

      {/* Input field container */}
      <div className="relative">
        <div
          className={cn(
            'relative flex items-center rounded-xl border transition-all',
            isFocused 
              ? 'border-[#C08B5C]/50 ring-2 ring-[#C08B5C]/20' 
              : error 
              ? 'border-red-500/50' 
              : 'border-white/10 hover:border-white/20',
            disabled && 'opacity-50 cursor-not-allowed',
            isOverridden && 'border-amber-500/30 bg-amber-500/5'
          )}
        >
          {/* Prefix */}
          {(prefix || format === 'currency') && (
            <span className="pl-4 text-slate-400 text-sm font-medium">
              {format === 'currency' ? '$' : prefix}
            </span>
          )}
          
          {/* Input */}
          <input
            type="text"
            value={formatValue(value)}
            onChange={(e) => {
              const parsed = parseValue(e.target.value);
              onChange(parsed);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex-1 px-4 py-3 bg-transparent text-white text-sm font-medium',
              'focus:outline-none placeholder:text-slate-500',
              (prefix || format === 'currency') && 'pl-2'
            )}
          />
          
          {/* Suffix */}
          {(suffix || format === 'percentage') && (
            <span className="pr-4 text-slate-400 text-sm font-medium">
              {format === 'percentage' ? '%' : suffix}
            </span>
          )}
          
          {/* Quick increment buttons */}
          {!disabled && (shortcuts.up || shortcuts.down) && (
            <div className="flex flex-col border-l border-white/10 ml-2">
              <button
                onClick={() => handleIncrement(
                  typeof shortcuts.up === 'number' ? shortcuts.up : parseValue(shortcuts.up || '0')
                )}
                className="px-3 py-1 hover:bg-white/5 transition-colors"
                type="button"
              >
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleIncrement(
                  -(typeof shortcuts.down === 'number' ? shortcuts.down : parseValue(shortcuts.down || '0'))
                )}
                className="px-3 py-1 hover:bg-white/5 transition-colors border-t border-white/10"
                type="button"
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          )}
          
          {/* Reset button (if overridden) */}
          {isOverridden && !disabled && (
            <button
              onClick={handleReset}
              className="px-3 py-2 hover:bg-white/5 transition-colors border-l border-white/10"
              title="Reset to default"
              type="button"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>

        {/* Quick suggestions */}
        {suggestions.length > 0 && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 rounded-lg bg-slate-800 border border-white/10 shadow-xl z-50"
          >
            <div className="text-xs text-slate-500 mb-2 px-2">Quick values:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    onChange(suggestion);
                    setIsFocused(false);
                  }}
                  className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
                  type="button"
                >
                  {formatValue(suggestion)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Help text or error */}
      {(helpText || error) && (
        <div className={cn('text-xs', error ? 'text-red-400' : 'text-slate-500')}>
          {error || helpText}
        </div>
      )}
      
      {/* Keyboard shortcut hint */}
      {!disabled && shortcuts.up && (
        <div className="text-xs text-slate-600 flex items-center gap-2">
          <span>↑↓ to adjust</span>
          {shortcuts.shift_up && <span>• Shift+↑↓ for larger increments</span>}
        </div>
      )}
    </div>
  );
};
