/**
 * Evidence Row: Displays evidence links (listings, comps, regulations).
 * 
 * Every claim must cite sources. This component makes citations visible and clickable.
 */

import React from 'react';
import { ExternalLink, FileText, TrendingUp, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Evidence } from '@/types/events';

interface EvidenceRowProps {
  items: Evidence[];
  onClickEvidence?: (id: string) => void;
  className?: string;
}

export const EvidenceRow: React.FC<EvidenceRowProps> = ({
  items,
  onClickEvidence,
  className,
}) => {
  const getIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'listing':
        return FileText;
      case 'comp':
        return TrendingUp;
      case 'regulation':
        return Scale;
      case 'market_stat':
        return TrendingUp;
    }
  };

  if (items.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((evidence) => {
        const Icon = getIcon(evidence.type);
        
        return (
          <button
            key={evidence.id}
            onClick={() => onClickEvidence?.(evidence.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs',
              'bg-slate-800/50 text-violet-400 border border-white/10',
              'hover:bg-slate-800 hover:border-violet-500/30 transition-colors'
            )}
          >
            <Icon className="w-3 h-3" />
            <span>{evidence.label}</span>
            {evidence.url && <ExternalLink className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
};
