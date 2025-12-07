// FILE: src/pages/PnLCalculatorPage.tsx
/**
 * Standalone P&L Calculator Page
 * Full-page P&L analysis tool with premium design
 */
import React from 'react';
import { motion } from 'framer-motion';
import { DealAnalyzer } from '../components/analysis/DealAnalyzer';

export const PnLCalculatorPage: React.FC = () => {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-shrink-0 px-8 py-6 backdrop-blur-xl bg-white/80 border-b border-blue-900/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                P&L Calculator
              </h1>
              <p className="text-sm text-blue-900/60">
                Analyze investment returns for STR and LTR properties
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Calculator Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 overflow-auto"
      >
        <div className="h-full px-8 py-6">
          <div className="max-w-7xl mx-auto h-full">
            <div className="h-full rounded-2xl backdrop-blur-xl bg-white/90 border border-blue-900/10 shadow-2xl shadow-blue-900/5 overflow-hidden">
              <DealAnalyzer
                propertyId={null}
                initialPurchasePrice={500000}
                initialStrategy="STR"
                propertyAddress={undefined}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PnLCalculatorPage;
