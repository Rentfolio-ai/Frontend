/**
 * Animated holographic avatar SVG with lip-sync and expressions.
 * Based on the original AgentAvatarSvg but with animated features.
 */

import React from 'react';
import type { EmotionalState } from './hooks';
import { EMOTIONAL_CONFIGS } from './hooks';

interface AnimatedAvatarSvgProps {
    className?: string;
    mouthPath: string;
    isBlinking: boolean;
    eyeOffset: { x: number; y: number };
    emotion: EmotionalState;
    holographic?: boolean;
}

export const AnimatedAvatarSvg: React.FC<AnimatedAvatarSvgProps> = ({
    className = '',
    mouthPath,
    isBlinking,
    eyeOffset,
    emotion,
    holographic = true,
}) => {
    const config = EMOTIONAL_CONFIGS[emotion];

    // Holographic color overrides - Pure Cyan/Tech Palette
    const colors = holographic ? {
        skin: 'url(#holoGridInfo)',
        skinStroke: 'rgba(0, 255, 255, 0.4)',
        hair: 'rgba(0, 20, 40, 0.8)',
        hairStroke: 'rgba(0, 255, 255, 0.6)',
        suit: 'rgba(0, 10, 20, 0.8)',
        suitStroke: 'rgba(0, 200, 255, 0.5)',
        eye: 'rgba(0, 255, 255, 0.9)',
        lips: 'rgba(0, 255, 255, 0.6)',
    } : {
        skin: 'url(#skinGrad)',
        skinStroke: 'none',
        hair: 'url(#hairGrad)',
        hairStroke: 'none',
        suit: 'url(#blazerGrad)',
        suitStroke: 'none',
        eye: '#8B6F47',
        lips: '#D94A6B',
    };

    const eyeScaleY = isBlinking ? 0.1 : config.eyeScale;

    return (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                {/* Tech Grid Pattern for Skin */}
                <pattern id="holoGridInfo" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(0, 255, 255, 0.1)" strokeWidth="0.5" />
                    <rect width="8" height="8" fill="rgba(0, 40, 60, 0.3)" />
                </pattern>

                {/* Holographic glow filter */}
                <filter id="holoGlow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Fallback Gradients */}
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD5B8" />
                    <stop offset="100%" stopColor="#F4A460" />
                </linearGradient>
                <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2C1810" />
                    <stop offset="100%" stopColor="#1A0F08" />
                </linearGradient>
                <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E40AF" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                </linearGradient>
            </defs>

            {/* Avatar Group */}
            <g filter={holographic ? "url(#holoGlow)" : ""}>
                {/* Head Base */}
                <path
                    d="M 60 70 Q 60 30, 100 30 Q 140 30, 140 70 L 140 110 Q 140 145, 100 145 Q 60 145, 60 110 Z"
                    fill={colors.skin}
                    stroke={colors.skinStroke}
                    strokeWidth="1.5"
                />

                {/* Ears */}
                <path d="M 55 85 Q 45 80, 45 95 Q 45 110, 60 105" fill={colors.skin} stroke={colors.skinStroke} strokeWidth="1" />
                <path d="M 145 85 Q 155 80, 155 95 Q 155 110, 140 105" fill={colors.skin} stroke={colors.skinStroke} strokeWidth="1" />

                {/* Hair - Tech Helm Look */}
                <path
                    d="M 100 25 Q 150 25, 150 75 Q 150 50, 130 35 Q 100 15, 70 35 Q 50 50, 50 75 Q 50 25, 100 25"
                    fill={colors.hair}
                    stroke={colors.hairStroke}
                    strokeWidth="1.5"
                />

                {/* Suit - Simplified Tech Collar */}
                <path
                    d="M 50 160 Q 100 190, 150 160 L 150 200 L 50 200 Z"
                    fill={colors.suit}
                    stroke={colors.suitStroke}
                    strokeWidth="1"
                />

                {/* Tie / Central Node */}
                <path
                    d="M 100 145 L 85 160 L 115 160 Z"
                    fill="rgba(0, 255, 255, 0.5)"
                    stroke="rgba(0, 255, 255, 0.8)"
                    strokeWidth="1"
                />

                {/* Face Features Group */}
                <g style={{ transform: `translateY(${config.eyebrowOffset}px)` }}>
                    {/* Tech Eyebrows (Lines) */}
                    <path d="M 70 75 Q 85 70, 95 78" stroke={colors.hairStroke} strokeWidth="2" fill="none" />
                    <path d="M 105 78 Q 115 70, 130 75" stroke={colors.hairStroke} strokeWidth="2" fill="none" />
                </g>

                {/* Cyber Eyes */}
                <g
                    style={{
                        transformOrigin: '100px 90px',
                        transform: `scaleY(${eyeScaleY})`,
                        transition: 'transform 0.08s ease-out',
                    }}
                >
                    <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
                        {/* Left Eye */}
                        <circle cx="82" cy="90" r="6" stroke={colors.eye} strokeWidth="1.5" fill="none" opacity="0.8" />
                        <circle cx="82" cy="90" r="2" fill={colors.eye} />

                        {/* Right Eye */}
                        <circle cx="118" cy="90" r="6" stroke={colors.eye} strokeWidth="1.5" fill="none" opacity="0.8" />
                        <circle cx="118" cy="90" r="2" fill={colors.eye} />
                    </g>
                </g>

                {/* Tech Nose (Minimal) */}
                <path d="M 100 95 L 98 110 L 102 110 Z" fill={colors.skinStroke} opacity="0.5" />

                {/* Animated Mouth - Light Beam */}
                <g>
                    <path
                        d={mouthPath}
                        stroke={colors.lips}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        style={{
                            transition: 'all 0.08s ease-out',
                            filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.8))',
                        }}
                    />
                </g>
            </g>
        </svg>
    );
};

export default AnimatedAvatarSvg;
// End of component
