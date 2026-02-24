/**
 * RenovationPlanner — AI renovation plan with SSE streaming
 *
 * Calls POST /renovation-plan (SSE endpoint) and streams phases
 * one-by-one with animation. Each phase shows:
 *   - Title, priority badge, cost range, timeline, description
 *   - Phased card with priority indicator
 * After streaming completes:
 *   - Gantt-like timeline visualization
 *   - Total budget summary
 *   - Export button
 *
 * Design: Cards appear one-by-one with staggered spring animation,
 * gradient priority bars, frosted glass budget summary.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Wrench,
  Clock,
  DollarSign,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Detection } from '../shared/DetectionOverlay';

// ── Types ──────────────────────────────────────────────────

interface RenovationPhase {
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  description: string;
  estimated_cost_low: number;
  estimated_cost_high: number;
  timeline_weeks: number;
  tasks?: string[];
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

interface RenovationPlannerProps {
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

const PRIORITY_STYLES: Record<string, {
  bg: string;
  border: string;
  text: string;
  bar: string;
  dot: string;
}> = {
  urgent: {
    bg: 'bg-red-500/8',
    border: 'border-red-500/15',
    text: 'text-red-400',
    bar: 'from-red-600 to-red-400',
    dot: 'bg-red-500',
  },
  high: {
    bg: 'bg-orange-500/8',
    border: 'border-orange-500/15',
    text: 'text-orange-400',
    bar: 'from-orange-600 to-orange-400',
    dot: 'bg-orange-500',
  },
  medium: {
    bg: 'bg-yellow-500/8',
    border: 'border-yellow-500/15',
    text: 'text-yellow-400',
    bar: 'from-yellow-600 to-yellow-400',
    dot: 'bg-yellow-500',
  },
  low: {
    bg: 'bg-green-500/8',
    border: 'border-green-500/15',
    text: 'text-green-400',
    bar: 'from-green-600 to-green-400',
    dot: 'bg-green-500',
  },
};

// ── Phase Card ─────────────────────────────────────────────

const PhaseCard: React.FC<{
  phase: RenovationPhase;
  index: number;
  isStreaming: boolean;
}> = ({ phase, index, isStreaming }) => {
  const style = PRIORITY_STYLES[phase.priority] || PRIORITY_STYLES.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: isStreaming ? 0 : index * 0.08,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className={`${style.bg} rounded-2xl border ${style.border} overflow-hidden`}
    >
      {/* Priority accent bar */}
      <div className={`h-0.5 bg-gradient-to-r ${style.bar}`} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-medium uppercase tracking-wider text-white/20">
                Phase {index + 1}
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium capitalize border ${style.bg} ${style.border} ${style.text}`}>
                <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                {phase.priority}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white/85">{phase.title}</h4>
          </div>
        </div>

        <p className="text-xs text-white/40 leading-relaxed mb-3">
          {phase.description}
        </p>

        {/* Tasks list */}
        {phase.tasks && phase.tasks.length > 0 && (
          <div className="space-y-1 mb-3">
            {phase.tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-white/15 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-white/35">{task}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cost + Timeline */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-white/20" />
            <span className="text-xs text-white/50 font-medium">
              {formatCurrency(phase.estimated_cost_low)} – {formatCurrency(phase.estimated_cost_high)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-white/20" />
            <span className="text-xs text-white/50 font-medium">
              {phase.timeline_weeks} week{phase.timeline_weeks !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Gantt Timeline ─────────────────────────────────────────

const GanttTimeline: React.FC<{ phases: RenovationPhase[] }> = ({ phases }) => {
  const totalWeeks = phases.reduce((sum, p) => sum + p.timeline_weeks, 0);
  let weekOffset = 0;

  return (
    <div className="space-y-2">
      <div className="text-[10px] text-white/20 uppercase tracking-wider mb-2">
        Timeline · {totalWeeks} weeks total
      </div>
      {phases.map((phase, i) => {
        const style = PRIORITY_STYLES[phase.priority] || PRIORITY_STYLES.medium;
        const widthPct = totalWeeks > 0 ? (phase.timeline_weeks / totalWeeks) * 100 : 0;
        const offsetPct = totalWeeks > 0 ? (weekOffset / totalWeeks) * 100 : 0;
        weekOffset += phase.timeline_weeks;

        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] text-white/30 w-16 truncate">{phase.title}</span>
            <div className="flex-1 h-4 relative bg-white/[0.02] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                className={`absolute top-0 bottom-0 rounded-full bg-gradient-to-r ${style.bar} opacity-60`}
                style={{ left: `${offsetPct}%` }}
              />
            </div>
            <span className="text-[10px] text-white/20 w-8 text-right">{phase.timeline_weeks}w</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────

export const RenovationPlanner: React.FC<RenovationPlannerProps> = ({
  result,
  onBack,
}) => {
  const [phases, setPhases] = useState<RenovationPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch renovation plan via SSE ─────────────────────

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    async function fetchPlan() {
      try {
        const resp = await fetch(`${API_BASE}/api/vision/renovation-plan`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify({
            room_type: result.room_type,
            condition: result.condition,
            detections: result.detections,
            renovation_costs: result.renovation_costs,
            analysis_id: result.analysis_id,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          throw new Error(`Failed: ${resp.statusText}`);
        }

        const contentType = resp.headers.get('content-type') || '';

        if (contentType.includes('text/event-stream')) {
          // SSE streaming
          const reader = resp.body?.getReader();
          if (!reader) throw new Error('No reader');

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.phase) {
                    setPhases(prev => [...prev, data.phase]);
                  } else if (data.phases) {
                    setPhases(data.phases);
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } else {
          // JSON response
          const data = await resp.json();
          if (data.phases) {
            // Stagger reveal
            for (let i = 0; i < data.phases.length; i++) {
              await new Promise(r => setTimeout(r, 200));
              setPhases(prev => [...prev, data.phases[i]]);
            }
          } else if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
              await new Promise(r => setTimeout(r, 200));
              setPhases(prev => [...prev, data[i]]);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load renovation plan');

          // Generate fallback plan from local data
          const fallbackPhases: RenovationPhase[] = [];
          const criticalDetections = result.detections.filter(d => d.severity === 'critical' || d.severity === 'high');
          const otherDetections = result.detections.filter(d => d.severity !== 'critical' && d.severity !== 'high');

          if (criticalDetections.length > 0) {
            fallbackPhases.push({
              title: 'Critical Repairs',
              priority: 'urgent',
              description: `Address ${criticalDetections.length} high-priority issue(s) that affect safety and structural integrity.`,
              estimated_cost_low: Math.round(result.renovation_costs.basic_refresh * 0.4),
              estimated_cost_high: Math.round(result.renovation_costs.standard_rental * 0.5),
              timeline_weeks: Math.max(1, criticalDetections.length),
              tasks: criticalDetections.map(d => d.damage_class.replace(/_/g, ' ')),
            });
          }

          if (otherDetections.length > 0) {
            fallbackPhases.push({
              title: 'General Renovation',
              priority: 'medium',
              description: `Complete ${otherDetections.length} remaining repair(s) and cosmetic improvements.`,
              estimated_cost_low: Math.round(result.renovation_costs.basic_refresh * 0.6),
              estimated_cost_high: Math.round(result.renovation_costs.standard_rental * 0.5),
              timeline_weeks: Math.max(2, otherDetections.length),
              tasks: otherDetections.map(d => d.damage_class.replace(/_/g, ' ')),
            });
          }

          fallbackPhases.push({
            title: 'Final Touches & Inspection',
            priority: 'low',
            description: 'Quality inspection, final cosmetic touch-ups, and property staging preparation.',
            estimated_cost_low: Math.round(result.renovation_costs.basic_refresh * 0.1),
            estimated_cost_high: Math.round(result.renovation_costs.basic_refresh * 0.2),
            timeline_weeks: 1,
          });

          for (let i = 0; i < fallbackPhases.length; i++) {
            await new Promise(r => setTimeout(r, 300));
            setPhases(prev => [...prev, fallbackPhases[i]]);
          }
          setError(null); // Clear error since we have fallback
        }
      } finally {
        setLoading(false);
        setStreaming(false);
      }
    }

    fetchPlan();
    return () => controller.abort();
  }, [result]);

  // ── Totals ────────────────────────────────────────────

  const totalCostLow = phases.reduce((s, p) => s + p.estimated_cost_low, 0);
  const totalCostHigh = phases.reduce((s, p) => s + p.estimated_cost_high, 0);
  const totalWeeks = phases.reduce((s, p) => s + p.timeline_weeks, 0);

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/[0.04] flex-shrink-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white/60">Renovation Plan</span>
        </div>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {/* Loading shimmer */}
        {loading && phases.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="text-center space-y-3">
              <Loader2 className="w-6 h-6 text-violet-400/50 animate-spin mx-auto" />
              <p className="text-xs text-white/25">Generating renovation plan...</p>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && phases.length === 0 && (
          <div className="bg-red-500/8 border border-red-500/15 rounded-2xl p-4 text-center">
            <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Phase cards */}
        <AnimatePresence>
          {phases.map((phase, i) => (
            <PhaseCard key={`${phase.title}-${i}`} phase={phase} index={i} isStreaming={streaming} />
          ))}
        </AnimatePresence>

        {/* Streaming indicator */}
        {streaming && phases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-3"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400"
                />
              ))}
            </div>
            <span className="text-[10px] text-white/20">Generating next phase...</span>
          </motion.div>
        )}

        {/* Post-streaming: Timeline + Budget */}
        {!streaming && phases.length > 0 && (
          <>
            {/* Gantt timeline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#121216] rounded-2xl p-4 border border-white/[0.03]"
            >
              <GanttTimeline phases={phases} />
            </motion.div>

            {/* Budget summary */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#121216] rounded-2xl p-5 border border-white/[0.03]"
            >
              <div className="text-[10px] text-white/20 uppercase tracking-wider mb-3">
                Total Budget
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-display font-bold text-violet-400">
                  {formatCurrency(totalCostLow)}
                </span>
                <span className="text-sm text-white/25 mb-0.5">–</span>
                <span className="text-2xl font-display font-bold text-white/50">
                  {formatCurrency(totalCostHigh)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-white/25">
                <span>{phases.length} phases</span>
                <span>·</span>
                <span>{totalWeeks} weeks</span>
                <span>·</span>
                <span>{result.detections.length} issues addressed</span>
              </div>
            </motion.div>

            {/* Export */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                // Could add renovation plan to PDF
                import('../../../services/visionReportGenerator').then(m => {
                  m.generateVisionPDF(result as any, null);
                }).catch(() => alert('Export coming soon'));
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] text-white/40 text-sm font-medium border border-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Plan
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

export default RenovationPlanner;
