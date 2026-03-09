/**
 * InteractiveResults — Tappable detection zones with detail popovers
 *
 * Full-width captured image with:
 *   - Tappable bounding boxes that show animated detail popovers
 *   - Pinch-to-zoom on image (via CSS transform)
 *   - Navigation between detections (prev/next)
 *   - Action buttons: Renovation Plan, Negotiation, Export PDF
 *
 * Design: Parallax image, frosted glass popovers, spring animations,
 * pulse on active zone.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Scale,
  Download,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DetectionOverlay, type Detection } from '../shared/DetectionOverlay';
import { SeverityBadge } from '../shared/SeverityBadge';
import { ScoreGauge } from '../shared/ScoreGauge';
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

interface InteractiveResultsProps {
  result: AnalysisResult;
  image: string | null;
  onBack: () => void;
  onGetRenovationPlan?: (result: AnalysisResult) => void;
  onGetNegotiationPoints?: (result: AnalysisResult) => void;
}

// ── Helpers ────────────────────────────────────────────────

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ── Detection Detail Popover ───────────────────────────────

const DetectionPopover: React.FC<{
  detection: Detection;
  repairs: RepairEstimate[];
  onClose: () => void;
}> = ({ detection, repairs, onClose }) => {
  // Find relevant repair for this damage class
  const matchedRepair = repairs.find(r =>
    r.category.toLowerCase().includes(detection.damage_class.toLowerCase().replace(/_/g, ' '))
    || detection.damage_class.toLowerCase().includes(r.repair_type.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute bottom-4 left-4 right-4 z-30
        bg-black/60 backdrop-blur-2xl border border-black/[0.06] rounded-2xl p-4
        shadow-[0_8px_60px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {formatDamageClass(detection.damage_class)}
          </h4>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">
            {(detection.confidence * 100).toFixed(0)}% confidence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={detection.severity} size="sm" />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/[0.05] transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground/50" />
          </button>
        </div>
      </div>

      {/* Cost range if available */}
      {matchedRepair && (
        <div className="pt-3 border-t border-black/[0.04] space-y-2">
          <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Repair estimate</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-[9px] text-muted-foreground/40">Basic</div>
              <div className="text-xs text-blue-400 font-medium">{formatCurrency(matchedRepair.basic_cost)}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-muted-foreground/40">Standard</div>
              <div className="text-xs text-violet-400 font-medium">{formatCurrency(matchedRepair.standard_cost)}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-muted-foreground/40">Premium</div>
              <div className="text-xs text-amber-400 font-medium">{formatCurrency(matchedRepair.premium_cost)}</div>
            </div>
          </div>
        </div>
      )}

      {/* AI tip */}
      <div className="mt-3 pt-3 border-t border-black/[0.04]">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded bg-violet-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[8px]">💡</span>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
            {detection.severity === 'critical'
              ? `Negotiate ${matchedRepair ? formatCurrency(matchedRepair.standard_cost) : '$1,000+'} off asking price — this is a safety concern inspectors will flag.`
              : detection.severity === 'high'
              ? 'Request seller credit for this repair before closing.'
              : 'Factor into renovation budget for future value appreciation.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────

export const InteractiveResults: React.FC<InteractiveResultsProps> = ({
  result,
  image,
  onBack,
  onGetRenovationPlan,
  onGetNegotiationPoints,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Resize observer
  useEffect(() => {
    const el = imageContainerRef.current;
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

  const handleDetectionTap = useCallback((index: number) => {
    setActiveIndex(prev => prev === index ? null : index);
  }, []);

  const goToPrev = useCallback(() => {
    if (result.detections.length === 0) return;
    setActiveIndex(prev => {
      if (prev === null) return result.detections.length - 1;
      return prev > 0 ? prev - 1 : result.detections.length - 1;
    });
  }, [result.detections.length]);

  const goToNext = useCallback(() => {
    if (result.detections.length === 0) return;
    setActiveIndex(prev => {
      if (prev === null) return 0;
      return prev < result.detections.length - 1 ? prev + 1 : 0;
    });
  }, [result.detections.length]);

  const handleExportPDF = useCallback(() => {
    import('../../../services/visionReportGenerator').then(m => {
      m.generateVisionPDF(result as any, image);
    }).catch(() => alert('PDF export coming soon'));
  }, [result, image]);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-xl border-b border-black/[0.04] flex-shrink-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Detection nav */}
        {result.detections.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={goToPrev} className="p-1.5 rounded-lg hover:bg-black/[0.03] transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground/50" />
            </button>
            <span className="text-xs text-muted-foreground/50 min-w-[40px] text-center">
              {activeIndex !== null ? `${activeIndex + 1}/${result.detections.length}` : `${result.detections.length}`}
            </span>
            <button onClick={goToNext} className="p-1.5 rounded-lg hover:bg-black/[0.03] transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(1, z - 0.5))}
            className="p-1.5 rounded-lg hover:bg-black/[0.03] transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground/50" />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.5))}
            className="p-1.5 rounded-lg hover:bg-black/[0.03] transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground/50" />
          </button>
        </div>
      </div>

      {/* Image area with detection overlay */}
      <div className="flex-1 relative overflow-auto" ref={imageContainerRef}>
        <div
          className="relative min-h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          {image && (
            <img src={image} alt="Analyzed" className="w-full" />
          )}
          <DetectionOverlay
            detections={result.detections}
            width={containerSize.width * zoom}
            height={containerSize.height * zoom}
            activeIndex={activeIndex}
            onTap={handleDetectionTap}
          />
        </div>

        {/* Detection detail popover */}
        <AnimatePresence>
          {activeIndex !== null && result.detections[activeIndex] && (
            <DetectionPopover
              detection={result.detections[activeIndex]}
              repairs={result.renovation_costs.repairs}
              onClose={() => setActiveIndex(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-2xl border-t border-black/[0.04] px-4 py-3">
        <div className="flex gap-2">
          {onGetRenovationPlan && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onGetRenovationPlan(result)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500/15 text-violet-300 text-xs font-medium border border-violet-500/10"
            >
              <Wrench className="w-3.5 h-3.5" />
              Renovation Plan
            </motion.button>
          )}
          {onGetNegotiationPoints && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onGetNegotiationPoints(result)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/15 text-blue-300 text-xs font-medium border border-blue-500/10"
            >
              <Scale className="w-3.5 h-3.5" />
              Negotiate
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-black/[0.03] text-muted-foreground/70 text-xs font-medium border border-black/[0.05]"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveResults;
