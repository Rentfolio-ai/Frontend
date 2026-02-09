// FILE: src/hooks/useThemeState.ts
//
// State theme colors (visual accent per US state).
// Theme toggling is now handled by useAppearance hook.
// This hook is kept for backward compatibility with state-based color theming.

import { useState, useEffect } from 'react';

// State theme colors
const STATE_THEMES = {
  'California': { primary: '#F59E0B', secondary: '#FBBF24', gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' },
  'Texas': { primary: '#DC2626', secondary: '#EF4444', gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' },
  'Florida': { primary: '#06B6D4', secondary: '#22D3EE', gradient: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)' },
  'New York': { primary: '#6366F1', secondary: '#818CF8', gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)' },
  'Colorado': { primary: '#10B981', secondary: '#34D399', gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' },
  'Tennessee': { primary: '#8B5CF6', secondary: '#A78BFA', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' },
  'Arizona': { primary: '#EF4444', secondary: '#F87171', gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)' },
  'Georgia': { primary: '#F97316', secondary: '#FB923C', gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)' },
  'Nevada': { primary: '#EC4899', secondary: '#F472B6', gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)' },
};

const DEFAULT_THEME = { primary: '#3b82f6', secondary: '#2563eb', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' };

export type StateTheme = keyof typeof STATE_THEMES;

export function useThemeState() {
  const [selectedState, setSelectedState] = useState<string>(() => {
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem('civitas-selected-state')
      : null;
    return saved || '';
  });

  useEffect(() => {
    if (selectedState) {
      window.localStorage.setItem('civitas-selected-state', selectedState);
    }
  }, [selectedState]);

  const currentTheme = selectedState && STATE_THEMES[selectedState as StateTheme]
    ? STATE_THEMES[selectedState as StateTheme]
    : DEFAULT_THEME;

  return {
    selectedState,
    setSelectedState,
    currentTheme,
    STATE_THEMES,
    DEFAULT_THEME
  };
}
