/**
 * ContextPill - Visual chip/badge for displaying selected @-mention contexts
 */

import React from 'react';
import { X, MessageSquare, Home, FileText, BarChart3, Settings } from 'lucide-react';
import type { ContextItem } from '../../types/context';
import { cn } from '../../lib/utils';

interface ContextPillProps {
  /** The context to display */
  context: ContextItem;
  
  /** Callback when pill is removed */
  onRemove?: () => void;
  
  /** Whether to show remove button */
  showRemove?: boolean;
  
  /** Whether the pill is interactive (clickable) */
  isInteractive?: boolean;
  
  /** Callback when pill is clicked */
  onClick?: () => void;
  
  /** Custom class name */
  className?: string;
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get icon component for context type
 */
const getContextIcon = (context: ContextItem, size: 'sm' | 'md' | 'lg' = 'md') => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  
  if (typeof context.icon === 'string') {
    return <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>{context.icon}</span>;
  }
  
  // Default icons by type
  switch (context.type) {
    case 'page':
      return <MessageSquare className={iconSize} />;
    case 'property':
      return <Home className={iconSize} />;
    case 'file':
      return <FileText className={iconSize} />;
    case 'report':
      return <BarChart3 className={iconSize} />;
    case 'custom':
      return <Settings className={iconSize} />;
    default:
      return <MessageSquare className={iconSize} />;
  }
};

/**
 * Get color classes based on context type
 */
const getTypeColors = (type: ContextItem['type']) => {
  switch (type) {
    case 'page':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        hover: 'hover:bg-blue-500/15 hover:border-blue-500/30',
      };
    case 'property':
      return {
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/20',
        text: 'text-teal-400',
        hover: 'hover:bg-teal-500/15 hover:border-teal-500/30',
      };
    case 'file':
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        hover: 'hover:bg-purple-500/15 hover:border-purple-500/30',
      };
    case 'report':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        hover: 'hover:bg-orange-500/15 hover:border-orange-500/30',
      };
    case 'custom':
      return {
        bg: 'bg-white/5',
        border: 'border-white/10',
        text: 'text-white/70',
        hover: 'hover:bg-white/8 hover:border-white/15',
      };
    default:
      return {
        bg: 'bg-white/5',
        border: 'border-white/10',
        text: 'text-white/70',
        hover: 'hover:bg-white/8 hover:border-white/15',
      };
  }
};

export const ContextPill: React.FC<ContextPillProps> = ({
  context,
  onRemove,
  showRemove = true,
  isInteractive = false,
  onClick,
  className,
  size = 'md',
}) => {
  const colors = getTypeColors(context.type);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-2.5 py-1.5 text-sm gap-2',
    lg: 'px-3 py-2 text-base gap-2.5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border transition-all',
        colors.bg,
        colors.border,
        colors.text,
        sizeClasses[size],
        isInteractive && colors.hover,
        isInteractive && 'cursor-pointer',
        className
      )}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {/* Icon */}
      <div className="flex items-center justify-center flex-shrink-0">
        {getContextIcon(context, size)}
      </div>

      {/* Title */}
      <span className="font-medium truncate max-w-[200px]">
        {context.title}
      </span>

      {/* Remove button */}
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            'flex items-center justify-center flex-shrink-0 rounded transition-colors',
            'hover:bg-white/10',
            size === 'sm' && 'w-3.5 h-3.5',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5'
          )}
          aria-label="Remove context"
        >
          <X className={size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>
      )}
    </div>
  );
};

/**
 * Container for multiple context pills
 */
interface ContextPillsContainerProps {
  /** Array of contexts to display */
  contexts: ContextItem[];
  
  /** Callback when a pill is removed */
  onRemove?: (context: ContextItem) => void;
  
  /** Whether to show remove buttons */
  showRemove?: boolean;
  
  /** Maximum number of pills to show before truncating */
  maxVisible?: number;
  
  /** Custom class name */
  className?: string;
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const ContextPillsContainer: React.FC<ContextPillsContainerProps> = ({
  contexts,
  onRemove,
  showRemove = true,
  maxVisible,
  className,
  size = 'md',
}) => {
  const visibleContexts = maxVisible ? contexts.slice(0, maxVisible) : contexts;
  const hiddenCount = maxVisible ? Math.max(0, contexts.length - maxVisible) : 0;

  if (contexts.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {visibleContexts.map((context) => (
        <ContextPill
          key={context.id}
          context={context}
          onRemove={onRemove ? () => onRemove(context) : undefined}
          showRemove={showRemove}
          size={size}
        />
      ))}
      
      {hiddenCount > 0 && (
        <div className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
          +{hiddenCount} more
        </div>
      )}
    </div>
  );
};
