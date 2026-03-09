/**
 * FlowCard - Unified frictionless card component
 * 
 * Design principles:
 * - Glanceable at first sight (key metric + title)
 * - Expands inline for more detail
 * - Actions appear on hover/context
 * - Subtle, breathable design
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlowCardProps {
  // Core content
  title: string;
  subtitle?: string;
  metric?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'purple' | 'orange';
  };
  
  // Visual
  icon?: ReactNode;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'info' | 'neutral';
  };
  
  // Progressive content
  preview?: ReactNode; // Always visible
  details?: ReactNode; // Expands inline
  deepDive?: ReactNode; // Opens in modal/full view
  
  // Interactions
  onDeepDive?: () => void;
  actions?: Array<{
    icon: ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  
  // State
  defaultExpanded?: boolean;
  className?: string;
}

export function FlowCard({
  title,
  subtitle,
  metric,
  icon,
  badge,
  preview,
  details,
  deepDive,
  onDeepDive,
  actions,
  defaultExpanded = false,
  className,
}: FlowCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);
  
  const hasExpandable = !!details;
  const hasDeepDive = !!onDeepDive || !!deepDive;

  const metricColors = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };

  const badgeVariants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-black/5 text-muted-foreground border-black/8',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        // Base styles - minimal, breathable
        'group relative rounded-xl',
        'bg-black/[0.02] backdrop-blur-sm',
        'border border-black/[0.05]',
        'transition-all duration-300 ease-out',
        // Hover - subtle lift
        'hover:bg-black/[0.03] hover:border-black/8',
        'hover:shadow-lg hover:shadow-black/5',
        className
      )}
    >
      {/* Main content - always visible */}
      <div
        className={cn(
          'p-5 cursor-pointer',
          hasExpandable && 'pb-4'
        )}
        onClick={() => hasExpandable && setIsExpanded(!isExpanded)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {icon && (
              <div className="mt-0.5 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                {icon}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate group-hover:text-foreground transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Badge or Metric */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge && (
              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium border',
                badgeVariants[badge.variant || 'neutral']
              )}>
                {badge.text}
              </span>
            )}
            
            {metric && (
              <div className="text-right">
                <div className={cn(
                  'text-xl font-bold',
                  metricColors[metric.color || 'blue']
                )}>
                  {metric.value}
                </div>
                {metric.label && (
                  <div className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium mt-0.5">
                    {metric.label}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview content */}
        {preview && (
          <div className="mt-3">
            {preview}
          </div>
        )}

        {/* Expand indicator */}
        {hasExpandable && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.05]">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: isExpanded ? 0 : 1 }}
                className="w-1.5 h-1.5 rounded-full bg-blue-400/60"
              />
              <span className="text-xs text-muted-foreground/70">
                {isExpanded ? 'Less detail' : 'More detail'}
              </span>
            </div>
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Contextual actions - appear on hover */}
      <AnimatePresence>
        {isHovered && actions && actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-3 right-3 flex items-center gap-1.5"
          >
            {actions.map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={cn(
                  'p-2 rounded-lg backdrop-blur-sm transition-all',
                  action.variant === 'primary' && 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300',
                  action.variant === 'danger' && 'bg-red-500/20 hover:bg-red-500/30 text-red-300',
                  (!action.variant || action.variant === 'secondary') && 'bg-black/8 hover:bg-black/12 text-muted-foreground'
                )}
                title={action.label}
              >
                {action.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable details */}
      <AnimatePresence>
        {isExpanded && details && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-black/[0.05]"
          >
            <div className="p-5 pt-4 space-y-4 bg-gradient-to-b from-black/[0.02] to-transparent">
              {details}
              
              {/* Deep dive CTA */}
              {hasDeepDive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeepDive?.();
                  }}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/20 text-foreground/80 text-sm font-medium hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/30 hover:text-foreground transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                >
                  <span>View Full Analysis</span>
                  <motion.span
                    className="inline-block"
                    animate={{ x: isHovered ? 2 : 0 }}
                  >
                    →
                  </motion.span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
