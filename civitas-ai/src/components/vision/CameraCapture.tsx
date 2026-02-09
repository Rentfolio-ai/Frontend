// FILE: src/components/vision/CameraCapture.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, Upload, SwitchCamera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [captured, setCaptured] = useState<string | null>(null);

  /** Stop all tracks on the current stream ref and clear the video element. */
  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsInitializing(true);

    // Stop any existing stream first
    stopAllTracks();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Use the upload button to select a photo instead.');
      } else {
        setError('Could not access camera. Try uploading a photo instead.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopAllTracks]);

  // Start camera on mount / facing change; always clean up on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopAllTracks();
    };
  }, [facingMode, startCamera, stopAllTracks]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCaptured(dataUrl);
  };

  const handleConfirm = () => {
    if (!captured) return;

    // Convert data URL to File
    fetch(captured)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopAllTracks();
        onCapture(file, captured);
      });
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = reader.result as string;
      stopAllTracks();
      onCapture(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const toggleFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) { stopAllTracks(); onClose(); } }}
    >
      <div className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden bg-[#0f0f0f] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-medium text-white">Property Photo</h3>
          <button onClick={() => { stopAllTracks(); onClose(); }} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative aspect-[4/3] bg-black">
          <AnimatePresence mode="wait">
            {captured ? (
              <motion.img
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={captured}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full px-8 text-center"
              >
                <Camera className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-sm text-white/60 mb-4">{error}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#C08B5C] text-white rounded-lg text-sm font-medium hover:bg-[#C08B5C]/80 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
              </motion.div>
            ) : (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full">
                {isInitializing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => setIsInitializing(false)}
                />
                {/* Viewfinder grid overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/10" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/10" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/10" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/10" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-4 py-4 bg-[#0f0f0f]">
          {captured ? (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/15 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 rounded-xl bg-[#C08B5C] text-white hover:bg-[#C08B5C]/80 transition-colors text-sm font-medium"
              >
                Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/15 hover:text-white transition-colors"
                title="Upload photo"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                onClick={handleCapture}
                disabled={!!error || isInitializing}
                className="w-16 h-16 rounded-full border-4 border-white/80 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                title="Take photo"
              >
                <div className="w-full h-full rounded-full bg-white/90 scale-[0.85]" />
              </button>
              <button
                onClick={toggleFacing}
                disabled={!!error}
                className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/15 hover:text-white transition-colors disabled:opacity-30"
                title="Switch camera"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </motion.div>
  );
};
