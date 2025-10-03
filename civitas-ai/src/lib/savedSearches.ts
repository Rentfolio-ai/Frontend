// FILE: src/lib/savedSearches.ts
import type { PropertySearchFilters } from '../../../types';

export interface SavedSearch {
  id: string;
  name: string;
  query?: string;
  filters: PropertySearchFilters;
  createdAt: Date;
  resultsCount?: number;
  lastUsed?: Date;
}

const STORAGE_KEY = 'civitas-saved-searches';

export class SavedSearchManager {
  /**
   * Get all saved searches
   */
  static getAll(): SavedSearch[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const searches = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return searches.map((search: any) => ({
        ...search,
        createdAt: new Date(search.createdAt),
        lastUsed: search.lastUsed ? new Date(search.lastUsed) : undefined
      }));
    } catch (error) {
      console.error('Error loading saved searches:', error);
      return [];
    }
  }

  /**
   * Save a new search
   */
  static save(search: Omit<SavedSearch, 'id' | 'createdAt'>): SavedSearch {
    try {
      // Generate a unique ID using crypto.randomUUID() if available, with fallback
      const generateId = (): string => {
        // Use crypto.randomUUID() if available (modern browsers)
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return `saved-search-${crypto.randomUUID()}`;
        }
        // Fallback for environments without crypto.randomUUID()
        return `saved-search-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      };
      
      const newSearch: SavedSearch = {
        ...search,
        id: generateId(),
        createdAt: new Date()
      };

      const existingSearches = this.getAll();
      const updatedSearches = [newSearch, ...existingSearches];

      // Limit to 50 saved searches to prevent storage overflow
      const limitedSearches = updatedSearches.slice(0, 50);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSearches));
      
      return newSearch;
    } catch (error) {
      console.error('Error saving search:', error);
      throw new Error('Failed to save search');
    }
  }

  /**
   * Delete a saved search
   */
  static delete(id: string): void {
    try {
      const searches = this.getAll();
      const updatedSearches = searches.filter(search => search.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error deleting search:', error);
      throw new Error('Failed to delete search');
    }
  }

  /**
   * Update a saved search (e.g., update last used time)
   */
  static update(id: string, updates: Partial<SavedSearch>): SavedSearch {
    try {
      const searches = this.getAll();
      const searchIndex = searches.findIndex(search => search.id === id);
      
      if (searchIndex === -1) {
        throw new Error('Search not found');
      }
      
      // Create a safe copy of updates by stripping immutable fields
      const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
      
      // Create a new merged object, preserving original immutable fields
      const updatedSearch = {
        ...searches[searchIndex],
        ...safeUpdates
      };

      // Update the array with the new object
      searches[searchIndex] = updatedSearch;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
      
      return updatedSearch;
    } catch (error) {
      console.error('Error updating search:', error);
      throw new Error('Failed to update search');
    }
  }

  /**
   * Mark a search as used (updates lastUsed timestamp)
   */
  static markAsUsed(id: string): void {
    try {
      this.update(id, { lastUsed: new Date() });
    } catch (error) {
      console.error('Error marking search as used:', error);
      // We silently fail here since this is a non-critical operation
    }
  }

  /**
   * Get recently used searches (last 5)
   */
  static getRecentlyUsed(limit: number = 5): SavedSearch[] {
    const searches = this.getAll();
    return searches
      .filter(search => search.lastUsed)
      .sort((a, b) => (b.lastUsed!.getTime() - a.lastUsed!.getTime()))
      .slice(0, limit);
  }

  /**
   * Search within saved searches by name
   */
  static search(query: string): SavedSearch[] {
    const searches = this.getAll();
    const lowercaseQuery = query.toLowerCase();
    
    return searches.filter(search =>
      search.name.toLowerCase().includes(lowercaseQuery) ||
      search.query?.toLowerCase().includes(lowercaseQuery) ||
      search.filters.location?.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Check if current search criteria already exists
   */
  static findSimilar(query?: string, filters?: PropertySearchFilters): SavedSearch[] {
    const searches = this.getAll();
    
    return searches.filter(search => {
      // Check if queries match
      if (query && search.query) {
        if (search.query.toLowerCase() === query.toLowerCase()) return true;
      }
      
      // Check if filters are similar
      if (filters && search.filters) {
        let matchScore = 0;
        let totalChecks = 0;
        
        // Compare key filter properties
        const comparisons = [
          { key: 'location', weight: 3 },
          { key: 'propertyType', weight: 2 },
          { key: 'minPrice', weight: 2 },
          { key: 'maxPrice', weight: 2 },
          { key: 'beds', weight: 1 },
          { key: 'baths', weight: 1 }
        ];
        
        for (const { key, weight } of comparisons) {
          const filterValue = filters[key as keyof PropertySearchFilters];
          const searchValue = search.filters[key as keyof PropertySearchFilters];
          
          if (filterValue !== undefined || searchValue !== undefined) {
            totalChecks += weight;
            if (filterValue === searchValue) {
              matchScore += weight;
            }
          }
        }
        
        // Consider it similar if 70% of criteria match
        if (totalChecks > 0 && (matchScore / totalChecks) >= 0.7) {
          return true;
        }
      }
      
      return false;
    });
  }

  /**
   * Get statistics about saved searches
   */
  static getStats(): {
    total: number;
    recentlyUsed: number;
    oldestDate: Date | null;
    newestDate: Date | null;
  } {
    const searches = this.getAll();
    
    if (searches.length === 0) {
      return {
        total: 0,
        recentlyUsed: 0,
        oldestDate: null,
        newestDate: null
      };
    }
    
    const recentlyUsed = searches.filter(search => 
      search.lastUsed && 
      (Date.now() - search.lastUsed.getTime()) < (7 * 24 * 60 * 60 * 1000) // Last 7 days
    ).length;
    
    const dates = searches.map(search => search.createdAt);
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return {
      total: searches.length,
      recentlyUsed,
      oldestDate,
      newestDate
    };
  }

  /**
   * Export saved searches as JSON
   */
  static exportSearches(): string {
    const searches = this.getAll();
    return JSON.stringify(searches, null, 2);
  }

  /**
   * Import saved searches from JSON
   */
  static importSearches(jsonData: string): boolean {
    try {
      const importedSearches = JSON.parse(jsonData);
      
      // Validate the structure
      if (!Array.isArray(importedSearches)) {
        throw new Error('Invalid format: expected array');
      }
      
      // Get existing searches to merge with imports
      const existingSearches = this.getAll();
      const existingIds = new Set(existingSearches.map(search => search.id));
      
      // Generate a unique ID using crypto.randomUUID() if available, with fallback
      const generateId = (): string => {
        // Use crypto.randomUUID() if available (modern browsers)
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return `imported-${crypto.randomUUID()}`;
        }
        // Fallback for environments without crypto.randomUUID()
        return `imported-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      };
      
      // Validate each search object and ensure it has required fields with correct types
      const validatedImports = importedSearches
        .filter((search: any) => {
          // Basic structure validation
          return (
            search && 
            typeof search === 'object' && 
            typeof search.name === 'string' && 
            search.name.trim() !== '' &&
            typeof search.filters === 'object'
          );
        })
        .map((search: any) => {
          // Format and type correction
          const validated: SavedSearch = {
            // Generate new ID if missing or already exists to prevent duplicates
            id: (search.id && !existingIds.has(search.id)) ? search.id : generateId(),
            name: search.name.trim(),
            filters: search.filters,
            // Ensure createdAt is a valid date, default to now if invalid
            createdAt: search.createdAt && !isNaN(new Date(search.createdAt).getTime())
              ? new Date(search.createdAt)
              : new Date(),
            // Optional fields
            query: typeof search.query === 'string' ? search.query : undefined,
            resultsCount: typeof search.resultsCount === 'number' ? search.resultsCount : undefined,
            lastUsed: search.lastUsed && !isNaN(new Date(search.lastUsed).getTime())
              ? new Date(search.lastUsed)
              : undefined
          };
          return validated;
        });
      
      // Merge validated imports with existing searches
      const mergedSearches = [...existingSearches, ...validatedImports];
      
      // Limit to 50 saved searches to prevent storage overflow (newest first)
      const limitedSearches = mergedSearches.slice(0, 50);
      
      // Only update localStorage after successful validation
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSearches));
      return true;
    } catch (error) {
      console.error('Error importing searches:', error);
      return false;
    }
  }

  /**
   * Clear all saved searches
   */
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}