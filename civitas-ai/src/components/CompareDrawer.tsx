/**
 * Compare Drawer: Shows only meaningful differences between 2 properties.
 * 
 * Slides in from right, highlights better value in each metric.
 * Max 2 properties for clarity.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, DollarSign, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property, Analysis } from '@/stores/eventStore';

interface CompareDrawerProps {
  isOpen: boolean;
  properties: Property[];
  analyses: Map<string, Analysis>;
  onClose: () => void;
  onChoose: (propertyId: string) => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  isOpen,
  properties,
  analyses,
  onClose,
  onChoose,
}) => {
  // Limit to 2 properties
  const compareProperties = properties.slice(0, 2);
  
  if (compareProperties.length < 2) return null;

  const [prop1, prop2] = compareProperties;
  const analysis1 = analyses.get(prop1.id);
  const analysis2 = analyses.get(prop2.id);

  // Helper to determine which is better
  const getBetter = (val1: number, val2: number, higherIsBetter = true) => {
    if (higherIsBetter) {
      return val1 > val2 ? 0 : val1 < val2 ? 1 : -1;
    }
    return val1 < val2 ? 0 : val1 > val2 ? 1 : -1;
  };

  // Comparison rows (only show if values differ by >10%)
  const rows: Array<{
    label: string;
    val1: string | number;
    val2: string | number;
    better: number;
    icon: React.ReactNode;
  }> = [];

  // Price
  const priceDiff = Math.abs(prop1.price - prop2.price) / Math.min(prop1.price, prop2.price);
  if (priceDiff > 0.1) {
    rows.push({
      label: 'Price',
      val1: `$${(prop1.price / 1000).toFixed(0)}k`,
      val2: `$${(prop2.price / 1000).toFixed(0)}k`,
      better: getBetter(prop1.price, prop2.price, false),
      icon: <DollarSign className="w-4 h-4" />,
    });
  }

  // Sqft
  if (prop1.sqft && prop2.sqft) {
    const sqftDiff = Math.abs(prop1.sqft - prop2.sqft) / Math.min(prop1.sqft, prop2.sqft);
    if (sqftDiff > 0.1) {
      rows.push({
        label: 'Square Feet',
        val1: prop1.sqft.toLocaleString(),
        val2: prop2.sqft.toLocaleString(),
        better: getBetter(prop1.sqft, prop2.sqft, true),
        icon: <Home className="w-4 h-4" />,
      });
    }
  }

  // Fit Score
  if (prop1.fit_score !== undefined && prop2.fit_score !== undefined) {
    const scoreDiff = Math.abs(prop1.fit_score - prop2.fit_score) / Math.max(prop1.fit_score, prop2.fit_score);
    if (scoreDiff > 0.1) {
      rows.push({
        label: 'Fit Score',
        val1: `${prop1.fit_score}/100`,
        val2: `${prop2.fit_score}/100`,
        better: getBetter(prop1.fit_score, prop2.fit_score, true),
        icon: <TrendingUp className="w-4 h-4" />,
      });
    }
  }

  // Cash Flow (if analyses available)
  if (analysis1 && analysis2) {
    const cfDiff = Math.abs(analysis1.monthly_cash_flow - analysis2.monthly_cash_flow) / 
                   Math.max(Math.abs(analysis1.monthly_cash_flow), Math.abs(analysis2.monthly_cash_flow));
    if (cfDiff > 0.1) {
      rows.push({
        label: 'Monthly Cash Flow',
        val1: `$${analysis1.monthly_cash_flow.toLocaleString()}`,
        val2: `$${analysis2.monthly_cash_flow.toLocaleString()}`,
        better: getBetter(analysis1.monthly_cash_flow, analysis2.monthly_cash_flow, true),
        icon: <DollarSign className="w-4 h-4" />,
      });
    }

    // Cap Rate
    const capDiff = Math.abs(analysis1.cap_rate - analysis2.cap_rate) / Math.max(analysis1.cap_rate, analysis2.cap_rate);
    if (capDiff > 0.1) {
      rows.push({
        label: 'Cap Rate',
        val1: `${analysis1.cap_rate.toFixed(1)}%`,
        val2: `${analysis2.cap_rate.toFixed(1)}%`,
        better: getBetter(analysis1.cap_rate, analysis2.cap_rate, true),
        icon: <TrendingUp className="w-4 h-4" />,
      });
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-slate-950 border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Compare Properties</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Property Headers */}
            <div className="grid grid-cols-2 gap-4 p-4 border-b border-white/10">
              {compareProperties.map((prop) => (
                <div key={prop.id} className="p-4 rounded-lg bg-slate-900/50 border border-white/10">
                  <h3 className="font-semibold text-white text-sm mb-1 truncate">
                    {prop.address}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {prop.city}, {prop.state}
                  </p>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="p-4 space-y-2">
              {rows.length > 0 ? (
                rows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-3 rounded-lg bg-slate-900/30"
                  >
                    {/* Property 1 Value */}
                    <div
                      className={cn(
                        'text-right p-2 rounded',
                        row.better === 0 && 'bg-emerald-500/10'
                      )}
                    >
                      <span className={cn('text-sm font-medium', row.better === 0 ? 'text-emerald-400' : 'text-gray-300')}>
                        {row.val1}
                      </span>
                    </div>

                    {/* Label */}
                    <div className="flex flex-col items-center gap-1 min-w-[120px]">
                      <div className="text-gray-400">{row.icon}</div>
                      <span className="text-xs text-gray-400 text-center">{row.label}</span>
                    </div>

                    {/* Property 2 Value */}
                    <div
                      className={cn(
                        'text-left p-2 rounded',
                        row.better === 1 && 'bg-emerald-500/10'
                      )}
                    >
                      <span className={cn('text-sm font-medium', row.better === 1 ? 'text-emerald-400' : 'text-gray-300')}>
                        {row.val2}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Properties are very similar</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-slate-950/95 backdrop-blur-sm border-t border-white/10 p-4">
              <div className="grid grid-cols-2 gap-4">
                {compareProperties.map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => onChoose(prop.id)}
                    className="px-4 py-3 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-all"
                  >
                    Choose {prop.address.split(',')[0]}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="w-full mt-2 px-4 py-2 rounded-lg bg-slate-800 text-gray-300 font-medium hover:bg-slate-700 transition-all"
              >
                Keep looking
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
