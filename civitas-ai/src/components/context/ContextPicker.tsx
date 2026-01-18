/**
 * ContextPicker - Dropdown component for selecting @-mention contexts
 * Similar to CommandSearch, with keyboard navigation and fuzzy search
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MessageSquare, Home, FileText, BarChart3, Settings } from 'lucide-react';
import type { ContextItem, GroupedContexts } from '../../types/context';
import { useContextStore } from '../../stores/contextStore';
import { cn } from '../../lib/utils';

interface ContextPickerProps {
  /** Whether the picker is open */
  isOpen: boolean;
  
  /** Current search query */
  query: string;
  
  /** Callback when context is selected */
  onSelect: (context: ContextItem) => void;
  
  /** Callback when picker should close */
  onClose: () => void;
  
  /** Position of the picker (relative to parent) */
  position?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  
  /** Maximum height of the picker */
  maxHeight?: number;
  
  /** Custom class name */
  className?: string;
}

/**
 * Get icon component for context type
 */
const getContextIcon = (context: ContextItem) => {
  if (typeof context.icon === 'string') {
    return <span className="text-lg">{context.icon}</span>;
  }
  
  // Default icons by type
  switch (context.type) {
    case 'page':
      return <MessageSquare className="w-4 h-4" />;
    case 'property':
      return <Home className="w-4 h-4" />;
    case 'file':
      return <FileText className="w-4 h-4" />;
    case 'report':
      return <BarChart3 className="w-4 h-4" />;
    case 'custom':
      return <Settings className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
};

/**
 * Format timestamp for display
 */
const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}w ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export const ContextPicker: React.FC<ContextPickerProps> = ({
  isOpen,
  query: externalQuery,
  onSelect,
  onClose,
  position,
  maxHeight = 400,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [internalQuery, setInternalQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { searchContexts, getGroupedContexts, recentContexts } = useContextStore();

  // Use internal query if provided, otherwise external
  const query = internalQuery || externalQuery;

  // Search or get recent contexts
  const contexts = query.trim() ? searchContexts(query) : recentContexts;
  
  // Group contexts by type
  const groupedContexts = getGroupedContexts(contexts);
  
  // Flatten for keyboard navigation
  const flatContexts = groupedContexts.flatMap(g => g.contexts);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus search input when picker opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Reset internal query when picker opens
  useEffect(() => {
    if (isOpen) {
      setInternalQuery('');
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && flatContexts.length > 0) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, flatContexts.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, flatContexts.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatContexts[selectedIndex]) {
            onSelect(flatContexts[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatContexts, selectedIndex, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay adding listener to avoid immediate close from the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleContextClick = useCallback((context: ContextItem) => {
    onSelect(context);
  }, [onSelect]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className={cn(
        'w-full bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/[0.10] overflow-hidden animate-in slide-in-from-bottom-2 duration-200',
        className
      )}
      style={{
        top: position?.top,
        bottom: position?.bottom,
        left: position?.left,
        right: position?.right,
        maxHeight,
      }}
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-white/[0.05] bg-white/[0.02]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={internalQuery}
            onChange={(e) => setInternalQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-2.5 bg-white/[0.05] border border-white/[0.10] rounded-md text-xs text-white/90 placeholder-white/40 focus:outline-none focus:border-white/[0.20] focus:ring-1 focus:ring-white/[0.10] transition-all"
          />
        </div>
      </div>

      {/* Results */}
      <div
        ref={resultsRef}
        className="overflow-y-auto custom-scrollbar"
        style={{ maxHeight: maxHeight - 50 }}
      >
        {flatContexts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Search className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-white/60 text-xs mb-1">
              {query.trim() ? 'No contexts found' : 'No recent contexts'}
            </p>
            <p className="text-white/40 text-[10px]">
              {query.trim() ? 'Try different keywords' : 'Select contexts to populate'}
            </p>
          </div>
        )}

        {groupedContexts.map((group, groupIdx) => {
          const groupStartIndex = groupedContexts
            .slice(0, groupIdx)
            .reduce((sum, g) => sum + g.contexts.length, 0);

          return (
            <div key={group.label} className="py-1.5">
              <h3 className="px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/40">
                {group.label}
              </h3>
              <div className="space-y-0.5">
                {group.contexts.map((context, contextIdx) => {
                  const index = groupStartIndex + contextIdx;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={context.id}
                      data-index={index}
                      onClick={() => handleContextClick(context)}
                      className={cn(
                        'w-full px-3 py-2 flex items-center gap-2 text-left transition-colors',
                        isSelected
                          ? 'bg-white/[0.08] text-white/90'
                          : 'text-white/70 hover:bg-white/[0.04] hover:text-white/90'
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs',
                          isSelected ? 'bg-white/[0.10]' : 'bg-white/[0.05]'
                        )}
                      >
                        {getContextIcon(context)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium truncate">
                            {context.title}
                          </span>
                          {context.timestamp && (
                            <span className="text-[9px] text-white/40 flex-shrink-0">
                              {formatTimestamp(context.timestamp)}
                            </span>
                          )}
                        </div>
                        {context.subtitle && (
                          <p className="text-[10px] text-white/40 truncate mt-0.5">
                            {context.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="w-1 h-1 rounded-full bg-teal-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {flatContexts.length > 0 && (
        <div className="px-3 py-1.5 border-t border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-center gap-2 text-[9px] text-white/40">
            <span>↑↓</span>
            <span>•</span>
            <span>↵</span>
            <span>•</span>
            <span>Esc</span>
          </div>
        </div>
      )}
    </div>
  );
};
