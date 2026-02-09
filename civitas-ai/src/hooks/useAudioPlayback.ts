// FILE: src/hooks/useAudioPlayback.ts
// Speaker output via Web Audio API — queues PCM chunks for gapless playback.
// Supports instant interruption: flush() stops all queued audio immediately
// so the user can barge in mid-response like a natural conversation.

import { useRef, useState, useCallback } from 'react';

const OUTPUT_SAMPLE_RATE = 24000; // Gemini Live outputs 24 kHz PCM

export interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  /** Enqueue a PCM16-LE ArrayBuffer for gapless playback. */
  enqueueAudio: (pcmBytes: ArrayBuffer) => void;
  /** Immediately stop all queued and playing audio (interruption). */
  flush: () => void;
  /** Tear down everything (call on unmount). */
  stop: () => void;
  analyserNode: AnalyserNode | null;
}

export function useAudioPlayback(): UseAudioPlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const ensureContext = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const ctx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      ctxRef.current = ctx;

      // Gain node so we can ramp volume to 0 on interruption (avoids pop)
      const gain = ctx.createGain();
      gain.gain.value = 1;
      gain.connect(ctx.destination);
      gainRef.current = gain;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      analyser.connect(gain);
      analyserRef.current = analyser;
      setAnalyserNode(analyser);

      nextStartTimeRef.current = 0;
    }

    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {});
    }

    return ctxRef.current;
  }, []);

  const enqueueAudio = useCallback(
    (pcmBytes: ArrayBuffer) => {
      const ctx = ensureContext();
      const analyser = analyserRef.current;
      const gain = gainRef.current;
      if (!analyser || !gain) return;

      // Ensure gain is at 1 (may have been ramped down by flush)
      gain.gain.value = 1;

      // Convert raw PCM16-LE to Float32
      const int16View = new Int16Array(pcmBytes);
      const float32 = new Float32Array(int16View.length);
      for (let i = 0; i < int16View.length; i++) {
        float32[i] = int16View[i] / 32768;
      }

      const buffer = ctx.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
      buffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);

      // Schedule gapless playback
      const now = ctx.currentTime;
      const startTime = Math.max(now, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;

      activeSourcesRef.current.add(source);
      setIsPlaying(true);

      source.onended = () => {
        activeSourcesRef.current.delete(source);
        if (activeSourcesRef.current.size === 0) {
          setIsPlaying(false);
        }
      };
    },
    [ensureContext],
  );

  /**
   * Instantly stop all queued and playing audio.
   * Used when the user interrupts (barge-in) — like GPT voice mode
   * where the AI stops talking the moment you start speaking.
   */
  const flush = useCallback(() => {
    // Quick fade-out to avoid audio pop (5ms ramp)
    if (gainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
      gainRef.current.gain.linearRampToValueAtTime(0, now + 0.005);
    }

    // Stop all active sources
    activeSourcesRef.current.forEach(src => {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    });
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsPlaying(false);
  }, []);

  /** Full teardown — call on unmount or session end. */
  const stop = useCallback(() => {
    flush();

    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
      analyserRef.current = null;
      gainRef.current = null;
      setAnalyserNode(null);
    }
  }, [flush]);

  return { isPlaying, enqueueAudio, flush, stop, analyserNode };
}
