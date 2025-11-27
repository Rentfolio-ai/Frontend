// FILE: src/types/bookmarks.ts
// Type definitions for property bookmarks

import type { ScoutedProperty } from './backendTools';

export interface BookmarkedProperty {
  // Core property data from scout
  property: ScoutedProperty;
  
  // Bookmark metadata
  id: string; // Unique bookmark ID
  bookmarkedAt: string; // ISO timestamp
  lastUpdatedAt: string; // ISO timestamp of last data refresh
  
  // User-added context
  notes?: string;
  tags?: string[];
  
  // Quick reference fields for display
  displayName: string; // e.g., "123 Main St, Austin"
  searchQuery?: string; // Original search that found this property
}

export interface PropertyBookmarksState {
  bookmarks: BookmarkedProperty[];
  lastSyncedAt?: string;
}

