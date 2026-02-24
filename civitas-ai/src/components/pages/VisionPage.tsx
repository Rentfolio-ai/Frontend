/**
 * VisionPage — Vasthu Vision Premium Property Analysis
 *
 * Full-page app-like experience with 4 views:
 *   1. Camera   — capture / upload an image
 *   2. Analyzing — animated pipeline stages
 *   3. Results  — condition, detections, costs, investment metrics
 *   4. History  — grid of past analyses
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Upload,
  RefreshCw,
  Download,
  Share2,
  History as HistoryIcon,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ScanEye,
  Eye,
  Grid3X3,
  BarChart3,
  DollarSign,
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────

interface Detection {
  damage_class: string;
  severity: string;
  confidence: number;
  class_confidence: number;
  severity_confidence: number;
  bbox: number[]; // [x1, y1, x2, y2] normalised 0-1
}

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

interface AnalysisResult {
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

interface HistoryItem {
  analysis_id: string;
  analyzed_at: string;
  room_type: string;
  condition_rating: string;
  analysis_data: AnalysisResult;
  image_url?: string;
}

type ViewState = 'camera' | 'analyzing' | 'results' | 'history';

interface VisionPageProps {
  onBack?: () => void;
}

// ── API Config ───────────────────────────────────────────────

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

function getHeaders(isJson = false): HeadersInit {
  const headers: HeadersInit = {};
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
}

// ── Analysis pipeline stages ─────────────────────────────────

const ANALYSIS_STAGES = [
  { key: 'upload', label: 'Uploading image...', icon: Upload },
  { key: 'room', label: 'Detecting room type...', icon: Grid3X3 },
  { key: 'condition', label: 'Assessing condition...', icon: Eye },
  { key: 'damage', label: 'Scanning for damage...', icon: AlertTriangle },
  { key: 'costs', label: 'Estimating costs...', icon: DollarSign },
  { key: 'metrics', label: 'Calculating investment metrics...', icon: TrendingUp },
];

// ── Helpers ──────────────────────────────────────────────────

const conditionColors: Record<string, string> = {
  excellent: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  good: 'bg-green-500/20 text-green-400 border-green-500/30',
  fair: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  poor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const severityColors: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Main Component ───────────────────────────────────────────

export const VisionPage: React.FC<VisionPageProps> = ({ onBack } = {}) => {
  const [view, setView] = useState<ViewState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [costsExpanded, setCostsExpanded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Camera management ──────────────────────────────────

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (view === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [view, startCamera, stopCamera]);

  // ── Capture / Upload ───────────────────────────────────

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setCapturedFile(file);
      setCapturedImage(URL.createObjectURL(blob));
      runAnalysis(file);
    }, 'image/jpeg', 0.92);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedFile(file);
    setCapturedImage(URL.createObjectURL(file));
    runAnalysis(file);
  }, []);

  // ── Analysis API call ──────────────────────────────────

  const runAnalysis = useCallback(async (file: File) => {
    setView('analyzing');
    setError(null);
    setCurrentStage(0);

    // Simulate progressive stages while waiting for API
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

      // Short delay before showing results for smooth transition
      setTimeout(() => setView('results'), 600);
    } catch (err: any) {
      clearInterval(stageInterval);
      setError(err.message || 'Analysis failed');
      setView('camera');
    }
  }, []);

  // ── History ────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/vision/?limit=20`, {
        headers: getHeaders(),
      });
      if (resp.ok) {
        const data = await resp.json();
        setHistory(data);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const openHistory = useCallback(() => {
    setView('history');
    loadHistory();
  }, [loadHistory]);

  // ── New scan ───────────────────────────────────────────

  const newScan = useCallback(() => {
    setCapturedImage(null);
    setCapturedFile(null);
    setAnalysisResult(null);
    setError(null);
    setCurrentStage(0);
    setCostsExpanded(false);
    setView('camera');
  }, []);

  // ── Render views ───────────────────────────────────────

  return (
    <div className="h-full w-full bg-[#0a0a0c] text-white flex flex-col overflow-hidden">
      {/* Sub-header: view controls (no branding — wrapper handles that) */}
      {(view === 'results' || view === 'analyzing') && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            {view === 'results' && (
              <button
                onClick={newScan}
                className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                New scan
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {view !== 'history' && (
              <button
                onClick={openHistory}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                title="History"
              >
                <HistoryIcon className="w-[18px] h-[18px] text-white/40" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ── Camera View ─────────────────────────────── */}
          {view === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              {/* Viewfinder */}
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner markers */}
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
                  <div className="absolute bottom-28 left-8 w-12 h-12 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
                  <div className="absolute bottom-28 right-8 w-12 h-12 border-b-2 border-r-2 border-white/30 rounded-br-lg" />
                </div>

                {/* Error message */}
                {error && (
                  <div className="absolute bottom-32 left-4 right-4 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div className="flex items-center justify-center gap-6 py-6 bg-[#0a0a0c]">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  title="Upload image"
                >
                  <Upload className="w-6 h-6 text-white/60" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg shadow-white/10"
                >
                  <Camera className="w-7 h-7 text-[#0a0a0c]" />
                </button>
                <button
                  onClick={openHistory}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  title="View history"
                >
                  <HistoryIcon className="w-6 h-6 text-white/60" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </motion.div>
          )}

          {/* ── Analyzing View ──────────────────────────── */}
          {view === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center p-6"
            >
              {/* Captured image preview */}
              {capturedImage && (
                <div className="w-full max-w-sm rounded-xl overflow-hidden mb-8 ring-1 ring-white/10">
                  <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover" />
                </div>
              )}

              {/* Analysis stages */}
              <div className="w-full max-w-sm space-y-3">
                {ANALYSIS_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isActive = idx === currentStage;
                  const isDone = idx < currentStage;

                  return (
                    <motion.div
                      key={stage.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-violet-500/10 border border-violet-500/20'
                          : isDone
                          ? 'bg-white/[0.02] border border-white/5'
                          : 'opacity-30'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-violet-400 animate-spin flex-shrink-0" />
                      ) : (
                        <Icon className="w-5 h-5 text-white/30 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${isActive ? 'text-white' : isDone ? 'text-white/60' : 'text-white/30'}`}>
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
              className="p-4 space-y-4 pb-24"
            >
              {/* Image + Condition header */}
              <div className="flex gap-4">
                {capturedImage && (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                    <img src={capturedImage} alt="Analyzed" className="w-full h-full object-cover" />
                    {/* Detection bboxes overlay */}
                    {analysisResult.detections.length > 0 && (
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1 1" preserveAspectRatio="none">
                        {analysisResult.detections.map((det, i) => (
                          <rect
                            key={i}
                            x={det.bbox[0]}
                            y={det.bbox[1]}
                            width={det.bbox[2] - det.bbox[0]}
                            height={det.bbox[3] - det.bbox[1]}
                            fill="none"
                            stroke={det.severity === 'critical' ? '#ef4444' : det.severity === 'high' ? '#f97316' : '#eab308'}
                            strokeWidth="0.003"
                          />
                        ))}
                      </svg>
                    )}
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="text-xs text-white/40 uppercase tracking-wider">
                    {formatDamageClass(analysisResult.room_type)}
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border ${conditionColors[analysisResult.condition] || 'bg-white/10 text-white/60'}`}>
                    {analysisResult.condition === 'critical' ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : analysisResult.condition === 'poor' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {analysisResult.condition.charAt(0).toUpperCase() + analysisResult.condition.slice(1)} Condition
                  </div>
                  <div className="text-xs text-white/30">
                    {analysisResult.detections.length} issue{analysisResult.detections.length !== 1 ? 's' : ''} detected
                    {' · '}
                    {analysisResult.inference_time_ms.toFixed(0)}ms
                  </div>
                </div>
              </div>

              {/* Deal Score */}
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium">Deal Score</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {analysisResult.investment_metrics.deal_score}
                    <span className="text-sm text-white/30 font-normal">/100</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisResult.investment_metrics.deal_score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      analysisResult.investment_metrics.deal_score >= 70
                        ? 'bg-emerald-500'
                        : analysisResult.investment_metrics.deal_score >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-white/40">
                  <span>Risk: {analysisResult.investment_metrics.risk_level}</span>
                  <span>Value-add: {(analysisResult.investment_metrics.value_add_potential * 100).toFixed(0)}%</span>
                  <span>BRRRR: {analysisResult.investment_metrics.brrrr_viable ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {/* Detected Issues */}
              {analysisResult.detections.length > 0 && (
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium">Detected Issues</span>
                  </div>
                  <div className="space-y-2">
                    {analysisResult.detections.map((det, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            det.severity === 'critical' ? 'bg-red-500' :
                            det.severity === 'high' ? 'bg-orange-500' :
                            det.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="text-sm text-white/70">{formatDamageClass(det.damage_class)}</span>
                        </div>
                        <span className={`text-xs font-medium ${severityColors[det.severity]}`}>
                          {det.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Renovation Costs */}
              <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setCostsExpanded(!costsExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">Renovation Costs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">
                      {formatCurrency(analysisResult.renovation_costs.standard_rental)}
                    </span>
                    {costsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {costsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {/* Three tiers */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Basic', value: analysisResult.renovation_costs.basic_refresh, color: 'text-blue-400' },
                            { label: 'Standard', value: analysisResult.renovation_costs.standard_rental, color: 'text-violet-400' },
                            { label: 'Premium', value: analysisResult.renovation_costs.premium_upgrade, color: 'text-amber-400' },
                          ].map(tier => (
                            <div key={tier.label} className="bg-white/[0.03] rounded-lg p-3 text-center">
                              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{tier.label}</div>
                              <div className={`text-sm font-semibold ${tier.color}`}>{formatCurrency(tier.value)}</div>
                            </div>
                          ))}
                        </div>

                        {/* Individual repairs */}
                        {analysisResult.renovation_costs.repairs.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-white/5">
                            {analysisResult.renovation_costs.repairs.map((repair, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-white/50">{repair.description}</span>
                                <span className="text-white/70">{formatCurrency(repair.standard_cost)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Strategy Recommendation */}
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Recommended Strategy</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {analysisResult.investment_metrics.recommended_strategy}
                </p>
                {analysisResult.investment_metrics.estimated_arv && (
                  <div className="mt-2 text-xs text-white/40">
                    Estimated ARV: {formatCurrency(analysisResult.investment_metrics.estimated_arv)}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={newScan}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Scan
                </button>
                <button
                  onClick={() => {
                    // Trigger PDF export via visionReportGenerator
                    import('../../services/visionReportGenerator').then(m => {
                      if (analysisResult) m.generateVisionPDF(analysisResult, capturedImage);
                    }).catch(() => alert('PDF export coming soon'));
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>

              {/* Model version footer */}
              <div className="text-center text-[10px] text-white/20 pt-2">
                Model: {analysisResult.model_version} · {analysisResult.inference_time_ms.toFixed(0)}ms
              </div>
            </motion.div>
          )}

          {/* ── History View ────────────────────────────── */}
          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Analysis History</h2>
                <button
                  onClick={newScan}
                  className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  New Scan
                </button>
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-white/30">
                  <ScanEye className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">No analyses yet</p>
                  <button
                    onClick={newScan}
                    className="mt-3 text-sm text-violet-400 hover:text-violet-300"
                  >
                    Take your first scan
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {history.map(item => (
                    <button
                      key={item.analysis_id}
                      onClick={() => {
                        if (item.analysis_data) {
                          setAnalysisResult(item.analysis_data);
                          setCapturedImage(item.image_url || null);
                          setView('results');
                        }
                      }}
                      className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden hover:bg-white/[0.05] transition-colors text-left"
                    >
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="w-full h-24 object-cover" />
                      )}
                      <div className="p-3">
                        <div className="text-xs text-white/40 mb-1">
                          {new Date(item.analyzed_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-medium">
                          {formatDamageClass(item.room_type || 'unknown')}
                        </div>
                        <div className={`inline-flex text-[10px] px-1.5 py-0.5 rounded mt-1 ${conditionColors[item.condition_rating] || 'bg-white/5 text-white/40'}`}>
                          {item.condition_rating || 'N/A'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisionPage;
