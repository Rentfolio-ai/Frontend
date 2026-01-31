// FILE: src/components/analysis/DealAnalyzer.tsx
/**
 * Deal Analyzer Component
 * Main P&L calculator interface with assumptions panel and results display
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  Info,
  Building2,
  Home,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDealAnalyzer } from '../../hooks/useDealAnalyzer';
import type { InvestmentStrategy, ScenarioPreset } from '../../types/pnl';
import { SCENARIO_PRESETS } from '../../types/pnl';
import { AssumptionsPanel } from './AssumptionsPanel';
import { ResultsPanel } from './ResultsPanel';
import { AIInsightsPanel } from './AIInsightsPanel';
import { KeyMetricsPanel } from './KeyMetricsPanel';
import { TabbedAssumptionsPanel } from './TabbedAssumptionsPanel';
import { EnhancedResultsPanel } from './EnhancedResultsPanel';
import { EnhancedAIInsightsPanel } from './EnhancedAIInsightsPanel';

interface DealAnalyzerProps {
  propertyId?: string | null;
  initialPurchasePrice?: number;
  initialStrategy?: InvestmentStrategy;
  propertyAddress?: string;
  className?: string;
  onClose?: () => void;
}

export const DealAnalyzer: React.FC<DealAnalyzerProps> = ({
  propertyId = null,
  initialPurchasePrice = 500000,
  initialStrategy = 'STR',
  propertyAddress,
  className,
}) => {
  const {
    strategy,
    assumptions,
    pnlOutput,
    isLoading,
    error,
    activeScenario,
    aiExplanation,
    isExplaining,
    aiVerdict,
    setStrategy,
    updateAssumption,
    setScenario,
    askAI,
    resetToDefaults,
    isFieldOverridden,
  } = useDealAnalyzer({
    propertyId,
    initialPurchasePrice,
    initialStrategy,
    autoCalculate: true,
  });

  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');

  // Handle AI question submission
  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    await askAI(aiQuestion);
    setAiQuestion('');
  };

  // Quick AI questions
  const quickQuestions = [
    'Is this a good deal?',
    'What are the risks?',
    'How can I improve returns?',
    'Compare STR vs LTR',
  ];

  return (
    <div className={cn('flex flex-col h-full bg-[#0F1115]', className)}>
      {/* Compact Header - Hidden as it is redundant with Drawer header now, or keep very minimal */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        {/* Strategy Toggle - Sleek segments */}
        <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setStrategy('STR')}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              strategy === 'STR'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            Short-Term
          </button>
          <button
            onClick={() => setStrategy('LTR')}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              strategy === 'LTR'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            Long-Term
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* Main Content - Full width single column */}
      <div className="flex-1 overflow-y-auto bg-[#0F1115]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Key Metrics - Top */}
          {pnlOutput && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="text-sm font-medium text-white/60">Cash Flow</div>
                </div>
                <div className="text-3xl font-semibold text-white tracking-tight">
                  <span className="text-emerald-400">$</span>{Math.round((pnlOutput.year1?.cashflow_before_taxes || 0) / 12).toLocaleString()}
                  <span className="text-lg text-white/40 font-normal ml-1">/mo</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-blue-500/30 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <div className="text-sm font-medium text-white/60">Cap Rate</div>
                </div>
                <div className="text-3xl font-semibold text-white tracking-tight">
                  {((pnlOutput.year1?.cap_rate || 0) * 100).toFixed(2)}
                  <span className="text-lg text-blue-400/80 font-normal ml-0.5">%</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-purple-500/30 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <div className="text-sm font-medium text-white/60">CoC ROI</div>
                </div>
                <div className="text-3xl font-semibold text-white tracking-tight">
                  {((pnlOutput.year1?.cash_on_cash_return || 0) * 100).toFixed(2)}
                  <span className="text-lg text-purple-400/80 font-normal ml-0.5">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Inputs Panel */}
          <div className="bg-transparent border border-white/5 rounded-xl overflow-hidden">
            <TabbedAssumptionsPanel
              strategy={strategy}
              assumptions={assumptions}
              onUpdate={updateAssumption}
              isFieldOverridden={isFieldOverridden}
              dataSources={{
                purchase_price: { source: 'Zillow', confidence: 'high' },
                monthly_rent: { source: 'Census', confidence: 'high' },
                mortgage_rate_pct: { source: 'FRED', confidence: 'high' },
                property_tax_rate_pct: { source: 'Census', confidence: 'high' },
              }}
            />
          </div>

          {/* AI Verdict */}
          {aiVerdict && (
            <div className={cn(
              "p-4 rounded-xl border",
              aiVerdict === 'Black'
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            )}>
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5",
                  aiVerdict === 'Black' ? "bg-emerald-500/10" : "bg-red-500/10"
                )}>
                  {aiVerdict === 'Black' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={cn(
                    "text-sm font-semibold mb-1",
                    aiVerdict === 'Black' ? "text-emerald-400" : "text-red-400"
                  )}>
                    {aiVerdict === 'Black' ? 'Investment Opportunity' : 'High Risk Factor'}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">{aiExplanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="font-semibold text-red-400 mb-1">Calculation Error</p>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          ) : (
            <div className="bg-transparent border border-white/5 rounded-xl overflow-hidden">
              <EnhancedResultsPanel pnlOutput={pnlOutput} />
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-transparent border border-white/5 rounded-xl overflow-hidden">
            <EnhancedAIInsightsPanel
              insights={pnlOutput?.aiInsights}
              verdict={aiVerdict === 'Black' ? 'good' : aiVerdict === 'Red' ? 'bad' : 'okay'}
              isLoading={isExplaining}
              onAskQuestion={async (question) => {
                await askAI(question);
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Chat Section - Compact */}
      <div className="flex-shrink-0 border-t border-white/5 bg-[#0F1115]">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-700 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white">Ask AI about this deal</span>
          </div>
          <ChevronDown className={cn(
            'w-4 h-4 text-slate-400 transition-transform',
            showAIChat && 'rotate-180'
          )} />
        </button>

        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 space-y-3">
                {/* Quick question chips */}
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => askAI(q)}
                      disabled={isExplaining}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 text-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Custom question input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                    placeholder="Ask a question about this investment..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                    disabled={isExplaining}
                  />
                  <button
                    onClick={handleAskAI}
                    disabled={!aiQuestion.trim() || isExplaining}
                    className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExplaining ? 'Thinking...' : 'Ask'}
                  </button>
                </div>

                {/* AI Response */}
                {aiExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                        <Info className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                        {aiExplanation}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DealAnalyzer;
