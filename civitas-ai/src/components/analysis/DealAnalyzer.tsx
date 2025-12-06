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
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-white/10 bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/10" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Deal Analyzer</h2>
              {propertyAddress && (
                <p className="text-sm text-slate-400 font-medium line-clamp-1">{propertyAddress}</p>
              )}
            </div>
          </div>

          {/* Strategy Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/50 border border-border/50">
            <button
              onClick={() => setStrategy('STR')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                strategy === 'STR'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted'
              )}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                STR
              </span>
            </button>
            <button
              onClick={() => setStrategy('LTR')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                strategy === 'LTR'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted'
              )}
            >
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                LTR
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5 relative">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scenario</span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            {(Object.keys(SCENARIO_PRESETS) as ScenarioPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setScenario(preset)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  activeScenario === preset
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {SCENARIO_PRESETS[preset].name}
              </button>
            ))}
            {activeScenario === 'custom' && (
              <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Custom
              </span>
            )}
          </div>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Reset to defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Assumptions Panel */}
        <div className="lg:w-[360px] flex-shrink-0 border-r border-border/50 overflow-y-auto">
          <AssumptionsPanel
            strategy={strategy}
            assumptions={assumptions}
            onUpdateAssumption={updateAssumption}
            isFieldOverridden={isFieldOverridden}
            isLoading={isLoading}
          />
        </div>

        {/* Results Panel */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-950/30">
          {/* AI Verdict Banner */}
          {aiVerdict && (
            <div className="p-6 pb-0">
              <div className={cn(
                "relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 shadow-xl",
                aiVerdict === 'Black'
                  ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 shadow-emerald-500/5"
                  : "bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20 shadow-rose-500/5"
              )}>
                <div className="flex items-start gap-5 relative z-10">
                  <div className={cn(
                    "flex-shrink-0 p-3 rounded-xl",
                    aiVerdict === 'Black' ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  )}>
                    {aiVerdict === 'Black' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={cn(
                        "text-lg font-bold tracking-tight",
                        aiVerdict === 'Black' ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
                      )}>
                        {aiVerdict === 'Black' ? 'Excellent Investment Opportunity' : 'High Risk Investment'}
                      </h3>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border",
                        aiVerdict === 'Black'
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                      )}>
                        {aiVerdict === 'Black' ? 'Strong Buy' : 'Caution'}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      {aiExplanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error ? (
            <div className="p-6">
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger">
                <p className="font-medium">Calculation Error</p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
              </div>
            </div>
          ) : (
            <ResultsPanel
              pnlOutput={pnlOutput}
              strategy={strategy}
              isLoading={isLoading}
              financingSummary={pnlOutput?.financingSummary}
            />
          )}

          {/* AI Insights Panel */}
          {pnlOutput?.aiInsights && (
            <div className="p-6 pt-0">
              <AIInsightsPanel insights={pnlOutput.aiInsights} />
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Section */}
      <div className="flex-shrink-0 border-t border-border/50 bg-gradient-to-r from-blue-50/30 to-teal-50/30 dark:from-blue-950/20 dark:to-teal-950/20">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="w-full px-6 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Ask AI about this deal</span>
          </div>
          <ChevronDown className={cn(
            'w-4 h-4 text-foreground/50 transition-transform',
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
