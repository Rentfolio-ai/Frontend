// FILE: src/components/chat/GroundingSources.tsx
/**
 * Display grounding sources (listings + web) with citations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Home, Globe } from 'lucide-react';
import type { GroundingSource } from '@/types/stream';

interface GroundingSourcesProps {
  sources: GroundingSource[];
  className?: string;
}

export const GroundingSources: React.FC<GroundingSourcesProps> = ({
  sources,
  className = '',
}) => {
  if (!sources || sources.length === 0) return null;

  const listingSources = sources.filter(s => s.type === 'listing');
  const webSources = sources.filter(s => s.type === 'web');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-3 ${className}`}
    >
      {/* Listings Section */}
      {listingSources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Home className="w-4 h-4" />
            <span>Listings Referenced ({listingSources.length})</span>
          </div>
          <div className="grid gap-2">
            {listingSources.map((source, idx) => (
              <div
                key={source.id || idx}
                className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-violet-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {source.title}
                    </div>
                    {source.price && (
                      <div className="text-xs text-emerald-400 font-semibold mt-1">
                        ${source.price.toLocaleString()}
                      </div>
                    )}
                    {(source.beds || source.baths) && (
                      <div className="text-xs text-white/50 mt-1">
                        {source.beds}bd / {source.baths}ba
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-white/40 flex-shrink-0">
                    [{idx + 1}]
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Web Sources Section */}
      {webSources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Globe className="w-4 h-4" />
            <span>Web Sources ({webSources.length})</span>
          </div>
          <div className="grid gap-2">
            {webSources.map((source, idx) => (
              <a
                key={source.url || idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-blue-500/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {source.title}
                    </div>
                    {source.snippet && (
                      <div className="text-xs text-white/50 mt-1 line-clamp-2">
                        {source.snippet}
                      </div>
                    )}
                    {source.url && (
                      <div className="text-xs text-white/30 mt-1 truncate">
                        {new URL(source.url).hostname}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-xs text-white/40">
                      [{listingSources.length + idx + 1}]
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
