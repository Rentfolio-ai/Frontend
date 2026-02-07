import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'dark' | 'light';
    showIcon?: boolean;
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className = '',
    variant = 'dark',
    showIcon = true,
    showText = true
}) => {
    const textColor = variant === 'dark' ? 'text-slate-900' : 'text-white';
    const taglineColor = variant === 'dark' ? 'text-slate-500' : 'text-slate-400';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {showIcon && (
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 shrink-0 max-w-full max-h-full"
                >
                    <defs>
                        <linearGradient id="ribbonGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#115E59" /> {/* Deep Teal */}
                            <stop offset="50%" stopColor="#A8734A" /> {/* Main Teal */}
                            <stop offset="100%" stopColor="#134E4A" /> {/* Darker End */}
                        </linearGradient>

                        <linearGradient id="ribbonHighlight" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#0F766E" stopOpacity="0" />
                        </linearGradient>

                        <radialGradient id="centerGlow" cx="50" cy="50" r="25" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
                            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* BACKGROUND SHAPE: The main "House" outline formed by ribbons */}
                    {/* Left Arm curling up */}
                    <path
                        d="M50 15
               C 30 30, 15 45, 25 65
               C 30 75, 45 75, 50 65"
                        stroke="url(#ribbonGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* Right Arm curling up */}
                    <path
                        d="M50 15
               C 70 30, 85 45, 75 65
               C 70 75, 55 75, 50 65"
                        stroke="url(#ribbonGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* LOWER LOOP aka The Infinity Base */}
                    <path
                        d="M25 65 C 25 85, 75 85, 75 65"
                        stroke="url(#ribbonGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* REFINED INNER DETAILS (Overlays to create the Knot effect) */}
                    <path
                        d="M28 62 C 32 78, 68 78, 72 62"
                        stroke="#0F766E"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.3"
                    />

                    {/* CENTRAL BLOOM: The "Lotus" / Flame */}
                    <path
                        d="M50 35
               Q 40 50, 50 70
               Q 60 50, 50 35 Z"
                        fill="#134E4A"
                    />
                    <path
                        d="M50 40
               Q 45 50, 50 65
               Q 55 50, 50 40 Z"
                        fill="#CCFBF1"
                    />

                    {/* THE SPARK: Diamond shape center */}
                    <circle cx="50" cy="50" r="15" fill="url(#centerGlow)" />
                    <path
                        d="M50 42 L53 48 L59 50 L53 52 L50 58 L47 52 L41 50 L47 48 Z"
                        fill="#FFFBEB"
                    />
                </svg>
            )}
            {showText && (
                <div className="flex flex-col justify-center">
                    <span className={`text-2xl font-bold tracking-tight leading-none ${textColor}`} style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                        VASTHU
                    </span>
                    <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${taglineColor} mt-0.5`}>
                        Real Estate AI
                    </span>
                </div>
            )}
        </div>
    );
};
