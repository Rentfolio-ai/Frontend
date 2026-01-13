/**
 * Audio analysis hooks for lip-sync and avatar animation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Mouth shape visemes - SVG paths for different mouth positions.
 * Based on the original AgentAvatarSvg mouth at position (100, 122).
 */
export const MOUTH_SHAPES = {
    // Idle smile (default)
    idle: "M 85 122 Q 93 128, 100 129 Q 107 128, 115 122",
    // Slightly open
    small: "M 87 120 Q 94 127, 100 128 Q 106 127, 113 120 Q 106 132, 100 133 Q 94 132, 87 120",
    // Medium open
    medium: "M 85 118 Q 93 126, 100 127 Q 107 126, 115 118 Q 107 135, 100 137 Q 93 135, 85 118",
    // Wide open
    wide: "M 83 115 Q 92 124, 100 125 Q 108 124, 117 115 Q 108 140, 100 143 Q 92 140, 83 115",
    // Round "O" shape
    round: "M 90 118 Q 95 122, 100 123 Q 105 122, 110 118 Q 105 135, 100 138 Q 95 135, 90 118",
} as const;

export type MouthShape = keyof typeof MOUTH_SHAPES;

/**
 * Emotional states with corresponding facial adjustments.
 */
export type EmotionalState = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited';

export const EMOTIONAL_CONFIGS: Record<EmotionalState, {
    eyebrowOffset: number;
    eyeScale: number;
    mouthModifier: string;
    glowIntensity: number;
    glowColor: string;
}> = {
    neutral: {
        eyebrowOffset: 0,
        eyeScale: 1,
        mouthModifier: '',
        glowIntensity: 0.5,
        glowColor: 'rgba(0, 255, 255, 0.6)',
    },
    happy: {
        eyebrowOffset: -2,
        eyeScale: 0.95,
        mouthModifier: 'happy',
        glowIntensity: 0.8,
        glowColor: 'rgba(100, 255, 200, 0.7)',
    },
    thinking: {
        eyebrowOffset: 2,
        eyeScale: 1,
        mouthModifier: 'thinking',
        glowIntensity: 0.4,
        glowColor: 'rgba(150, 200, 255, 0.6)',
    },
    concerned: {
        eyebrowOffset: 3,
        eyeScale: 1.05,
        mouthModifier: 'concerned',
        glowIntensity: 0.6,
        glowColor: 'rgba(255, 180, 100, 0.5)',
    },
    excited: {
        eyebrowOffset: -3,
        eyeScale: 1.1,
        mouthModifier: 'excited',
        glowIntensity: 1.0,
        glowColor: 'rgba(0, 255, 200, 0.8)',
    },
};

/**
 * Smooth interpolation between values.
 */
export const lerp = (current: number, target: number, factor: number = 0.15): number => {
    return current + (target - current) * factor;
};

/**
 * Hook to analyze audio energy for lip-sync.
 */
export const useAudioEnergy = (isPlaying: boolean) => {
    const [energy, setEnergy] = useState(0);
    const smoothedEnergy = useRef(0);
    const frameRef = useRef<number | undefined>(undefined);
    // Note: analyserRef and audioContextRef reserved for future real audio analysis

    // Simulate energy when we don't have real audio data
    useEffect(() => {
        if (!isPlaying) {
            setEnergy(0);
            smoothedEnergy.current = 0;
            return;
        }

        // Simulate talking energy with natural rhythm
        let phase = 0;
        const animate = () => {
            phase += 0.15;

            // Create natural speaking rhythm
            const base = Math.sin(phase) * 0.3 + 0.3;
            const accent = Math.sin(phase * 2.5) * 0.2;
            const random = Math.random() * 0.15;
            const target = Math.max(0, Math.min(1, base + accent + random));

            // Smooth the transition
            smoothedEnergy.current = lerp(smoothedEnergy.current, target, 0.2);
            setEnergy(smoothedEnergy.current);

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [isPlaying]);

    // Method to feed real audio data
    const analyzeAudioData = useCallback((audioData: Float32Array) => {
        // Calculate RMS energy
        const sum = audioData.reduce((acc, val) => acc + val * val, 0);
        const rms = Math.sqrt(sum / audioData.length);
        const normalizedEnergy = Math.min(1, rms * 15);

        smoothedEnergy.current = lerp(smoothedEnergy.current, normalizedEnergy, 0.25);
        setEnergy(smoothedEnergy.current);
    }, []);

    return { energy, analyzeAudioData };
};

/**
 * Hook to get the current mouth shape based on energy.
 */
export const useMouthShape = (energy: number): string => {
    const [currentPath, setCurrentPath] = useState<string>(MOUTH_SHAPES.idle);

    useEffect(() => {
        let shape: MouthShape;

        if (energy < 0.1) shape = 'idle';
        else if (energy < 0.25) shape = 'small';
        else if (energy < 0.45) shape = 'medium';
        else if (energy < 0.65) shape = 'wide';
        else shape = 'round';

        setCurrentPath(MOUTH_SHAPES[shape]);
    }, [energy]);

    return currentPath;
};

/**
 * Hook for realistic eye blinking.
 */
export const useBlinkAnimation = () => {
    const [isBlinking, setIsBlinking] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        const scheduleBlink = () => {
            // Random interval between 2-6 seconds
            const delay = 2000 + Math.random() * 4000;

            timeoutRef.current = setTimeout(() => {
                setIsBlinking(true);

                // Blink duration 100-150ms
                setTimeout(() => {
                    setIsBlinking(false);
                    scheduleBlink();
                }, 100 + Math.random() * 50);
            }, delay);
        };

        scheduleBlink();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return isBlinking;
};

/**
 * Hook for subtle eye movement.
 */
export const useEyeMovement = (isActive: boolean) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    useEffect(() => {
        if (!isActive) {
            setOffset({ x: 0, y: 0 });
            return;
        }

        intervalRef.current = setInterval(() => {
            setOffset({
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 2,
            });
        }, 600 + Math.random() * 400);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive]);

    return offset;
};

/**
 * Hook to determine emotional state from context.
 */
export const useEmotionalState = (
    isSpeaking: boolean,
    isListening: boolean,
    lastMessage?: string
): EmotionalState => {
    const [emotion, setEmotion] = useState<EmotionalState>('neutral');

    useEffect(() => {
        if (isListening) {
            setEmotion('thinking');
            return;
        }

        if (isSpeaking) {
            // Analyze last message for emotional cues
            if (lastMessage) {
                const lower = lastMessage.toLowerCase();

                if (lower.includes('great') || lower.includes('excellent') || lower.includes('congrat')) {
                    setEmotion('excited');
                } else if (lower.includes('concern') || lower.includes('risk') || lower.includes('careful')) {
                    setEmotion('concerned');
                } else if (lower.includes('think') || lower.includes('consider') || lower.includes('analyzing')) {
                    setEmotion('thinking');
                } else {
                    setEmotion('happy');
                }
            } else {
                setEmotion('happy');
            }
            return;
        }

        setEmotion('neutral');
    }, [isSpeaking, isListening, lastMessage]);

    return emotion;
};
