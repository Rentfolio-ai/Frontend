// FILE: src/components/search/SaveSearchButton.tsx
import React, { useState } from 'react';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Save, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SavedSearchManager, type SavedSearch } from '../../lib/savedSearches';
import type { PropertySearchFilters } from '../../../../types/index';

interface SaveSearchButtonProps {
  query?: string;
  filters: PropertySearchFilters;
  resultsCount?: number;
  className?: string;
  onSaveSuccess?: (savedSearch: SavedSearch) => void;
}

export const SaveSearchButton: React.FC<SaveSearchButtonProps> = ({
  query,
  filters,
  resultsCount,
  className,
  onSaveSuccess
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const generateDefaultName = (): string => {
    const parts: string[] = [];
    
    if (query) {
      parts.push(`"${query}"`);
    }
    
    if (filters.location) {
      parts.push(`in ${filters.location}`);
    }
    
    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice && filters.maxPrice) {
        parts.push(`$${(filters.minPrice / 1000).toFixed(0)}K-$${(filters.maxPrice / 1000).toFixed(0)}K`);
      } else if (filters.minPrice) {
        parts.push(`$${(filters.minPrice / 1000).toFixed(0)}K+`);
      } else if (filters.maxPrice) {
        parts.push(`Under $${(filters.maxPrice / 1000).toFixed(0)}K`);
      }
    }
    
    if (filters.beds) {
      parts.push(`${filters.beds}+ bed${filters.beds > 1 ? 's' : ''}`);
    }
    
    if (filters.propertyType) {
      parts.push(filters.propertyType.replace('-', ' '));
    }
    
    if (parts.length === 0) {
      return 'Property Search';
    }
    
    return parts.join(' • ');
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;
    
    setIsSaving(true);
    
    try {
      const savedSearch = SavedSearchManager.save({
        name: searchName.trim(),
        query,
        filters,
        resultsCount
      });
      
      // Show success state
      setShowSuccess(true);
      setIsExpanded(false);
      setSearchName('');
      
      // Call success callback
      onSaveSuccess?.(savedSearch);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving search:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setSearchName('');
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setSearchName(generateDefaultName());
  };

  if (showSuccess) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700",
        className
      )}>
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium">Search Saved!</span>
      </div>
    );
  }

  if (isExpanded) {
    return (
      <div className={cn(
        "p-4 bg-surface border border-border rounded-lg shadow-sm space-y-3",
        className
      )}>
        <div>
          <label htmlFor="search-name" className="block text-sm font-medium text-foreground mb-2">
            Save this search as:
          </label>
          <input
            id="search-name"
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Enter a name for this search..."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm 
                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                     bg-background text-foreground"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveSearch();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
        </div>
        
        {/* Search summary */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-2">Search Details:</div>
          <div className="flex flex-wrap gap-2">
            {query && (
              <Badge variant="outline" className="text-xs">
                Query: "{query}"
              </Badge>
            )}
            {filters.location && (
              <Badge variant="outline" className="text-xs">
                Location: {filters.location}
              </Badge>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <Badge variant="outline" className="text-xs">
                Price: {filters.minPrice ? `$${(filters.minPrice / 1000).toFixed(0)}K` : '0'} - {filters.maxPrice ? `$${(filters.maxPrice / 1000).toFixed(0)}K` : '∞'}
              </Badge>
            )}
            {filters.beds && (
              <Badge variant="outline" className="text-xs">
                {filters.beds}+ beds
              </Badge>
            )}
            {filters.propertyType && (
              <Badge variant="outline" className="text-xs">
                {filters.propertyType.replace('-', ' ')}
              </Badge>
            )}
            {resultsCount !== undefined && (
              <Badge variant="success" className="text-xs">
                {resultsCount} results
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSaveSearch}
            disabled={!searchName.trim() || isSaving}
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Search'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleExpand}
      variant="outline"
      size="sm"
      className={cn(
        "flex items-center gap-2 transition-colors hover:bg-primary/5",
        className
      )}
    >
      <Save className="w-4 h-4" />
      Save Search
    </Button>
  );
};