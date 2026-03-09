/**
 * QuickScanMode — Single-shot capture → analyze → results
 *
 * Extracted from the original VisionPage monolith. Uses the shared
 * CameraFeed, DetectionOverlay, ScoreGauge, SeverityBadge, and
 * CostBreakdown components with the premium design system.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  RefreshCw,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Upload,
  Eye,
  Grid3X3,
  DollarSign,
  TrendingUp,
  BarChart3,
  Shield,
  Wrench,
  Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraFeed, type CameraFeedRef } from '../shared/CameraFeed';
import { DetectionOverlay, type Detection } from '../shared/DetectionOverlay';
import { ScoreGauge } from '../shared/ScoreGauge';
import { SeverityBadge } from '../shared/SeverityBadge';
import { CostBreakdown } from '../shared/CostBreakdown';

// ── Types ──────────────────────────────────────────────────

interface RepairEstimate {
  category: string;
  repair_type: string;
  description: string;
  quantity: number;
  unit: string;
  basic_cost: number;
  standard_cost: number;
  premium_cost: number;
}

export interface AnalysisResult {
  room_type: string;
  room_confidence: number;
  condition: string;
  condition_confidence: number;
  detections: Detection[];
  renovation_costs: {
    basic_refresh: number;
    standard_rental: number;
    premium_upgrade: number;
    region: string;
    regional_multiplier: number;
    repairs: RepairEstimate[];
  };
  investment_metrics: {
    deal_score: number;
    value_add_potential: number;
    brrrr_viable: boolean;
    risk_level: string;
    recommended_strategy: string;
    estimated_arv: number | null;
    reasoning: string;
  };
  summary: string;
  model_version: string;
  inference_time_ms: number;
  analysis_id?: string;
}

type QuickScanView = 'camera' | 'analyzing' | 'results';

interface QuickScanModeProps {
  /** Navigate to interactive results (Phase 4) */
  onViewInteractiveResults?: (result: AnalysisResult, image: string | null) => void;
  /** Navigate to renovation planner (Phase 5) */
  onGetRenovationPlan?: (result: AnalysisResult) => void;
  /** Navigate to negotiation assistant (Phase 6) */
  onGetNegotiationPoints?: (result: AnalysisResult) => void;
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

// ── Analysis stages ────────────────────────────────────────

const ANALYSIS_STAGES = [
  { key: 'upload', label: 'Uploading image', icon: Upload },
  { key: 'room', label: 'Detecting room type', icon: Grid3X3 },
  { key: 'condition', label: 'Assessing condition', icon: Eye },
  { key: 'damage', label: 'Scanning for damage', icon: AlertTriangle },
  { key: 'costs', label: 'Estimating renovation costs', icon: DollarSign },
  { key: 'metrics', label: 'Calculating investment score', icon: TrendingUp },
];

// ── Helpers ────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const conditionColors: Record<string, string> = {
  excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  good: 'bg-green-500/10 text-green-400 border-green-500/20',
  fair: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  poor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

// ── Main Component ─────────────────────────────────────────

export const QuickScanMode: React.FC<QuickScanModeProps> = ({
  onViewInteractiveResults,
  onGetRenovationPlan,
  onGetNegotiationPoints,
}) => {
  const [view, setView] = useState<QuickScanView>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraFeedRef>(null);

  // ── Analysis API ──────────────────────────────────────

  const runAnalysis = useCallback(async (file: File) => {
    setView('analyzing');
    setError(null);
    setCurrentStage(0);

    const stageInterval = setInterval(() => {
      setCurrentStage(prev => Math.min(prev + 1, ANALYSIS_STAGES.length - 1));
    }, 800);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('region', 'national_average');
      formData.append('store_result', 'true');

      const response = await fetch(`${API_BASE}/api/vision/analyze`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      });

      clearInterval(stageInterval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Analysis failed: ${response.statusText}`);
      }

      const data: AnalysisResult = await response.json();
      setCurrentStage(ANALYSIS_STAGES.length);
      setAnalysisResult(data);
      setTimeout(() => setView('results'), 500);
    } catch (err: any) {
      clearInterval(stageInterval);
      setError(err.message || 'Analysis failed');
      setView('camera');
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────

  const handleCapture = useCallback((file: File, previewUrl: string) => {
    setCapturedImage(previewUrl);
    runAnalysis(file);
  }, [runAnalysis]);

  const handleUpload = useCallback((file: File, previewUrl: string) => {
    setCapturedImage(previewUrl);
    runAnalysis(file);
  }, [runAnalysis]);

  const newScan = useCallback(() => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
    setCurrentStage(0);
    setView('camera');
  }, []);

  const handleExportPDF = useCallback(() => {
    import('../../../services/visionReportGenerator').then(m => {
      if (analysisResult) m.generateVisionPDF(analysisResult as any, capturedImage);
    }).catch(() => alert('PDF export coming soon'));
  }, [analysisResult, capturedImage]);

  // ── Render ────────────────────────────────────────────

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ── Camera View ─────────────────────────────── */}
        {view === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <CameraFeed
              ref={cameraRef}
              active={true}
              showScanLine={true}
              onCapture={handleCapture}
              onUpload={handleUpload}
              error={error}
            />
          </motion.div>
        )}

        {/* ── Analyzing View ──────────────────────────── */}
        {view === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col items-center justify-center p-6"
          >
            {/* Captured image preview */}
            {capturedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm rounded-[20px] overflow-hidden mb-8 border border-black/[0.05]"
              >
                <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover" />
              </motion.div>
            )}

            {/* Analysis stages */}
            <div className="w-full max-w-sm space-y-2.5">
              {ANALYSIS_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isActive = idx === currentStage;
                const isDone = idx < currentStage;

                return (
                  <motion.div
                    key={stage.key}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-violet-500/8 border border-violet-500/15'
                        : isDone
                        ? 'bg-black/[0.02] border border-black/[0.05]'
                        : 'opacity-25 border border-transparent'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4.5 h-4.5 text-violet-400 animate-spin flex-shrink-0" />
                    ) : (
                      <Icon className="w-4.5 h-4.5 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-foreground' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/40'
                    }`}>
                      {stage.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Results View ────────────────────────────── */}
        {view === 'results' && analysisResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto"
          >
            {/* Back bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-xl border-b border-black/[0.04]">
              <button
                onClick={newScan}
                className="flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>New scan</span>
              </button>
              <div className="text-[10px] text-muted-foreground/40 font-medium">
                {analysisResult.inference_time_ms.toFixed(0)}ms · {analysisResult.model_version}
              </div>
            </div>

            <div className="p-4 space-y-4 pb-24">
              {/* Image + Condition header */}
              <div className="flex gap-4">
                {capturedImage && (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 border border-black/[0.05]">
                    <img src={capturedImage} alt="Analyzed" className="w-full h-full object-cover" />
                    <DetectionOverlay detections={analysisResult.detections} animate={false} />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-center space-y-2">
                  <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
                    {formatDamageClass(analysisResult.room_type)}
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border ${conditionColors[analysisResult.condition] || 'bg-black/5 text-muted-foreground'}`}>
                    {analysisResult.condition === 'critical' ? <XCircle className="w-3.5 h-3.5" /> :
                     analysisResult.condition === 'poor' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                     <CheckCircle2 className="w-3.5 h-3.5" />}
                    {analysisResult.condition.charAt(0).toUpperCase() + analysisResult.condition.slice(1)}
                  </div>
                  <div className="text-[11px] text-muted-foreground/50">
                    {analysisResult.detections.length} issue{analysisResult.detections.length !== 1 ? 's' : ''} detected
                  </div>
                </div>
              </div>

              {/* Deal Score — prominent gauge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-5 border border-black/[0.05]"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground/70">Deal Score</span>
                </div>

                <div className="flex items-center gap-6">
                  <ScoreGauge
                    score={analysisResult.investment_metrics.deal_score}
                    size={100}
                    strokeWidth={7}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground/50">Risk</span>
                      <span className="text-muted-foreground capitalize">{analysisResult.investment_metrics.risk_level}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground/50">Value-add</span>
                      <span className="text-muted-foreground">{(analysisResult.investment_metrics.value_add_potential * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground/50">BRRRR</span>
                      <span className={`font-medium ${analysisResult.investment_metrics.brrrr_viable ? 'text-emerald-400' : 'text-muted-foreground/70'}`}>
                        {analysisResult.investment_metrics.brrrr_viable ? 'Viable' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Detected Issues */}
              {analysisResult.detections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-card rounded-2xl p-4 border border-black/[0.05]"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground/70">Detected Issues</span>
                  </div>
                  <div className="space-y-2">
                    {analysisResult.detections.map((det, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="flex items-center justify-between py-2 border-b border-black/[0.05] last:border-0"
                      >
                        <span className="text-sm text-muted-foreground">{formatDamageClass(det.damage_class)}</span>
                        <SeverityBadge severity={det.severity} size="sm" confidence={det.confidence} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Renovation Costs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CostBreakdown
                  basicCost={analysisResult.renovation_costs.basic_refresh}
                  standardCost={analysisResult.renovation_costs.standard_rental}
                  premiumCost={analysisResult.renovation_costs.premium_upgrade}
                  repairs={analysisResult.renovation_costs.repairs}
                  region={analysisResult.renovation_costs.region}
                />
              </motion.div>

              {/* Strategy */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card rounded-2xl p-4 border border-black/[0.05]"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground/70">Recommended Strategy</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysisResult.investment_metrics.recommended_strategy}
                </p>
                {analysisResult.investment_metrics.estimated_arv && (
                  <div className="mt-2 text-xs text-muted-foreground/50">
                    Estimated ARV: {formatCurrency(analysisResult.investment_metrics.estimated_arv)}
                  </div>
                )}
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                {/* Primary actions */}
                <div className="flex gap-2">
                  {onGetRenovationPlan && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onGetRenovationPlan(analysisResult)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 transition-all text-sm font-medium border border-violet-500/10"
                    >
                      <Wrench className="w-4 h-4" />
                      Renovation Plan
                    </motion.button>
                  )}
                  {onGetNegotiationPoints && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onGetNegotiationPoints(analysisResult)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition-all text-sm font-medium border border-blue-500/10"
                    >
                      <Scale className="w-4 h-4" />
                      Negotiate
                    </motion.button>
                  )}
                </div>

                {/* Secondary actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={newScan}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black/[0.03] text-muted-foreground hover:bg-black/[0.05] transition-all text-sm font-medium border border-black/[0.05]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Scan
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExportPDF}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black/[0.03] text-muted-foreground hover:bg-black/[0.05] transition-all text-sm font-medium border border-black/[0.05]"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickScanMode;
