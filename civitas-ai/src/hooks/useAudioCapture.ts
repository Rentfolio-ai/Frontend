// FILE: src/hooks/useAudioCapture.ts
// Microphone input via Web Audio API with AudioWorklet for raw PCM capture.
// Batches tiny worklet frames (~128 samples / 8ms) into ~100ms chunks
// before forwarding, reducing WebSocket overhead and improving streaming quality.

import { useRef, useState, useCallback } from 'react';

const SAMPLE_RATE = 16000;
// How many samples to accumulate before emitting a chunk (~100ms at 16 kHz)
const BATCH_SAMPLES = 1600;

/**
 * AudioWorklet processor (inlined as Blob URL).
 * Captures raw PCM float32 frames and posts to main thread.
 */
const WORKLET_CODE = `
class PCMCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = new Float32Array(${BATCH_SAMPLES});
    this._offset = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const samples = input[0];
    let pos = 0;

    while (pos < samples.length) {
      const remaining = ${BATCH_SAMPLES} - this._offset;
      const toCopy = Math.min(remaining, samples.length - pos);

      this._buffer.set(samples.subarray(pos, pos + toCopy), this._offset);
      this._offset += toCopy;
      pos += toCopy;

      if (this._offset >= ${BATCH_SAMPLES}) {
        // Send a full batch
        this.port.postMessage(new Float32Array(this._buffer));
        this._offset = 0;
      }
    }

    return true;
  }
}
registerProcessor('pcm-capture-processor', PCMCaptureProcessor);
`;

export interface UseAudioCaptureReturn {
  isCapturing: boolean;
  startCapture: (onChunk: (pcm: Int16Array) => void) => Promise<void>;
  stopCapture: () => void;
  analyserNode: AnalyserNode | null;
  error: string | null;
}

export function useAudioCapture(): UseAudioCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const onChunkRef = useRef<((pcm: Int16Array) => void) | null>(null);

  const startCapture = useCallback(async (onChunk: (pcm: Int16Array) => void) => {
    setError(null);
    onChunkRef.current = onChunk;

    try {
      // Request microphone with echo-cancellation and noise suppression
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = ctx;

      // Load worklet from inline Blob
      const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const workletNode = new AudioWorkletNode(ctx, 'pcm-capture-processor');
      workletNodeRef.current = workletNode;

      // Convert batched Float32 frames to Int16 and forward
      workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (!onChunkRef.current) return;
        const float32 = event.data;
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        onChunkRef.current(int16);
      };

      // Analyser for waveform visualisation
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      setAnalyserNode(analyser);

      // Graph: source -> analyser -> workletNode -> destination (silent passthrough)
      source.connect(analyser);
      analyser.connect(workletNode);
      workletNode.connect(ctx.destination);

      setIsCapturing(true);
    } catch (err: any) {
      console.error('[useAudioCapture] Failed:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else {
        setError(err.message || 'Failed to start microphone');
      }
    }
  }, []);

  const stopCapture = useCallback(() => {
    onChunkRef.current = null;

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setAnalyserNode(null);
    setIsCapturing(false);
  }, []);

  return { isCapturing, startCapture, stopCapture, analyserNode, error };
}
