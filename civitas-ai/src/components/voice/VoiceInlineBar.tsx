// FILE: src/components/voice/VoiceInlineBar.tsx
// Inline voice bar shown in the composer area during voice mode

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Square, Mic, Volume2, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { useAudioCapture } from '../../hooks/useAudioCapture';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { usePreferencesStore } from '../../stores/preferencesStore';

const VOICE_API_BASE = (() => {
  const env = import.meta.env.VITE_DATALAYER_API_URL;
  return (env && typeof env === 'string' && env.startsWith('http')) ? env : 'http://localhost:8001';
})();

const VOICE_API_KEY = import.meta.env.VITE_API_KEY;

interface VoiceInlineBarProps {
  conversationId?: string;
  onTurn: (role: 'user' | 'assistant', content: string) => void;
  onClose: () => void;
}

const SYSTEM_INSTRUCTIONS = `You are Vasthu, an expert AI assistant for real estate investors. You help with property analysis, market research, deal evaluation, and investment strategy. Be concise and helpful in voice conversations. When discussing numbers, say them clearly. Keep responses brief and conversational.`;

export const VoiceInlineBar: React.FC<VoiceInlineBarProps> = ({
  conversationId,
  onTurn,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const prevTurnCountRef = useRef(0);

  const language = usePreferencesStore(s => s.language);

  // Hooks
  const gemini = useGeminiLive();
  const capture = useAudioCapture();
  const playback = useAudioPlayback();

  // Wire audio chunks from Gemini to playback
  useEffect(() => {
    gemini.onAudioChunk((pcmBytes) => {
      playback.enqueueAudio(pcmBytes);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Wire mic audio to Gemini
  const handleAudioChunk = useCallback((pcm: Int16Array) => {
    gemini.sendAudio(pcm);
  }, [gemini]);

  // Emit turns to parent as they are produced
  useEffect(() => {
    if (gemini.turns.length > prevTurnCountRef.current) {
      const newTurns = gemini.turns.slice(prevTurnCountRef.current);
      for (const turn of newTurns) {
        onTurn(turn.role, turn.content);
      }
      prevTurnCountRef.current = gemini.turns.length;
    }
  }, [gemini.turns, onTurn]);

  // Initialize voice session
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // 1. Fetch ephemeral token
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (VOICE_API_KEY) headers['X-API-Key'] = VOICE_API_KEY;

        const res = await fetch(`${VOICE_API_BASE}/api/voice/token`, {
          method: 'POST',
          headers,
        });

        if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
        const { token } = await res.json();

        if (cancelled) return;

        // 2. Connect to Gemini Live
        gemini.connect(token, SYSTEM_INSTRUCTIONS, language);

        // 3. Start capturing mic audio (once connected)
        // We start capture immediately - the hook handles the async init
        await capture.startCapture(handleAudioChunk);
      } catch (err: any) {
        console.error('[VoiceInlineBar] Init failed:', err);
      }
    };

    startTimeRef.current = Date.now();
    init();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Waveform visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = capture.analyserNode || playback.analyserNode;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 32;
      const barWidth = w / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] / 255;
        const barHeight = Math.max(2, val * h * 0.8);
        const x = i * barWidth;
        const y = (h - barHeight) / 2;

        // Accent color gradient
        const r = 192, g = 139, b = 92; // Copper
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + val * 0.7})`;
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [capture.analyserNode, playback.analyserNode]);

  // Handle stop
  const handleStop = async () => {
    capture.stopCapture();
    playback.stop();
    gemini.disconnect();

    // Save turns to backend
    if (conversationId && gemini.turns.length > 0) {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (VOICE_API_KEY) headers['X-API-Key'] = VOICE_API_KEY;

        await fetch(`${VOICE_API_BASE}/api/voice/save-turn`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            conversation_id: conversationId,
            turns: gemini.turns,
          }),
        });
      } catch (err) {
        console.error('[VoiceInlineBar] Failed to save turns:', err);
      }
    }

    onClose();
  };

  // Format elapsed time
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Status display
  const statusConfig = {
    idle: { label: 'Initializing...', color: 'text-white/40', dot: 'bg-white/30', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    connecting: { label: 'Connecting...', color: 'text-white/40', dot: 'bg-yellow-400', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    connected: { label: 'Ready', color: 'text-white/60', dot: 'bg-green-400', icon: <Mic className="w-3 h-3" /> },
    listening: { label: 'Listening...', color: 'text-green-400', dot: 'bg-green-400 animate-pulse', icon: <Mic className="w-3 h-3" /> },
    speaking: { label: 'Vasthu speaking', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse', icon: <Volume2 className="w-3 h-3" /> },
    disconnected: { label: 'Disconnected', color: 'text-white/40', dot: 'bg-white/20', icon: null },
    error: { label: 'Error', color: 'text-red-400', dot: 'bg-red-400', icon: <AlertTriangle className="w-3 h-3" /> },
  };

  const currentStatus = statusConfig[gemini.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mx-4 mb-3 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${currentStatus.dot}`} />
          <div className="flex items-center gap-1.5">
            {currentStatus.icon}
            <span className={`text-xs font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
          </div>
        </div>

        {/* Waveform */}
        <div className="flex-1 mx-2">
          <canvas
            ref={canvasRef}
            width={200}
            height={32}
            className="w-full h-8"
          />
        </div>

        {/* Timer */}
        <span className="text-xs text-white/30 font-mono tabular-nums shrink-0">{formatTime(elapsed)}</span>

        {/* Stop button */}
        <button
          onClick={handleStop}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors shrink-0"
          title="End voice session"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      {/* Live transcription */}
      {(gemini.partialTranscript || gemini.turns.length > 0) && (
        <div className="px-4 pb-3 border-t border-white/[0.05]">
          {/* Latest turns */}
          {gemini.turns.slice(-2).map((turn, i) => (
            <div key={i} className={`text-xs mt-1.5 ${turn.role === 'user' ? 'text-white/50' : 'text-[#C08B5C]/70'}`}>
              <span className="font-medium capitalize">{turn.role === 'user' ? 'You' : 'Vasthu'}:</span>{' '}
              {turn.content}
            </div>
          ))}
          {/* Partial */}
          {gemini.partialTranscript && (
            <div className="text-xs mt-1.5 text-blue-400/60 italic">
              {gemini.partialTranscript}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {(gemini.error || capture.error) && (
        <div className="px-4 pb-3">
          <div className="text-xs text-red-400/70 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            {gemini.error || capture.error}
          </div>
        </div>
      )}

      {/* Session limit warning */}
      {elapsed > 780 && ( // 13 minutes
        <div className="px-4 pb-2">
          <div className="text-xs text-amber-400/70">
            Voice session approaching 15-minute limit. Consider ending soon.
          </div>
        </div>
      )}
    </motion.div>
  );
};
