// FILE: src/types/bookmarks.ts
// Type definitions for property bookmarks

import type { ScoutedProperty } from './backendTools';

export type DealStatus = 'active' | 'under_contract' | 'closed' | 'lost';

export interface BookmarkedProperty {
  property: ScoutedProperty;

  id: string;
  bookmarkedAt: string;
  lastUpdatedAt: string;

  notes?: string;
  tags?: string[];

  displayName: string;
  searchQuery?: string;

  dealStatus?: DealStatus;
  dealClosedAt?: string;
}

export interface PropertyBookmarksState {
  bookmarks: BookmarkedProperty[];
  lastSyncedAt?: string;
}

