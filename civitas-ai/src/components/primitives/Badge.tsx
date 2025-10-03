// FILE: src/components/primitives/Badge.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-muted text-foreground border-transparent',
  success: 'bg-success text-white border-transparent',
  warning: 'bg-warning text-white border-transparent',
  danger: 'bg-danger text-white border-transparent',
  outline: 'bg-transparent border-border text-foreground',
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};