/**
 * ContextMenu - Right-click context menu for property actions
 * 
 * Power user feature for quick actions:
 * - Dark background with backdrop blur
 * - Keyboard shortcuts displayed
 * - Hover: teal highlight
 * - Smooth fade-in animation
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import {
  Eye,
  Sparkles,
  GitCompare,
  FolderPlus,
  Link2,
  Star,
  TrendingUp,
} from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [isOpen, x, y]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose} />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 min-w-[220px] rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2 duration-100"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-lg border border-white/10 overflow-hidden shadow-2xl">
          <div className="py-1">
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && index % 3 === 0 && (
                  <div className="h-px bg-white/10 my-1" />
                )}
                <button
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      onClose();
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full px-3 py-2 flex items-center gap-3 text-sm transition-all',
                    item.disabled
                      ? 'text-white/30 cursor-not-allowed'
                      : item.danger
                      ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                      : 'text-white/90 hover:bg-teal-500/10 hover:text-teal-400'
                  )}
                >
                  <span className={cn(
                    'w-4 h-4 flex-shrink-0',
                    item.disabled && 'opacity-30'
                  )}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] text-white/40 font-mono px-1.5 py-0.5 rounded bg-white/5">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// Hook for managing context menu state
export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const closeContextMenu = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    position,
    openContextMenu,
    closeContextMenu,
  };
};

// Property-specific context menu items generator
export const createPropertyContextMenuItems = (
  property: any,
  handlers: {
    onViewDetails: () => void;
    on3DView: () => void;
    onAddToComparison: () => void;
    onAddToPortfolio: () => void;
    onCopyLink: () => void;
    onBookmark: () => void;
    onAnalyzeDeal?: () => void;
  }
): ContextMenuItem[] => {
  return [
    {
      id: 'view-details',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: handlers.onViewDetails,
    },
    {
      id: '3d-view',
      label: '3D Holographic View',
      icon: <Sparkles className="w-4 h-4" />,
      onClick: handlers.on3DView,
      shortcut: 'H',
    },
    {
      id: 'analyze-deal',
      label: 'Analyze Deal',
      icon: <TrendingUp className="w-4 h-4" />,
      onClick: handlers.onAnalyzeDeal || (() => {}),
      disabled: !handlers.onAnalyzeDeal,
      shortcut: 'A',
    },
    {
      id: 'add-comparison',
      label: 'Add to Comparison',
      icon: <GitCompare className="w-4 h-4" />,
      onClick: handlers.onAddToComparison,
      shortcut: 'C',
    },
    {
      id: 'add-portfolio',
      label: 'Add to Portfolio',
      icon: <FolderPlus className="w-4 h-4" />,
      onClick: handlers.onAddToPortfolio,
      shortcut: 'P',
    },
    {
      id: 'copy-link',
      label: 'Copy Link',
      icon: <Link2 className="w-4 h-4" />,
      onClick: handlers.onCopyLink,
      shortcut: '⌘C',
    },
    {
      id: 'bookmark',
      label: 'Bookmark',
      icon: <Star className="w-4 h-4" />,
      onClick: handlers.onBookmark,
      shortcut: 'B',
    },
  ];
};

