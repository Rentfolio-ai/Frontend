/**
 * Evidence Chip
 * 
 * Inline citation for AI sources
 * Minimal, clickable, unobtrusive
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvidenceChipProps {
  label: string;
  url?: string;
  onClick?: () => void;
  className?: string;
}

export const EvidenceChip: React.FC<EvidenceChipProps> = ({
  label,
  url,
  onClick,
  className,
}) => {
  const isClickable = Boolean(url || onClick);

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={isClickable ? handleClick : undefined}
      disabled={!isClickable}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all',
        isClickable && 'hover:scale-105 cursor-pointer',
        !isClickable && 'cursor-default',
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#94a3b8',
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
          e.currentTarget.style.color = '#fbbf24';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.color = '#94a3b8';
      }}
    >
      <span className="truncate max-w-[200px]">{label}</span>
      {url && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
    </button>
  );
};
