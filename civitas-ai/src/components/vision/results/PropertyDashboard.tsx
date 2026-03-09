/**
 * PropertyDashboard — Composite property score and room-by-room breakdown
 *
 * Appears after a walkthrough completes, or can be viewed from history.
 * Shows:
 *   - Composite Vision Score (animated gauge)
 *   - Score breakdown (Deal, Health, Condition)
 *   - Room grid with mini score rings
 *   - Total renovation costs (3-tier)
 *   - Risk heatmap
 *   - Renovation timeline estimate
 *
 * Design: Card grid with hover lift, violet accent lines, staggered reveals.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Shield,
  BarChart3,
  Clock,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ScoreGauge } from '../shared/ScoreGauge';
import { SeverityBadge } from '../shared/SeverityBadge';
import { CostBreakdown } from '../shared/CostBreakdown';
import type { Detection } from '../shared/DetectionOverlay';

// ── Types ──────────────────────────────────────────────────

interface RoomResult {
  room_type: string;
  condition: string;
  condition_confidence: number;
  detections: Detection[];
  renovation_costs?: {
    basic_refresh: number;
    standard_rental: number;
    premium_upgrade: number;
    repairs?: any[];
  };
  investment_metrics?: {
    deal_score: number;
    risk_level?: string;
  };
}

interface PropertyScoreResponse {
  composite_score: number;
  deal_score: number;
  property_health: number;
  condition_score: number;
  risk_level: string;
  room_scores: { room: string; score: number; condition: string; issues: number }[];
}

interface PropertyDashboardProps {
  /** All room analyses from the walkthrough */
  rooms: { name: string; icon: string; result: RoomResult }[];
  /** Walkthrough session ID */
  sessionId?: string;
  onBack: () => void;
  /** Drill into a specific room's interactive results */
  onViewRoom?: (roomIndex: number) => void;
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

const conditionColors: Record<string, string> = {
  excellent: 'text-emerald-400',
  good: 'text-green-400',
  fair: 'text-yellow-400',
  poor: 'text-orange-400',
  critical: 'text-red-400',
};

const riskColors: Record<string, string> = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/15',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/15',
  critical: 'text-red-400 bg-red-500/10 border-red-500/15',
};

// ── Score Breakdown Bar ────────────────────────────────────

const BreakdownBar: React.FC<{
  label: string;
  score: number;
  weight: string;
  delay: number;
}> = ({ label, score, weight, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="space-y-1.5"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-[9px] text-muted-foreground/40">{weight}</span>
      </div>
      <span className="text-xs font-semibold text-foreground/70">{score}</span>
    </div>
    <div className="w-full h-1 rounded-full bg-black/[0.03] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.33, 1, 0.68, 1] }}
        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
      />
    </div>
  </motion.div>
);

// ── Room Card ──────────────────────────────────────────────

const RoomDashCard: React.FC<{
  room: { name: string; icon: string; result: RoomResult };
  index: number;
  onTap?: () => void;
}> = ({ room, index, onTap }) => {
  const issueCount = room.result.detections.length;
  const dealScore = room.result.investment_metrics?.deal_score ?? 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      className="bg-card rounded-2xl p-4 border border-black/[0.05] hover:border-black/[0.06] hover:-translate-y-1 transition-all duration-300 text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg mb-1">{room.icon}</div>
          <div className="text-xs font-medium text-foreground/70">{room.name}</div>
        </div>
        <ScoreGauge score={dealScore} size={44} strokeWidth={3} showValue={false} animate={true} />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-medium capitalize ${conditionColors[room.result.condition] || 'text-muted-foreground/70'}`}>
          {room.result.condition}
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {issueCount} issue{issueCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Violet accent line for rooms with issues */}
      {issueCount > 0 && (
        <div className="mt-2 h-0.5 w-full rounded-full bg-gradient-to-r from-violet-500/30 to-transparent" />
      )}
    </motion.button>
  );
};

// ── Risk Heatmap ───────────────────────────────────────────

const RiskHeatmap: React.FC<{
  rooms: { name: string; icon: string; result: RoomResult }[];
}> = ({ rooms }) => {
  const sortedRooms = [...rooms].sort((a, b) =>
    (b.result.detections.length) - (a.result.detections.length)
  );

  return (
    <div className="space-y-2">
      {sortedRooms.map((room, i) => {
        const issues = room.result.detections.length;
        const maxIssues = Math.max(...rooms.map(r => r.result.detections.length), 1);
        const intensity = issues / maxIssues;

        return (
          <div key={room.name} className="flex items-center gap-3">
            <span className="text-sm w-5 text-center">{room.icon}</span>
            <div className="flex-1">
              <div className="w-full h-3 rounded-full bg-black/[0.02] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${intensity * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{
                    background: intensity > 0.7
                      ? 'linear-gradient(90deg, #ef4444, #f97316)'
                      : intensity > 0.3
                      ? 'linear-gradient(90deg, #f97316, #eab308)'
                      : 'linear-gradient(90deg, #22c55e, #84cc16)',
                  }}
                />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground/50 w-4 text-right">{issues}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────

export const PropertyDashboard: React.FC<PropertyDashboardProps> = ({
  rooms,
  sessionId,
  onBack,
  onViewRoom,
}) => {
  const [loading, setLoading] = useState(false);
  const [propertyScore, setPropertyScore] = useState<PropertyScoreResponse | null>(null);

  // Compute aggregates locally as fallback
  const totalIssues = rooms.reduce((sum, r) => sum + r.result.detections.length, 0);
  const avgDealScore = rooms.reduce((sum, r) => sum + (r.result.investment_metrics?.deal_score ?? 50), 0) / rooms.length;
  const totalBasic = rooms.reduce((sum, r) => sum + (r.result.renovation_costs?.basic_refresh ?? 0), 0);
  const totalStandard = rooms.reduce((sum, r) => sum + (r.result.renovation_costs?.standard_rental ?? 0), 0);
  const totalPremium = rooms.reduce((sum, r) => sum + (r.result.renovation_costs?.premium_upgrade ?? 0), 0);

  const compositeScore = propertyScore?.composite_score ?? Math.round(avgDealScore);
  const riskLevel = propertyScore?.risk_level ??
    (totalIssues > 8 ? 'high' : totalIssues > 4 ? 'medium' : 'low');

  // Try to fetch property score from backend
  useEffect(() => {
    async function fetchScore() {
      setLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/api/vision/score-property`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify({
            room_analyses: rooms.map(r => r.result),
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setPropertyScore(data);
        }
      } catch {
        // Use local aggregation
      } finally {
        setLoading(false);
      }
    }
    fetchScore();
  }, [rooms]);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-xl border-b border-black/[0.04] flex-shrink-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-xs text-muted-foreground/40 font-medium">
          {rooms.length} rooms · {totalIssues} issues
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Composite Score — hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 border border-black/[0.05] text-center"
        >
          <div className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium mb-4">
            Property Vision Score
          </div>
          <div className="flex justify-center mb-4">
            <ScoreGauge score={compositeScore} size={140} strokeWidth={9} animate={true} />
          </div>

          {/* Risk badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium capitalize ${riskColors[riskLevel] || riskColors.medium}`}>
            <Shield className="w-3.5 h-3.5" />
            {riskLevel} risk
          </div>
        </motion.div>

        {/* Score breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-4 border border-black/[0.05] space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Score Breakdown</span>
          </div>
          <BreakdownBar label="Deal Score" score={propertyScore?.deal_score ?? Math.round(avgDealScore)} weight="35%" delay={0.1} />
          <BreakdownBar label="Property Health" score={propertyScore?.property_health ?? Math.round(100 - totalIssues * 5)} weight="30%" delay={0.15} />
          <BreakdownBar label="Condition" score={propertyScore?.condition_score ?? Math.round(avgDealScore * 0.8)} weight="15%" delay={0.2} />
        </motion.div>

        {/* Room grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium mb-3 px-1">
            Room by room
          </div>
          <div className="grid grid-cols-2 gap-3">
            {rooms.map((room, i) => (
              <RoomDashCard
                key={room.name}
                room={room}
                index={i}
                onTap={onViewRoom ? () => onViewRoom(i) : undefined}
              />
            ))}
          </div>
        </motion.div>

        {/* Total renovation costs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <CostBreakdown
            basicCost={totalBasic}
            standardCost={totalStandard}
            premiumCost={totalPremium}
            defaultExpanded={true}
          />
        </motion.div>

        {/* Risk heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 border border-black/[0.05]"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Risk Assessment</span>
          </div>
          <RiskHeatmap rooms={rooms} />
        </motion.div>

        {/* Estimated timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-4 border border-black/[0.05]"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Estimated Timeline</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-2">
              {[
                { label: 'Critical repairs', weeks: Math.max(1, Math.ceil(totalIssues * 0.3)), color: 'bg-red-500' },
                { label: 'Standard renovation', weeks: Math.max(2, Math.ceil(totalStandard / 5000)), color: 'bg-violet-500' },
                { label: 'Premium upgrade', weeks: Math.max(4, Math.ceil(totalPremium / 5000)), color: 'bg-amber-500' },
              ].map((phase, i) => (
                <div key={phase.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/50">{phase.label}</span>
                    <span className="text-[10px] text-muted-foreground/40">{phase.weeks}w</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/[0.02] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, phase.weeks * 8)}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                      className={`h-full rounded-full ${phase.color}/60`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyDashboard;
