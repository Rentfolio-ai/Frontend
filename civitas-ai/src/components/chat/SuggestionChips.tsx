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
            <button
              key={key}
              onClick={() => onSelect(query)}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
              <div className="flex-1">
                <div className="font-medium text-white/90">{label}</div>
                <div className="text-xs text-white/50 truncate max-w-[200px]">{query}</div>
              </div>
            </button>
          );
        }

        return (
          <button
            key={key}
            onClick={() => onSelect(query)}
            className={isCarousel
              ? "flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-sm text-white/80 transition-all hover:scale-[1.02] active:scale-[0.98] group whitespace-nowrap"
              : "group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-sm text-white/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
            }
          >
            {icon ? (
              <span className="text-base">{icon}</span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </motion.div>
  );
};