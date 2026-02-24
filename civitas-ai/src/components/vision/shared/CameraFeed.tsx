/**
 * CameraFeed — Premium shared camera component
 *
 * Full-bleed camera viewfinder with frosted glass HUD, animated corner
 * brackets, scanning line, and professional capture controls.
 *
 * Used by QuickScanMode and LiveScanMode.
 */

import React, { useRef, useCallback, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────

export interface CameraFeedRef {
  captureFrame: () => Promise<File | null>;
  getVideo: () => HTMLVideoElement | null;
}

interface CameraFeedProps {
  /** Whether the camera should be active */
  active: boolean;
  /** Show the animated scanning line */
  showScanLine?: boolean;
  /** Called when user taps the capture button */
  onCapture?: (file: File, previewUrl: string) => void;
  /** Called when user uploads a file */
  onUpload?: (file: File, previewUrl: string) => void;
  /** Show upload button */
  showUpload?: boolean;
  /** Show capture button */
  showCaptureButton?: boolean;
  /** Custom overlay content */
  overlay?: React.ReactNode;
  /** Error message to display */
  error?: string | null;
  /** Additional HUD content (bottom bar chips) */
  hudContent?: React.ReactNode;
}

// ── Corner Bracket Component ───────────────────────────────

const CornerBracket: React.FC<{
  position: 'tl' | 'tr' | 'bl' | 'br';
  delay: number;
}> = ({ position, delay }) => {
  const corners: Record<string, string> = {
    tl: 'top-6 left-6 border-t-2 border-l-2 rounded-tl-lg',
    tr: 'top-6 right-6 border-t-2 border-r-2 rounded-tr-lg',
    bl: 'bottom-6 left-6 border-b-2 border-l-2 rounded-bl-lg',
    br: 'bottom-6 right-6 border-b-2 border-r-2 rounded-br-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      className={`absolute w-10 h-10 border-violet-400/60 ${corners[position]}`}
    />
  );
};

// ── Scanning Line ──────────────────────────────────────────

const ScanningLine: React.FC = () => (
  <motion.div
    className="absolute left-0 right-0 h-24 pointer-events-none"
    initial={{ top: '0%' }}
    animate={{ top: '100%' }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    <div className="w-full h-full bg-gradient-to-b from-violet-400/0 via-violet-400/20 to-violet-400/0" />
    <div className="absolute top-1/2 left-0 right-0 h-px bg-violet-400/40 shadow-[0_0_12px_rgba(139,92,246,0.4)]" />
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────

export const CameraFeed = forwardRef<CameraFeedRef, CameraFeedProps>(({
  active,
  showScanLine = false,
  onCapture,
  onUpload,
  showUpload = true,
  showCaptureButton = true,
  overlay,
  error,
  hudContent,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // ── Camera lifecycle ──────────────────────────────────

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
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
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [active, startCamera, stopCamera]);

  // ── Frame capture ─────────────────────────────────────

  const captureFrame = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (!blob) { resolve(null); return; }
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.92);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    captureFrame,
    getVideo: () => videoRef.current,
  }), [captureFrame]);

  // ── Capture handler ───────────────────────────────────

  const handleCapture = useCallback(async () => {
    const file = await captureFrame();
    if (file && onCapture) {
      const url = URL.createObjectURL(file);
      onCapture(file, url);
    }
  }, [captureFrame, onCapture]);

  // ── Upload handler ────────────────────────────────────

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    const url = URL.createObjectURL(file);
    onUpload(file, url);
  }, [onUpload]);

  // ── Render ────────────────────────────────────────────

  return (
    <div className="relative h-full w-full flex flex-col bg-black overflow-hidden">
      {/* Video feed — full bleed */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner brackets */}
          <CornerBracket position="tl" delay={0} />
          <CornerBracket position="tr" delay={0.05} />
          <CornerBracket position="bl" delay={0.1} />
          <CornerBracket position="br" delay={0.15} />

          {/* Scanning line */}
          {showScanLine && cameraReady && <ScanningLine />}
        </div>

        {/* Custom overlay (detection boxes etc.) */}
        {overlay}

        {/* Error overlay */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-24 left-4 right-4 bg-red-500/15 backdrop-blur-xl border border-red-500/20 rounded-2xl px-4 py-3 text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Frosted glass HUD — capture controls */}
      <div className="relative flex-shrink-0 bg-black/40 backdrop-blur-2xl border-t border-white/[0.06]">
        {/* HUD status chips */}
        {hudContent && (
          <div className="flex items-center justify-center gap-2 px-4 pt-3 pb-1">
            {hudContent}
          </div>
        )}

        {/* Capture controls */}
        {showCaptureButton && (
          <div className="flex items-center justify-center gap-8 py-5 px-4">
            {/* Upload button */}
            {showUpload && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center transition-colors hover:bg-white/[0.1]"
              >
                <Upload className="w-5 h-5 text-white/50" />
              </motion.button>
            )}

            {/* Capture button — large frosted glass ring */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={handleCapture}
              className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center group"
            >
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-white/30 group-hover:border-white/50 transition-colors" />
              {/* Inner fill */}
              <div className="w-[58px] h-[58px] rounded-full bg-white group-hover:bg-white/90 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.15)]" />
            </motion.button>

            {/* Spacer for symmetry when upload is shown */}
            {showUpload && <div className="w-12 h-12" />}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
});

CameraFeed.displayName = 'CameraFeed';
export default CameraFeed;
