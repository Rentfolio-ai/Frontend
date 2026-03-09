// FILE: src/components/chat/CitationBadge.tsx
/**
 * Citation Badge Component - Like Perplexity
 * 
 * Shows inline citation numbers [1], [2], etc. that link to sources
 * Hover shows preview, click opens source
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, FileText, Globe, Database, BookOpen } from 'lucide-react';

export interface Citation {
  id: number;
  title: string;
  url?: string;
  source: string; // "web", "document", "database", "knowledge_base"
  snippet?: string;
  publishedDate?: string;
  favicon?: string;
}

interface CitationBadgeProps {
  citation: Citation;
  onClick?: (citation: Citation) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  citation,
  onClick,
  size = 'sm',
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getSourceIcon = () => {
    switch (citation.source) {
      case 'web':
        return <Globe className="w-3 h-3" />;
      case 'document':
        return <FileText className="w-3 h-3" />;
      case 'database':
        return <Database className="w-3 h-3" />;
      case 'knowledge_base':
        return <BookOpen className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    }
    onClick?.(citation);
  };
  
  const sizeClasses = size === 'sm' 
    ? 'text-[10px] w-5 h-5 min-w-[20px]' 
    : 'text-xs w-6 h-6 min-w-[24px]';
  
  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Citation Number Badge */}
      <motion.button
        onClick={handleClick}
        className={`
          ${sizeClasses}
          inline-flex items-center justify-center
          rounded bg-blue-500/20 text-blue-400 
          border border-blue-500/30
          hover:bg-blue-500/30 hover:border-blue-500/50
          transition-all cursor-pointer
          font-bold
          mx-0.5
          relative
          ${citation.url ? 'hover:scale-110' : ''}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {citation.id}
        
        {/* External link indicator */}
        {citation.url && (
          <ExternalLink className="absolute -top-0.5 -right-0.5 w-2 h-2 text-blue-400 opacity-0 group-hover:opacity-100" />
        )}
      </motion.button>
      
      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            <div className="min-w-[280px] max-w-[400px] p-3 rounded-lg bg-black/95 backdrop-blur-xl border border-black/12 shadow-2xl">
              {/* Source info */}
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-shrink-0 w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 mt-0.5">
                  {getSourceIcon()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground line-clamp-2">
                    {citation.title}
                  </div>
                  
                  {citation.url && (
                    <div className="text-[10px] text-blue-400 truncate mt-0.5 flex items-center gap-1">
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
                </div>
              </div>
              
              {/* Snippet */}
              {citation.snippet && (
                <div className="text-[11px] text-foreground/70 line-clamp-3 leading-relaxed">
                  {citation.snippet}
                </div>
              )}
              
              {/* Date */}
              {citation.publishedDate && (
                <div className="text-[10px] text-muted-foreground/70 mt-2">
                  {new Date(citation.publishedDate).toLocaleDateString()}
                </div>
              )}
              
              {/* Click hint */}
              {citation.url && (
                <div className="text-[10px] text-blue-400/70 mt-2 flex items-center gap-1">
                  <ExternalLink className="w-2.5 h-2.5" />
                  Click to open
                </div>
              )}
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-l border-b border-black/12 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
