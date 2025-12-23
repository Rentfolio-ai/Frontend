// FILE: src/components/chat/ScrollToBottomButton.tsx
import React, { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ScrollToBottomButtonProps {
    containerRef: React.RefObject<HTMLElement | null>;
    threshold?: number;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
    containerRef,
    threshold = 300,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

            // Show button if user has scrolled up more than threshold
            setIsVisible(distanceFromBottom > threshold);

            // Count "unread" messages (optional - could track new messages while scrolled up)
            if (distanceFromBottom > threshold) {
                // This could be enhanced to track actual new messages
                setUnreadCount(0); // Reset for now
            } else {
                setUnreadCount(0);
            }
        };

        container.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [containerRef, threshold]);

    const scrollToBottom = () => {
        const container = containerRef.current;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToBottom}
            className={cn(
                "fixed bottom-24 right-8 z-30",
                "w-12 h-12 rounded-full",
                "bg-gradient-to-br from-blue-600 to-blue-500",
                "border border-white/20",
                "shadow-lg shadow-blue-500/30",
                "flex items-center justify-center",
                "hover:scale-110 active:scale-95",
                "transition-all duration-200",
                "group",
                "animate-in fade-in slide-in-from-bottom-4"
            )}
            title="Scroll to bottom"
            aria-label="Scroll to bottom"
        >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 rounded-full" />

            {/* Icon */}
            <ArrowDown className="w-5 h-5 text-white relative z-10" />

            {/* Unread indicator (optional) */}
            {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </div>
            )}

            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping opacity-75" />
        </button>
    );
};
