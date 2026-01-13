/**
 * Holographic visual effects components.
 * Classic sci-fi cyan/blue theme with particles, scanlines, and glow.
 */

import React, { useMemo } from 'react';

interface HolographicGlowProps {
    intensity: number;
    color?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Animated holographic glow effect around the avatar.
 */
interface ProjectorLightProps {
    color?: string;
}

/**
 * Conical light beam simulating a hologram projector.
 */
export const ProjectorLight: React.FC<ProjectorLightProps> = ({ color = 'rgba(0, 255, 255, 0.3)' }) => {
    return (
        <div className="absolute bottom-0 w-full h-1/2 flex justify-center items-end pointer-events-none z-0">
            {/* Main Beam */}
            <div
                className="w-48 h-full blur-xl"
                style={{
                    background: `conic-gradient(from 180deg at 50% 100%, transparent 0deg, transparent 150deg, ${color} 180deg, transparent 210deg, transparent 360deg)`,
                    opacity: 0.2,
                    transformOrigin: 'bottom center',
                    animation: 'pulse-beam 4s ease-in-out infinite'
                }}
            />
            {/* Core Beam */}
            <div
                className="absolute w-20 h-full blur-md"
                style={{
                    background: `linear-gradient(to top, ${color} 0%, transparent 80%)`,
                    opacity: 0.3,
                }}
            />
        </div>
    );
};

interface HologramFloorProps {
    color?: string;
}

/**
 * 3D Perspective Grid Floor
 */
export const HologramFloor: React.FC<HologramFloorProps> = ({ color = 'rgba(0, 255, 255, 0.4)' }) => {
    return (
        <div
            className="absolute bottom-[-100px] w-[200%] h-[300px] left-[-50%] pointer-events-none z-0"
            style={{
                perspective: '500px',
                transformStyle: 'preserve-3d',
            }}
        >
            <div
                className="w-full h-full"
                style={{
                    transform: 'rotateX(80deg)',
                    background: `
                        linear-gradient(90deg, transparent 24%, ${color} 25%, ${color} 26%, transparent 27%, transparent 74%, ${color} 75%, ${color} 76%, transparent 77%),
                        linear-gradient(${color} 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    opacity: 0.15,
                    maskImage: 'linear-gradient(to top, black, transparent)',
                    animation: 'grid-scroll 20s linear infinite',
                }}
            />
        </div>
    );
};

/**
 * Animated holographic glow effect around the avatar.
 * Now featuring rotating tech rings.
 */
export const HolographicGlow: React.FC<HolographicGlowProps> = ({
    intensity = 0.5,
    color = 'rgba(0, 255, 255, 0.6)',
    size = 'lg',
}) => {
    const sizeStyles = {
        sm: 'w-32 h-32',
        md: 'w-48 h-48',
        lg: 'w-72 h-72',
        xl: 'w-[500px] h-[500px]', // Larger intense glow for XL
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer glow cloud */}
            <div
                className={`absolute ${sizeStyles[size]} rounded-full animate-pulse`}
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                    opacity: intensity * 0.3,
                    filter: 'blur(40px)',
                }}
            />

            {/* Rotating Tech Ring 1 */}
            <div
                className={`absolute rounded-full`}
                style={{
                    width: '110%',
                    height: '110%',
                    border: `1px dashed ${color}`,
                    opacity: intensity * 0.3,
                    animation: 'spin 20s linear infinite',
                }}
            />

            {/* Rotating Tech Ring 2 (Counter) */}
            <div
                className={`absolute rounded-full`}
                style={{
                    width: '95%',
                    height: '95%',
                    borderTop: `2px solid ${color}`,
                    borderBottom: `2px solid ${color}`,
                    borderLeft: `2px solid transparent`,
                    borderRight: `2px solid transparent`,
                    opacity: intensity * 0.5,
                    animation: 'reverse-spin 15s linear infinite',
                }}
            />

            {/* Inner glow ring */}
            <div
                className={`absolute rounded-full`}
                style={{
                    width: '85%',
                    height: '85%',
                    background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
                    opacity: intensity * 0.5,
                    filter: 'blur(15px)',
                    animation: 'holographic-pulse 2s ease-in-out infinite',
                }}
            />
        </div>
    );
};




interface ScanlineOverlayProps {
    opacity?: number;
}

/**
 * Classic CRT/hologram scanline effect.
 */
export const ScanlineOverlay: React.FC<ScanlineOverlayProps> = ({ opacity = 0.08 }) => {
    return (
        <div
            className="absolute inset-0 pointer-events-none rounded-full overflow-hidden"
            style={{
                background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 2px,
          rgba(0, 255, 255, ${opacity}) 2px,
          rgba(0, 255, 255, ${opacity}) 4px
        )`,
                animation: 'scanline-scroll 8s linear infinite',
            }}
        />
    );
};

interface FloatingParticlesProps {
    count?: number;
    color?: string;
}

/**
 * Floating holographic particles around the avatar.
 */
export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
    count = 30,
    color = 'rgb(0, 255, 255)',
}) => {
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: 1 + Math.random() * 3,
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 3,
            opacity: 0.3 + Math.random() * 0.5,
        }));
    }, [count]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: color,
                        opacity: p.opacity,
                        animation: `particle-float ${p.duration}s ease-in-out infinite`,
                        animationDelay: `${p.delay}s`,
                        boxShadow: `0 0 ${p.size * 2}px ${color}`,
                    }}
                />
            ))}
        </div>
    );
};

interface HexGridProps {
    opacity?: number;
}

/**
 * Subtle hexagonal grid pattern for sci-fi aesthetic.
 */
export const HexGrid: React.FC<HexGridProps> = ({ opacity = 0.1 }) => {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                opacity,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.4'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
        />
    );
};

interface GlitchEffectProps {
    active?: boolean;
    intensity?: number;
}

/**
 * Occasional holographic glitch effect.
 */
export const GlitchEffect: React.FC<GlitchEffectProps> = ({
    active = false,
    intensity = 1,
}) => {
    if (!active) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                animation: `holographic-glitch ${0.1 / intensity}s steps(1) infinite`,
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.1) 50%, transparent 100%)',
                    transform: 'translateX(-100%)',
                    animation: 'glitch-sweep 0.3s ease-out',
                }}
            />
        </div>
    );
};

interface DataStreamProps {
    active?: boolean;
}

/**
 * Vertical data stream effect (like Matrix rain, but cyan).
 */
export const DataStream: React.FC<DataStreamProps> = ({ active = true }) => {
    const streams = useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => ({
            id: i,
            left: `${10 + i * 12}%`,
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            chars: Array.from({ length: 6 }, () =>
                String.fromCharCode(0x30A0 + Math.random() * 96)
            ).join(''),
        }));
    }, []);

    if (!active) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {streams.map((s) => (
                <div
                    key={s.id}
                    className="absolute text-cyan-400 text-xs font-mono writing-mode-vertical"
                    style={{
                        left: s.left,
                        top: '-20%',
                        writingMode: 'vertical-rl',
                        animation: `data-stream ${s.duration}s linear infinite`,
                        animationDelay: `${s.delay}s`,
                        textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
                    }}
                >
                    {s.chars}
                </div>
            ))}
        </div>
    );
}
export const holographicStyles = `
  @keyframes holographic-pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }

  @keyframes scanline-scroll {
    0% { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }

  @keyframes particle-float {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
    50% { transform: translateY(-30px) translateX(-5px); opacity: 0.5; }
  }

  @keyframes holographic-glitch {
    0%, 90%, 100% { transform: translateX(0); filter: hue-rotate(0deg); }
    92% { transform: translateX(-2px); filter: hue-rotate(90deg); }
    94% { transform: translateX(2px); filter: hue-rotate(-90deg); }
    96% { transform: translateX(1px); }
    98% { transform: translateX(-1px); }
  }

  @keyframes glitch-sweep {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }

  @keyframes data-stream {
    0% { transform: translateY(-100%); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(500%); opacity: 0; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes reverse-spin {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }

  @keyframes grid-scroll {
    0% { background-position: 0 0; }
    100% { background-position: 0 50px; }
  }

  @keyframes pulse-beam {
    0%, 100% { opacity: 0.2; transform: scaleX(1); }
    50% { opacity: 0.3; transform: scaleX(1.1); }
  }
`;
