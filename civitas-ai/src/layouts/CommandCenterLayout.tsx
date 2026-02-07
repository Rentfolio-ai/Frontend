/**
 * CommandCenterLayout - Split-screen workspace for property intelligence
 * 
 * Creates a professional command center experience with:
 * - Resizable 60/40 split (adjustable 40-80%)
 * - Glass morphism styling with holographic accents
 * - Persistent comparison dock at bottom
 * - Spatial awareness - no overlapping modals
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface CommandCenterLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  dockContent?: React.ReactNode;
  onResize?: (leftWidth: number) => void;
  className?: string;
}

const MIN_LEFT_WIDTH = 40; // Minimum 40%
const MAX_LEFT_WIDTH = 80; // Maximum 80%
const DEFAULT_LEFT_WIDTH = 60; // Default 60%

export const CommandCenterLayout: React.FC<CommandCenterLayoutProps> = ({
  leftContent,
  rightContent,
  dockContent,
  onResize,
  className,
}) => {
  // Retrieve saved split ratio from localStorage
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('civitas-split-ratio');
      return saved ? parseFloat(saved) : DEFAULT_LEFT_WIDTH;
    }
    return DEFAULT_LEFT_WIDTH;
  });

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle divider drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidthPx = e.clientX - containerRect.left;
      const newLeftWidthPercent = (newLeftWidthPx / containerRect.width) * 100;

      // Clamp between min and max
      const clampedWidth = Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, newLeftWidthPercent));
      
      setLeftWidthPercent(clampedWidth);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('civitas-split-ratio', clampedWidth.toString());
      }
      
      onResize?.(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize]);

  const rightWidthPercent = 100 - leftWidthPercent;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-col h-full w-full overflow-hidden',
        className
      )}
    >
      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Property Results */}
        <div
          style={{ width: `${leftWidthPercent}%` }}
          className="h-full overflow-y-auto overflow-x-hidden transition-all duration-400 ease-out"
        >
          {leftContent}
        </div>

        {/* Resizable Divider */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            'relative w-1 cursor-col-resize group flex-shrink-0 transition-colors',
            isDragging ? 'bg-[#C08B5C]/50' : 'bg-white/10 hover:bg-[#C08B5C]/30'
          )}
        >
          {/* Holographic Glow Effect */}
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-300',
              isDragging || 'opacity-0 group-hover:opacity-100'
            )}
            style={{
              background: 'linear-gradient(180deg, rgba(192, 139, 92, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)',
              boxShadow: '0 0 20px rgba(192, 139, 92, 0.4)',
            }}
          />

          {/* Drag Handle */}
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-20 rounded-full transition-all duration-300',
              isDragging
                ? 'bg-gradient-to-b from-[#D4A27F] to-purple-500 shadow-lg shadow-[#C08B5C]/50'
                : 'bg-white/20 group-hover:bg-gradient-to-b group-hover:from-[#D4A27F] group-hover:to-purple-500'
            )}
          />
        </div>

        {/* Right Panel - Intelligence Pane */}
        <div
          style={{ width: `${rightWidthPercent}%` }}
          className="h-full overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm transition-all duration-400 ease-out border-l border-white/5"
        >
          {rightContent}
        </div>
      </div>

      {/* Comparison Dock (if provided) */}
      {dockContent && (
        <div className="relative flex-shrink-0">
          {dockContent}
        </div>
      )}

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 cursor-col-resize z-50" />
      )}
    </div>
  );
};

