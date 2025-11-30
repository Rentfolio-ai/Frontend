// FILE: src/hooks/usePropertyBookmarks.ts
// Hook for managing property bookmarks with localStorage persistence

import { useState, useEffect, useCallback } from 'react';
import type { BookmarkedProperty, PropertyBookmarksState } from '@/types/bookmarks';
import type { ScoutedProperty } from '@/types/backendTools';

const STORAGE_KEY = 'civitas-property-bookmarks';

function generateBookmarkId(property: ScoutedProperty): string {
  // Use listing_id if available, otherwise create from address
  return property.listing_id || `bm-${property.address.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
}

function createDisplayName(property: ScoutedProperty): string {
  const parts = [property.address];
  if (property.city) parts.push(property.city);
  return parts.join(', ');
}

function loadBookmarks(): PropertyBookmarksState {
  if (typeof window === 'undefined') {
    return { bookmarks: [] };
  }
  
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { bookmarks: [] };
    
    const parsed = JSON.parse(stored);
    
    // Validate and filter bookmarks - ensure no hardcoded/test data
    const bookmarks = Array.isArray(parsed.bookmarks) 
      ? parsed.bookmarks.filter((bm: any) => {
          // Only include valid bookmarks with required fields
          return bm && 
                 bm.id && 
                 bm.property && 
                 bm.property.address &&
                 bm.bookmarkedAt &&
                 bm.displayName;
        })
      : [];
    
    return {
      bookmarks,
      lastSyncedAt: parsed.lastSyncedAt,
    };
  } catch (error) {
    console.error('[usePropertyBookmarks] Failed to load bookmarks:', error);
    // Clear corrupted data
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return { bookmarks: [] };
  }
}

function saveBookmarks(state: PropertyBookmarksState): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[usePropertyBookmarks] Failed to save bookmarks:', error);
  }
}

export interface UsePropertyBookmarksReturn {
  bookmarks: BookmarkedProperty[];
  
  // Actions
  addBookmark: (property: ScoutedProperty, searchQuery?: string) => BookmarkedProperty;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<Pick<BookmarkedProperty, 'notes' | 'tags'>>) => void;
  updatePropertyData: (id: string, property: ScoutedProperty) => void;
  
  // Queries
  isBookmarked: (property: ScoutedProperty) => boolean;
  getBookmarkByAddress: (address: string) => BookmarkedProperty | undefined;
  getBookmarkById: (id: string) => BookmarkedProperty | undefined;
  findMatchingBookmark: (property: ScoutedProperty) => BookmarkedProperty | undefined;
  
  // Bulk operations
  clearAllBookmarks: () => void;
}

export function usePropertyBookmarks(): UsePropertyBookmarksReturn {
  const [state, setState] = useState<PropertyBookmarksState>(loadBookmarks);
  
  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveBookmarks(state);
  }, [state]);
  
  const addBookmark = useCallback((property: ScoutedProperty, searchQuery?: string): BookmarkedProperty => {
    console.log('[usePropertyBookmarks] addBookmark called', { property, searchQuery });
    const now = new Date().toISOString();
    const bookmark: BookmarkedProperty = {
      id: generateBookmarkId(property),
      property,
      bookmarkedAt: now,
      lastUpdatedAt: now,
      displayName: createDisplayName(property),
      searchQuery,
    };
    
    console.log('[usePropertyBookmarks] Created bookmark:', bookmark);
    
    setState(prev => {
      const newState = {
        ...prev,
        bookmarks: [bookmark, ...prev.bookmarks],
        lastSyncedAt: now,
      };
      console.log('[usePropertyBookmarks] New state:', newState);
      return newState;
    });
    
    return bookmark;
  }, []);
  
  const removeBookmark = useCallback((id: string) => {
    console.log('[usePropertyBookmarks] removeBookmark called', { id });
    setState(prev => {
      const filtered = prev.bookmarks.filter(b => b.id !== id);
      const newState = {
        ...prev,
        bookmarks: filtered,
        lastSyncedAt: new Date().toISOString(),
      };
      console.log('[usePropertyBookmarks] Removed bookmark, new state:', newState);
      return newState;
    });
  }, []);
  
  const updateBookmark = useCallback((id: string, updates: Partial<Pick<BookmarkedProperty, 'notes' | 'tags'>>) => {
    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b =>
        b.id === id ? { ...b, ...updates } : b
      ),
      lastSyncedAt: new Date().toISOString(),
    }));
  }, []);
  
  const updatePropertyData = useCallback((id: string, property: ScoutedProperty) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b =>
        b.id === id
          ? {
              ...b,
              property,
              lastUpdatedAt: now,
              displayName: createDisplayName(property),
            }
          : b
      ),
      lastSyncedAt: now,
    }));
  }, []);
  
  const isBookmarked = useCallback((property: ScoutedProperty): boolean => {
    return state.bookmarks.some(b => 
      b.property.listing_id === property.listing_id ||
      b.property.address.toLowerCase() === property.address.toLowerCase()
    );
  }, [state.bookmarks]);
  
  const getBookmarkByAddress = useCallback((address: string): BookmarkedProperty | undefined => {
    const normalizedAddress = address.toLowerCase().trim();
    return state.bookmarks.find(b => 
      b.property.address.toLowerCase().includes(normalizedAddress) ||
      normalizedAddress.includes(b.property.address.toLowerCase())
    );
  }, [state.bookmarks]);
  
  const getBookmarkById = useCallback((id: string): BookmarkedProperty | undefined => {
    return state.bookmarks.find(b => b.id === id);
  }, [state.bookmarks]);
  
  const findMatchingBookmark = useCallback((property: ScoutedProperty): BookmarkedProperty | undefined => {
    // First try exact listing_id match
    const byListingId = state.bookmarks.find(b => 
      b.property.listing_id && b.property.listing_id === property.listing_id
    );
    if (byListingId) return byListingId;
    
    // Fall back to address match
    return state.bookmarks.find(b => 
      b.property.address.toLowerCase() === property.address.toLowerCase()
    );
  }, [state.bookmarks]);
  
  const clearAllBookmarks = useCallback(() => {
    setState({ bookmarks: [], lastSyncedAt: new Date().toISOString() });
  }, []);
  
  return {
    bookmarks: state.bookmarks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    updatePropertyData,
    isBookmarked,
    getBookmarkByAddress,
    getBookmarkById,
    findMatchingBookmark,
    clearAllBookmarks,
  };
}

