// FILE: src/components/chat/SuggestionChips.tsx
import React from 'react';
import { Button } from '../primitives/Button';

interface SuggestionChip {
  id: string;
  label: string;
  icon?: string;
}

interface SuggestionChipsProps {
  suggestions: SuggestionChip[];
  onSuggestionClick: (suggestion: SuggestionChip) => void;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map(suggestion => (
        <Button
          key={suggestion.id}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClick(suggestion)}
          className="text-sm gap-2"
        >
          {suggestion.icon && (
            <span className="text-base">{suggestion.icon}</span>
          )}
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
};