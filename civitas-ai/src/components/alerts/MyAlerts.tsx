// FILE: src/components/alerts/MyAlerts.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Card } from '../primitives/Card';
import { 
  Search, 
  Trash2, 
  Play, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Home,
  Clock,
  AlertCircle,
  ChevronRight,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SavedSearchManager, type SavedSearch } from '../../lib/savedSearches';
import type { PropertySearchFilters } from '../../../../types/index';

interface MyAlertsProps {
  className?: string;
  onRunSearch?: (query?: string, filters?: PropertySearchFilters) => void;
  compact?: boolean;
}

export const MyAlerts: React.FC<MyAlertsProps> = ({ 
  className, 
  onRunSearch,
  compact = false
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recent' | 'favorites'>('all');

  // Load saved searches on component mount and refresh when localStorage changes
  useEffect(() => {
    const loadSearches = () => {
      const searches = SavedSearchManager.getAll();
      setSavedSearches(searches);
    };
    
    loadSearches();
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'civitas-saved-searches') {
        loadSearches();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDeleteSearch = (id: string) => {
    try {
      SavedSearchManager.delete(id);
      setSavedSearches(SavedSearchManager.getAll());
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleRunSearch = (search: SavedSearch) => {
    try {
      SavedSearchManager.markAsUsed(search.id);
      setSavedSearches(SavedSearchManager.getAll());
      onRunSearch?.(search.query, search.filters);
    } catch (error) {
      console.error('Error running search:', error);
    }
  };

  const getFilteredSearches = (): SavedSearch[] => {
    let filtered = savedSearches;
    
    // Apply category filter
    if (selectedCategory === 'recent') {
      filtered = SavedSearchManager.getRecentlyUsed();
    }
    
    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = SavedSearchManager.search(searchQuery.trim());
    }
    
    return filtered;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  };

  const generateSearchSummary = (search: SavedSearch): string => {
    const parts: string[] = [];
    
    if (search.filters.location) {
      parts.push(search.filters.location);
    }
    
    if (search.filters.minPrice || search.filters.maxPrice) {
      if (search.filters.minPrice && search.filters.maxPrice) {
        parts.push(`$${(search.filters.minPrice / 1000).toFixed(0)}K-$${(search.filters.maxPrice / 1000).toFixed(0)}K`);
      } else if (search.filters.minPrice) {
        parts.push(`$${(search.filters.minPrice / 1000).toFixed(0)}K+`);
      } else if (search.filters.maxPrice) {
        parts.push(`Under $${(search.filters.maxPrice / 1000).toFixed(0)}K`);
      }
    }
    
    if (search.filters.beds) {
      parts.push(`${search.filters.beds}+ bed${search.filters.beds > 1 ? 's' : ''}`);
    }
    
    if (search.filters.propertyType) {
      parts.push(search.filters.propertyType.replace('-', ' '));
    }
    
    return parts.join(' • ') || 'All properties';
  };

  const filteredSearches = getFilteredSearches();

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">My Alerts</h3>
          <Badge variant="outline" className="text-xs">
            {savedSearches.length}
          </Badge>
        </div>
        
        {savedSearches.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            <p className="text-xs">No saved searches yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedSearches.slice(0, 3).map((search) => (
              <Card
                key={search.id}
                variant="outlined"
                padding="sm"
                className="cursor-pointer hover:bg-accent/10 transition-colors group"
                onClick={() => handleRunSearch(search)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                      {search.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {generateSearchSummary(search)}
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}
            
            {savedSearches.length > 3 && (
              <div className="text-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all {savedSearches.length} alerts
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">My Alerts</h2>
          <Badge variant="outline" className="text-xs">
            {savedSearches.length}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log('Export functionality coming soon')}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your saved alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm 
                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                     bg-background text-foreground"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'recent'] as const).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs capitalize"
            >
              {category === 'recent' ? 'Recently Used' : 'All Alerts'}
            </Button>
          ))}
        </div>
      </div>

      {/* Saved Searches List */}
      <div className="space-y-3">
        {filteredSearches.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-sm font-medium mb-1">
              {searchQuery ? 'No matching alerts' : 'No saved searches yet'}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Save your search criteria to quickly access them later'
              }
            </p>
          </div>
        ) : (
          filteredSearches.map((search) => (
            <Card
              key={search.id}
              variant="outlined"
              padding="sm"
              className="hover:shadow-sm transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{search.name}</h3>
                    {search.query && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Query: "{search.query}"
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRunSearch(search)}
                      className="w-8 h-8 p-0 hover:bg-primary/10"
                      title="Run this search"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSearch(search.id)}
                      className="w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      title="Delete this search"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Search Criteria */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {search.filters.location && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {search.filters.location}
                      </Badge>
                    )}
                    
                    {(search.filters.minPrice || search.filters.maxPrice) && (
                      <Badge variant="outline" className="text-xs">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {search.filters.minPrice ? `$${(search.filters.minPrice / 1000).toFixed(0)}K` : '0'} - {search.filters.maxPrice ? `$${(search.filters.maxPrice / 1000).toFixed(0)}K` : '∞'}
                      </Badge>
                    )}
                    
                    {search.filters.beds && (
                      <Badge variant="outline" className="text-xs">
                        <Home className="w-3 h-3 mr-1" />
                        {search.filters.beds}+ beds
                      </Badge>
                    )}
                    
                    {search.filters.propertyType && (
                      <Badge variant="outline" className="text-xs">
                        {search.filters.propertyType.replace('-', ' ')}
                      </Badge>
                    )}
                    
                    {search.resultsCount !== undefined && (
                      <Badge variant="success" className="text-xs">
                        {search.resultsCount} results
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created {formatDate(search.createdAt)}
                  </div>
                  
                  {search.lastUsed && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Used {formatDate(search.lastUsed)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};