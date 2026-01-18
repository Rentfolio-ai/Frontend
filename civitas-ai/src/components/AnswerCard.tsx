/**
 * Answer Card: Structured AI response with headline, bullets, evidence, and next action.
 * 
 * Enforces max 3-5 bullets, always includes next action, expandable details.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EvidenceRow } from './EvidenceRow';
import type { Evidence } from '@/types/events';

interface AnswerCardProps {
  headline: string;
  bullets: string[];
  evidence?: Evidence[];
  nextAction?: {
    label: string;
    onClick: () => void;
  };
  details?: React.ReactNode;
  className?: string;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  headline,
  bullets,
  evidence = [],
  nextAction,
  details,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Enforce max 5 bullets
  const displayBullets = bullets.slice(0, 5);

  return (
    <div className={cn('p-4 rounded-lg bg-slate-900/50 border border-white/10', className)}>
      {/* Headline */}
      <h3 className="text-lg font-semibold text-white mb-3">
        {headline}
      </h3>

      {/* Bullets */}
      <ul className="space-y-2 mb-4">
        {displayBullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-violet-400 mt-0.5">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* Evidence Links */}
      {evidence.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 mb-2">Sources:</p>
          <EvidenceRow items={evidence} />
        </div>
      )}

      {/* Next Action CTA */}
      {nextAction && (
        <button
          onClick={nextAction.onClick}
          className={cn(
            'w-full px-4 py-2 rounded-lg font-medium text-sm',
            'bg-gradient-to-r from-violet-500 to-indigo-500 text-white',
            'hover:from-violet-600 hover:to-indigo-600 transition-all'
          )}
        >
          {nextAction.label}
        </button>
      )}

      {/* Expandable Details */}
      {details && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors'
            )}
          >
            <span>{isExpanded ? 'Hide' : 'Show'} detailed analysis</span>
            <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/10">
                  {details}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
