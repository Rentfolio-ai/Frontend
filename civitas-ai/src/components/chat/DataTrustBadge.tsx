/**
 * DataTrustBadge — Richer trust indicators for data sources
 *
 * Replaces the basic DataSourceBadge with trust-level awareness:
 * - Official (green shield) — government APIs, county records
 * - Verified (blue check) — paid APIs like RentCast
 * - Community (gray) — scraped listing sites
 * - Web (outline) — general web search results
 *
 * Tooltip shows: source name, last updated, confidence score.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, Users, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrustLevel = 'official' | 'verified' | 'community' | 'web';

interface DataTrustBadgeProps {
  level: TrustLevel;
  sourceName?: string;
  lastUpdated?: string;
  confidence?: number;
  className?: string;
}

const TRUST_CONFIG: Record<
  TrustLevel,
  { icon: React.ReactNode; label: string; colors: string; border: string }
> = {
  official: {
    icon: <Shield className="w-2.5 h-2.5" />,
    label: 'Official',
    colors: 'text-emerald-400 bg-emerald-500/15',
    border: 'border-emerald-500/20',
  },
  verified: {
    icon: <CheckCircle className="w-2.5 h-2.5" />,
    label: 'Verified',
    colors: 'text-blue-400 bg-blue-500/15',
    border: 'border-blue-500/20',
  },
  community: {
    icon: <Users className="w-2.5 h-2.5" />,
    label: 'Community',
    colors: 'text-white/40 bg-white/[0.05]',
    border: 'border-white/[0.08]',
  },
  web: {
    icon: <Globe className="w-2.5 h-2.5" />,
    label: 'Web',
    colors: 'text-white/30 bg-transparent',
    border: 'border-white/[0.08]',
  },
};

export const DataTrustBadge: React.FC<DataTrustBadgeProps> = ({
  level,
  sourceName,
  lastUpdated,
  confidence,
  className,
}) => {
  const [hovered, setHovered] = useState(false);
  const config = TRUST_CONFIG[level];

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border',
          config.colors,
          config.border,
        )}
      >
        {config.icon}
        {config.label}
      </span>

      <AnimatePresence>
        {hovered && (sourceName || lastUpdated || confidence != null) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-3 py-2 rounded-lg bg-black/95 border border-white/15 shadow-xl z-50 min-w-[160px]"
          >
            <div className="text-[10px] space-y-1">
              {sourceName && (
                <div className="text-white/60">
                  <span className="text-white/30">Source: </span>
                  {sourceName}
                </div>
              )}
              {lastUpdated && (
                <div className="text-white/60">
                  <span className="text-white/30">Updated: </span>
                  {lastUpdated}
                </div>
              )}
              {confidence != null && (
                <div className="text-white/60">
                  <span className="text-white/30">Confidence: </span>
                  {Math.round(confidence * 100)}%
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataTrustBadge;
