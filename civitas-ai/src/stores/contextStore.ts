// FILE: src/stores/contextStore.ts
// Zustand store for managing @-mention contexts

import { create } from 'zustand';
import Fuse from 'fuse.js';
import type { ContextItem, GroupedContexts } from '../types/context';

const RECENT_CONTEXTS_KEY = 'civitas-recent-contexts';
const MAX_RECENT_CONTEXTS = 10;

interface ContextStore {
  /** All available contexts */
  availableContexts: ContextItem[];
  
  /** Recently used contexts */
  recentContexts: ContextItem[];
  
  /** Set all available contexts */
  setAvailableContexts: (contexts: ContextItem[]) => void;
  
  /** Add a single context to available contexts */
  addContext: (context: ContextItem) => void;
  
  /** Remove a context by ID */
  removeContext: (contextId: string) => void;
  
  /** Add a context to recent contexts */
  addRecentContext: (context: ContextItem) => void;
  
  /** Clear recent contexts */
  clearRecentContexts: () => void;
  
  /** Search contexts with fuzzy matching */
  searchContexts: (query: string) => ContextItem[];
  
  /** Get contexts grouped by type */
  getGroupedContexts: (contexts: ContextItem[]) => GroupedContexts[];
  
  /** Load recent contexts from localStorage */
  loadRecentContexts: () => void;
  
  /** Get contexts by type */
  getContextsByType: (type: ContextItem['type']) => ContextItem[];
}

/**
 * Fuse.js configuration for fuzzy search
 */
const fuseOptions = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'subtitle', weight: 1.5 },
    { name: 'preview', weight: 1 },
    { name: 'metadata.address', weight: 1.5 },
    { name: 'metadata.fileName', weight: 1.5 },
  ],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 1,
  includeScore: true,
};

/**
 * Group contexts by type with labels
 */
const groupByType = (contexts: ContextItem[]): GroupedContexts[] => {
  const groups: Record<string, ContextItem[]> = {
    page: [],
    property: [],
    file: [],
    report: [],
    custom: [],
  };

  contexts.forEach(context => {
    if (groups[context.type]) {
      groups[context.type].push(context);
    }
  });

  const result: GroupedContexts[] = [];

  if (groups.page.length > 0) {
    result.push({ label: 'CONVERSATIONS', contexts: groups.page });
  }
  if (groups.property.length > 0) {
    result.push({ label: 'PROPERTIES', contexts: groups.property });
  }
  if (groups.file.length > 0) {
    result.push({ label: 'FILES', contexts: groups.file });
  }
  if (groups.report.length > 0) {
    result.push({ label: 'REPORTS', contexts: groups.report });
  }
  if (groups.custom.length > 0) {
    result.push({ label: 'OTHER', contexts: groups.custom });
  }

  return result;
};

/**
 * Load recent contexts from localStorage
 */
const loadFromStorage = (): ContextItem[] => {
  try {
    const stored = localStorage.getItem(RECENT_CONTEXTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load recent contexts from localStorage:', error);
  }
  return [];
};

/**
 * Save recent contexts to localStorage
 */
const saveToStorage = (contexts: ContextItem[]) => {
  try {
    localStorage.setItem(RECENT_CONTEXTS_KEY, JSON.stringify(contexts));
  } catch (error) {
    console.error('Failed to save recent contexts to localStorage:', error);
  }
};

export const useContextStore = create<ContextStore>((set, get) => ({
  availableContexts: [],
  recentContexts: loadFromStorage(),

  setAvailableContexts: (contexts) => {
    set({ availableContexts: contexts });
  },

  addContext: (context) => {
    set((state) => {
      // Check if context already exists
      const exists = state.availableContexts.some(c => c.id === context.id);
      if (exists) return state;

      return {
        availableContexts: [...state.availableContexts, context],
      };
    });
  },

  removeContext: (contextId) => {
    set((state) => ({
      availableContexts: state.availableContexts.filter(c => c.id !== contextId),
    }));
  },

  addRecentContext: (context) => {
    set((state) => {
      // Remove if already exists
      const filtered = state.recentContexts.filter(c => c.id !== context.id);
      
      // Add to front and limit to MAX_RECENT_CONTEXTS
      const updated = [context, ...filtered].slice(0, MAX_RECENT_CONTEXTS);
      
      // Save to localStorage
      saveToStorage(updated);
      
      return { recentContexts: updated };
    });
  },

  clearRecentContexts: () => {
    set({ recentContexts: [] });
    localStorage.removeItem(RECENT_CONTEXTS_KEY);
  },

  searchContexts: (query) => {
    const { availableContexts } = get();
    
    if (!query.trim()) {
      // Return recent contexts if no query
      return get().recentContexts;
    }

    // Use Fuse.js for fuzzy search
    const fuse = new Fuse(availableContexts, fuseOptions);
    const results = fuse.search(query);
    
    return results.map(result => result.item);
  },

  getGroupedContexts: (contexts) => {
    return groupByType(contexts);
  },

  loadRecentContexts: () => {
    const recent = loadFromStorage();
    set({ recentContexts: recent });
  },

  getContextsByType: (type) => {
    return get().availableContexts.filter(c => c.type === type);
  },
}));

/**
 * Hook to populate contexts from various sources
 */
export const usePopulateContexts = () => {
  const { setAvailableContexts } = useContextStore();
  
  const populateFromSources = (sources: {
    chatHistory?: any[];
    properties?: any[];
    files?: any[];
    reports?: any[];
    custom?: any[];
  }) => {
    const contexts: ContextItem[] = [];

    // Convert chat history to page contexts
    if (sources.chatHistory) {
      sources.chatHistory.forEach(chat => {
        contexts.push({
          id: `page-${chat.id}`,
          type: 'page',
          title: chat.title || 'Untitled Chat',
          subtitle: chat.messages?.[0]?.content?.substring(0, 60) + '...',
          icon: '💬',
          timestamp: chat.timestamp || chat.createdAt,
          metadata: {
            chatId: chat.id,
            messageCount: chat.messages?.length || 0,
            isPinned: chat.isPinned,
            isArchived: chat.isArchived,
          },
        });
      });
    }

    // Convert properties to property contexts
    if (sources.properties) {
      sources.properties.forEach(property => {
        contexts.push({
          id: `property-${property.listing_id || property.address}`,
          type: 'property',
          title: property.address,
          subtitle: property.price ? `$${property.price.toLocaleString()}` : undefined,
          icon: '🏠',
          timestamp: property.timestamp,
          metadata: {
            address: property.address,
            price: property.price,
            propertyId: property.id,
            listingId: property.listing_id,
          },
        });
      });
    }

    // Convert files to file contexts
    if (sources.files) {
      sources.files.forEach(file => {
        contexts.push({
          id: `file-${file.name}-${file.timestamp}`,
          type: 'file',
          title: file.name,
          subtitle: `${(file.size / 1024).toFixed(1)} KB`,
          icon: '📎',
          timestamp: file.timestamp,
          metadata: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            url: file.url,
          },
        });
      });
    }

    // Convert reports to report contexts
    if (sources.reports) {
      sources.reports.forEach(report => {
        contexts.push({
          id: `report-${report.id}`,
          type: 'report',
          title: report.title,
          subtitle: report.description,
          icon: '📊',
          timestamp: report.generatedAt,
          metadata: {
            reportType: report.type,
            generatedAt: report.generatedAt,
            properties: report.properties,
          },
        });
      });
    }

    // Add custom contexts
    if (sources.custom) {
      sources.custom.forEach(custom => {
        contexts.push({
          id: `custom-${custom.id}`,
          type: 'custom',
          title: custom.title,
          subtitle: custom.subtitle,
          icon: custom.icon || '⚙️',
          timestamp: custom.timestamp,
          metadata: custom.metadata,
        });
      });
    }

    setAvailableContexts(contexts);
  };

  return { populateFromSources };
};
