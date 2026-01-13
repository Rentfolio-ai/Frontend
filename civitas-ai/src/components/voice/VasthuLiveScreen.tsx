/**
 * VasthuLiveScreen - Real-time voice assistant using Gemini Live.
 * 
 * Key features:
 * - Sub-second response latency
 * - Natural conversation flow (no wait for full sentence)
 * - Barge-in support (interrupt AI mid-sentence)
 * - Server-side voice activity detection
 * - Holographic talking avatar with lip-sync
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Mic, MicOff, Square, Volume2, VolumeX } from 'lucide-react';
import { HolographicAvatar, AvatarStatus } from './HolographicAvatar';

interface VasthuLiveScreenProps {
    persona?: string;
    language?: string;
    threadId?: string;
    userId?: string;
    onClose: () => void;
}

type ConnectionState = 'connecting' | 'connected' | 'error' | 'disconnected';

export function VasthuLiveScreen({
    persona = 'friendly',
    language = 'en',
    threadId,
    userId,
    onClose,
}: VasthuLiveScreenProps) {
    const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [lastAiMessage, setLastAiMessage] = useState('');
    const [statusText, setStatusText] = useState('Connecting to Vasthu Live...');
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioQueueRef = useRef<AudioBuffer[]>([]);
    const isPlayingRef = useRef(false);

    const activeSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    // Audio playback function
    const playAudioQueue = useCallback(async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

        isPlayingRef.current = true;
        setIsSpeaking(true);

        while (audioQueueRef.current.length > 0) {
            const buffer = audioQueueRef.current.shift();
            if (!buffer || !audioContextRef.current) break;

            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);

            activeSourceNodeRef.current = source;
            source.start();

            // Wait for playback to finish
            await new Promise<void>(resolve => {
                source.onended = () => {
                    activeSourceNodeRef.current = null;
                    resolve();
                };
            });
        }

        isPlayingRef.current = false;

        // Only stop speaking if queue is truly empty (check again in case new chunks arrived)
        if (audioQueueRef.current.length === 0) {
            setIsSpeaking(false);
            setStatusText('Ready');
        } else {
            // Recursive call if more items were added
            playAudioQueue();
        }
    }, []);

    // Handle interruption (barge-in)
    const handleInterrupt = useCallback(() => {
        // Clear audio queue and stop current source
        audioQueueRef.current = [];
        if (activeSourceNodeRef.current) {
            try {
                activeSourceNodeRef.current.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            activeSourceNodeRef.current = null;
        }
        setStatusText('Listening...');
        console.log('[VasthuLive] User interrupted (stopped playback)');
    }, []);

    // Setup WebSocket connection
    const setupConnection = useCallback(async () => {
        try {
            // Initialize audio context if needed (redundant check but safe)
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            } else if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            // Build WebSocket URL
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            const params = new URLSearchParams({
                persona,
                language,
                input_sample_rate: audioContextRef.current.sampleRate.toString(),
                ...(threadId && { thread_id: threadId }),
                ...(userId && { user_id: userId }),
            });
            const wsUrl = `${protocol}//${host}/api/voice/live?${params}`;

            console.log('[VasthuLive] Connecting to:', wsUrl, 'Rate:', audioContextRef.current.sampleRate);

            // Create WebSocket
            const ws = new WebSocket(wsUrl);
            ws.binaryType = 'arraybuffer'; // Crucial for Cartesia audio
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[VasthuLive] WebSocket connected');
                setConnectionState('connected');
                setStatusText('Hands-Free Active. Say hello!');
            };

            ws.onmessage = async (event) => {
                try {
                    if (event.data instanceof ArrayBuffer) {
                        // Binary Audio Chunk from ElevenLabs (MP3)
                        const rawBuffer = event.data;

                        console.log('[VasthuLive] Rx Audio Chunk (MP3):', rawBuffer.byteLength);

                        // Resume context if suspended
                        if (audioContextRef.current?.state === 'suspended') {
                            await audioContextRef.current.resume();
                        }

                        if (audioContextRef.current) {
                            try {
                                // Decode MP3 audio
                                const audioBuffer = await audioContextRef.current.decodeAudioData(rawBuffer.slice(0));

                                audioQueueRef.current.push(audioBuffer);
                                playAudioQueue();
                                setStatusText('Vasthu is speaking...');
                            } catch (decodeError) {
                                console.error('[VasthuLive] Audio decode error:', decodeError);
                            }
                        }
                    } else {
                        // JSON Message
                        const data = JSON.parse(event.data);

                        switch (data.type) {
                            case 'connected':
                                setStatusText(data.message || 'Connected!');
                                break;

                            case 'transcript':
                                if (data.role === 'user') {
                                    if (data.is_final) {
                                        setTranscription(data.text);
                                    } else {
                                        setTranscription(data.text + '...');
                                    }
                                } else {
                                    setLastAiMessage(data.text);
                                }
                                break;

                            case 'interrupt':
                                handleInterrupt();
                                setIsSpeaking(false);
                                break;

                            case 'status':
                                setStatusText(data.message);
                                break;

                            case 'error':
                                setError(data.message);
                                setConnectionState('error');
                                setIsSpeaking(false);
                                break;
                        }
                    }
                } catch (e) {
                    console.error('[VasthuLive] Message error:', e);
                }
            };

            ws.onerror = (e) => {
                console.error('[VasthuLive] WebSocket error:', e);
                setError('Connection error');
                setConnectionState('error');
            };

            ws.onclose = () => {
                console.log('[VasthuLive] WebSocket closed');
                setConnectionState('disconnected');
            };

        } catch (e) {
            console.error('[VasthuLive] Setup error:', e);
            setError('Failed to initialize');
            setConnectionState('error');
        }
    }, [persona, language, threadId, userId, handleInterrupt, playAudioQueue]);

    // Start listening (capture microphone and stream to server)
    const startListening = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setError('Not connected');
            return;
        }

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });

            mediaStreamRef.current = stream;

            // Create audio processor
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext({ sampleRate: 16000 });
            }

            const source = audioContextRef.current.createMediaStreamSource(stream);
            sourceNodeRef.current = source;

            // Use ScriptProcessorNode for audio capture
            const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Check for silence (Debug)
                let hasSound = false;
                for (let i = 0; i < inputData.length; i += 100) {
                    if (Math.abs(inputData[i]) > 0.01) {
                        hasSound = true;
                        break;
                    }
                }
                if (hasSound && Math.random() < 0.05) {
                    console.log('[VasthuLive] Mic input detected (Level > 1%)');
                }

                // Convert Float32 to Int16
                const int16Data = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const sample = Math.max(-1, Math.min(1, inputData[i]));
                    int16Data[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                }

                // Send raw PCM bytes to server
                wsRef.current.send(int16Data.buffer);
            };

            source.connect(processor);

            // Critical: Connect to destination via MUTE gain to prevent feedback loop
            // while keeping the processor alive (browser requirement)
            const silentGain = audioContextRef.current.createGain();
            silentGain.gain.value = 0;
            processor.connect(silentGain);
            silentGain.connect(audioContextRef.current.destination);

            setIsListening(true);
            setStatusText('Listening... speak now!');
            console.log('[VasthuLive] Started listening');

        } catch (e) {
            console.error('[VasthuLive] Microphone error:', e);
            setError('Microphone access denied');
        }
    }, []);

    // Stop listening
    const stopListening = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }

        setIsListening(false);
        setStatusText('Paused');
        console.log('[VasthuLive] Stopped listening');

        // Signal end of audio to server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'end_audio' }));
        }
    }, []);

    // State for user gesture
    const [hasStarted, setHasStarted] = useState(false);

    // Initialize connection ONLY after user interaction
    useEffect(() => {
        if (hasStarted && !wsRef.current) {
            setupConnection();
        }
        return () => {
            // cleanup handled in setupConnection's return or logic
            if (!hasStarted && wsRef.current) { // if stopped
                stopListening();
                if (wsRef.current) wsRef.current.close();
            }
        };
    }, [hasStarted, setupConnection, stopListening]);

    // Handle initial user gesture
    const handleStart = useCallback(async () => {
        try {
            // Create context using system default defaults (most robust)
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            // Always ensure resumed
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            // DEBUG BEEP (Subtle "Boop" to confirm Audio Context)
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime); // Quiet 5%

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1); // Short 100ms

            console.log('[VasthuLive] Audio System Active (24k Output)');

        } catch (e) {
            console.error('[VasthuLive] Audio Init failed:', e);
            setError('Audio System Failed');
        }

        setHasStarted(true);
    }, []);

    // Toggle mute
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
        // Clear audio queue when muting
        if (!isMuted) {
            audioQueueRef.current = [];
        }
    }, [isMuted]);

    // Auto-start listening when connected
    useEffect(() => {
        if (connectionState === 'connected' && !isListening) {
            // slight delay to ensure socket is stable
            const timer = setTimeout(() => {
                startListening();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [connectionState, startListening]); // Removed isListening to avoid loops, only trigger on connect

    if (!hasStarted) {
        return (
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#050510] to-black z-50 flex flex-col items-center justify-center font-sans text-white">
                <div className="text-2xl mb-8 tracking-wider font-light">VASTHU VOICE</div>
                <button
                    onClick={handleStart}
                    className="px-8 py-4 bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/40 rounded-full transition-all duration-300 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.3)] group"
                >
                    <span className="group-hover:scale-105 inline-block transition-transform">INITIALIZE SESSION</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#050510] to-black z-50 flex flex-col font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${connectionState === 'connected' ? 'bg-emerald-400 animate-pulse' :
                        connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                            'bg-red-400'
                        }`} />
                    <span className="font-medium text-white/90">Vasthu Live</span>

                </div>

                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
                >
                    <X className="w-5 h-5 text-white/80" />
                </button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
                {/* Holographic talking avatar - large and prominent */}
                <HolographicAvatar
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    lastMessage={lastAiMessage}
                    size="xl"
                    showDataStreams={true}
                    className="mb-4"
                />

                {/* Status indicator */}
                <AvatarStatus
                    emotion={isSpeaking ? 'happy' : isListening ? 'thinking' : 'neutral'}
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                />

                {/* Status text */}
                <div className="text-center max-w-md mt-4 z-20">
                    <h2
                        className="text-xl font-medium tracking-wider text-cyan-100/90 mb-2 uppercase"
                        style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.4)' }}
                    >
                        {statusText}
                    </h2>
                    {transcription && (
                        <div className="relative p-4 bg-black/40 rounded-lg border border-cyan-900/30 backdrop-blur-sm">
                            <p className="text-sm text-cyan-400 font-mono leading-relaxed">
                                {">"} {transcription.trim().slice(-100)}<span className="animate-pulse">_</span>
                            </p>
                        </div>
                    )}
                    {error && (
                        <p className="text-sm text-red-400 mt-2 font-mono bg-red-950/30 px-2 py-1 rounded border border-red-900/50">{error}</p>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 pb-10">
                {/* Mute button */}
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition ${isMuted
                        ? 'bg-red-500/20 border border-red-400/30 text-red-300'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>

                {/* Main mic button */}
                <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={connectionState !== 'connected'}
                    className={`p-6 rounded-full transition-all ${connectionState !== 'connected'
                        ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                        : isListening
                            ? 'bg-purple-500/30 border-2 border-purple-400/60 text-purple-300 shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-pulse'
                            : 'bg-emerald-500/20 border-2 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                >
                    {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>

                {/* End button */}
                <button
                    onClick={onClose}
                    className="p-4 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition"
                    title="End conversation"
                >
                    <Square className="w-6 h-6" />
                </button>
            </div>


        </div>
    );
}

export default VasthuLiveScreen;
