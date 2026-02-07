import { describe, it, expect, beforeEach } from 'vitest';
import { usePreferencesStore } from '../preferencesStore';

describe('preferencesStore', () => {
  beforeEach(() => {
    // Reset store to defaults between tests
    usePreferencesStore.getState().resetPreferences();
  });

  it('starts with default values', () => {
    const state = usePreferencesStore.getState();
    expect(state.defaultStrategy).toBeNull();
    expect(state.theme).toBe('dark');
    expect(state.accentColor).toBe('teal');
    expect(state.fontSize).toBe('medium');
    expect(state.favoriteMarkets).toEqual([]);
  });

  it('setDefaultStrategy updates strategy', () => {
    usePreferencesStore.getState().setDefaultStrategy('STR');
    expect(usePreferencesStore.getState().defaultStrategy).toBe('STR');
  });

  it('setBudgetRange updates range', () => {
    usePreferencesStore.getState().setBudgetRange(100_000, 500_000);
    const { budgetRange } = usePreferencesStore.getState();
    expect(budgetRange).toEqual({ min: 100_000, max: 500_000 });
  });

  it('toggleFavoriteMarket adds and removes', () => {
    const { toggleFavoriteMarket } = usePreferencesStore.getState();

    toggleFavoriteMarket('Austin, TX');
    expect(usePreferencesStore.getState().favoriteMarkets).toContain('Austin, TX');

    toggleFavoriteMarket('Austin, TX');
    expect(usePreferencesStore.getState().favoriteMarkets).not.toContain('Austin, TX');
  });

  it('addRecentSearch caps at 5', () => {
    const { addRecentSearch } = usePreferencesStore.getState();
    for (let i = 0; i < 7; i++) {
      addRecentSearch(`search-${i}`);
    }
    expect(usePreferencesStore.getState().recentSearches.length).toBe(5);
    expect(usePreferencesStore.getState().recentSearches[0]).toBe('search-6');
  });

  it('setTheme persists value', () => {
    usePreferencesStore.getState().setTheme('light');
    expect(usePreferencesStore.getState().theme).toBe('light');
  });

  it('setAccentColor persists value', () => {
    usePreferencesStore.getState().setAccentColor('violet');
    expect(usePreferencesStore.getState().accentColor).toBe('violet');
  });

  it('resetPreferences restores defaults', () => {
    usePreferencesStore.getState().setDefaultStrategy('FLIP');
    usePreferencesStore.getState().setAccentColor('rose');
    usePreferencesStore.getState().resetPreferences();

    const state = usePreferencesStore.getState();
    expect(state.defaultStrategy).toBeNull();
    expect(state.accentColor).toBe('teal');
  });
});
