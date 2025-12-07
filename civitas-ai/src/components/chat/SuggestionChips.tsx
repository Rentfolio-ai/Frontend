import React from 'react';
import type { SuggestionChip } from '../../hooks/useSmartSuggestions';
import { cn } from '../../lib/utils';


interface SuggestionChipsProps {
  suggestions: SuggestionChip[];
  onSelect: (query: string) => void;
  variant?: 'grid' | 'carousel'; // grid for empty state, carousel for chat
  className?: string;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSelect,
  variant = 'carousel',
  className
}) => {
  if (suggestions.length === 0) return null;

  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mx-auto", className)}>
        {suggestions.map((chip, index) => (
          <button
            key={chip.id}
            onClick={() => onSelect(chip.query)}
            className="group relative px-5 py-4 rounded-xl glass-card hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 animate-slide-up text-left"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5">
                {chip.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors mb-1">
                  {chip.label}
                </div>
                {/* We can hide query or show it as description if needed, for grid we usually want description but query is fine for now as a fallback or we add description to type */}
              </div>
              <svg
                className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Carousel / Floating variant
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right px-4 md:px-0", className)}>
      <div className="flex items-center gap-2 mx-auto md:mx-0">
        {suggestions.map((chip, index) => (
          <button
            key={chip.id}
            onClick={() => onSelect(chip.query)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap animate-in fade-in zoom-in slide-in-from-bottom-2",
              // Style variants based on category
              chip.category === 'analysis'
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30"
                : chip.category === 'action'
                  ? "bg-primary/10 border-primary/20 text-primary-300 hover:bg-primary/20 hover:border-primary/30"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-sm">{chip.icon}</span>
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};