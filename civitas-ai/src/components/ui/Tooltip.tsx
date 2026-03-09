/**
 * Tooltip Component
 * Simple tooltip for icon buttons and truncated text
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
    content: string;
    children: React.ReactElement;
    delay?: number;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
    content, 
    children, 
    delay = 500,
    side = 'top' 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const timeoutRef = useRef<NodeJS.Timeout>();
    const triggerRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;

                let x = rect.left + scrollX + rect.width / 2;
                let y = rect.top + scrollY;

                switch (side) {
                    case 'top':
                        y = rect.top + scrollY - 8;
                        break;
                    case 'bottom':
                        y = rect.bottom + scrollY + 8;
                        break;
                    case 'left':
                        x = rect.left + scrollX - 8;
                        y = rect.top + scrollY + rect.height / 2;
                        break;
                    case 'right':
                        x = rect.right + scrollX + 8;
                        y = rect.top + scrollY + rect.height / 2;
                        break;
                }

                setPosition({ x, y });
            }
            setIsVisible(true);
        }, delay);
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

    // Clone the child and add event handlers
    const trigger = React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: () => {
            showTooltip();
            children.props.onMouseEnter?.();
        },
        onMouseLeave: () => {
            hideTooltip();
            children.props.onMouseLeave?.();
        },
        onFocus: () => {
            showTooltip();
            children.props.onFocus?.();
        },
        onBlur: () => {
            hideTooltip();
            children.props.onBlur?.();
        },
    });

    return (
        <>
            {trigger}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="fixed z-50 pointer-events-none"
                        style={{
                            left: side === 'left' || side === 'right' ? position.x : undefined,
                            top: side === 'top' || side === 'bottom' ? position.y : undefined,
                            transform: (() => {
                                switch (side) {
                                    case 'top':
                                        return 'translate(-50%, -100%)';
                                    case 'bottom':
                                        return 'translate(-50%, 0)';
                                    case 'left':
                                        return 'translate(-100%, -50%)';
                                    case 'right':
                                        return 'translate(0, -50%)';
                                    default:
                                        return 'translate(-50%, -100%)';
                                }
                            })(),
                        }}
                    >
                        <div className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium',
                            'bg-popover text-foreground border border-black/8',
                            'shadow-lg backdrop-blur-sm',
                            'max-w-xs whitespace-nowrap'
                        )}>
                            {content}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Simple wrapper for common use case
export const TooltipButton: React.FC<{
    tooltip: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}> = ({ tooltip, children, onClick, className, disabled }) => {
    return (
        <Tooltip content={tooltip}>
            <button
                onClick={onClick}
                disabled={disabled}
                className={className}
            >
                {children}
            </button>
        </Tooltip>
    );
};

