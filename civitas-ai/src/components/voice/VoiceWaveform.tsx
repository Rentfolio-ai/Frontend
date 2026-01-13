import { motion } from 'framer-motion';

interface VoiceWaveformProps {
    status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
    audioLevel?: number;
}

/**
 * Gemini Live-style horizontal waveform bar with glow effect.
 * Positioned at the bottom of the screen with animated gradient.
 */
export function VoiceWaveform({ status, audioLevel = 0.5 }: VoiceWaveformProps) {
    const isActive = status === 'listening' || status === 'speaking';

    // Color based on status
    const getGlowColor = () => {
        switch (status) {
            case 'listening':
                return 'rgba(16, 185, 129, 0.8)'; // Emerald for user speaking
            case 'speaking':
                return 'rgba(99, 102, 241, 0.8)'; // Indigo/blue for AI speaking
            case 'thinking':
                return 'rgba(251, 191, 36, 0.6)'; // Amber for thinking
            case 'error':
                return 'rgba(239, 68, 68, 0.6)'; // Red for error
            default:
                return 'rgba(100, 116, 139, 0.4)'; // Slate for idle
        }
    };

    const glowColor = getGlowColor();
    const intensity = isActive ? 0.5 + audioLevel * 0.5 : 0.3;

    return (
        <div className="w-full h-32 relative overflow-hidden">
            {/* Main glow bar - horizontal like Gemini Live */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-24"
                style={{
                    background: `linear-gradient(to top, ${glowColor}, transparent)`,
                }}
                animate={{
                    opacity: [intensity * 0.6, intensity, intensity * 0.6],
                    scaleY: isActive ? [0.8 + audioLevel * 0.2, 1 + audioLevel * 0.3, 0.8 + audioLevel * 0.2] : [0.5, 0.6, 0.5],
                }}
                transition={{
                    duration: isActive ? 0.3 : 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Secondary glow layer for depth */}
            <motion.div
                className="absolute bottom-0 left-1/4 right-1/4 h-20"
                style={{
                    background: `radial-gradient(ellipse at bottom, ${glowColor}, transparent 70%)`,
                    filter: 'blur(20px)',
                }}
                animate={{
                    opacity: [intensity * 0.4, intensity * 0.8, intensity * 0.4],
                    scaleX: isActive ? [0.8, 1.2, 0.8] : [1, 1, 1],
                }}
                transition={{
                    duration: isActive ? 0.5 : 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Bright center highlight */}
            <motion.div
                className="absolute bottom-0 left-1/3 right-1/3 h-8"
                style={{
                    background: `linear-gradient(to top, white, transparent)`,
                    opacity: 0.3,
                    filter: 'blur(8px)',
                }}
                animate={{
                    opacity: isActive ? [0.2, 0.5, 0.2] : [0.1, 0.15, 0.1],
                    scaleX: isActive ? [0.9, 1.1, 0.9] : [1, 1, 1],
                }}
                transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Animated waves/ripples for speaking */}
            {status === 'speaking' && (
                <>
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bottom-0 left-0 right-0 h-16"
                            style={{
                                background: `linear-gradient(to top, rgba(99, 102, 241, ${0.3 - i * 0.1}), transparent)`,
                            }}
                            animate={{
                                y: [0, -20 - i * 10, 0],
                                opacity: [0.3, 0.1, 0.3],
                            }}
                            transition={{
                                duration: 1 + i * 0.3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </>
            )}

            {/* Listening pulse effect */}
            {status === 'listening' && (
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-4"
                    style={{
                        background: 'linear-gradient(to right, transparent, rgba(16, 185, 129, 0.6), transparent)',
                    }}
                    animate={{
                        x: ['-100%', '100%'],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            )}
        </div>
    );
}
