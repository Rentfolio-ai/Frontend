// FILE: src/hooks/useGeminiLive.ts
// Core hook managing WebSocket connection to Gemini Live API
// with natural turn-taking, interruption support, function calling, and reconnection

import { useRef, useState, useCallback, useEffect } from 'react';

export type GeminiLiveStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'speaking'
  | 'tool_calling'
  | 'interrupted'
  | 'disconnected'
  | 'error';

export interface VoiceTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConnectOptions {
  token: string;
  tokenType?: 'ephemeral' | 'api_key';
  /** Model name returned by the backend token endpoint (overrides the default) */
  model?: string;
  systemInstructions: string;
  language?: string;
  voiceName?: string;
  /** Gemini function calling tools array (e.g. [{ functionDeclarations: [...] }]) */
  tools?: object[];
  /** Backend base URL for executing tool calls */
  toolApiBase?: string;
  /** API key for backend tool calls */
  toolApiKey?: string;
  /** Authenticated user ID to send with tool calls */
  userId?: string;
  /** Thinking budget for the model (0 = disabled, 512 = balanced, 1024 = deep) */
  thinkingBudget?: number;
}

export interface UseGeminiLiveReturn {
  status: GeminiLiveStatus;
  turns: VoiceTurn[];
  /** Partial AI transcript (what the AI is currently saying) */
  partialTranscript: string;
  /** Partial user transcript (what the user is currently saying) */
  partialUserTranscript: string;
  connect: (opts: ConnectOptions) => void;
  sendAudio: (pcmChunk: Int16Array) => void;
  /** Send a JPEG video frame (base64-encoded, no data URL prefix) over the WebSocket */
  sendVideo: (base64Jpeg: string) => void;
  /** Send a text turn as client content (e.g. camera on/off hint) */
  sendTextHint: (text: string) => void;
  /** Send prior conversation context as incremental content updates */
  sendPriorContext: (turns: { role: string; content: string }[]) => void;
  disconnect: () => void;
  error: string | null;
  /** Whether the camera was used in this session (affects session duration limit) */
  cameraUsed: boolean;
  /** Session limit in seconds (120 if camera used, 900 if audio-only) */
  sessionLimitSeconds: number;
  /** Register a handler called with raw PCM audio bytes from the AI response */
  onAudioChunk: (handler: (pcmBytes: ArrayBuffer) => void) => void;
  /** Register a handler called when the AI is interrupted (user started speaking) */
  onInterrupted: (handler: () => void) => void;
  /** Register a handler called when the session is about to expire */
  onSessionWarning: (handler: () => void) => void;
  /** Register a handler called when the session has expired */
  onSessionExpired: (handler: () => void) => void;
}

const GEMINI_LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

const SESSION_LIMIT_AUDIO_ONLY = 900;  // 15 minutes
const SESSION_LIMIT_WITH_CAMERA = 120; // 2 minutes

export function useGeminiLive(): UseGeminiLiveReturn {
  const [status, setStatus] = useState<GeminiLiveStatus>('idle');
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [partialUserTranscript, setPartialUserTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cameraUsed, setCameraUsed] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioHandlerRef = useRef<((pcmBytes: ArrayBuffer) => void) | null>(null);
  const interruptedHandlerRef = useRef<(() => void) | null>(null);
  const sessionWarningHandlerRef = useRef<(() => void) | null>(null);
  const sessionExpiredHandlerRef = useRef<(() => void) | null>(null);
  const sessionWarningFiredRef = useRef(false);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number>(0);

  // Auto-reconnect state
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConnectOptsRef = useRef<ConnectOptions | null>(null);
  const connectRef = useRef<((opts: ConnectOptions) => void) | null>(null);
  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAYS = [1000, 3000, 7000]; // Exponential backoff

  // Track whether AI is currently producing audio so we can detect interruptions
  const aiSpeakingRef = useRef(false);

  // Accumulate partial assistant text (only from outputTranscription — excludes thinking)
  const partialAssistantRef = useRef('');

  // Accumulate partial user input transcription fragments into one message
  const partialUserRef = useRef('');

  // Debounce timer for user turn finalization — inputTranscription events from Gemini
  // can arrive AFTER the model starts responding, so we debounce to avoid losing text.
  const userFinalizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track when the last inputTranscription fragment arrived (for adaptive debounce)
  const lastInputTsRef = useRef<number>(0);

  /** Schedule a debounced finalization of the user turn.
   *  Resets the timer each call so nearby fragments batch together.
   *  Uses adaptive delay — if fragments are still actively arriving, wait longer. */
  const scheduleFinalizeUser = useCallback((delayMs = 1200) => {
    if (userFinalizeTimerRef.current) clearTimeout(userFinalizeTimerRef.current);
    userFinalizeTimerRef.current = setTimeout(() => {
      // If a fragment arrived very recently (within 500ms), reschedule — more may be coming
      const sinceLast = Date.now() - lastInputTsRef.current;
      if (sinceLast < 500 && partialUserRef.current.trim()) {
        scheduleFinalizeUser(600);
        return;
      }

      userFinalizeTimerRef.current = null;
      const text = partialUserRef.current.trim().replace(/^[.,;:!?\s]+/, '').replace(/\s{2,}/g, ' ').trim();
      if (text) {
        setTurns(t => [...t, {
          role: 'user' as const,
          content: text,
          timestamp: new Date().toISOString(),
        }]);
      }
      partialUserRef.current = '';
      setPartialUserTranscript('');
    }, delayMs);
  }, []);

  const onAudioChunk = useCallback((handler: (pcmBytes: ArrayBuffer) => void) => {
    audioHandlerRef.current = handler;
  }, []);

  const onInterrupted = useCallback((handler: () => void) => {
    interruptedHandlerRef.current = handler;
  }, []);

  const onSessionWarning = useCallback((handler: () => void) => {
    sessionWarningHandlerRef.current = handler;
  }, []);

  const onSessionExpired = useCallback((handler: () => void) => {
    sessionExpiredHandlerRef.current = handler;
  }, []);

  // ── Helpers ──

  /** Strip leading/trailing punctuation artifacts from speech transcription */
  const cleanTranscript = (raw: string): string => {
    // Remove leading punctuation + whitespace (e.g. ". Hello" → "Hello")
    let cleaned = raw.trim().replace(/^[.,;:!?\s]+/, '');
    // Collapse multiple spaces
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    return cleaned.trim();
  };

  /** Finalize whatever partial user text we've accumulated into a turn (immediate). */
  const finalizeUserTurn = useCallback(() => {
    // Cancel any pending debounced finalization
    if (userFinalizeTimerRef.current) {
      clearTimeout(userFinalizeTimerRef.current);
      userFinalizeTimerRef.current = null;
    }
    const text = cleanTranscript(partialUserRef.current);
    if (text) {
      const turn: VoiceTurn = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setTurns(t => [...t, turn]);
    }
    partialUserRef.current = '';
    setPartialUserTranscript('');
  }, []);

  /** Finalize whatever partial assistant text we've accumulated into a turn */
  const finalizeAssistantTurn = useCallback(() => {
    const text = partialAssistantRef.current.trim();
    if (text) {
      const turn: VoiceTurn = {
        role: 'assistant',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setTurns(t => [...t, turn]);
    }
    partialAssistantRef.current = '';
    setPartialTranscript('');
  }, []);

  // ── Connect ──

  const connect = useCallback((opts: ConnectOptions) => {
    const {
      token,
      tokenType,
      model: backendModel,
      systemInstructions,
      language,
      voiceName,
      tools,
      toolApiBase,
      toolApiKey,
      userId,
      thinkingBudget,
    } = opts;
    const resolvedModel = backendModel || GEMINI_LIVE_MODEL;

    // Store opts for auto-reconnect (token will be refreshed on reconnect by useVoiceSession)
    lastConnectOptsRef.current = opts;

    setError(null);
    setStatus('connecting');
    setTurns([]);
    setPartialTranscript('');
    partialAssistantRef.current = '';
    partialUserRef.current = '';
    aiSpeakingRef.current = false;

    // Build WebSocket URL — use v1beta (stable version for Live API)
    const authParam = tokenType === 'api_key' ? 'key' : 'access_token';
    const wsUrl =
      `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?${authParam}=${token}`;

    console.log('[useGeminiLive] Connecting:', { tokenType, version: 'v1beta', model: resolvedModel, toolCount: tools?.length });

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    // ── Execute a tool call by calling our backend ──
    const executeToolCall = async (
      functionName: string,
      functionArgs: Record<string, unknown>,
    ): Promise<Record<string, unknown>> => {
      if (!toolApiBase) {
        return { error: 'Tool backend not configured' };
      }
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (toolApiKey) headers['X-API-Key'] = toolApiKey;
        if (userId) headers['X-User-ID'] = userId;

        const res = await fetch(`${toolApiBase}/api/voice/tool`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tool_name: functionName,
            arguments: functionArgs,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error('[useGeminiLive] Tool call failed:', res.status, errText);
          return { error: `Tool failed: ${res.status}` };
        }

        return await res.json();
      } catch (e: any) {
        console.error('[useGeminiLive] Tool call error:', e);
        return { error: e.message || 'Tool execution failed' };
      }
    };

    ws.onopen = () => {
      // Map language codes to human-readable names so the model understands which language to speak
      const LANGUAGE_NAMES: Record<string, string> = {
        'en-US': 'English', 'en-GB': 'English', 'es-ES': 'Spanish', 'es-MX': 'Spanish',
        'fr-FR': 'French', 'de-DE': 'German', 'pt-BR': 'Portuguese', 'it-IT': 'Italian',
        'zh-CN': 'Mandarin Chinese', 'zh-TW': 'Mandarin Chinese', 'ja-JP': 'Japanese',
        'ko-KR': 'Korean', 'ar-SA': 'Arabic', 'hi-IN': 'Hindi', 'ru-RU': 'Russian',
        'nl-NL': 'Dutch', 'sv-SE': 'Swedish', 'pl-PL': 'Polish', 'tr-TR': 'Turkish',
        'vi-VN': 'Vietnamese', 'th-TH': 'Thai', 'uk-UA': 'Ukrainian',
        'ks-IN': 'Kashmiri',
      };
      const langName = language ? LANGUAGE_NAMES[language] || language : '';
      const langInstruction =
        language && language !== 'en-US'
          ? `\n\nIMPORTANT: You MUST speak and respond entirely in ${langName} (language code: ${language}). Do not switch to English. Every word you say must be in ${langName}.`
          : '';

      // Build setup message (structure matches official Python SDK wire format)
      const setupMsg: Record<string, unknown> = {
        setup: {
          model: `models/${resolvedModel}`,
          generationConfig: {
            responseModalities: ['AUDIO'],
            temperature: 0.9,
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName || 'Puck',
                },
              },
            },
            // NOTE: thinkingConfig removed — native audio models reject it as invalid argument.
            // Per-persona thinkingBudget stored in persona config for future use when supported.
          },
          systemInstruction: {
            parts: [{ text: systemInstructions + langInstruction }],
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          // NOTE: realtimeInputConfig (VAD), enableAffectiveDialog, and proactivity are Gemini
          // preview features not yet reliably supported in the WebSocket wire format.
          // They will be enabled once verified working with the native audio model.
          // Tools for function calling + Google Search grounding
          ...(tools && tools.length > 0 ? { tools } : {}),
        },
      };

      const setupJson = JSON.stringify(setupMsg);
      console.log('[useGeminiLive] Sending setup:', { tools: tools?.length || 0, size: setupJson.length });
      ws.send(setupJson);
    };

    // ── Message handler ──

    ws.onmessage = async (event: MessageEvent) => {
      try {
        const raw = event.data instanceof Blob ? await event.data.text() : event.data;
        const msg = JSON.parse(raw);

        // 1. Setup complete
        if (msg.setupComplete) {
          reconnectAttemptsRef.current = 0; // Reset on successful connection
          setStatus('listening');
          return;
        }

        // 2. Tool call — Gemini wants to execute a function
        if (msg.toolCall) {
          console.log('[useGeminiLive] Tool call received:', msg.toolCall);
          setStatus('tool_calling');

          const functionResponses: object[] = [];

          for (const fc of msg.toolCall.functionCalls || []) {
            console.log(`[useGeminiLive] Executing tool: ${fc.name}`, fc.args);
            const result = await executeToolCall(fc.name, fc.args || {});
            functionResponses.push({
              id: fc.id,
              name: fc.name,
              response: result,
            });
          }

          // Send tool responses back to Gemini
          const toolResponseMsg = {
            toolResponse: { functionResponses },
          };
          console.log('[useGeminiLive] Sending tool response');
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(toolResponseMsg));
          }
          return;
        }

        // 3. Tool call cancellation (user interrupted during tool execution)
        if (msg.toolCallCancellation) {
          console.log('[useGeminiLive] Tool call cancelled:', msg.toolCallCancellation.ids);
          setStatus('listening');
          return;
        }

        // 4. Server content (audio + text from model)
        if (msg.serverContent) {
          const sc = msg.serverContent;

          // 4a. Turn complete — model finished speaking
          if (sc.turnComplete) {
            aiSpeakingRef.current = false;
            // Catch-all: finalize any lingering user text that wasn't flushed
            if (partialUserRef.current.trim()) {
              finalizeUserTurn();
            }
            finalizeAssistantTurn();
            setStatus('listening');
            return;
          }

          // 4b. Model is interrupted by user speech (barge-in)
          if (sc.interrupted) {
            aiSpeakingRef.current = false;
            finalizeAssistantTurn();
            setStatus('listening');
            if (interruptedHandlerRef.current) {
              interruptedHandlerRef.current();
            }
            return;
          }

          // 4c. Audio + text parts from the model
          if (sc.modelTurn?.parts) {
            if (!aiSpeakingRef.current) {
              // AI just started speaking — schedule user turn finalization.
              // We use a long debounce because inputTranscription events can
              // arrive well AFTER the model starts — sometimes 1-2 seconds later.
              // This prevents losing or splitting user messages.
              scheduleFinalizeUser(1500);
              aiSpeakingRef.current = true;
              setStatus('speaking');
            }

            for (const part of sc.modelTurn.parts) {
              // Raw audio data — send to playback
              if (part.inlineData?.data) {
                const binaryString = atob(part.inlineData.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                if (audioHandlerRef.current) {
                  audioHandlerRef.current(bytes.buffer);
                }
              }

              // SKIP text parts — for thinking models (gemini-2.5-flash),
              // part.text contains internal reasoning / chain-of-thought.
              // We use outputTranscription instead.
            }
          }

          // 4d. Output transcription (what the model actually SPOKE — no thinking)
          if (sc.outputTranscription?.text) {
            // NOTE: Do NOT finalize user turn here — inputTranscription fragments
            // for the user's speech often arrive AFTER the first outputTranscription.
            // Finalizing here splits user messages in half. The debounce handles it.

            // Smart spacing: ensure proper separation between fragments
            const newText = sc.outputTranscription.text;
            const existing = partialAssistantRef.current;
            if (existing.length > 0) {
              const lastChar = existing[existing.length - 1];
              const firstChar = newText[0];
              // Add space if needed (e.g., "Searching now...Hmm" → "Searching now... Hmm")
              const needsSpace =
                lastChar !== ' ' && lastChar !== '\n' &&
                firstChar !== ' ' && firstChar !== '\n' &&
                /[.!?]/.test(lastChar) && /[A-Z]/.test(firstChar);
              partialAssistantRef.current += (needsSpace ? ' ' : '') + newText;
            } else {
              partialAssistantRef.current = newText;
            }
            setPartialTranscript(partialAssistantRef.current);
          }

          // 4e. Input transcription (what the user said — arrives as fragments)
          if (sc.inputTranscription?.text) {
            lastInputTsRef.current = Date.now();
            partialUserRef.current += sc.inputTranscription.text;
            setPartialUserTranscript(partialUserRef.current);

            // If AI is already speaking, this is a late-arriving transcription.
            // Reschedule the debounced finalize — each fragment resets the window
            // so the full utterance is batched into one message.
            if (aiSpeakingRef.current) {
              scheduleFinalizeUser(1000);
            }
          }
        }

        // 5. Top-level interrupted flag (some API versions)
        if (msg.interrupted) {
          aiSpeakingRef.current = false;
          finalizeAssistantTurn();
          setStatus('listening');
          if (interruptedHandlerRef.current) {
            interruptedHandlerRef.current();
          }
        }
      } catch (e) {
        console.error('[useGeminiLive] Parse error:', e);
      }
    };

    ws.onerror = (ev) => {
      console.error('[useGeminiLive] WebSocket error:', ev);
      setStatus('error');
      setError('Voice connection failed. Please try again.');
    };

    ws.onclose = (e) => {
      console.warn('[useGeminiLive] WebSocket closed:', {
        code: e.code,
        reason: e.reason,
        wasClean: e.wasClean,
        readyState: ws.readyState,
      });
      // Log common close code meanings for debugging
      const codeMeanings: Record<number, string> = {
        1000: 'Normal closure',
        1001: 'Going away',
        1002: 'Protocol error',
        1003: 'Unsupported data',
        1006: 'Abnormal closure (no close frame)',
        1007: 'Invalid payload (bad JSON or unknown field)',
        1008: 'Policy violation (unsupported operation/model/feature)',
        1009: 'Message too big',
        1011: 'Server error',
      };
      console.warn('[useGeminiLive] Close code meaning:', codeMeanings[e.code] || 'Unknown');
      aiSpeakingRef.current = false;
      finalizeUserTurn();
      finalizeAssistantTurn();

      if (e.code === 1000) {
        // Clean close — user ended session
        reconnectAttemptsRef.current = 0;
        setStatus('disconnected');
      } else if (
        reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
        lastConnectOptsRef.current &&
        // Don't auto-reconnect on config/setup errors (1007, 1008) — those won't resolve
        e.code !== 1007 && e.code !== 1008
      ) {
        // Auto-reconnect with exponential backoff
        const attempt = reconnectAttemptsRef.current;
        const delay = RECONNECT_DELAYS[attempt] || 7000;
        reconnectAttemptsRef.current = attempt + 1;
        console.log(`[useGeminiLive] Auto-reconnect attempt ${attempt + 1}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
        setStatus('connecting');
        setError(`Reconnecting... (attempt ${attempt + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          if (lastConnectOptsRef.current && connectRef.current) {
            // Re-trigger connect with the stored options via ref (avoids circular dep)
            connectRef.current(lastConnectOptsRef.current);
          }
        }, delay);
      } else {
        // Max attempts reached or unrecoverable error
        reconnectAttemptsRef.current = 0;
        setStatus('error');
        const reason = e.reason ? `: ${e.reason}` : '';
        setError(`Connection lost (code ${e.code}${reason}). Tap the mic to reconnect.`);
      }
    };
  }, [finalizeAssistantTurn, finalizeUserTurn]);

  // Keep connectRef up to date for auto-reconnect (avoids circular useCallback dep)
  connectRef.current = connect;

  // ── Send audio ──

  const sendAudio = useCallback((pcmChunk: Int16Array) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const uint8 = new Uint8Array(pcmChunk.buffer, pcmChunk.byteOffset, pcmChunk.byteLength);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);

    ws.send(
      JSON.stringify({
        realtimeInput: {
          audio: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64,
          },
        },
      }),
    );
  }, []);

  // ── Send video frame ──

  const sendVideo = useCallback((base64Jpeg: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // Mark camera as used (affects session limit)
    if (!cameraUsed) {
      setCameraUsed(true);
    }

    ws.send(
      JSON.stringify({
        realtimeInput: {
          video: {
            mimeType: 'image/jpeg',
            data: base64Jpeg,
          },
        },
      }),
    );
  }, [cameraUsed]);

  // ── Send text hint (client content) ──

  const sendTextHint = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        },
      }),
    );
  }, []);

  // ── Send prior conversation context ──

  const sendPriorContext = useCallback((priorTurns: { role: string; content: string }[]) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || priorTurns.length === 0) return;

    // Send as clientContent with multiple turns so the AI has conversation history
    const formattedTurns = priorTurns.map(t => ({
      role: t.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: t.content }],
    }));

    ws.send(
      JSON.stringify({
        clientContent: {
          turns: formattedTurns,
          turnComplete: true,
        },
      }),
    );
    console.log(`[useGeminiLive] Sent ${priorTurns.length} prior context turns`);
  }, []);

  // ── Disconnect ──

  const disconnect = useCallback(() => {
    // Cancel any pending auto-reconnect
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    lastConnectOptsRef.current = null;

    if (wsRef.current) {
      wsRef.current.close(1000, 'User ended session');
      wsRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (userFinalizeTimerRef.current) {
      clearTimeout(userFinalizeTimerRef.current);
      userFinalizeTimerRef.current = null;
    }
    // Flush any remaining user text as a final turn
    if (partialUserRef.current.trim()) {
      const text = cleanTranscript(partialUserRef.current);
      if (text) {
        setTurns(t => [...t, {
          role: 'user' as const,
          content: text,
          timestamp: new Date().toISOString(),
        }]);
      }
      partialUserRef.current = '';
    }
    aiSpeakingRef.current = false;
    setCameraUsed(false);
    sessionWarningFiredRef.current = false;
    setPartialTranscript('');
    setPartialUserTranscript('');
    setStatus('disconnected');
  }, []);

  // ── Session duration enforcement ──

  const sessionLimitSeconds = cameraUsed ? SESSION_LIMIT_WITH_CAMERA : SESSION_LIMIT_AUDIO_ONLY;

  // Start session timer when session is established (status reaches 'listening')
  useEffect(() => {
    if (status === 'listening') {
      sessionStartRef.current = Date.now();
      sessionWarningFiredRef.current = false;

      sessionTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - sessionStartRef.current) / 1000;
        const limit = cameraUsed ? SESSION_LIMIT_WITH_CAMERA : SESSION_LIMIT_AUDIO_ONLY;
        const warningThreshold = limit * 0.8;

        if (elapsed >= limit) {
          console.log('[useGeminiLive] Session expired');
          sessionExpiredHandlerRef.current?.();
          disconnect();
        } else if (elapsed >= warningThreshold && !sessionWarningFiredRef.current) {
          sessionWarningFiredRef.current = true;
          sessionWarningHandlerRef.current?.();
        }
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    };
  }, [status, cameraUsed, disconnect]);

  return {
    status,
    turns,
    partialTranscript,
    partialUserTranscript,
    connect,
    sendAudio,
    sendVideo,
    sendTextHint,
    sendPriorContext,
    disconnect,
    cameraUsed,
    sessionLimitSeconds,
    error,
    onAudioChunk,
    onInterrupted,
    onSessionWarning,
    onSessionExpired,
  };
}
