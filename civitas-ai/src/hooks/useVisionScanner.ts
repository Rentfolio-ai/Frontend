/**
 * useVisionScanner — Live property scanning hook
 *
 * Wraps useCameraStream to provide:
 *   - Frame throttling (1 frame every 2s)
 *   - Sends frames to /api/vision/scan-frame for lightweight inference
 *   - Accumulates detections across frames with deduplication
 *   - Room auto-detection tracking
 *   - Snapshot capture for full analysis
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { useCameraStream } from './useCameraStream';

// ── Types ──────────────────────────────────────────────────

export interface ScanDetection {
  id: string;
  damage_class: string;
  severity: string;
  confidence: number;
  class_confidence: number;
  severity_confidence: number;
  bbox: number[];
  room_type: string;
  detected_at: string;
  frame_number: number;
}

export interface ScanFrameResult {
  room_type: string;
  room_confidence: number;
  condition: string;
  condition_confidence: number;
  detections: Array<{
    damage_class: string;
    severity: string;
    confidence: number;
    class_confidence: number;
    severity_confidence: number;
    bbox: number[];
  }>;
  inference_time_ms: number;
}

export interface UseVisionScannerReturn {
  /** Whether live scanning is active */
  isScanning: boolean;
  /** Whether camera is initialising */
  isInitializing: boolean;
  /** Camera error */
  error: string | null;
  /** Ref for the video element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Accumulated findings across frames */
  findings: ScanDetection[];
  /** Currently detected room type */
  currentRoom: string | null;
  /** Current condition assessment */
  currentCondition: string | null;
  /** Latest detections (from most recent frame) */
  latestDetections: ScanDetection[];
  /** Number of frames processed */
  frameCount: number;
  /** Average inference time in ms */
  avgInferenceTime: number;
  /** Whether a frame is currently being processed */
  isProcessing: boolean;
  /** Start scanning */
  startScan: () => Promise<void>;
  /** Stop scanning */
  stopScan: () => void;
  /** Capture a high-res snapshot (returns base64) */
  captureSnapshot: () => string | null;
  /** Clear accumulated findings */
  clearFindings: () => void;
}

// ── Constants ──────────────────────────────────────────────

const SCAN_INTERVAL_MS = 2000; // Send 1 frame every 2 seconds
const SCAN_CANVAS_SIZE = 384;  // Match model input size for efficiency

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http'))
  ? envApiUrl
  : 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

// ── Hook ───────────────────────────────────────────────────

export function useVisionScanner(): UseVisionScannerReturn {
  const camera = useCameraStream();

  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState<ScanDetection[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentCondition, setCurrentCondition] = useState<string | null>(null);
  const [latestDetections, setLatestDetections] = useState<ScanDetection[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [avgInferenceTime, setAvgInferenceTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inferenceTimesRef = useRef<number[]>([]);
  const frameCountRef = useRef(0);

  /** Capture a frame at scan resolution and return as base64 */
  const captureFrameBase64 = useCallback((): string | null => {
    const video = camera.videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    if (!scanCanvasRef.current) {
      scanCanvasRef.current = document.createElement('canvas');
      scanCanvasRef.current.width = SCAN_CANVAS_SIZE;
      scanCanvasRef.current.height = SCAN_CANVAS_SIZE;
    }

    const canvas = scanCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Center-crop to square
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const side = Math.min(vw, vh);
    const sx = (vw - side) / 2;
    const sy = (vh - side) / 2;
    ctx.drawImage(video, sx, sy, side, side, 0, 0, SCAN_CANVAS_SIZE, SCAN_CANVAS_SIZE);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    return dataUrl.split(',')[1] || null;
  }, [camera.videoRef]);

  /** Send a frame to the scan-frame endpoint */
  const processFrame = useCallback(async () => {
    if (isProcessing) return;

    const base64 = captureFrameBase64();
    if (!base64) return;

    setIsProcessing(true);
    frameCountRef.current += 1;
    const currentFrame = frameCountRef.current;

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (API_KEY) headers['X-API-Key'] = API_KEY;

      const resp = await fetch(`${API_BASE}/api/vision/scan-frame`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ image_base64: base64 }),
      });

      if (!resp.ok) return;

      const result: ScanFrameResult = await resp.json();

      // Track inference time
      inferenceTimesRef.current.push(result.inference_time_ms);
      if (inferenceTimesRef.current.length > 20) inferenceTimesRef.current.shift();
      const avg = inferenceTimesRef.current.reduce((a, b) => a + b, 0) / inferenceTimesRef.current.length;
      setAvgInferenceTime(Math.round(avg));
      setFrameCount(currentFrame);

      // Update room and condition
      setCurrentRoom(result.room_type);
      setCurrentCondition(result.condition);

      // Convert detections to ScanDetections
      const newDetections: ScanDetection[] = result.detections.map((d, i) => ({
        id: `${currentFrame}-${i}`,
        ...d,
        room_type: result.room_type,
        detected_at: new Date().toISOString(),
        frame_number: currentFrame,
      }));

      setLatestDetections(newDetections);

      // Deduplicate and accumulate findings
      if (newDetections.length > 0) {
        setFindings((prev) => {
          const merged = [...prev];
          for (const det of newDetections) {
            // Skip if we already have this damage class in the same room
            const exists = merged.some(
              (f) =>
                f.damage_class === det.damage_class &&
                f.room_type === det.room_type
            );
            if (!exists) {
              merged.push(det);
            }
          }
          return merged;
        });
      }
    } catch (err) {
      // Silently fail for individual frames — scanning continues
      console.debug('[useVisionScanner] Frame processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [captureFrameBase64, isProcessing]);

  /** Start scanning */
  const startScan = useCallback(async () => {
    await camera.start();
    setIsScanning(true);
    frameCountRef.current = 0;
    inferenceTimesRef.current = [];

    // Start periodic frame processing
    scanIntervalRef.current = setInterval(processFrame, SCAN_INTERVAL_MS);
  }, [camera, processFrame]);

  /** Stop scanning */
  const stopScan = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    camera.stop();
    setIsScanning(false);
    setIsProcessing(false);
  }, [camera]);

  /** Capture a high-res snapshot */
  const captureSnapshot = useCallback((): string | null => {
    const video = camera.videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [camera.videoRef]);

  /** Clear all findings */
  const clearFindings = useCallback(() => {
    setFindings([]);
    setLatestDetections([]);
    setCurrentRoom(null);
    setCurrentCondition(null);
    setFrameCount(0);
    setAvgInferenceTime(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  return {
    isScanning,
    isInitializing: camera.isInitializing,
    error: camera.error,
    videoRef: camera.videoRef,
    findings,
    currentRoom,
    currentCondition,
    latestDetections,
    frameCount,
    avgInferenceTime,
    isProcessing,
    startScan,
    stopScan,
    captureSnapshot,
    clearFindings,
  };
}
