// FILE: src/hooks/useVoiceSession.ts
// Manages the complete voice session lifecycle: Gemini Live connection,
// audio capture/playback, camera streaming, and turn tracking.
// Extracted from VoiceOrbOverlay for use with inline voice chat.

import { useEffect, useRef, useCallback, useState } from 'react';
import { useGeminiLive, type GeminiLiveStatus, type VoiceTurn } from './useGeminiLive';
import { useAudioCapture } from './useAudioCapture';
import { useAudioPlayback } from './useAudioPlayback';
import { useCameraStream, type UseCameraStreamReturn } from './useCameraStream';
import { usePreferencesStore } from '../stores/preferencesStore';
import { type VoicePersona } from '../config/voicePersonas';
import { getToolsForMode, getToolInstructions } from '../config/voiceTools';

const VOICE_API_BASE = (() => {
  const env = import.meta.env.VITE_DATALAYER_API_URL;
  return env && typeof env === 'string' && env.startsWith('http')
    ? env
    : 'http://localhost:8001';
})();

const VOICE_API_KEY = import.meta.env.VITE_API_KEY;

export interface UseVoiceSessionReturn {
  // Connection
  status: GeminiLiveStatus;
  connect: (persona: VoicePersona) => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;

  // Audio
  muted: boolean;
  toggleMute: () => void;
  isAISpeaking: boolean;

  // Camera
  camera: UseCameraStreamReturn;
  toggleCamera: () => void;

  // Session info
  elapsed: number;
  activePersona: VoicePersona | null;
  sessionLimitSeconds: number;
  cameraUsed: boolean;
  sessionWarning: boolean;
  sessionExpired: boolean;

  // Transcript
  turns: VoiceTurn[];
  /** What the AI is currently saying (partial, streams in real-time) */
  partialTranscript: string;
  /** What the user is currently saying (partial, streams in real-time) */
  partialUserTranscript: string;

  // Audio analysis (for audio level viz)
  analyserNode: AnalyserNode | null;

  // Errors
  error: string | null;
}

interface UseVoiceSessionOptions {
  conversationId?: string;
  onTurn?: (role: 'user' | 'assistant', content: string) => void;
}

export function useVoiceSession(options: UseVoiceSessionOptions = {}): UseVoiceSessionReturn {
  const { conversationId, onTurn } = options;

  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const prevTurnCountRef = useRef(0);
  const [muted, setMuted] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [activePersona, setActivePersona] = useState<VoicePersona | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Keep onTurn ref stable so it doesn't re-trigger effects
  const onTurnRef = useRef(onTurn);
  onTurnRef.current = onTurn;

  const language = usePreferencesStore(s => s.language);

  // Core hooks
  const gemini = useGeminiLive();
  const capture = useAudioCapture();
  const playback = useAudioPlayback();
  const camera = useCameraStream();

  // ── Wire audio from Gemini -> playback ──
  useEffect(() => {
    gemini.onAudioChunk(pcmBytes => {
      playback.enqueueAudio(pcmBytes);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wire interruption: instantly flush playback ──
  useEffect(() => {
    gemini.onInterrupted(() => {
      playback.flush();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wire session warning/expiry ──
  useEffect(() => {
    gemini.onSessionWarning(() => {
      setSessionWarning(true);
    });
    gemini.onSessionExpired(() => {
      setSessionExpired(true);
      camera.stop();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wire camera frames to Gemini ──
  useEffect(() => {
    camera.onFrame((base64Jpeg) => {
      gemini.sendVideo(base64Jpeg);
    });
  }, [camera, gemini]);

  // ── Send mic audio to Gemini ──
  const handleAudioChunk = useCallback(
    (pcm: Int16Array) => {
      if (!muted) {
        gemini.sendAudio(pcm);
      }
    },
    [gemini, muted],
  );

  // ── Emit completed turns to parent ──
  useEffect(() => {
    if (gemini.turns.length > prevTurnCountRef.current) {
      const newTurns = gemini.turns.slice(prevTurnCountRef.current);
      for (const turn of newTurns) {
        onTurnRef.current?.(turn.role, turn.content);
      }
      prevTurnCountRef.current = gemini.turns.length;
    }
  }, [gemini.turns]);

  // ── Connect with a persona ──
  const connect = useCallback(async (persona: VoicePersona) => {
    setSessionExpired(false);
    setSessionWarning(false);
    setActivePersona(persona);
    setIsConnecting(true);
    prevTurnCountRef.current = 0;

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (VOICE_API_KEY) headers['X-API-Key'] = VOICE_API_KEY;

      const res = await fetch(`${VOICE_API_BASE}/api/voice/token`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
      const { token, token_type } = await res.json();

      const toolInstructions = getToolInstructions(persona.mode);
      const fullInstructions = persona.systemInstructions + toolInstructions;

      // Read user ID from local storage for tool call authentication
      let userId: string | undefined;
      try {
        const userStr = localStorage.getItem('civitas-user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.id) userId = user.id;
        }
      } catch { /* ignore */ }

      gemini.connect({
        token,
        tokenType: token_type,
        systemInstructions: fullInstructions,
        language,
        voiceName: persona._geminiVoice,
        tools: getToolsForMode(persona.mode),
        toolApiBase: VOICE_API_BASE,
        toolApiKey: VOICE_API_KEY,
        userId,
        thinkingBudget: persona.thinkingBudget,
      });
      await capture.startCapture(handleAudioChunk);
      startTimeRef.current = Date.now();
      setElapsed(0);

      // Load conversation context (fire-and-forget — don't block connection)
      if (conversationId) {
        const ctxHeaders: HeadersInit = { 'Content-Type': 'application/json' };
        if (VOICE_API_KEY) ctxHeaders['X-API-Key'] = VOICE_API_KEY;
        fetch(`${VOICE_API_BASE}/api/voice/context`, {
          method: 'POST',
          headers: ctxHeaders,
          body: JSON.stringify({ conversation_id: conversationId, limit: 10 }),
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data?.turns?.length > 0) {
              // Delay to ensure Gemini setup is complete before sending context
              setTimeout(() => gemini.sendPriorContext(data.turns), 1000);
            }
          })
          .catch(() => { /* context loading is best-effort */ });
      }

      // Track session start analytics
      try {
        const analyticsHeaders: HeadersInit = { 'Content-Type': 'application/json' };
        if (VOICE_API_KEY) analyticsHeaders['X-API-Key'] = VOICE_API_KEY;
        if (userId) analyticsHeaders['X-User-ID'] = userId;
        fetch(`${VOICE_API_BASE}/api/voice/analytics`, {
          method: 'POST',
          headers: analyticsHeaders,
          body: JSON.stringify({
            event_type: 'session_start',
            persona_id: persona.id,
            language,
          }),
        }).catch(() => { /* analytics is best-effort */ });
      } catch { /* ignore */ }

      // Flush any queued unsaved turns from a previous failed session
      try {
        const queued = localStorage.getItem('civitas-unsaved-voice-turns');
        if (queued) {
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          if (VOICE_API_KEY) headers['X-API-Key'] = VOICE_API_KEY;
          fetch(`${VOICE_API_BASE}/api/voice/save-turn`, {
            method: 'POST',
            headers,
            body: queued,
          })
            .then(() => localStorage.removeItem('civitas-unsaved-voice-turns'))
            .catch(() => { /* will retry next session */ });
        }
      } catch { /* ignore */ }
    } catch (err: any) {
      console.error('[useVoiceSession] Init failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [gemini, capture, handleAudioChunk, language]);

  // ── Timer ──
  useEffect(() => {
    const isActive =
      gemini.status !== 'idle' &&
      gemini.status !== 'disconnected' &&
      gemini.status !== 'error' &&
      !isConnecting;
    if (!isActive) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [gemini.status, isConnecting]);

  // ── Camera toggle ──
  const toggleCamera = useCallback(async () => {
    if (camera.isActive) {
      camera.stop();
      gemini.sendTextHint(
        '[The user has turned off their camera. You can no longer see their surroundings.]',
      );
    } else {
      await camera.start();
      gemini.sendTextHint(
        '[The user has enabled their camera. You can now see what they see in real-time. ' +
          'Describe what you observe when asked. For properties, comment on condition, ' +
          'renovation needs, curb appeal, structural concerns, and anything relevant to ' +
          'real estate investment. Be specific about what you see.]',
      );
    }
  }, [camera, gemini]);

  // ── Disconnect ──
  const disconnect = useCallback(() => {
    camera.stop();
    capture.stopCapture();
    playback.stop();
    gemini.disconnect();

    // Track session end analytics
    const sessionDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    try {
      let userId: string | undefined;
      try {
        const userStr = localStorage.getItem('civitas-user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.id) userId = user.id;
        }
      } catch { /* ignore */ }

      const analyticsHeaders: HeadersInit = { 'Content-Type': 'application/json' };
      if (VOICE_API_KEY) analyticsHeaders['X-API-Key'] = VOICE_API_KEY;
      if (userId) analyticsHeaders['X-User-ID'] = userId;

      fetch(`${VOICE_API_BASE}/api/voice/analytics`, {
        method: 'POST',
        headers: analyticsHeaders,
        body: JSON.stringify({
          event_type: 'session_end',
          session_duration: sessionDuration,
          turn_count: gemini.turns.length,
          persona_id: activePersona?.id,
          camera_used: gemini.cameraUsed,
          language,
        }),
      }).catch(() => { /* analytics is best-effort */ });
    } catch { /* ignore */ }

    // Persist turns with retry (up to 2 retries with 1s delay)
    if (conversationId && gemini.turns.length > 0) {
      const saveTurns = async (retries = 2) => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (VOICE_API_KEY) headers['X-API-Key'] = VOICE_API_KEY;
        const body = JSON.stringify({
          conversation_id: conversationId,
          turns: gemini.turns,
        });

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const res = await fetch(`${VOICE_API_BASE}/api/voice/save-turn`, {
              method: 'POST',
              headers,
              body,
            });
            if (res.ok) {
              console.log('[useVoiceSession] Turns saved successfully');
              // Clear any queued turns from localStorage
              try { localStorage.removeItem('civitas-unsaved-voice-turns'); } catch { /* ignore */ }
              return;
            }
            throw new Error(`Save failed: ${res.status}`);
          } catch (err) {
            console.warn(`[useVoiceSession] Save attempt ${attempt + 1}/${retries + 1} failed:`, err);
            if (attempt < retries) {
              await new Promise(r => setTimeout(r, 1000));
            }
          }
        }

        // All retries exhausted — queue in localStorage for next session
        console.error('[useVoiceSession] All save attempts failed. Queuing in localStorage.');
        try {
          localStorage.setItem('civitas-unsaved-voice-turns', body);
        } catch { /* storage full or unavailable */ }
      };

      saveTurns();
    }
  }, [camera, capture, playback, gemini, conversationId, activePersona, language]);

  // ── Reconnect (voice-only after session expired) ──
  const reconnect = useCallback(async () => {
    camera.stop();
    capture.stopCapture();
    playback.stop();
    setSessionExpired(false);
    setSessionWarning(false);
    if (activePersona) {
      await connect(activePersona);
    }
  }, [camera, capture, playback, activePersona, connect]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  // Combine errors
  const error = gemini.error || capture.error || camera.error;

  return {
    status: isConnecting ? 'connecting' : gemini.status,
    connect,
    disconnect,
    reconnect,
    muted,
    toggleMute,
    isAISpeaking: playback.isPlaying,
    camera,
    toggleCamera,
    elapsed,
    activePersona,
    sessionLimitSeconds: gemini.sessionLimitSeconds,
    cameraUsed: gemini.cameraUsed,
    sessionWarning,
    sessionExpired,
    turns: gemini.turns,
    partialTranscript: gemini.partialTranscript,
    partialUserTranscript: gemini.partialUserTranscript,
    analyserNode: capture.analyserNode,
    error,
  };
}
