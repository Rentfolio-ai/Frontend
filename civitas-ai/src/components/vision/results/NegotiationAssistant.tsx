/**
 * NegotiationAssistant — Smart negotiation strategy
 *
 * Shows analysis-derived negotiation talking points:
 *   - Recommended price reduction
 *   - Talking points sorted by leverage strength
 *   - Severity impact on property value
 *   - Counter-offer calculator (input asking price, see recommendation)
 *
 * Design: Frosted glass cards, leverage strength bars, animated reveals,
 * violet accent highlights for key numbers.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Scale,
  DollarSign,
  Shield,
  TrendingDown,
  AlertTriangle,
  Loader2,
  Download,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Detection } from '../shared/DetectionOverlay';

// ── Types ──────────────────────────────────────────────────

interface TalkingPoint {
  text: string;
  leverage_score: number;
  category: string;
  estimated_cost: number;
}

interface SeverityImpactItem {
  damage_class: string;
  severity: string;
  value_impact_pct: number;
  description: string;
}

interface CounterOffer {
  asking_price: number;
  recommended_offer: number;
  reduction_amount: number;
  reduction_pct: number;
  justification: string;
}

interface NegotiationResponse {
  recommended_reduction: number;
  recommended_reduction_pct: number;
  talking_points: TalkingPoint[];
  severity_impact: SeverityImpactItem[];
  counter_offer: CounterOffer | null;
  confidence: number;
  strategy_summary: string;
}

interface AnalysisResult {
  room_type: string;
  condition: string;
  detections: Detection[];
  renovation_costs: {
    basic_refresh: number;
    standard_rental: number;
    premium_upgrade: number;
    repairs: any[];
  };
  analysis_id?: string;
}

interface NegotiationAssistantProps {
  result: AnalysisResult;
  onBack: () => void;
}

// ── API Config ─────────────────────────────────────────────

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

function getHeaders(isJson = false): HeadersInit {
  const headers: HeadersInit = {};
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
}

// ── Helpers ────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  safety: { icon: '🛑', color: 'text-red-400' },
  structural: { icon: '🏗️', color: 'text-orange-400' },
  code_violation: { icon: '⚠️', color: 'text-yellow-400' },
  cosmetic: { icon: '🎨', color: 'text-blue-400' },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};

// ── Leverage Bar ───────────────────────────────────────────

const LeverageBar: React.FC<{ score: number; delay: number }> = ({ score, delay }) => (
  <div className="w-full h-1 rounded-full bg-white/[0.04] overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${score * 100}%` }}
      transition={{ duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] }}
      className={`h-full rounded-full ${
        score >= 0.7 ? 'bg-gradient-to-r from-violet-600 to-violet-400' :
        score >= 0.4 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
        'bg-gradient-to-r from-white/20 to-white/10'
      }`}
    />
  </div>
);

// ── Main Component ─────────────────────────────────────────

export const NegotiationAssistant: React.FC<NegotiationAssistantProps> = ({
  result,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<NegotiationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askingPrice, setAskingPrice] = useState('');
  const [counterOffer, setCounterOffer] = useState<CounterOffer | null>(null);
  const [calculatingOffer, setCalculatingOffer] = useState(false);

  // ── Fetch negotiation strategy ────────────────────────

  useEffect(() => {
    async function fetchStrategy() {
      setLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/api/vision/negotiate`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify({
            detections: result.detections,
            renovation_costs: result.renovation_costs,
            analysis_id: result.analysis_id,
          }),
        });

        if (resp.ok) {
          const data: NegotiationResponse = await resp.json();
          setStrategy(data);
        } else {
          throw new Error('Failed to generate strategy');
        }
      } catch (err: any) {
        setError(err.message);
        // Generate local fallback
        generateLocalStrategy();
      } finally {
        setLoading(false);
      }
    }

    function generateLocalStrategy() {
      const stdCost = result.renovation_costs.standard_rental;
      const points: TalkingPoint[] = result.detections.map(det => ({
        text: `${formatDamageClass(det.damage_class)} (${det.severity}) — estimated repair needed.`,
        leverage_score: det.severity === 'critical' ? 0.9 : det.severity === 'high' ? 0.7 : 0.4,
        category: det.severity === 'critical' ? 'safety' : 'cosmetic',
        estimated_cost: stdCost / Math.max(result.detections.length, 1),
      }));
      points.sort((a, b) => b.leverage_score - a.leverage_score);

      const impacts: SeverityImpactItem[] = result.detections.map(det => ({
        damage_class: det.damage_class,
        severity: det.severity,
        value_impact_pct: det.severity === 'critical' ? 8 : det.severity === 'high' ? 4 : 2,
        description: `${det.severity} severity ${formatDamageClass(det.damage_class).toLowerCase()}`,
      }));

      setStrategy({
        recommended_reduction: stdCost,
        recommended_reduction_pct: 0,
        talking_points: points,
        severity_impact: impacts,
        counter_offer: null,
        confidence: 0.6,
        strategy_summary: `${result.detections.length} issue(s) detected totaling ${formatCurrency(stdCost)} in repairs.`,
      });
      setError(null);
    }

    fetchStrategy();
  }, [result]);

  // ── Counter-offer calculator ──────────────────────────

  const calculateCounterOffer = useCallback(async () => {
    const price = parseFloat(askingPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(price) || price <= 0) return;

    setCalculatingOffer(true);
    try {
      const resp = await fetch(`${API_BASE}/api/vision/negotiate`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          detections: result.detections,
          renovation_costs: result.renovation_costs,
          asking_price: price,
        }),
      });

      if (resp.ok) {
        const data: NegotiationResponse = await resp.json();
        setCounterOffer(data.counter_offer);
      } else {
        // Local calculation
        const reduction = strategy?.recommended_reduction || result.renovation_costs.standard_rental;
        setCounterOffer({
          asking_price: price,
          recommended_offer: price - reduction,
          reduction_amount: reduction,
          reduction_pct: (reduction / price) * 100,
          justification: `Based on ${formatCurrency(reduction)} in identified repairs, recommend offering ${formatCurrency(price - reduction)}.`,
        });
      }
    } catch {
      const reduction = strategy?.recommended_reduction || result.renovation_costs.standard_rental;
      setCounterOffer({
        asking_price: price,
        recommended_offer: price - reduction,
        reduction_amount: reduction,
        reduction_pct: (reduction / price) * 100,
        justification: `Based on ${formatCurrency(reduction)} in identified repairs.`,
      });
    } finally {
      setCalculatingOffer(false);
    }
  }, [askingPrice, result, strategy]);

  // ── Render ────────────────────────────────────────────

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/[0.04] flex-shrink-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white/60">Negotiation Strategy</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Loader2 className="w-6 h-6 text-blue-400/50 animate-spin mx-auto" />
              <p className="text-xs text-white/25">Analyzing negotiation leverage...</p>
            </div>
          </div>
        )}

        {!loading && strategy && (
          <>
            {/* Strategy Summary */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121216] rounded-2xl p-5 border border-white/[0.03]"
            >
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                {strategy.strategy_summary}
              </p>
              <div className="flex items-end gap-2">
                <div className="text-[10px] text-white/20 uppercase tracking-wider">Recommended reduction</div>
              </div>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-display font-bold text-violet-400">
                  {formatCurrency(strategy.recommended_reduction)}
                </span>
              </div>
            </motion.div>

            {/* Talking Points */}
            {strategy.talking_points.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-[#121216] rounded-2xl p-4 border border-white/[0.03]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-sm font-medium text-white/60">Talking Points</span>
                  <span className="text-[9px] text-white/15 ml-auto">sorted by leverage</span>
                </div>

                <div className="space-y-4">
                  {strategy.talking_points.map((tp, i) => {
                    const cat = CATEGORY_ICONS[tp.category] || CATEGORY_ICONS.cosmetic;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm mt-0.5">{cat.icon}</span>
                          <div className="flex-1">
                            <p className="text-xs text-white/55 leading-relaxed">{tp.text}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[9px] text-white/20 uppercase tracking-wider">{tp.category}</span>
                              <span className="text-[9px] text-white/20">·</span>
                              <span className="text-[9px] text-white/30 font-medium">{formatCurrency(tp.estimated_cost)}</span>
                            </div>
                          </div>
                        </div>
                        <LeverageBar score={tp.leverage_score} delay={0.15 + i * 0.06} />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Severity Impact */}
            {strategy.severity_impact.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#121216] rounded-2xl p-4 border border-white/[0.03]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-white/60">Value Impact</span>
                </div>

                <div className="space-y-2">
                  {strategy.severity_impact.map((si, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.04 }}
                      className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium capitalize ${SEVERITY_COLORS[si.severity] || 'text-white/40'}`}>
                          {si.severity}
                        </span>
                        <span className="text-xs text-white/50">{formatDamageClass(si.damage_class)}</span>
                      </div>
                      <span className="text-xs text-red-400/70 font-medium">
                        -{si.value_impact_pct.toFixed(1)}%
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Counter-offer Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#121216] rounded-2xl p-4 border border-white/[0.03]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-white/60">Counter-Offer Calculator</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <input
                    type="text"
                    value={askingPrice}
                    onChange={e => setAskingPrice(e.target.value)}
                    placeholder="Asking price"
                    className="w-full pl-8 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-violet-500/30 transition-colors"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={calculateCounterOffer}
                  disabled={calculatingOffer}
                  className="px-4 py-2.5 rounded-xl bg-violet-500/20 text-violet-300 text-sm font-medium border border-violet-500/10 hover:bg-violet-500/30 transition-all disabled:opacity-50"
                >
                  {calculatingOffer ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calculate'}
                </motion.button>
              </div>

              {/* Counter offer result */}
              <AnimatePresence>
                {counterOffer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 border-t border-white/[0.04] space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Recommended offer</div>
                        <div className="text-lg font-display font-bold text-emerald-400">
                          {formatCurrency(counterOffer.recommended_offer)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Savings</div>
                        <div className="text-lg font-display font-bold text-violet-400">
                          {formatCurrency(counterOffer.reduction_amount)}
                        </div>
                        <div className="text-[10px] text-white/25">
                          {counterOffer.reduction_pct.toFixed(1)}% off
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/35 leading-relaxed">
                      {counterOffer.justification}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Export */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                import('../../../services/visionReportGenerator').then(m => {
                  m.generateVisionPDF(result as any, null);
                }).catch(() => alert('Export coming soon'));
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] text-white/40 text-sm font-medium border border-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Strategy
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

export default NegotiationAssistant;
