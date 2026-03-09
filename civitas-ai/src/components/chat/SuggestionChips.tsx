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

  let containerClass = "flex flex-wrap gap-2 mt-2";
  if (isGrid) {
    containerClass = "grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-2xl mx-auto w-full px-4";
  } else if (isCarousel) {
    containerClass = "flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 group
                         bg-black/[0.02] border border-black/[0.08] backdrop-blur-sm
                         hover:bg-black/[0.05] hover:border-[#C08B5C]/20 hover:shadow-lg hover:shadow-[#C08B5C]/[0.05]"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-foreground/80 group-hover:text-foreground transition-colors">{label}</div>
                <div className="text-[11px] text-muted-foreground/50 truncate max-w-[220px] mt-0.5">{query}</div>
              </div>
            </motion.button>
          );
        }

        return (
          <motion.button
            key={key}
            onClick={() => onSelect(query)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] transition-all duration-200 whitespace-nowrap
                        bg-black/[0.03] border border-black/[0.08] backdrop-blur-sm
                        hover:bg-black/[0.06] hover:border-[#C08B5C]/20
                        text-muted-foreground hover:text-foreground/80
                        ${isCarousel ? 'flex-shrink-0 snap-start' : ''}`}
          >
            {icon ? (
              <span className="text-sm">{icon}</span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#C08B5C]/40 group-hover:text-[#C08B5C] transition-colors" />
            )}
            <span className="font-medium">{label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
