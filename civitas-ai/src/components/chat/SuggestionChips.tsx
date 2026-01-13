import React from 'react';
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
  variant = 'grid' // Default to grid for professional look
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  const isGrid = variant === 'grid' || variant === 'carousel'; // Treat carousel as grid

  const containerClass = isGrid
    ? "grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto w-full px-4"
    : "flex flex-wrap gap-2 mt-4";

  return (
    <div className={containerClass}>
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
              className="flex items-center gap-3 p-4 text-left transition-colors"
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-emphasis)';
                e.currentTarget.style.background = 'var(--gradient-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              }}
            >
              <span className="text-2xl flex-shrink-0" style={{ color: 'var(--color-accent-teal-400)' }}>{icon || '✨'}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</div>
                <div className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{query}</div>
              </div>
            </button>
          );
        }

        // Row variant (simple chips)
        return (
          <button
            key={key}
            onClick={() => onSelect(query)}
            className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
            style={{
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-emphasis)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {icon ? (
              <span className="text-base">{icon}</span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 transition-opacity" style={{ color: 'var(--color-accent-teal-400)' }} />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};