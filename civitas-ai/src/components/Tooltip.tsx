/**
 * Tooltip Component
 * 
 * Reusable tooltip with keyboard shortcut display and auto-positioning
 */

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    content: string;
    shortcut?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    shortcut,
    position = 'top',
    delay = 500,
    children
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay) as unknown as number;
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}

            {isVisible && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
                    role="tooltip"
                >
                    <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <span>{content}</span>
                            {shortcut && (
                                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-xs font-mono">
                                    {shortcut}
                                </kbd>
                            )}
                        </div>
                    </div>
                    <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
                </div>
            )}
        </div>
    );
};
