// FILE: src/hooks/useCameraStream.ts
// Camera capture hook for Gemini Live voice+camera mode.
// Captures JPEG frames at 1 FPS and forwards them for WebSocket transmission.

import { useRef, useState, useCallback, useEffect } from 'react';

const FRAME_INTERVAL_MS = 1000; // 1 FPS
const CANVAS_SIZE = 768;        // Google's recommended resolution
const JPEG_QUALITY = 0.8;

export interface UseCameraStreamReturn {
  /** Whether the camera stream is currently active and sending frames */
  isActive: boolean;
  /** Whether the camera is initializing (getUserMedia in progress) */
  isInitializing: boolean;
  /** Error message if camera access failed */
  error: string | null;
  /** Ref to attach to a <video> element for live preview */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Start the camera stream and begin capturing frames */
  start: () => Promise<void>;
  /** Stop the camera stream and release all resources */
  stop: () => void;
  /** Register a handler that receives base64 JPEG data for each frame */
  onFrame: (handler: (base64Jpeg: string) => void) => void;
}

export function useCameraStream(): UseCameraStreamReturn {
  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameHandlerRef = useRef<((base64Jpeg: string) => void) | null>(null);

  const onFrame = useCallback((handler: (base64Jpeg: string) => void) => {
    frameHandlerRef.current = handler;
  }, []);

  /** Capture a single frame from the video, resize, and forward as base64 JPEG */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;
    if (!frameHandlerRef.current) return;

    // Lazy-create canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = CANVAS_SIZE;
      canvasRef.current.height = CANVAS_SIZE;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame scaled to 768x768 (center-crop to square)
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const side = Math.min(vw, vh);
    const sx = (vw - side) / 2;
    const sy = (vh - side) / 2;

    ctx.drawImage(video, sx, sy, side, side, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Convert to JPEG base64 and strip the data URL prefix
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    const base64 = dataUrl.split(',')[1];
    if (base64) {
      frameHandlerRef.current(base64);
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setIsInitializing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: CANVAS_SIZE },
          height: { ideal: CANVAS_SIZE },
        },
        audio: false, // Audio is handled by useAudioCapture
      });

      streamRef.current = stream;

      // Bind stream to video element for preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Listen for unexpected track end (phone lock, tab hidden, etc.)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          console.warn('[useCameraStream] Video track ended unexpectedly');
          stop();
        };
      }

      // Start frame capture interval
      intervalRef.current = setInterval(captureFrame, FRAME_INTERVAL_MS);

      setIsActive(true);
      setIsInitializing(false);
    } catch (err: any) {
      setIsInitializing(false);
      console.error('[useCameraStream] Failed:', err);

      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. You can continue with voice only.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is in use by another app.');
      } else {
        setError(err.message || 'Failed to start camera');
      }
    }
  }, [captureFrame]);

  const stop = useCallback(() => {
    // Clear frame interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setError(null);
  }, []);

  // Handle tab visibility change -- pause frames when hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isActive) {
        // Pause frame capture when tab is hidden to save resources
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (!document.hidden && isActive && streamRef.current) {
        // Resume frame capture when tab becomes visible
        if (!intervalRef.current) {
          intervalRef.current = setInterval(captureFrame, FRAME_INTERVAL_MS);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive, captureFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    isActive,
    isInitializing,
    error,
    videoRef,
    start,
    stop,
    onFrame,
  };
}
