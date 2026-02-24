/**
 * LiveScanMode — Real-time camera scanning with live detection overlays
 *
 * Continuous camera feed that captures frames every ~500ms and sends
 * them to /scan-frame for lightweight analysis. Detection bounding
 * boxes render as animated SVG overlays with frosted glass labels.
 *
 * Design: Professional scanner aesthetic with scanning line, pulsing
 * detections, and frosted glass info bar.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Camera,
  Pause,
  Play,
  X,
  Maximize2,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraFeed, type CameraFeedRef } from '../shared/CameraFeed';
import { DetectionOverlay, type Detection } from '../shared/DetectionOverlay';
import { SeverityBadge } from '../shared/SeverityBadge';

// ── Types ──────────────────────────────────────────────────

interface ScanFrameResult {
  room_type: string;
  room_confidence: number;
  condition: string;
  condition_confidence: number;
  detections: Detection[];
}

interface DetailPopoverData {
  detection: Detection;
  index: number;
}

interface LiveScanModeProps {
  /** Callback to run full analysis (freeze frame -> /analyze) */
  onCaptureFullAnalysis?: (file: File, previewUrl: string) => void;
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

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const conditionColors: Record<string, string> = {
  excellent: 'text-emerald-400',
  good: 'text-green-400',
  fair: 'text-yellow-400',
  poor: 'text-orange-400',
  critical: 'text-red-400',
};

// ── Status Chip ────────────────────────────────────────────

const StatusChip: React.FC<{ label: string; value: string; valueClass?: string }> = ({
  label, value, valueClass = 'text-white/70',
}) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/[0.06]">
    <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
    <span className={`text-xs font-medium ${valueClass}`}>{value}</span>
  </div>
);

// ── Detail Popover ─────────────────────────────────────────

const DetailPopover: React.FC<{
  data: DetailPopoverData;
  onClose: () => void;
}> = ({ data, onClose }) => {
  const { detection } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="absolute bottom-20 left-4 right-4 z-30
        bg-black/60 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-4
        shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white/90">
            {formatDamageClass(detection.damage_class)}
          </h4>
          <p className="text-[11px] text-white/30 mt-0.5">
            Confidence: {(detection.confidence * 100).toFixed(0)}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={detection.severity} size="sm" />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white/30" />
          </button>
        </div>
      </div>

      {/* Bounding box coordinates */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04]">
        <div>
          <div className="text-[9px] text-white/20 uppercase tracking-wider mb-0.5">Class conf.</div>
          <div className="text-xs text-white/60 font-medium">
            {detection.class_confidence ? `${(detection.class_confidence * 100).toFixed(0)}%` : '—'}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-white/20 uppercase tracking-wider mb-0.5">Severity conf.</div>
          <div className="text-xs text-white/60 font-medium">
            {detection.severity_confidence ? `${(detection.severity_confidence * 100).toFixed(0)}%` : '—'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────

export const LiveScanMode: React.FC<LiveScanModeProps> = ({
  onCaptureFullAnalysis,
}) => {
  const cameraRef = useRef<CameraFeedRef>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [scanning, setScanning] = useState(true);
  const [paused, setPaused] = useState(false);
  const [frameResult, setFrameResult] = useState<ScanFrameResult | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [activeDetection, setActiveDetection] = useState<DetailPopoverData | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanCount, setScanCount] = useState(0);

  // ── Resize observer for container dimensions ──────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Frame scanning loop ───────────────────────────────

  const scanFrame = useCallback(async () => {
    if (!cameraRef.current || paused) return;

    try {
      const file = await cameraRef.current.captureFrame();
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch(`${API_BASE}/api/vision/scan-frame`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      });

      if (resp.ok) {
        const data: ScanFrameResult = await resp.json();
        setFrameResult(data);
        setDetections(data.detections || []);
        setScanCount(prev => prev + 1);
      }
    } catch (err) {
      console.warn('Frame scan failed:', err);
    }
  }, [paused]);

  useEffect(() => {
    if (scanning && !paused) {
      // Start polling at ~500ms intervals
      pollingRef.current = setInterval(scanFrame, 500);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [scanning, paused, scanFrame]);

  // ── Capture full analysis ─────────────────────────────

  const handleFullCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    setPaused(true);

    const file = await cameraRef.current.captureFrame();
    if (file && onCaptureFullAnalysis) {
      const url = URL.createObjectURL(file);
      onCaptureFullAnalysis(file, url);
    }
  }, [onCaptureFullAnalysis]);

  // ── Toggle pause ──────────────────────────────────────

  const togglePause = useCallback(() => {
    setPaused(prev => !prev);
    setActiveDetection(null);
  }, []);

  // ── Handle detection tap ──────────────────────────────

  const handleDetectionTap = useCallback((index: number) => {
    const det = detections[index];
    if (det) {
      setActiveDetection(prev =>
        prev?.index === index ? null : { detection: det, index }
      );
    }
  }, [detections]);

  // ── HUD status chips ──────────────────────────────────

  const hudContent = frameResult ? (
    <>
      <StatusChip label="Room" value={formatDamageClass(frameResult.room_type)} />
      <StatusChip
        label="Condition"
        value={frameResult.condition.charAt(0).toUpperCase() + frameResult.condition.slice(1)}
        valueClass={conditionColors[frameResult.condition] || 'text-white/70'}
      />
      <StatusChip
        label="Issues"
        value={String(detections.length)}
        valueClass={detections.length > 0 ? 'text-orange-400' : 'text-white/50'}
      />
    </>
  ) : (
    <StatusChip label="Status" value={scanning ? 'Scanning...' : 'Ready'} />
  );

  // ── Detection overlay ─────────────────────────────────

  const overlay = (
    <div ref={containerRef} className="absolute inset-0">
      <DetectionOverlay
        detections={detections}
        width={containerSize.width}
        height={containerSize.height}
        activeIndex={activeDetection?.index ?? null}
        onTap={handleDetectionTap}
        animate={true}
      />
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0c] relative">
      {/* Camera with overlays */}
      <CameraFeed
        ref={cameraRef}
        active={scanning}
        showScanLine={!paused}
        showCaptureButton={false}
        showUpload={false}
        overlay={overlay}
        hudContent={hudContent}
      />

      {/* Bottom control bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="bg-black/50 backdrop-blur-2xl border-t border-white/[0.04]">
          <div className="flex items-center justify-center gap-5 py-4 px-4">
            {/* Pause / Resume */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={togglePause}
              className="w-12 h-12 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center"
            >
              {paused ? (
                <Play className="w-5 h-5 text-white/60 ml-0.5" />
              ) : (
                <Pause className="w-5 h-5 text-white/60" />
              )}
            </motion.button>

            {/* Capture Full Analysis */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={handleFullCapture}
              className="relative flex items-center gap-2 px-5 py-3 rounded-full bg-violet-500/20 border border-violet-500/15 hover:bg-violet-500/30 transition-all"
            >
              <Maximize2 className="w-4 h-4 text-violet-300" />
              <span className="text-sm font-medium text-violet-300">Full Analysis</span>
            </motion.button>

            {/* Scan counter */}
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-white/50">{scanCount}</span>
              <span className="text-[7px] text-white/20 uppercase">frames</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail popover */}
      <AnimatePresence>
        {activeDetection && (
          <DetailPopover
            data={activeDetection}
            onClose={() => setActiveDetection(null)}
          />
        )}
      </AnimatePresence>

      {/* Paused indicator */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20
              flex items-center gap-2 px-4 py-2 rounded-full
              bg-black/50 backdrop-blur-xl border border-white/[0.08]"
          >
            <Pause className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-medium text-white/50">Paused</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveScanMode;
