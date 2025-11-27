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
  Home
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDealAnalyzer } from '../../hooks/useDealAnalyzer';
import type { InvestmentStrategy, ScenarioPreset } from '../../types/pnl';
import { SCENARIO_PRESETS } from '../../types/pnl';
import { AssumptionsPanel } from './AssumptionsPanel';
import { ResultsPanel } from './ResultsPanel';

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
      <div className="flex-shrink-0 px-6 py-4 border-b border-border/50 bg-gradient-to-r from-blue-50/50 to-teal-50/50 dark:from-blue-950/30 dark:to-teal-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Deal Analyzer</h2>
              {propertyAddress && (
                <p className="text-sm text-foreground/60 line-clamp-1">{propertyAddress}</p>
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

        {/* Scenario Presets */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Scenario:</span>
          <div className="flex items-center gap-1.5">
            {(Object.keys(SCENARIO_PRESETS) as ScenarioPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setScenario(preset)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                  activeScenario === preset
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground border border-border/50'
                )}
              >
                {SCENARIO_PRESETS[preset].name}
              </button>
            ))}
            {activeScenario === 'custom' && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Custom
              </span>
            )}
          </div>
          <button
            onClick={resetToDefaults}
            className="ml-2 p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
            title="Reset to defaults"
          >
            <RefreshCw className="w-4 h-4" />
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
