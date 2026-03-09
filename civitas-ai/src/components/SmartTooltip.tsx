/**
 * Smart Tooltip Component
 * Rich tooltips with keyboard shortcuts, descriptions, and flexible positioning
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

interface SmartTooltipProps {
    trigger: React.ReactElement;
    title?: string;
    description?: string;
    shortcut?: string;
    learnMoreLink?: string;
    position?: TooltipPosition;
    delay?: number;
    dismissible?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
    trigger,
    title,
    description,
    shortcut,
    learnMoreLink,
    position = 'auto',
    delay = 300,
    dismissible = false,
    className,
    children,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [computedPosition, setComputedPosition] = useState<TooltipPosition>('top');
    const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false);

    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Auto-detect best position if set to 'auto'
    useEffect(() => {
        if (position !== 'auto' || !triggerRef.current || !isVisible) {
            setComputedPosition(position === 'auto' ? 'top' : position);
            return;
        }

        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Determine best position based on available space
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = viewportWidth - rect.right;

        const maxSpace = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight);

        if (maxSpace === spaceAbove && spaceAbove > 100) {
            setComputedPosition('top');
        } else if (maxSpace === spaceBelow && spaceBelow > 100) {
            setComputedPosition('bottom');
        } else if (maxSpace === spaceLeft && spaceLeft > 200) {
            setComputedPosition('left');
        } else if (maxSpace === spaceRight && spaceRight > 200) {
            setComputedPosition('right');
        } else {
            setComputedPosition('top');
        }
    }, [position, isVisible]); // Removed computedPosition to prevent infinite loop

    const handleMouseEnter = () => {
        if (isPermanentlyDismissed) return;

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsPermanentlyDismissed(true);
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Position classes
    const positionClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    // Arrow classes
    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
    };

    const hasContent = title || description || children || shortcut;

    return (
        <div className="relative inline-block" ref={triggerRef}>
            {/* Trigger */}
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-block"
            >
                {trigger}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {isVisible && hasContent && !isPermanentlyDismissed && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            'absolute z-[9999] min-w-[200px] max-w-[320px]',
                            positionClasses[computedPosition as keyof typeof positionClasses],
                            className
                        )}
                    >
                        <div className="bg-popover border border-black/8 rounded-lg shadow-2xl p-3 backdrop-blur-xl">
                            {/* Title and shortcut */}
                            {(title || shortcut) && (
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    {title && (
                                        <div className="font-semibold text-sm text-foreground">
                                            {title}
                                        </div>
                                    )}
                                    {shortcut && (
                                        <kbd className="px-2 py-0.5 rounded-md bg-black/8 text-foreground/70 text-xs font-mono border border-black/12 flex-shrink-0">
                                            {shortcut}
                                        </kbd>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            {description && (
                                <div className="text-xs text-muted-foreground leading-relaxed mb-2">
                                    {description}
                                </div>
                            )}

                            {/* Custom children */}
                            {children && (
                                <div className="text-xs text-foreground/70">
                                    {children}
                                </div>
                            )}

                            {/* Learn more link */}
                            {learnMoreLink && (
                                <a
                                    href={learnMoreLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span>Learn more</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}

                            {/* Dismiss button */}
                            {dismissible && (
                                <button
                                    onClick={handleDismiss}
                                    className="absolute top-1 right-1 p-1 rounded hover:bg-black/8 text-muted-foreground/70 hover:text-foreground/70 transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Arrow */}
                            <div
                                className={cn(
                                    'absolute w-0 h-0 border-[6px]',
                                    arrowClasses[computedPosition as keyof typeof arrowClasses]
                                )}
                                style={{
                                    borderTopColor: computedPosition === 'bottom' ? '#1a1d24' : 'transparent',
                                    borderBottomColor: computedPosition === 'top' ? '#1a1d24' : 'transparent',
                                    borderLeftColor: computedPosition === 'right' ? '#1a1d24' : 'transparent',
                                    borderRightColor: computedPosition === 'left' ? '#1a1d24' : 'transparent',
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
