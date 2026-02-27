import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const DealUnderwritingIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ shapeRendering: 'geometricPrecision' }}>
    <defs>
      <linearGradient id="du-bg" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#D4A27F" />
        <stop offset="100%" stopColor="#8B6339" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#du-bg)" />
    <rect width="48" height="24" rx="12" fill="#fff" opacity="0.08" />
    {/* Bold bar chart */}
    <rect x="8" y="28" width="7" height="12" rx="2" fill="#fff" opacity="0.9" />
    <rect x="17" y="22" width="7" height="18" rx="2" fill="#fff" opacity="0.7" />
    <rect x="26" y="16" width="7" height="24" rx="2" fill="#fff" opacity="0.8" />
    <rect x="35" y="10" width="7" height="30" rx="2" fill="#fff" opacity="0.95" />
    {/* Trend line */}
    <path d="M11 26 L20 20 L29 14 L38 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
  </svg>
);

export const MarketIntelIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ shapeRendering: 'geometricPrecision' }}>
    <defs>
      <linearGradient id="mi-bg" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#mi-bg)" />
    <rect width="48" height="24" rx="12" fill="#fff" opacity="0.08" />
    {/* Bold trend line going up */}
    <path d="M8 36 L18 26 L26 30 L40 12" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Arrow head */}
    <path d="M34 12 L40 12 L40 18" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Subtle area fill */}
    <path d="M8 36 L18 26 L26 30 L40 12 L40 40 L8 40 Z" fill="#fff" opacity="0.1" />
  </svg>
);

export const AIChatModesIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ shapeRendering: 'geometricPrecision' }}>
    <defs>
      <linearGradient id="ai-bg" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#ai-bg)" />
    <rect width="48" height="24" rx="12" fill="#fff" opacity="0.08" />
    {/* Chat bubble */}
    <path d="M8 14 C8 10 11 8 14 8 H34 C37 8 40 10 40 14 V28 C40 31 37 34 34 34 H18 L10 40 V34 C8 34 8 31 8 28 Z" fill="#fff" opacity="0.25" />
    {/* Bold lightning bolt */}
    <path d="M28 12 L20 24 H26 L20 36 L32 22 H26 Z" fill="#FDE68A" />
  </svg>
);

export const VoiceAssistantIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ shapeRendering: 'geometricPrecision' }}>
    <defs>
      <linearGradient id="va-bg" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#va-bg)" />
    <rect width="48" height="24" rx="12" fill="#fff" opacity="0.08" />
    {/* Bold microphone body */}
    <rect x="18" y="8" width="12" height="20" rx="6" fill="#fff" opacity="0.9" />
    {/* Mic arc */}
    <path d="M12 26 C12 33 17 38 24 38 C31 38 36 33 36 26" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    {/* Stand */}
    <line x1="24" y1="38" x2="24" y2="42" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const PortfolioStrategyIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ shapeRendering: 'geometricPrecision' }}>
    <defs>
      <linearGradient id="ps-bg" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#ps-bg)" />
    <rect width="48" height="24" rx="12" fill="#fff" opacity="0.08" />
    {/* Bold donut chart — 3 segments */}
    <circle cx="24" cy="24" r="14" stroke="#fff" strokeWidth="8" opacity="0.25" />
    <circle cx="24" cy="24" r="14" stroke="#fff" strokeWidth="8" strokeDasharray="22 66" strokeDashoffset="0" opacity="0.9" />
    <circle cx="24" cy="24" r="14" stroke="#fff" strokeWidth="8" strokeDasharray="28 60" strokeDashoffset="-22" opacity="0.55" />
    {/* Center dot */}
    <circle cx="24" cy="24" r="4" fill="#fff" opacity="0.9" />
  </svg>
);

export const ProfessionalReportsIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ shapeRendering: 'geometricPrecision' }}>
    <defs>
      <linearGradient id="pr-bg" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#6D28D9" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#pr-bg)" />
    <rect width="48" height="24" rx="12" fill="#fff" opacity="0.08" />
    {/* Bold document */}
    <rect x="10" y="6" width="22" height="30" rx="4" fill="#fff" opacity="0.9" />
    {/* Text lines */}
    <rect x="14" y="12" width="14" height="4" rx="2" fill="#7C3AED" opacity="0.3" />
    <rect x="14" y="20" width="10" height="4" rx="2" fill="#7C3AED" opacity="0.2" />
    <rect x="14" y="28" width="14" height="4" rx="2" fill="#7C3AED" opacity="0.15" />
    {/* Checkmark badge */}
    <circle cx="36" cy="36" r="9" fill="#FDE68A" />
    <path d="M31 36 L34 39 L41 32" stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SidebarMarketplaceIcon: React.FC<IconProps> = ({ className, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 7 L6 3 H18 L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    <path d="M20 7 C20 8.1 19.3 9 18.5 9 C17.7 9 17 8.1 17 7 C17 8.1 16.3 9 15.5 9 C14.7 9 14 8.1 14 7 C14 8.1 13.3 9 12.5 9 C11.7 9 11 8.1 11 7 C11 8.1 10.3 9 9.5 9 C8.7 9 8 8.1 8 7 C8 8.1 7.3 9 6.5 9 C5.7 9 5 8.1 5 7" fill="currentColor" opacity="0.6" />
    <rect x="5" y="9" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" fill="none" />
    <rect x="7" y="11" width="5" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="10" y="16" width="4" height="5" rx="1" fill="currentColor" opacity="0.5" />
  </svg>
);

export const SidebarReportsIcon: React.FC<IconProps> = ({ className, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="13" height="17" rx="2.5" fill="currentColor" opacity="0.25" />
    <rect x="7" y="5" width="13" height="17" rx="2.5" fill="currentColor" opacity="0.7" />
    <rect x="10" y="9" width="7" height="2" rx="1" fill="currentColor" opacity="0.25" />
    <rect x="10" y="12.5" width="5" height="2" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="10" y="16" width="7" height="2" rx="1" fill="currentColor" opacity="0.25" />
    <circle cx="18" cy="7" r="3.5" fill="currentColor" opacity="0.9" />
    <path d="M16.5 7 L17.5 8.2 L19.5 5.8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SidebarHomeIcon: React.FC<IconProps> = ({ className, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 10.5L12 3L21 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    <path d="M5 9.5V19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19V9.5" fill="currentColor" opacity="0.3" />
    <path d="M5 9.5V19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    <rect x="9.5" y="14" width="5" height="6" rx="1.5" fill="currentColor" opacity="0.6" />
  </svg>
);

export const SidebarDealsIcon: React.FC<IconProps> = ({ className, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.15" />
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    <line x1="3" y1="8.5" x2="21" y2="8.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <line x1="9" y1="8.5" x2="9" y2="21" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <line x1="15" y1="8.5" x2="15" y2="21" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <rect x="5" y="5" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.7" />
    <circle cx="6.5" cy="12" r="1.2" fill="currentColor" opacity="0.5" />
    <circle cx="6.5" cy="16" r="1.2" fill="currentColor" opacity="0.5" />
  </svg>
);

export const SidebarVasthuAIIcon: React.FC<IconProps> = ({ className, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L14.5 8.5L21 9.5L16.5 14L17.5 21L12 18L6.5 21L7.5 14L3 9.5L9.5 8.5L12 2Z" fill="currentColor" opacity="0.3" />
    <path d="M12 2L14.5 8.5L21 9.5L16.5 14L17.5 21L12 18L6.5 21L7.5 14L3 9.5L9.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.6" />
  </svg>
);
