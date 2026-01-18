/**
 * Intent Chips: Context-aware suggested prompts.
 * 
 * Guides users to structured intents instead of free-form dumping.
 */

import React from 'react';
import { Search, BarChart3, GitCompare, BookOpen, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IntentSuggestion {
  id: string;
  text: string;
  intent: 'search' | 'analyze' | 'compare' | 'learn' | 'refine';
}

interface IntentChipsProps {
  suggestions: IntentSuggestion[];
  onSelectSuggestion: (text: string) => void;
  className?: string;
}

export const IntentChips: React.FC<IntentChipsProps> = ({
  suggestions,
  onSelectSuggestion,
  className,
}) => {
  const getIcon = (intent: IntentSuggestion['intent']) => {
    switch (intent) {
      case 'search':
        return Search;
      case 'analyze':
        return BarChart3;
      case 'compare':
        return GitCompare;
      case 'learn':
        return BookOpen;
      case 'refine':
        return SlidersHorizontal;
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      {suggestions.map((suggestion) => {
        const Icon = getIcon(suggestion.intent);
        
        return (
          <button
            key={suggestion.id}
            onClick={() => onSelectSuggestion(suggestion.text)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md',
              'bg-slate-800 text-sm text-gray-300 border border-white/10',
              'hover:bg-slate-700 hover:border-violet-500/30 hover:text-white',
              'transition-all whitespace-nowrap flex-shrink-0'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{suggestion.text}</span>
          </button>
        );
      })}
    </div>
  );
};

// Helper to generate context-aware suggestions
export const getContextualSuggestions = (
  context: 'empty' | 'properties_shown' | 'analysis_shown' | 'comparison_shown',
  data?: { topProperty?: string; shortlistedCount?: number }
): IntentSuggestion[] => {
  switch (context) {
    case 'empty':
      return [
        { id: '1', text: 'Find properties in Austin under $400k', intent: 'search' },
        { id: '2', text: 'What makes a good rental property?', intent: 'learn' },
        { id: '3', text: 'Explain cap rate', intent: 'learn' },
      ];
    
    case 'properties_shown':
      return [
        data?.topProperty
          ? { id: '1', text: `Analyze ${data.topProperty}`, intent: 'analyze' }
          : { id: '1', text: 'Analyze top property', intent: 'analyze' },
        data?.shortlistedCount && data.shortlistedCount >= 2
          ? { id: '2', text: 'Compare shortlisted properties', intent: 'compare' }
          : { id: '2', text: 'Show me more properties', intent: 'refine' },
        { id: '3', text: 'What are the risks?', intent: 'learn' },
      ];
    
    case 'analysis_shown':
      return [
        { id: '1', text: 'What could go wrong?', intent: 'learn' },
        { id: '2', text: 'Compare to similar properties', intent: 'compare' },
        { id: '3', text: 'I want this one', intent: 'search' },
      ];
    
    case 'comparison_shown':
      return [
        { id: '1', text: 'Which one is best?', intent: 'learn' },
        { id: '2', text: 'Show detailed analysis', intent: 'analyze' },
        { id: '3', text: 'Keep searching', intent: 'search' },
      ];
    
    default:
      return [];
  }
};
