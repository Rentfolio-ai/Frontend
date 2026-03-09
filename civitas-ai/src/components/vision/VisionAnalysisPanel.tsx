// FILE: src/components/vision/VisionAnalysisPanel.tsx
// Property Diagnosis Panel — auto-analyzes captured photos and shows
// a professional diagnostic report with condition, costs, and investment metrics.

import React, { useState, useEffect } from 'react';
import {
  X, Loader2, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, DollarSign, Wrench,
  TrendingUp, Shield, Zap, Eye, RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { visionService } from '../../services/visionApi';
import type { AnalyzePropertyImageOutput } from '../../types/backendTools';

export type AnalysisType = 'renovation' | 'condition' | 'valuation' | 'comprehensive';
export type RoomType = 'kitchen' | 'bathroom' | 'bedroom' | 'living_room' | 'exterior' | 'interior' | 'auto';

interface VisionAnalysisPanelProps {
  file: File;
  previewUrl: string;
  onClose: () => void;
  onResult: (result: AnalyzePropertyImageOutput) => void;
}

const conditionConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ReactNode }> = {
  excellent: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', label: 'Excellent', icon: <CheckCircle className="w-4 h-4" /> },
  good: { color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/25', label: 'Good', icon: <CheckCircle className="w-4 h-4" /> },
  fair: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25', label: 'Fair', icon: <AlertTriangle className="w-4 h-4" /> },
  poor: { color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/25', label: 'Poor', icon: <AlertTriangle className="w-4 h-4" /> },
  critical: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/25', label: 'Critical', icon: <Shield className="w-4 h-4" /> },
};

const conditionScore: Record<string, number> = {
  excellent: 95,
  good: 78,
  fair: 55,
  poor: 35,
  critical: 15,
};

export const VisionAnalysisPanel: React.FC<VisionAnalysisPanelProps> = ({
  file,
  previewUrl,
  onClose,
  onResult,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzePropertyImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');

  // Auto-start comprehensive analysis when image is provided
  useEffect(() => {
    let cancelled = false;

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setError(null);
      setResult(null);
      setAnalysisStage('Classifying property condition...');

      try {
        // Short delay so the UI shows the loading state
        await new Promise(r => setTimeout(r, 300));
        if (cancelled) return;

        setAnalysisStage('Running comprehensive diagnosis...');
        const res = await visionService.analyzeFromFile(file, {
          analysis_type: 'comprehensive',
          room_type: 'auto',
        });

        if (cancelled) return;
        setResult(res);
        onResult(res);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Analysis failed');
      } finally {
        if (!cancelled) {
          setIsAnalyzing(false);
          setAnalysisStage('');
        }
      }
    };

    runAnalysis();
    return () => { cancelled = true; };
  }, [file]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setAnalysisStage('Retrying diagnosis...');

    try {
      const res = await visionService.analyzeFromFile(file, {
        analysis_type: 'comprehensive',
        room_type: 'auto',
      });
      setResult(res);
      onResult(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  const condition = result?.condition;
  const overallCondition = condition?.overall || 'unknown';
  const cfg = conditionConfig[overallCondition] || conditionConfig.fair;
  const score = conditionScore[overallCondition] || 50;
  const costs = result?.renovation_costs;
  const hasValidCosts = costs && (
    (costs.basic_refresh?.total && costs.basic_refresh.total > 0) ||
    (costs.standard_rental?.total && costs.standard_rental.total > 0) ||
    (costs.premium_upgrade?.total && costs.premium_upgrade.total > 0)
  );

  // Collect all issues
  const allIssues = [
    ...(condition?.safety_concerns || []).map((i: any) => ({ ...i, type: 'safety' })),
    ...(condition?.structural_issues || []).map((i: any) => ({ ...i, type: 'structural' })),
    ...(condition?.cosmetic_issues || []).map((i: any) => ({ ...i, type: 'cosmetic' })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mx-4 mt-3 rounded-2xl border border-black/[0.08] bg-surface/95 backdrop-blur-2xl overflow-hidden shadow-2xl"
    >
      {/* ── Loading State ── */}
      {isAnalyzing && (
        <div className="p-6">
          <div className="flex items-center gap-4">
            {/* Image preview */}
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-black/8 shrink-0 relative">
              <img src={previewUrl} alt="Property" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#C08B5C] border-t-transparent animate-spin" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C08B5C]" />
                <span className="text-sm font-semibold text-foreground">Property Diagnosis</span>
              </div>
              <p className="text-xs text-muted-foreground">{analysisStage}</p>
              <div className="h-1 rounded-full bg-black/[0.05] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#C08B5C] to-[#C08B5C]/60"
                  initial={{ width: '5%' }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 8, ease: 'linear' }}
                />
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/8 text-muted-foreground/50 hover:text-muted-foreground transition-colors self-start">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {error && !isAnalyzing && (
        <div className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Diagnosis Failed</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-3 px-3 py-1.5 rounded-lg bg-black/[0.05] hover:bg-black/[0.07] text-foreground/70 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Retry Analysis
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/8 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {result && result.success && !isAnalyzing && (
        <div>
          {/* Header with image and condition score */}
          <div className="relative">
            {/* Image banner */}
            <div className="h-32 overflow-hidden relative">
              <img src={previewUrl} alt="Property" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent" />

              {/* Close button */}
              <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-muted-foreground hover:text-foreground transition-colors z-10">
                <X className="w-4 h-4" />
              </button>

              {/* Condition score overlay */}
              <div className="absolute bottom-3 left-4 flex items-end gap-3">
                <div className={`${cfg.bg} ${cfg.border} border backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2`}>
                  {cfg.icon}
                  <div>
                    <p className={`text-lg font-bold ${cfg.color} leading-none`}>{score}</p>
                    <p className={`text-[10px] font-medium ${cfg.color} opacity-70`}>{cfg.label}</p>
                  </div>
                </div>

                {result.room_type && result.room_type !== 'auto' && (
                  <span className="text-xs text-muted-foreground/70 mb-1 capitalize">
                    {result.room_type.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-4 pt-2 space-y-3.5">
            {/* Summary */}
            <p className="text-[13px] text-foreground/70 leading-relaxed">{result.summary}</p>

            {/* ── Renovation Cost Tiers ── */}
            {hasValidCosts && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#C08B5C] hover:text-[#C08B5C]/80 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Estimated Renovation Costs
                  {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <div className="grid grid-cols-3 gap-2">
                  {costs!.basic_refresh?.total > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/15 text-center">
                      <p className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-wider">Basic</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5">${costs!.basic_refresh.total.toLocaleString()}</p>
                    </div>
                  )}
                  {costs!.standard_rental?.total > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/15 text-center">
                      <p className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-wider">Standard</p>
                      <p className="text-sm font-bold text-amber-400 mt-0.5">${costs!.standard_rental.total.toLocaleString()}</p>
                    </div>
                  )}
                  {costs!.premium_upgrade?.total > 0 && (
                    <div className="p-2.5 rounded-xl bg-violet-500/[0.07] border border-violet-500/15 text-center">
                      <p className="text-[10px] font-semibold text-violet-400/60 uppercase tracking-wider">Premium</p>
                      <p className="text-sm font-bold text-violet-400 mt-0.5">${costs!.premium_upgrade.total.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Cost breakdown detail */}
                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 mt-1"
                    >
                      {['basic_refresh', 'standard_rental', 'premium_upgrade'].map(tier => {
                        const tierData = costs![tier as keyof typeof costs] as any;
                        if (!tierData?.breakdown?.length) return null;
                        const tierColors: Record<string, string> = {
                          basic_refresh: 'text-emerald-400/50',
                          standard_rental: 'text-amber-400/50',
                          premium_upgrade: 'text-violet-400/50',
                        };
                        return (
                          <div key={tier} className="rounded-xl border border-black/[0.05] bg-black/[0.02] p-3">
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${tierColors[tier] || 'text-muted-foreground/70'}`}>
                              {tier.replace(/_/g, ' ')}
                            </p>
                            <div className="space-y-1.5">
                              {tierData.breakdown.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{item.category || item.description}</span>
                                  <span className="text-foreground/70 font-medium tabular-nums">${(item.cost || 0).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── Detected Issues ── */}
            {allIssues.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowIssues(!showIssues)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground/70 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {allIssues.length} Issue{allIssues.length !== 1 ? 's' : ''} Detected
                  {showIssues ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <AnimatePresence>
                  {showIssues && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      {allIssues.slice(0, 8).map((issue: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                            issue.type === 'safety' ? 'bg-red-400'
                              : issue.type === 'structural' ? 'bg-orange-400'
                                : 'bg-amber-400'
                          }`} />
                          <span className="text-muted-foreground">
                            <span className="text-foreground/70 font-medium capitalize">{issue.type}: </span>
                            {typeof issue === 'string' ? issue : (issue.description || issue.issue || JSON.stringify(issue))}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── Recommendations ── */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Action Items
                </p>
                <div className="space-y-1.5">
                  {result.recommendations.slice(0, 5).map((rec: any, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                        rec.priority === 'high' || rec.priority === 'critical'
                          ? 'bg-red-400'
                          : rec.priority === 'medium'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                      }`} />
                      <div className="flex-1">
                        <span className="text-muted-foreground">{rec.action}</span>
                        {rec.estimated_cost > 0 && (
                          <span className="text-muted-foreground/50 ml-1 tabular-nums">(~${rec.estimated_cost.toLocaleString()})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Investment Metrics ── */}
            {result.investment_metrics && (
              <div className="pt-2 border-t border-black/[0.05] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#C08B5C]" />
                    <span className="text-xs font-semibold text-[#C08B5C]">Investment Analysis</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    result.investment_metrics.risk_level === 'low'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : result.investment_metrics.risk_level === 'medium'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'
                  }`}>
                    {result.investment_metrics.risk_level} risk
                  </div>
                </div>

                {/* Deal Score + Strategy */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#C08B5C]/[0.07] border border-[#C08B5C]/15 text-center">
                    <p className="text-[10px] font-semibold text-[#C08B5C]/60 uppercase tracking-wider">Deal Score</p>
                    <p className="text-lg font-bold text-[#C08B5C] mt-0.5">{result.investment_metrics.deal_score}</p>
                    <p className="text-[10px] text-muted-foreground/50">/ 100</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.06] text-center">
                    <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Strategy</p>
                    <p className="text-sm font-bold text-foreground/80 mt-0.5 capitalize">
                      {result.investment_metrics.recommended_strategy.replace(/-/g, ' ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50">Recommended</p>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="p-2 rounded-lg bg-black/[0.02] text-center">
                    <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase">Value-Add</p>
                    <p className="text-xs font-bold text-foreground/70 mt-0.5">{result.investment_metrics.value_add_potential_pct}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/[0.02] text-center">
                    <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase">Rent Upside</p>
                    <p className="text-xs font-bold text-foreground/70 mt-0.5">{result.investment_metrics.rental_premium_pct}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/[0.02] text-center">
                    <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase">BRRRR</p>
                    <p className={`text-xs font-bold mt-0.5 capitalize ${
                      result.investment_metrics.brrrr_viability === 'yes' ? 'text-emerald-400'
                        : result.investment_metrics.brrrr_viability === 'maybe' ? 'text-amber-400'
                          : 'text-muted-foreground/70'
                    }`}>{result.investment_metrics.brrrr_viability}</p>
                  </div>
                </div>

                {/* Strategy reasoning */}
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  {result.investment_metrics.strategy_reasoning}
                </p>
              </div>
            )}

            {/* Fallback investment insight when no investment_metrics */}
            {!result.investment_metrics && hasValidCosts && (
              <div className="pt-2 border-t border-black/[0.05]">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C08B5C]" />
                  <span className="text-xs font-semibold text-[#C08B5C]">Investment Insight</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {overallCondition === 'excellent' || overallCondition === 'good'
                    ? 'This property is in strong condition. Minimal renovation needed — focus on cosmetic upgrades to maximize rental premium.'
                    : overallCondition === 'fair'
                      ? `With a standard renovation budget of ~$${(costs?.standard_rental?.total || 0).toLocaleString()}, this property could see significant value-add potential. Good candidate for BRRRR or rental repositioning.`
                      : `Major renovation needed (~$${(costs?.standard_rental?.total || 0).toLocaleString()}+). Evaluate total acquisition + renovation cost against ARV. Could be a high-ROI flip if purchased at the right price.`
                  }
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleRetry}
                className="flex-1 py-2 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-muted-foreground text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Re-analyze
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-[#C08B5C]/15 hover:bg-[#C08B5C]/25 border border-[#C08B5C]/20 text-[#C08B5C] text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3 h-3" />
                Ask About This
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
