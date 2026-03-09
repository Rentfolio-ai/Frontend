/**
 * VoiceSampleRecorder — Records a 30-60 second voice sample for cloning.
 * Uses the existing useAudioCapture hook to capture PCM audio,
 * assembles it into a WAV file, and uploads to the backend.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAudioCapture } from '../../hooks/useAudioCapture';
import { API_BASE_URL, jsonHeaders } from '../../services/apiConfig';

const MIN_SECONDS = 15;
const MAX_SECONDS = 60;
const SAMPLE_RATE = 16_000;

interface VoiceSampleRecorderProps {
  onComplete?: () => void;
}

export const VoiceSampleRecorder: React.FC<VoiceSampleRecorderProps> = ({ onComplete }) => {
  const { isCapturing, startCapture, stopCapture, analyserNode, error: captureError } = useAudioCapture();
  const [phase, setPhase] = useState<'idle' | 'recording' | 'uploading' | 'done' | 'error'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const pcmBufferRef = useRef<Int16Array[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const handleStart = useCallback(async () => {
    pcmBufferRef.current = [];
    setSeconds(0);
    setPhase('recording');

    await startCapture((chunk: Int16Array) => {
      pcmBufferRef.current.push(new Int16Array(chunk));
    });

    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s + 1 >= MAX_SECONDS) {
          handleStop();
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }, [startCapture]);

  const handleStop = useCallback(async () => {
    clearInterval(timerRef.current);
    stopCapture();

    if (seconds < MIN_SECONDS) {
      setErrorMsg(`Recording too short — need at least ${MIN_SECONDS} seconds.`);
      setPhase('error');
      return;
    }

    setPhase('uploading');

    try {
      const totalSamples = pcmBufferRef.current.reduce((s, c) => s + c.length, 0);
      const merged = new Int16Array(totalSamples);
      let offset = 0;
      for (const chunk of pcmBufferRef.current) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const wavBlob = encodeWav(merged, SAMPLE_RATE);
      const formData = new FormData();
      formData.append('file', wavBlob, 'voice_sample.wav');

      const res = await fetch(`${API_BASE_URL}/v2/voice-profile/upload`, {
        method: 'POST',
        headers: { 'X-API-Key': jsonHeaders()['X-API-Key'] || '' },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }

      setPhase('done');
      onComplete?.();
    } catch (e: any) {
      setErrorMsg(e.message);
      setPhase('error');
    }
  }, [seconds, stopCapture, onComplete]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const progressPct = Math.min((seconds / MIN_SECONDS) * 100, 100);

  return (
    <div className="rounded-xl bg-black/[0.02] border border-black/[0.06] p-5 max-w-sm">
      <h3 className="text-[14px] font-semibold text-foreground/85 mb-1">Voice Sample</h3>
      <p className="text-[11px] text-muted-foreground/60 mb-4">
        Read the script below naturally for at least {MIN_SECONDS} seconds so we can clone your voice for calls.
      </p>

      {/* Script to read */}
      <div className="rounded-lg bg-black/[0.02] border border-black/[0.05] px-3 py-2.5 mb-4">
        <p className="text-[12px] text-muted-foreground leading-relaxed italic">
          "Hello, I'm interested in learning more about your services. I've been looking at properties
          in the area and would love to discuss investment opportunities. Could you tell me about your
          experience working with real estate investors? I'm particularly interested in understanding
          the current market conditions and what makes a good deal right now."
        </p>
      </div>

      {/* Waveform / status area */}
      <div className="h-16 rounded-lg bg-black/[0.02] border border-black/[0.05] flex items-center justify-center mb-3 relative overflow-hidden">
        {phase === 'idle' && (
          <span className="text-[11px] text-muted-foreground/40">Press record to begin</span>
        )}
        {phase === 'recording' && (
          <>
            <div className="absolute inset-0 bg-red-500/5" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[13px] font-mono text-muted-foreground">
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
              </span>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-[#D4A27F]/50 transition-all duration-1000" style={{ width: `${progressPct}%` }} />
          </>
        )}
        {phase === 'uploading' && (
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing voice sample...
          </span>
        )}
        {phase === 'done' && (
          <span className="flex items-center gap-2 text-[11px] text-emerald-400/80">
            <CheckCircle2 className="w-4 h-4" />
            Voice sample uploaded — cloning in progress
          </span>
        )}
        {phase === 'error' && (
          <span className="flex items-center gap-2 text-[11px] text-red-400/80 px-3 text-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg || captureError}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {phase === 'idle' && (
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium
                       bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20
                       transition-all"
          >
            <Mic className="w-3.5 h-3.5" />
            Start Recording
          </button>
        )}
        {phase === 'recording' && (
          <button
            onClick={handleStop}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium
                       transition-all ${
                         seconds >= MIN_SECONDS
                           ? 'bg-[#C08B5C]/20 hover:bg-[#C08B5C]/30 text-[#D4A27F] border border-[#C08B5C]/20'
                           : 'bg-black/[0.03] text-muted-foreground/50 border border-black/[0.06]'
                       }`}
          >
            <Square className="w-3 h-3" />
            {seconds >= MIN_SECONDS ? 'Stop & Upload' : `Recording... (${MIN_SECONDS - seconds}s more)`}
          </button>
        )}
        {phase === 'error' && (
          <button
            onClick={() => setPhase('idle')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                       bg-black/[0.03] hover:bg-black/[0.06] text-muted-foreground border border-black/[0.06]
                       transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};


/**
 * Encode Int16 PCM samples as a WAV file blob.
 */
function encodeWav(samples: Int16Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);            // PCM
  view.setUint16(22, 1, true);            // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);            // block align
  view.setUint16(34, 16, true);           // bits per sample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(offset + i * 2, samples[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
