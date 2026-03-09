/**
 * KnowledgePanel — Structured panel for policy/regulatory/research data
 *
 * Collapsible accordion sections, key-value tables, source attribution,
 * trust level badges, and direct links to source documents.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink, Shield, CheckCircle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTrustBadge, type TrustLevel } from '../DataTrustBadge';

export interface KnowledgeSection {
  heading: string;
  content?: string;
  keyValues?: { key: string; value: string }[];
}

export interface KnowledgePanelData {
  title: string;
  sections: KnowledgeSection[];
  sourceUrl?: string;
  sourceName?: string;
  trustLevel?: TrustLevel;
  lastVerified?: string;
}

interface KnowledgePanelProps {
  data: KnowledgePanelData;
  className?: string;
}

export const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ data, className }) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-black/[0.08] bg-black/[0.02] overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
        <h3 className="text-[13px] font-semibold text-foreground/70">{data.title}</h3>
        <div className="flex items-center gap-2">
          {data.trustLevel && <DataTrustBadge level={data.trustLevel} />}
          {data.lastVerified && (
            <span className="text-[10px] text-muted-foreground/50">Verified {data.lastVerified}</span>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-black/[0.04]">
        {data.sections.map((section, idx) => {
          const isOpen = expandedSections.has(idx);
          return (
            <div key={idx}>
              <button
                onClick={() => toggleSection(idx)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-black/[0.02] transition-colors"
              >
                <motion.span
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-muted-foreground/50 flex-shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.span>
                <span className="text-[12px] font-medium text-muted-foreground/70">{section.heading}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 pl-9">
                      {section.content && (
                        <p className="text-[12px] leading-relaxed text-muted-foreground/70 mb-2">
                          {section.content}
                        </p>
                      )}
                      {section.keyValues && section.keyValues.length > 0 && (
                        <div className="rounded-lg border border-black/[0.04] overflow-hidden">
                          {section.keyValues.map((kv, ki) => (
                            <div
                              key={ki}
                              className={cn(
                                'flex items-center justify-between px-3 py-1.5 text-[11px]',
                                ki % 2 === 0 ? 'bg-black/[0.01]' : '',
                              )}
                            >
                              <span className="text-muted-foreground/70">{kv.key}</span>
                              <span className="text-muted-foreground/80 font-medium">{kv.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Source footer */}
      {data.sourceUrl && (
        <div className="px-4 py-2.5 border-t border-black/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/50">
            Source: {data.sourceName || 'External'}
          </span>
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-[#C08B5C]/60 hover:text-[#C08B5C] transition-colors"
          >
            View source <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </div>
  );
};

export default KnowledgePanel;
