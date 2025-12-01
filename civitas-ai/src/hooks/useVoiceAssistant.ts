import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceState {
    status: 'idle' | 'listening' | 'processing' | 'speaking';
    transcript: string;
    response: string;
    audioUrl: string | null;
    volume: number; // 0 to 1
}

export function useVoiceAssistant() {
    const [state, setState] = useState<VoiceState>({
        status: 'idle',
        transcript: '',
        response: '',
        audioUrl: null,
        volume: 0,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const contextRef = useRef<Record<string, any> | null>(null);

    // Audio Context for Visualization & VAD
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Sound Effects - Premium Procedural Audio
    const playSound = (type: 'start' | 'stop') => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const t = ctx.currentTime;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === 'start') {
            // "Listening" - Soft, rising chime (Sine wave)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, t); // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, t + 0.15); // A5

            gainNode.gain.setValueAtTime(0, t);
            gainNode.gain.linearRampToValueAtTime(0.15, t + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            oscillator.start(t);
            oscillator.stop(t + 0.3);
        } else {
            // "Stop" - Gentle, falling confirmation (Sine wave)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, t); // A5
            oscillator.frequency.exponentialRampToValueAtTime(440, t + 0.15); // A4

            gainNode.gain.setValueAtTime(0, t);
            gainNode.gain.linearRampToValueAtTime(0.15, t + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            oscillator.start(t);
            oscillator.stop(t + 0.3);
        }
    };

    const cleanupAudio = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        // Don't close AudioContext as we might reuse it, but maybe suspend?
    };

    const startListening = useCallback(async (context?: Record<string, any>) => {
        try {
            playSound('start');
            contextRef.current = context || null;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup Audio Context for Visualizer
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioCtx = audioContextRef.current;
            if (audioCtx.state === 'suspended') await audioCtx.resume();

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyserRef.current = analyser;
            sourceRef.current = source;

            // Setup Recording
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                cleanupAudio();
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await processAudio(audioBlob);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setState(prev => ({ ...prev, status: 'listening', transcript: '', volume: 0 }));

            // Start Analysis Loop (Visualizer + VAD)
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let silenceStart = Date.now();
            const SILENCE_DURATION = 2000; // Increased to 2s to prevent cutting off short greetings too early
            const NOISE_FLOOR = 0.02; // Lowered noise floor for better sensitivity

            const analyze = () => {
                if (mediaRecorder.state !== 'recording') return;

                analyser.getByteFrequencyData(dataArray);

                // Calculate average volume
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                const normalizedVolume = Math.min(1, average / 128); // Normalize to 0-1 range

                setState(prev => ({ ...prev, volume: normalizedVolume }));

                // Silence Detection
                if (normalizedVolume > NOISE_FLOOR) {
                    silenceStart = Date.now();
                } else if (Date.now() - silenceStart > SILENCE_DURATION) {
                    // Silence detected
                    console.log('Silence detected, stopping recording...');
                    stopListening();
                    return;
                }

                animationFrameRef.current = requestAnimationFrame(analyze);
            };
            analyze();

        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            playSound('stop');
            mediaRecorderRef.current.stop();
            setState(prev => ({ ...prev, status: 'processing', volume: 0 }));
        }
    }, []);

    const processAudio = async (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');

        if (contextRef.current) {
            formData.append('context', JSON.stringify(contextRef.current));
        }

        try {
            const response = await fetch('http://localhost:8002/voice/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Voice analysis failed');

            const data = await response.json();

            setState({
                status: 'speaking',
                transcript: data.text_input,
                response: data.text_response,
                audioUrl: `data:audio/mp3;base64,${data.audio_response}`,
                volume: 0
            });

            // Play audio
            const audio = new Audio(`data:audio/mp3;base64,${data.audio_response}`);
            audio.onended = () => setState(prev => ({ ...prev, status: 'idle' }));
            audio.play();

        } catch (error) {
            console.error('Error processing voice:', error);
            setState(prev => ({ ...prev, status: 'idle', response: 'Sorry, something went wrong.', volume: 0 }));
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupAudio();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return {
        state,
        startListening,
        stopListening,
    };
}
