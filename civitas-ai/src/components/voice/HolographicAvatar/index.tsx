/**
 * HolographicAvatar - Main component combining all effects.
 * Large, prominent, center-screen holographic talking avatar.
 */

import React, { useEffect, useState } from 'react';
import { AnimatedAvatarSvg } from './AnimatedAvatarSvg';
import {
    HolographicGlow,
    ScanlineOverlay,
    FloatingParticles,
    HexGrid,
    GlitchEffect,
    DataStream,
    HologramFloor,
    ProjectorLight,
    holographicStyles,
} from './effects';
import {
    useAudioEnergy,
    useMouthShape,
    useBlinkAnimation,
    useEyeMovement,
    useEmotionalState,
    EMOTIONAL_CONFIGS,
} from './hooks';
import type { EmotionalState } from './hooks';

interface HolographicAvatarProps {
    /** Is the AI currently speaking? */
    isSpeaking: boolean;
    /** Is the system listening to user? */
    isListening: boolean;
    /** Last message from AI (for emotion detection) */
    lastMessage?: string;
    /** Size of the avatar */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Show data streams in background */
    showDataStreams?: boolean;
    /** Override emotional state */
    emotionOverride?: EmotionalState;
    /** Additional className */
    className?: string;
}

const sizeConfig = {
    sm: { container: 'w-32 h-32', avatar: 'w-28 h-28' },
    md: { container: 'w-48 h-48', avatar: 'w-44 h-44' },
    lg: { container: 'w-72 h-72', avatar: 'w-64 h-64' },
    xl: { container: 'w-96 h-96', avatar: 'w-88 h-88' },
};

export const HolographicAvatar: React.FC<HolographicAvatarProps> = ({
    isSpeaking,
    isListening,
    lastMessage,
    size = 'xl',
    showDataStreams = true,
    emotionOverride,
    className = '',
}) => {
    // Animation hooks
    const { energy } = useAudioEnergy(isSpeaking);
    const mouthPath = useMouthShape(energy);
    const isBlinking = useBlinkAnimation();
    const eyeOffset = useEyeMovement(isSpeaking || isListening);
    const detectedEmotion = useEmotionalState(isSpeaking, isListening, lastMessage);
    const emotion = emotionOverride || detectedEmotion;

    // Occasional glitch effect
    const [showGlitch, setShowGlitch] = useState(false);

    useEffect(() => {
        const glitchInterval = setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every 3 seconds
                setShowGlitch(true);
                setTimeout(() => setShowGlitch(false), 200);
            }
        }, 3000);

        return () => clearInterval(glitchInterval);
    }, []);

    const emotionConfig = EMOTIONAL_CONFIGS[emotion];
    const { container, avatar } = sizeConfig[size];

    // Inject global styles
    useEffect(() => {
        const styleId = 'holographic-avatar-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = holographicStyles;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div className={`relative flex flex-col items-center justify-center ${className}`}>
            {/* Scenic Elements (Backdrop) */}
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden">
                <HologramFloor color={emotionConfig.glowColor} />
                <ProjectorLight color={emotionConfig.glowColor} />
            </div>

            {/* Outer container with glow */}
            <div className={`relative ${container} z-10`}>
                {/* Background hex grid */}
                <HexGrid opacity={0.15} />

                {/* Data streams (optional) */}
                {showDataStreams && <DataStream active={isSpeaking || isListening} />}

                {/* Floating particles */}
                <FloatingParticles
                    count={50}
                    color={emotionConfig.glowColor.replace(/[^,]+\)$/, '1)')}
                />

                {/* Main holographic glow */}
                <HolographicGlow
                    intensity={isSpeaking ? 1 : isListening ? 0.7 : 0.4}
                    color={emotionConfig.glowColor}
                    size={size}
                />

                {/* Avatar container */}
                <div
                    className={`absolute inset-0 flex items-center justify-center`}
                    style={{
                        filter: `drop-shadow(0 0 30px ${emotionConfig.glowColor})`,
                    }}
                >
                    {/* Circular frame */}
                    <div
                        className={`relative ${avatar} rounded-full overflow-hidden`}
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 30, 60, 0.9) 0%, rgba(0, 15, 30, 0.95) 100%)',
                            border: `2px solid ${emotionConfig.glowColor}`,
                            boxShadow: `
                0 0 20px ${emotionConfig.glowColor},
                inset 0 0 50px rgba(0, 255, 255, 0.2)
              `,
                        }}
                    >
                        {/* Scanline overlay */}
                        <ScanlineOverlay opacity={0.12} />

                        {/* The animated avatar */}
                        <AnimatedAvatarSvg
                            className="w-full h-full relative z-10"
                            mouthPath={mouthPath}
                            isBlinking={isBlinking}
                            eyeOffset={eyeOffset}
                            emotion={emotion}
                            holographic={true}
                        />

                        {/* Glitch effect overlay */}
                        <GlitchEffect active={showGlitch} intensity={1.5} />

                        {/* Inner glow */}
                        <div
                            className="absolute inset-0 pointer-events-none rounded-full"
                            style={{
                                background: `radial-gradient(circle, transparent 50%, ${emotionConfig.glowColor} 150%)`,
                                opacity: 0.3,
                            }}
                        />
                    </div>
                </div>

                {/* Status ring */}
                <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        border: `1px solid ${emotionConfig.glowColor}`,
                        opacity: 0.4,
                        animation: isSpeaking
                            ? 'holographic-pulse 1s ease-in-out infinite'
                            : isListening
                                ? 'holographic-pulse 2s ease-in-out infinite'
                                : 'none',
                    }}
                />

                {/* Outer decorative ring */}
                <div
                    className="absolute -inset-8 rounded-full pointer-events-none"
                    style={{
                        border: `1px dashed ${emotionConfig.glowColor}`,
                        opacity: 0.2,
                        animation: 'spin 30s linear infinite',
                    }}
                />
            </div>
        </div>
    );
};

/**
 * Status indicator component for displaying avatar state - HUD Style
 */
export const AvatarStatus: React.FC<{
    emotion: EmotionalState;
    isSpeaking: boolean;
    isListening: boolean;
}> = ({ emotion, isSpeaking, isListening }) => {
    const emotionLabels: Record<EmotionalState, string> = {
        neutral: 'SYSTEM READY',
        happy: 'OPTIMAL',
        thinking: 'PROCESSING',
        concerned: 'ALERT',
        excited: 'PEAK EFFICIENCY',
    };

    const statusLabel = isListening
        ? 'LISTENING...'
        : isSpeaking
            ? emotionLabels[emotion]
            : 'STANDBY';

    return (
        <div className="text-center mt-12 z-20">
            <div
                className="inline-flex items-center gap-3 px-6 py-2"
                style={{
                    background: 'rgba(0, 10, 20, 0.8)',
                    borderLeft: '2px solid rgba(0, 255, 255, 0.5)',
                    borderRight: '2px solid rgba(0, 255, 255, 0.5)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
                    clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%, 0% 20%)',
                }}
            >
                <div
                    className={`w-2 h-2 rounded-full ${isSpeaking
                        ? 'bg-cyan-400 animate-pulse'
                        : isListening
                            ? 'bg-purple-400 animate-pulse'
                            : 'bg-emerald-400'
                        }`}
                />
                <span className="text-cyan-400 text-sm font-mono tracking-widest">
                    [{statusLabel}]
                </span>
            </div>
        </div>
    );
};

export default HolographicAvatar;
