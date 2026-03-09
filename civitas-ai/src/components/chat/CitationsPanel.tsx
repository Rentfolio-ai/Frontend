// FILE: src/components/chat/CitationsPanel.tsx
/**
 * Citations Panel - Like Perplexity's source list
 * 
 * Shows all citations at the bottom of AI response with links
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, FileText, Database, BookOpen, 
  ExternalLink, ChevronDown, ChevronUp 
} from 'lucide-react';
import type { Citation } from './CitationBadge';

interface CitationsPanelProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const CitationsPanel: React.FC<CitationsPanelProps> = ({
  citations,
  onCitationClick,
  className = '',
  collapsible = true,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  if (citations.length === 0) return null;
  
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'web':
        return <Globe className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'knowledge_base':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  
  const handleCitationClick = (citation: Citation) => {
    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    }
    onCitationClick?.(citation);
  };
  
  return (
    <div className={`mt-4 ${className}`}>
      {/* Header */}
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/5 hover:bg-black/8 transition-colors text-sm text-foreground/70 font-medium"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Sources ({citations.length})
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      ) : (
        <div className="px-3 py-2 text-xs text-muted-foreground font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Sources ({citations.length})
        </div>
      )}
      
      {/* Citations List */}
      {(isExpanded || !collapsible) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 gap-2 mt-2"
        >
          {citations.map((citation) => (
            <motion.button
              key={citation.id}
              onClick={() => handleCitationClick(citation)}
              className="flex items-start gap-3 p-3 rounded-lg bg-black/5 hover:bg-black/8 border border-black/8 hover:border-black/12 transition-all text-left group"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Citation number */}
              <div className="flex-shrink-0 w-6 h-6 rounded bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center border border-blue-500/30">
                {citation.id}
              </div>
              
              {/* Icon */}
              <div className="flex-shrink-0 text-muted-foreground mt-0.5">
                {getSourceIcon(citation.source)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground font-medium line-clamp-2 group-hover:text-foreground transition-colors">
                  {citation.title}
                </div>
                
                {citation.url && (
                  <div className="text-xs text-blue-400 truncate mt-1 flex items-center gap-1">
                    {citation.favicon && (
                      <img 
                        src={citation.favicon} 
                        alt="" 
                        className="w-3 h-3 rounded"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    )}
                    {new URL(citation.url).hostname}
                  </div>
                )}
                
                {citation.snippet && (
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                    {citation.snippet}
                  </div>
                )}
              </div>
              
              {/* External link icon */}
              {citation.url && (
                <div className="flex-shrink-0 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4" />
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};
