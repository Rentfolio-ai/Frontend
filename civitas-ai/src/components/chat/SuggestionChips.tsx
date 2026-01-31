import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { SuggestionChip } from '../../hooks/useSmartSuggestions';

interface SuggestionChipsProps {
  suggestions: (string | SuggestionChip)[];
  onSelect: (suggestion: string) => void;
  variant?: 'row' | 'grid' | 'carousel';
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSelect,
  variant = 'row'
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  const isGrid = variant === 'grid';
  const isCarousel = variant === 'carousel';

  let containerClass = "flex flex-wrap gap-2 mt-4";
  if (isGrid) {
    containerClass = "grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto w-full px-4";
  } else if (isCarousel) {
    containerClass = "flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={containerClass}
    >
      {suggestions.map((suggestion, index) => {
        const isObject = typeof suggestion !== 'string';
        const label = isObject ? suggestion.label : suggestion;
        const query = isObject ? suggestion.query : suggestion;
        const icon = isObject ? suggestion.icon : null;
        const key = isObject ? suggestion.id : index;

        if (isGrid) {
          return (
            <motion.button
              key={key}
              onClick={() => onSelect(query)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-5 rounded-2xl text-left transition-all group"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid rgba(148,163,184,0.3)',
                boxShadow: '0 4px 16px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.08)',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0FDFA';
                e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,148,136,0.20), 0 6px 16px rgba(13,148,136,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.08)';
              }}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
              <div className="flex-1">
                <div className="font-semibold" style={{ color: '#0F172A' }}>{label}</div>
                <div className="text-xs truncate max-w-[200px]" style={{ color: '#64748B' }}>{query}</div>
              </div>
            </motion.button>
          );
        }

        return (
          <motion.button
            key={key}
            onClick={() => onSelect(query)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`group flex items-center gap-2 px-5 py-3 rounded-full text-sm transition-all whitespace-nowrap ${isCarousel ? 'flex-shrink-0 snap-start' : ''}`}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid rgba(148,163,184,0.3)',
              color: '#1E293B',
              boxShadow: '0 4px 12px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.08)',
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0FDFA';
              e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)';
              e.currentTarget.style.color = '#0D9488';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,148,136,0.20), 0 4px 12px rgba(13,148,136,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)';
              e.currentTarget.style.color = '#1E293B';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.08)';
            }}
          >
            {icon ? (
              <span className="text-base">{icon}</span>
            ) : (
              <Sparkles className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: '#14B8A6' }} />
            )}
            <span>{label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};