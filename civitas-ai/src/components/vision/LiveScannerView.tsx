/**
 * LiveScannerView -- Premium live property scanning component
 *
 * Renders a full-screen camera feed with AR damage overlays, a findings
 * drawer, camera controls and real-time inference stats.  Powered by the
 * useVisionScanner hook which handles frame capture, API calls and
 * deduplication.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  Scan,
  Camera,
  Trash2,
  ChevronUp,
  Activity,
  Cpu,
  Eye,
  AlertTriangle,
  Square,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVisionScanner } from '../../hooks/useVisionScanner';
import type { ScanDetection } from '../../hooks/useVisionScanner';

// ── Constants ───────────────────────────────────────────────

const DRAWER_COLLAPSED = 56;
const DRAWER_PEEK = 200;
const DRAWER_FULL_VH = 80;

const SEVERITY_COLOR_MAP: Record<string, { stroke: string; fill: string; text: string; bg: string }> = {
  critical: {
    stroke: '#f87171',  // red-400
    fill: 'rgba(248,113,113,0.08)',
    text: 'text-red-400',
    bg: 'bg-red-400/15 border-red-400/25',
  },
  high: {
    stroke: '#fb923c',  // orange-400
    fill: 'rgba(251,146,60,0.08)',
    text: 'text-orange-400',
    bg: 'bg-orange-400/15 border-orange-400/25',
  },
  medium: {
    stroke: '#facc15',  // yellow-400
    fill: 'rgba(250,204,21,0.08)',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/15 border-yellow-400/25',
  },
  low: {
    stroke: '#4ade80',  // green-400
    fill: 'rgba(74,222,128,0.08)',
    text: 'text-green-400',
    bg: 'bg-green-400/15 border-green-400/25',
  },
};

const fallbackSeverity = SEVERITY_COLOR_MAP.medium;

// ── Helpers ─────────────────────────────────────────────────

function severityColors(severity: string) {
  return SEVERITY_COLOR_MAP[severity.toLowerCase()] ?? fallbackSeverity;
}

function groupByRoom(findings: ScanDetection[]): Record<string, ScanDetection[]> {
  const groups: Record<string, ScanDetection[]> = {};
  for (const f of findings) {
    const key = f.room_type || 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }
  return groups;
}

function formatRoomType(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Sub-components ──────────────────────────────────────────

/** Corner accent lines for a bounding box */
const CornerAccents: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}> = ({ x, y, w, h, color }) => {
  const len = Math.min(12, w * 0.25, h * 0.25);
  return (
    <g stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none">
      {/* top-left */}
      <polyline points={`${x},${y + len} ${x},${y} ${x + len},${y}`} />
      {/* top-right */}
      <polyline points={`${x + w - len},${y} ${x + w},${y} ${x + w},${y + len}`} />
      {/* bottom-left */}
      <polyline points={`${x},${y + h - len} ${x},${y + h} ${x + len},${y + h}`} />
      {/* bottom-right */}
      <polyline points={`${x + w - len},${y + h} ${x + w},${y + h} ${x + w},${y + h - len}`} />
    </g>
  );
};

/** Severity badge pill */
const SeverityBadge: React.FC<{ severity: string; className?: string }> = ({ severity, className }) => {
  const s = severityColors(severity);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border',
        s.bg,
        s.text,
        className,
      )}
    >
      {severity}
    </span>
  );
};

/** Pulsing scan rings indicator */
const ScanIndicator: React.FC<{ active: boolean }> = ({ active }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet-400/50"
            initial={{ width: 40, height: 40, opacity: 0.6 }}
            animate={{
              width: [40, 120],
              height: [40, 120],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
        <div className="w-3 h-3 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(167,139,250,0.6)] relative z-10" />
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Main Component ──────────────────────────────────────────

export const LiveScannerView: React.FC = () => {
  const {
    isScanning,
    isInitializing,
    error,
    videoRef,
    findings,
    currentRoom,
    latestDetections,
    frameCount,
    avgInferenceTime,
    isProcessing,
    startScan,
    stopScan,
    captureSnapshot,
    clearFindings,
  } = useVisionScanner();

  // ── Drawer state ────────────────────────────────────────
  type DrawerState = 'collapsed' | 'peek' | 'full';
  const [drawerState, setDrawerState] = useState<DrawerState>('collapsed');
  const drawerY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawerHeight = useMemo(() => {
    if (drawerState === 'full') return `${DRAWER_FULL_VH}vh`;
    if (drawerState === 'peek') return `${DRAWER_PEEK}px`;
    return `${DRAWER_COLLAPSED}px`;
  }, [drawerState]);

  const handleDrawerDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const vy = info.velocity.y;
      const dy = info.offset.y;

      if (vy < -300 || dy < -60) {
        // Swiped up
        setDrawerState((prev) =>
          prev === 'collapsed' ? 'peek' : prev === 'peek' ? 'full' : 'full',
        );
      } else if (vy > 300 || dy > 60) {
        // Swiped down
        setDrawerState((prev) =>
          prev === 'full' ? 'peek' : prev === 'peek' ? 'collapsed' : 'collapsed',
        );
      }
      drawerY.set(0);
    },
    [drawerY],
  );

  // Auto-peek drawer when new findings arrive
  const prevFindingsCount = useRef(findings.length);
  useEffect(() => {
    if (findings.length > prevFindingsCount.current && drawerState === 'collapsed') {
      setDrawerState('peek');
    }
    prevFindingsCount.current = findings.length;
  }, [findings.length, drawerState]);

  // ── Grouped findings ────────────────────────────────────
  const grouped = useMemo(() => groupByRoom(findings), [findings]);

  // ── Snapshot handler ────────────────────────────────────
  const handleSnapshot = useCallback(() => {
    const dataUrl = captureSnapshot();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `vasthu-scan-${Date.now()}.jpg`;
    link.click();
  }, [captureSnapshot]);

  // ── Toggle scan ─────────────────────────────────────────
  const handleToggleScan = useCallback(async () => {
    if (isScanning) {
      stopScan();
    } else {
      await startScan();
    }
  }, [isScanning, startScan, stopScan]);

  // ── Video dimensions for SVG overlay ────────────────────
  const [videoDims, setVideoDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDims = () => {
      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        setVideoDims({ w: rect.width, h: rect.height });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, [isScanning]);

  // ── Render ──────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden select-none"
      style={{ background: 'hsl(var(--background))' }}
    >
      {/* ═══════════════════════════════════════════════════════
          Camera Feed + AR Overlay
          ═══════════════════════════════════════════════════════ */}
      <div
        ref={videoContainerRef}
        className="relative flex-1 overflow-hidden bg-black"
      >
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedMetadata={() => {
            if (videoContainerRef.current) {
              const rect = videoContainerRef.current.getBoundingClientRect();
              setVideoDims({ w: rect.width, h: rect.height });
            }
          }}
        />

        {/* Initializing overlay */}
        <AnimatePresence>
          {isInitializing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 gap-4"
            >
              <div className="w-10 h-10 rounded-full border-2 border-violet-400/30 border-t-violet-400 animate-spin" />
              <p className="text-sm font-sans text-muted-foreground">Initializing camera...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay */}
        <AnimatePresence>
          {error && !isInitializing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 gap-4 px-8 text-center"
            >
              <AlertTriangle className="w-10 h-10 text-red-400/70" />
              <p className="text-sm font-sans text-muted-foreground max-w-xs">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan indicator (pulsing rings) */}
        <ScanIndicator active={isScanning && isProcessing} />

        {/* ── AR Bounding Box Overlay ──────────────────────── */}
        {isScanning && latestDetections.length > 0 && videoDims.w > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox={`0 0 ${videoDims.w} ${videoDims.h}`}
            preserveAspectRatio="none"
          >
            {latestDetections.map((det) => {
              const [bx, by, bw, bh] = det.bbox;
              // bbox is normalized [0..1] — scale to container
              const x = bx * videoDims.w;
              const y = by * videoDims.h;
              const w = bw * videoDims.w;
              const h = bh * videoDims.h;
              const colors = severityColors(det.severity);

              return (
                <g key={det.id}>
                  {/* Dashed bounding box */}
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={4}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    className="animate-detection-appear"
                  />

                  {/* Corner accents */}
                  <CornerAccents x={x} y={y} w={w} h={h} color={colors.stroke} />

                  {/* Label pill above box */}
                  <foreignObject
                    x={x}
                    y={Math.max(0, y - 28)}
                    width={w}
                    height={28}
                    className="overflow-visible"
                  >
                    <div className="flex items-start justify-start">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-sans tracking-wide whitespace-nowrap"
                        style={{
                          background: `${colors.stroke}22`,
                          color: colors.stroke,
                          border: `1px solid ${colors.stroke}44`,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        {det.damage_class.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        )}

        {/* ── Room Type Badge (top-left) ───────────────────── */}
        <AnimatePresence>
          {currentRoom && isScanning && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute top-4 left-4 z-20"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/[0.05] border border-black/[0.08] backdrop-blur-xl">
                <Home className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-display font-semibold text-foreground/80 tracking-wide">
                  {formatRoomType(currentRoom)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Findings Counter Badge (top-right) ───────────── */}
        <AnimatePresence>
          {findings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 z-20"
            >
              <button
                onClick={() => setDrawerState((s) => (s === 'collapsed' ? 'peek' : 'collapsed'))}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/15 border border-violet-400/25 backdrop-blur-xl hover:bg-violet-500/25 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-mono font-bold text-violet-300 tabular-nums">
                  {findings.length}
                </span>
                <span className="text-[10px] font-sans text-violet-400/60">
                  {findings.length === 1 ? 'finding' : 'findings'}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Stats Bar
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-black/[0.06] bg-black/[0.02]"
          >
            <div className="flex items-center justify-center gap-6 px-4 py-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-violet-400/60" />
                <span className="text-[11px] font-sans text-muted-foreground/70">Frames</span>
                <span className="text-[11px] font-mono font-bold text-foreground/70 tabular-nums">
                  {frameCount}
                </span>
              </div>
              <div className="w-px h-3 bg-black/[0.06]" />
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-violet-400/60" />
                <span className="text-[11px] font-sans text-muted-foreground/70">Avg inference</span>
                <span className="text-[11px] font-mono font-bold text-foreground/70 tabular-nums">
                  {avgInferenceTime}ms
                </span>
              </div>
              {isProcessing && (
                <>
                  <div className="w-px h-3 bg-black/[0.06]" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[11px] font-sans text-violet-400/70">Analyzing</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          Camera Controls
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-30 border-t border-black/[0.06] bg-background">
        <div className="flex items-center justify-center gap-6 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Clear findings */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={clearFindings}
            disabled={findings.length === 0}
            className={cn(
              'p-3 rounded-full transition-colors',
              findings.length > 0
                ? 'bg-black/[0.05] border border-black/[0.08] text-muted-foreground hover:text-foreground/80 hover:bg-black/[0.07]'
                : 'bg-black/[0.02] border border-black/[0.04] text-muted-foreground/40 cursor-not-allowed',
            )}
            title="Clear findings"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>

          {/* Start / Stop Scan (large center button) */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleToggleScan}
            disabled={isInitializing}
            className={cn(
              'relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all',
              isScanning
                ? 'bg-red-500/20 border-2 border-red-400/50 shadow-[0_0_24px_rgba(248,113,113,0.25)]'
                : 'bg-violet-500/20 border-2 border-violet-400/50 shadow-[0_0_24px_rgba(167,139,250,0.25)]',
              isInitializing && 'opacity-50 cursor-not-allowed',
            )}
            title={isScanning ? 'Stop scanning' : 'Start scanning'}
          >
            {/* Animated ring behind button */}
            {isScanning && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-400/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {isScanning ? (
              <Square className="w-7 h-7 text-red-400 fill-red-400/80" />
            ) : (
              <Scan className="w-7 h-7 text-violet-400" />
            )}
          </motion.button>

          {/* Capture snapshot */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSnapshot}
            disabled={!isScanning}
            className={cn(
              'p-3 rounded-full transition-colors',
              isScanning
                ? 'bg-black/[0.05] border border-black/[0.08] text-muted-foreground hover:text-foreground/80 hover:bg-black/[0.07]'
                : 'bg-black/[0.02] border border-black/[0.04] text-muted-foreground/40 cursor-not-allowed',
            )}
            title="Capture snapshot"
          >
            <Camera className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Findings Drawer
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {findings.length > 0 && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ height: drawerHeight, y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            style={{ y: drawerY }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDrawerDragEnd}
            className={cn(
              'absolute bottom-0 left-0 right-0 z-40',
              'rounded-t-2xl overflow-hidden',
              'bg-background/95 backdrop-blur-2xl',
              'border-t border-x border-black/[0.06]',
              'flex flex-col',
            )}
          >
            {/* Handle bar */}
            <div
              className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing shrink-0"
              onDoubleClick={() =>
                setDrawerState((s) => (s === 'full' ? 'collapsed' : 'full'))
              }
            >
              <div className="w-10 h-1 rounded-full bg-black/12" />
            </div>

            {/* Collapsed bar */}
            <div className="flex items-center justify-between px-4 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-display font-semibold text-foreground/80">
                  Findings
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-violet-500/15 border border-violet-400/20 text-[10px] font-mono font-bold text-violet-300 tabular-nums">
                  {findings.length}
                </span>
              </div>
              <button
                onClick={() =>
                  setDrawerState((s) =>
                    s === 'collapsed' ? 'peek' : s === 'peek' ? 'full' : 'collapsed',
                  )
                }
                className="p-1.5 rounded-lg hover:bg-black/[0.05] text-muted-foreground/70 hover:text-foreground/70 transition-colors"
              >
                <motion.div
                  animate={{
                    rotate: drawerState === 'full' ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.div>
              </button>
            </div>

            {/* Scrollable findings list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {Object.entries(grouped).map(([room, items]) => (
                <div key={room} className="mb-4">
                  {/* Room group header */}
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background/90 backdrop-blur-md py-1 z-10">
                    <Home className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[11px] font-display font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {formatRoomType(room)}
                    </span>
                    <div className="flex-1 h-px bg-black/[0.05]" />
                  </div>

                  {/* Finding cards */}
                  <div className="space-y-2">
                    {items.map((f) => {
                      const sev = severityColors(f.severity);
                      return (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'px-3 py-2.5 rounded-xl',
                            'bg-black/[0.02] border border-black/[0.06]',
                            'flex items-center gap-3',
                          )}
                        >
                          {/* Severity dot */}
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: sev.stroke }}
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-sans font-medium text-foreground/80 truncate">
                              {f.damage_class.replace(/_/g, ' ')}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <SeverityBadge severity={f.severity} />
                              <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
                                {(f.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          {/* Frame tag */}
                          <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums shrink-0">
                            #{f.frame_number}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveScannerView;
