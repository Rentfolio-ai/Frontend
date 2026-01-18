/**
 * Daily Recommendations Component
 * Steve Jobs Priority 1: Proactive "Show me MY deals"
 * 
 * Philosophy:
 * - User opens app → Sees TOP 3 MATCHES immediately
 * - No empty chat box
 * - Each property shows: WHY it fits, cash flow, single action
 * - Feel like AI is YOUR SCOUT
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Star, RefreshCw, ChevronRight, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { useDecisionHistoryStore } from '../../stores/decisionHistoryStore';
import { cn } from '@/lib/utils';

interface FinancialSummary {
  monthly_cash_flow: number;
  coc_return: number;
  cap_rate: number;
}

interface Recommendation {
  property: any;
  fit_score: number;
  financial_summary: FinancialSummary;
  fit_reasons: string[];
  concerns: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface RecommendationsData {
  recommendations: Recommendation[];
  excluded_count: number;
  exclusion_reasons: string[];
  total_scanned: number;
  last_updated: string;
}

interface DailyRecommendationsProps {
  onPropertySelect?: (property: any) => void;
  onAnalyze?: (property: any) => void;
  onCompare?: (properties: any[]) => void;
}

export const DailyRecommendations: React.FC<DailyRecommendationsProps> = ({
  onPropertySelect,
  onAnalyze,
  onCompare
}) => {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  
  const { starProperty, rejectProperty } = useDecisionHistoryStore();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/recommendations/daily?limit=3&force_refresh=${forceRefresh}`);
      const responseData = response.data?.data;
      
      if (responseData) {
        setData(responseData);
      }
    } catch (err: any) {
      console.error('[DailyRecommendations] Failed to load:', err);
      setError(err.response?.data?.detail || 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStar = async (rec: Recommendation) => {
    try {
      await starProperty(rec.property.id, rec.property);
    } catch (error) {
      console.error('[DailyRecommendations] Failed to star property:', error);
    }
  };

  const handlePass = async (rec: Recommendation, reason: string) => {
    try {
      await rejectProperty(rec.property.id, reason, rec.property);
      // Remove from display
      setData((prev) => prev ? {
        ...prev,
        recommendations: prev.recommendations.filter(r => r.property.id !== rec.property.id)
      } : null);
    } catch (error) {
      console.error('[DailyRecommendations] Failed to reject property:', error);
    }
  };

  const handleAnalyze = (rec: Recommendation) => {
    if (onAnalyze) {
      onAnalyze(rec.property);
    }
  };

  const toggleSelection = (propertyId: string) => {
    setSelectedProperties((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  };

  const handleCompare = () => {
    if (onCompare && data) {
      const selected = data.recommendations.filter(r => selectedProperties.has(r.property.id));
      onCompare(selected.map(r => r.property));
    }
  };

  // Confidence colors
  const confidenceColors = {
    high: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-white/60">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Finding your best matches...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-semibold text-red-400">Failed to load recommendations</h3>
        </div>
        <p className="text-sm text-red-300/70">{error}</p>
        <button
          onClick={() => loadRecommendations(true)}
          className="mt-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data
  if (!data || data.recommendations.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
        <Sparkles className="w-8 h-8 text-white/40 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white/90 mb-2">No recommendations yet</h3>
        <p className="text-sm text-white/50 mb-4">
          Set your investment preferences to get personalized property recommendations.
        </p>
        <button
          onClick={() => loadRecommendations(true)}
          className="px-4 py-2 rounded-lg bg-white/[0.05] text-white/80 text-sm font-medium hover:bg-white/[0.10] transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white/90">Your Top Matches Today</h2>
        </div>
        
        <button
          onClick={() => loadRecommendations(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/60 hover:text-white/80 text-[10px] transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Learning Banner - Minimal */}
      {data.excluded_count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 rounded-lg bg-indigo-500/[0.06] border border-indigo-400/[0.15]"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-indigo-400" />
            <p className="text-[10px] text-indigo-300/80">
              Filtered {data.excluded_count} properties from your preferences
            </p>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <AnimatePresence mode="popLayout">
        {data.recommendations.map((rec, index) => (
          <motion.div
            key={rec.property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-3 rounded-lg border transition-all duration-200",
              selectedProperties.has(rec.property.id)
                ? "bg-amber-500/[0.08] border-amber-500/30"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
            )}
          >
            {/* Header: Address + Fit Score */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white/95">
                    {rec.property.address || 'Property Address'}
                  </h3>
                  {rec.fit_score >= 90 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      TOP MATCH
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50">
                  {rec.property.city}, {rec.property.state} • {rec.property.propertyType}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-lg border text-sm font-semibold",
                  confidenceColors[rec.confidence]
                )}>
                  {rec.fit_score}% Fit
                </div>
                <span className="text-lg font-bold text-white/95">
                  ${rec.property.price?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>

            {/* Financial Summary - Compact (2 cols instead of 3) */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span className="text-[9px] text-white/40 uppercase">Cash Flow</span>
                </div>
                <p className="text-base font-bold text-emerald-400">
                  ${Math.abs(rec.financial_summary.monthly_cash_flow).toLocaleString()}
                </p>
              </div>
              
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  <span className="text-[9px] text-white/40 uppercase">CoC</span>
                </div>
                <p className="text-base font-bold text-amber-400">
                  {rec.financial_summary.coc_return?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>

            {/* Why it fits - Compact (max 2) */}
            {rec.fit_reasons.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-white/60 mb-1">Why this fits:</p>
                <ul className="space-y-0.5">
                  {rec.fit_reasons.slice(0, 2).map((reason, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ChevronRight className="w-2.5 h-2.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-white/50">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns - Compact (max 1) */}
            {rec.concerns.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-white/60 mb-1">Consider:</p>
                <ul className="space-y-0.5">
                  {rec.concerns.slice(0, 1).map((concern, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertCircle className="w-2.5 h-2.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-white/40">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions - Compact */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => handleAnalyze(rec)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12] text-[10px] text-white/70 font-medium transition-all"
              >
                Analyze
              </button>
              
              <button
                onClick={() => handleStar(rec)}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12] transition-all"
                title="Star"
              >
                <Star className="w-3.5 h-3.5 text-white/50" />
              </button>
              
              <button
                onClick={() => handlePass(rec, 'not_interested')}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-red-500/[0.1] border border-white/[0.08] hover:border-red-400/[0.30] text-[10px] text-white/50 hover:text-red-400 transition-all"
              >
                Pass
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Compare selected */}
      {selectedProperties.size >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 p-4 rounded-xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-200">
              {selectedProperties.size} properties selected
            </span>
            <button
              onClick={handleCompare}
              className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
            >
              Compare Now
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
