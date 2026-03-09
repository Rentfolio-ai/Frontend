// FILE: src/components/primitives/Tooltip.tsx
import React, { useState, useId, useCallback } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  // Generate a unique ID for the tooltip for ARIA attributes
  const tooltipId = useId();

  // Handle keyboard events - specifically the Escape key to hide tooltip
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible) {
      setIsVisible(false);
    }
  }, [isVisible]);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Check if children are focusable - if it's a React element with focusable attributes
  const isFocusableChild = React.isValidElement(children) && 
    (typeof children.type !== 'string' || 
     ['input', 'select', 'button', 'textarea', 'a'].includes(children.type));

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onKeyDown={handleKeyDown}
      tabIndex={isFocusableChild ? undefined : 0}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-foreground bg-card rounded-md shadow-lg',
            'animate-fade-in whitespace-nowrap', // Removed pointer-events-none
            sideClasses[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};