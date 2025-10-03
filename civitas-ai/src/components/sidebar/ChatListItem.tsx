// FILE: src/components/sidebar/ChatListItem.tsx
import React from 'react';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { cn } from '../../lib/utils';

interface ChatListItemProps {
  id: string;
  title: string;
  timestamp: string;
  isActive?: boolean;
  hasUnread?: boolean;
  messagePreview?: string;
  onClick: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  id,
  title,
  timestamp,
  isActive = false,
  hasUnread = false,
  messagePreview,
  onClick,
  onDelete,
}) => {
  const handleClick = () => {
    onClick(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-muted/50',
        isActive && 'bg-muted border border-border'
      )}
      onClick={handleClick}
    >
      {/* Chat Icon */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-3 h-3 text-foreground/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground truncate">
            {title}
          </h4>
          <div className="flex items-center gap-1">
            {hasUnread && (
              <Badge variant="default" size="sm">
                New
              </Badge>
            )}
            <span className="text-xs text-foreground/60 whitespace-nowrap">
              {timestamp}
            </span>
          </div>
        </div>
        
        {messagePreview && (
          <p className="text-xs text-foreground/60 line-clamp-2 mb-2">
            {messagePreview}
          </p>
        )}
      </div>

      {/* Actions */}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
          aria-label="Delete chat"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      )}
    </div>
  );
};