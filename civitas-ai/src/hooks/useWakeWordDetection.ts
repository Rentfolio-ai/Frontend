import { useState, useEffect, useRef, useCallback } from 'react';

interface WakeWordState {
    isListening: boolean;
    isSupported: boolean;
    lastDetected: Date | null;
}

export function useWakeWordDetection(
    onWakeWordDetected: () => void,
    enabled: boolean = false
) {
    const [state, setState] = useState<WakeWordState>({
        isListening: false,
        isSupported: false,
        lastDetected: null,
    });

    const recognitionRef = useRef<any>(null);
    const isActiveRef = useRef(false);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            setState(prev => ({ ...prev, isSupported: true }));
        } else {
            console.warn('Web Speech API not supported in this browser');
        }
    }, []);

    // Wake word variations (accounting for speech recognition errors)
    const wakeWords = [
        'hey civi',
        'hey cv',
        'hey siri', // Sometimes misheard
        'a civi',
        'hey CV',
        'hey CV',
    ];

    const checkForWakeWord = useCallback(
        (transcript: string) => {
            const normalized = transcript.toLowerCase().trim();

            // Check if any wake word variant is present
            const detected = wakeWords.some(word => normalized.includes(word));

            if (detected) {
                console.log('[Wake Word] Detected:', transcript);
                setState(prev => ({ ...prev, lastDetected: new Date() }));
                onWakeWordDetected();

                // Brief pause after detection to avoid re-triggering
                isActiveRef.current = false;
                setTimeout(() => {
                    if (enabled) {
                        isActiveRef.current = true;
                    }
                }, 3000); // 3 second cooldown
            }
        },
        [onWakeWordDetected, enabled]
    );

    // Start/stop wake word detection
    useEffect(() => {
        if (!state.isSupported || !enabled) {
            return;
        }

        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        // Configure for continuous wake word detection
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('[Wake Word] Listening started');
            isActiveRef.current = true;
            setState(prev => ({ ...prev, isListening: true }));
        };

        recognition.onresult = (event: any) => {
            if (!isActiveRef.current) return;

            // Get the latest transcript
            const lastResultIndex = event.results.length - 1;
            const result = event.results[lastResultIndex];
            const transcript = result[0].transcript;

            // Only check final results to reduce false positives
            if (result.isFinal) {
                checkForWakeWord(transcript);
            }
        };

        recognition.onerror = (event: any) => {
            // Ignore "no-speech" errors (they're expected when silent)
            if (event.error !== 'no-speech') {
                console.error('[Wake Word] Recognition error:', event.error);
            }

            // Auto-restart on most errors
            if (event.error !== 'aborted' && enabled && isActiveRef.current) {
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (err) {
                        console.log('[Wake Word] Restart attempt failed:', err);
                    }
                }, 1000);
            }
        };

        recognition.onend = () => {
            console.log('[Wake Word] Recognition ended');
            setState(prev => ({ ...prev, isListening: false }));

            // Auto-restart if still enabled
            if (enabled && isActiveRef.current) {
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (err) {
                        console.log('[Wake Word] Auto-restart failed:', err);
                    }
                }, 500);
            }
        };

        // Start listening
        try {
            recognition.start();
        } catch (err) {
            console.error('[Wake Word] Failed to start:', err);
        }

        // Cleanup
        return () => {
            isActiveRef.current = false;
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (err) {
                    // Ignore cleanup errors
                }
            }
        };
    }, [enabled, state.isSupported, checkForWakeWord]);

    // Stop listening when tab is not visible (performance optimization)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isActiveRef.current = false;
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.stop();
                    } catch (err) {
                        // Ignore
                    }
                }
            } else if (enabled && state.isSupported) {
                isActiveRef.current = true;
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (err) {
                        // Ignore
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, state.isSupported]);

    return state;
}
