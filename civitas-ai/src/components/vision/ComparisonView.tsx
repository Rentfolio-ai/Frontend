/**
 * ComparisonView — Side-by-side property comparison
 *
 * Select 2–3 properties from history and compare:
 *   - Composite Vision Score gauges
 *   - Condition badge
 *   - Total issue count
 *   - Total renovation cost (3 tiers)
 *   - Deal Score comparison
 *   - Risk level
 *   - Winner highlighted per category
 *   - "Best deal" recommendation
 *
 * Design: Columns with score gauges, winner highlights with violet
 * accent, frosted glass cards.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  ArrowLeft,
  GitCompareArrows,
  Plus,
  X,
  Trophy,
  AlertTriangle,
  DollarSign,
  Shield,
  BarChart3,
  Loader2,
  ScanEye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreGauge } from './shared/ScoreGauge';
import type { Detection } from './shared/DetectionOverlay';

// ── Types ──────────────────────────────────────────────────

interface PropertyForComparison {
  id: string;
  name: string;
  analyzedAt: string;
  roomType: string;
  condition: string;
  detections: Detection[];
  dealScore: number;
  riskLevel: string;
  basicCost: number;
  standardCost: number;
  premiumCost: number;
  imageUrl?: string;
}

interface HistoryItem {
  analysis_id: string;
  analyzed_at: string;
  room_type: string;
  condition_rating: string;
  analysis_data: any;
  image_url?: string;
}

interface ComparisonViewProps {
  onBack: () => void;
}

// ── API Config ─────────────────────────────────────────────

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  return headers;
}

// ── Helpers ────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const conditionColors: Record<string, string> = {
  excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
  good: 'text-green-400 bg-green-500/10 border-green-500/15',
  fair: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/15',
  poor: 'text-orange-400 bg-orange-500/10 border-orange-500/15',
  critical: 'text-red-400 bg-red-500/10 border-red-500/15',
};

function historyToProperty(item: HistoryItem): PropertyForComparison {
  const data = item.analysis_data || {};
  return {
    id: item.analysis_id,
    name: formatDamageClass(item.room_type || 'Unknown'),
    analyzedAt: item.analyzed_at,
    roomType: item.room_type || 'unknown',
    condition: item.condition_rating || data.condition || 'unknown',
    detections: data.detections || [],
    dealScore: data.investment_metrics?.deal_score || 0,
    riskLevel: data.investment_metrics?.risk_level || 'unknown',
    basicCost: data.renovation_costs?.basic_refresh || 0,
    standardCost: data.renovation_costs?.standard_rental || 0,
    premiumCost: data.renovation_costs?.premium_upgrade || 0,
    imageUrl: item.image_url,
  };
}

// ── Comparison Row ─────────────────────────────────────────

const ComparisonRow: React.FC<{
  label: string;
  icon: React.ReactNode;
  values: { value: string | number; isWinner: boolean }[];
  delay: number;
}> = ({ label, icon, values, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="py-3 border-b border-white/[0.03]"
  >
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-[10px] text-white/25 uppercase tracking-wider">{label}</span>
    </div>
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${values.length}, 1fr)` }}>
      {values.map((v, i) => (
        <div key={i} className={`text-center ${v.isWinner ? 'relative' : ''}`}>
          <span className={`text-sm font-semibold ${v.isWinner ? 'text-violet-400' : 'text-white/50'}`}>
            {v.value}
          </span>
          {v.isWinner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.1, type: 'spring', stiffness: 400 }}
              className="absolute -top-1 -right-1"
            >
              <Trophy className="w-3 h-3 text-violet-400" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────

export const ComparisonView: React.FC<ComparisonViewProps> = ({ onBack }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PropertyForComparison[]>([]);
  const [showPicker, setShowPicker] = useState(true);

  // ── Load history ──────────────────────────────────────

  useEffect(() => {
    async function loadHistory() {
      try {
        const resp = await fetch(`${API_BASE}/api/vision/?limit=20`, { headers: getHeaders() });
        if (resp.ok) {
          const data = await resp.json();
          setHistory(data);
        }
      } catch {
        // History load failed
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  // ── Toggle selection ──────────────────────────────────

  const toggleSelect = useCallback((item: HistoryItem) => {
    const prop = historyToProperty(item);
    setSelected(prev => {
      const exists = prev.find(p => p.id === prop.id);
      if (exists) return prev.filter(p => p.id !== prop.id);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, prop];
    });
  }, []);

  const startComparison = useCallback(() => {
    if (selected.length >= 2) {
      setShowPicker(false);
    }
  }, [selected]);

  // ── Determine winners ─────────────────────────────────

  const maxDealScore = Math.max(...selected.map(p => p.dealScore));
  const minIssues = Math.min(...selected.map(p => p.detections.length));
  const minCost = Math.min(...selected.map(p => p.standardCost));

  // Best deal = highest score-to-cost ratio
  const bestDealId = selected.length > 0
    ? selected.reduce((best, p) => {
        const ratio = p.dealScore / Math.max(p.standardCost, 1);
        const bestRatio = best.dealScore / Math.max(best.standardCost, 1);
        return ratio > bestRatio ? p : best;
      }).id
    : null;

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/[0.04] flex-shrink-0 z-10">
        <button onClick={showPicker ? onBack : () => setShowPicker(true)} className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {showPicker ? 'Back' : 'Change selection'}
        </button>
        <div className="flex items-center gap-2">
          <GitCompareArrows className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white/60">Compare</span>
        </div>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ── Property Picker ───────────────────── */}
          {showPicker && (
            <motion.div
              key="picker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4"
            >
              <div className="text-center">
                <h3 className="text-sm font-medium text-white/60 mb-1">Select properties to compare</h3>
                <p className="text-[11px] text-white/25">Choose 2–3 from your scan history</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-white/20">
                  <ScanEye className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-xs">No scan history available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(item => {
                    const isSelected = selected.some(p => p.id === item.analysis_id);
                    return (
                      <motion.button
                        key={item.analysis_id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleSelect(item)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-violet-500/8 border-violet-500/15'
                            : 'bg-white/[0.02] border-white/[0.03] hover:bg-white/[0.04]'
                        }`}
                      >
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/[0.03] flex items-center justify-center">
                            <ScanEye className="w-5 h-5 text-white/10" />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="text-xs font-medium text-white/70">
                            {formatDamageClass(item.room_type || 'Unknown')}
                          </div>
                          <div className="text-[10px] text-white/25">
                            {new Date(item.analyzed_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-violet-400 bg-violet-500' : 'border-white/10'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Compare button */}
              {selected.length >= 2 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startComparison}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors shadow-[0_4px_24px_rgba(139,92,246,0.3)]"
                >
                  <GitCompareArrows className="w-4 h-4" />
                  Compare {selected.length} Properties
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── Comparison Results ────────────────── */}
          {!showPicker && selected.length >= 2 && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 pb-24"
            >
              {/* Column headers with score gauges */}
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}>
                {selected.map((prop, i) => (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-[#121216] rounded-2xl p-4 border text-center relative ${
                      prop.id === bestDealId ? 'border-violet-500/20' : 'border-white/[0.03]'
                    }`}
                  >
                    {prop.id === bestDealId && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/15">
                        <Trophy className="w-2.5 h-2.5 text-violet-400" />
                        <span className="text-[8px] text-violet-300 font-medium uppercase tracking-wider">Best deal</span>
                      </div>
                    )}
                    <div className="flex justify-center mb-3 mt-1">
                      <ScoreGauge score={prop.dealScore} size={72} strokeWidth={5} />
                    </div>
                    <div className="text-xs font-medium text-white/70 mb-1">{prop.name}</div>
                    <div className={`inline-flex text-[10px] px-2 py-0.5 rounded-full border capitalize ${conditionColors[prop.condition] || 'text-white/30 bg-white/[0.03] border-white/[0.04]'}`}>
                      {prop.condition}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Comparison rows */}
              <div className="bg-[#121216] rounded-2xl p-4 border border-white/[0.03]">
                <ComparisonRow
                  label="Deal Score"
                  icon={<BarChart3 className="w-3 h-3 text-violet-400" />}
                  values={selected.map(p => ({ value: `${p.dealScore}/100`, isWinner: p.dealScore === maxDealScore }))}
                  delay={0.1}
                />
                <ComparisonRow
                  label="Issues Found"
                  icon={<AlertTriangle className="w-3 h-3 text-orange-400" />}
                  values={selected.map(p => ({ value: p.detections.length, isWinner: p.detections.length === minIssues }))}
                  delay={0.15}
                />
                <ComparisonRow
                  label="Renovation Cost"
                  icon={<DollarSign className="w-3 h-3 text-emerald-400" />}
                  values={selected.map(p => ({ value: formatCurrency(p.standardCost), isWinner: p.standardCost === minCost }))}
                  delay={0.2}
                />
                <ComparisonRow
                  label="Risk Level"
                  icon={<Shield className="w-3 h-3 text-blue-400" />}
                  values={selected.map(p => ({ value: p.riskLevel, isWinner: p.riskLevel === 'low' }))}
                  delay={0.25}
                />
              </div>

              {/* Cost tiers breakdown */}
              <div className="bg-[#121216] rounded-2xl p-4 border border-white/[0.03]">
                <div className="text-[10px] text-white/20 uppercase tracking-wider mb-3">Cost Tiers</div>
                {['Basic', 'Standard', 'Premium'].map((tier, ti) => (
                  <div key={tier} className="py-2 border-b border-white/[0.03] last:border-0">
                    <div className="text-[10px] text-white/25 mb-1">{tier}</div>
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}>
                      {selected.map(p => (
                        <div key={p.id} className="text-center text-xs font-medium text-white/50">
                          {formatCurrency(ti === 0 ? p.basicCost : ti === 1 ? p.standardCost : p.premiumCost)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              {bestDealId && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-violet-500/8 rounded-2xl p-4 border border-violet-500/15 text-center"
                >
                  <Trophy className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                  <p className="text-sm text-white/60">
                    <span className="font-semibold text-violet-300">
                      {selected.find(p => p.id === bestDealId)?.name}
                    </span>{' '}
                    offers the best score-to-cost ratio.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComparisonView;
