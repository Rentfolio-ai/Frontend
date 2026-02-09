
export const AnalysisIcon = ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="5" y="4" width="14" height="16" rx="2" fill={color} fillOpacity="0.15" />
        <path d="M5 4h14v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4z" stroke={color} strokeWidth="1.5" />
        <path d="M9 8h6" stroke={color} strokeWidth="2" strokeLinecap="square" />
        <path d="M9 12h3" stroke={color} strokeWidth="2" strokeLinecap="square" />
        <rect x="14" y="14" width="2" height="2" rx="0.5" fill={color} />
    </svg>
);

export const MarketIcon = ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="8" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke={color} strokeWidth="2" strokeLinecap="square" />
        <circle cx="12" cy="12" r="2.5" fill={color} />
    </svg>
);

export const CheckIcon = ({ className = "w-5 h-5", color = "currentColor" }: { className?: string; color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ArrowRightIcon = ({ className = "w-5 h-5", color = "currentColor" }: { className?: string; color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 12h16M14 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="square" />
    </svg>
);

export const MenuIcon = ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="6" width="18" height="2" rx="1" fill={color} fillOpacity="0.8" />
        <rect x="3" y="11" width="18" height="2" rx="1" fill={color} fillOpacity="0.6" />
        <rect x="3" y="16" width="18" height="2" rx="1" fill={color} fillOpacity="0.4" />
    </svg>
);

export const CloseIcon = ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="square" />
    </svg>
);

export const ChevronDownIcon = ({ className = "w-4 h-4", color = "currentColor" }: { className?: string; color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
