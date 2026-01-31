/**
 * EnhancedAIInsightsPanel - Redesigned AI insights with TOON format
 * Features: collapsible sections, thought-observation-opinion-next structure
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Send
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TOONInsight {
  thought?: string;
  observations?: string[];
  opinion?: string;
  next_steps?: string[];
}

interface EnhancedAIInsightsPanelProps {
  insights?: TOONInsight | string;
  verdict?: 'good' | 'okay' | 'bad' | 'needs-work';
  isLoading?: boolean;
  onAskQuestion?: (question: string) => void;
  className?: string;
}

const VerdictBadge: React.FC<{ verdict: string }> = ({ verdict }) => {
  const verdictConfig = {
    good: {
      icon: CheckCircle,
      label: 'Good Deal',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
    },
    okay: {
      icon: TrendingUp,
      label: 'Potential',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
    },
    bad: {
      icon: AlertTriangle,
      label: 'Poor Deal',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
    },
    'needs-work': {
      icon: AlertTriangle,
      label: 'Needs Improvement',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
    },
  };

  const config = verdictConfig[verdict as keyof typeof verdictConfig] || verdictConfig.okay;
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border', config.bg, config.border)}>
      <Icon className={cn('w-4 h-4', config.color)} />
      <span className={cn('text-sm font-semibold', config.color)}>
        {config.label}
      </span>
    </div>
  );
};

const QuickQuestion: React.FC<{ question: string; onClick: () => void }> = ({ question, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-teal-500/50 hover:bg-white/10 transition-all text-left text-sm text-slate-300 group"
  >
    <div className="flex items-center justify-between">
      <span>{question}</span>
      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
    </div>
  </button>
);

export const EnhancedAIInsightsPanel: React.FC<EnhancedAIInsightsPanelProps> = ({
  insights,
  verdict = 'okay',
  isLoading = false,
  onAskQuestion,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [customQuestion, setCustomQuestion] = useState('');

  const quickQuestions = [
    'Is this a good deal?',
    'What are the main risks?',
    'How can I improve cashflow?',
    'Compare STR vs LTR for this property',
  ];

  const handleAskQuestion = (question: string) => {
    if (onAskQuestion) {
      onAskQuestion(question);
      setCustomQuestion('');
    }
  };

  // Parse insights if string
  let toonInsights: TOONInsight = {};
  if (typeof insights === 'string') {
    // Try to extract TOON format from string
    try {
      const parsed = JSON.parse(insights);
      toonInsights = parsed;
    } catch {
      // Fallback to simple display
      toonInsights = { thought: insights };
    }
  } else if (insights) {
    toonInsights = insights;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Insights</h3>
            <p className="text-xs text-slate-500">Analysis from Vasthu AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {verdict && <VerdictBadge verdict={verdict} />}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-4 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </motion.div>
                  <span className="text-sm text-slate-400">Analyzing deal...</span>
                </div>
              </div>
            ) : insights ? (
              <div className="space-y-4">
                {/* Thought */}
                {toonInsights.thought && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Lightbulb className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                          Key Insight
                        </div>
                        <div className="text-sm text-slate-200 leading-relaxed">
                          {toonInsights.thought}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observations */}
                {toonInsights.observations && toonInsights.observations.length > 0 && (
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/20">
                        <Eye className="w-4 h-4 text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3">
                          Observations
                        </div>
                        <ul className="space-y-2">
                          {toonInsights.observations.map((obs, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className="text-teal-400 mt-0.5">•</span>
                              <span>{obs}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Opinion */}
                {toonInsights.opinion && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                          Recommendation
                        </div>
                        <div className="text-sm text-slate-200 leading-relaxed">
                          {toonInsights.opinion}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {toonInsights.next_steps && toonInsights.next_steps.length > 0 && (
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                          Next Steps
                        </div>
                        <ol className="space-y-2">
                          {toonInsights.next_steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-semibold">
                                {index + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                <div className="text-sm">Ask AI a question to get insights</div>
              </div>
            )}

            {/* Ask AI Section */}
            {onAskQuestion && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ask Vasthu AI
                </div>
                
                {/* Quick Questions */}
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q) => (
                    <QuickQuestion
                      key={q}
                      question={q}
                      onClick={() => handleAskQuestion(q)}
                    />
                  ))}
                </div>
                
                {/* Custom Question Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customQuestion.trim()) {
                        handleAskQuestion(customQuestion);
                      }
                    }}
                    placeholder="Ask a custom question..."
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 text-sm text-white placeholder:text-slate-500 transition-all"
                  />
                  <button
                    onClick={() => customQuestion.trim() && handleAskQuestion(customQuestion)}
                    disabled={!customQuestion.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
