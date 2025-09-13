// FILE: src/components/primitives/Button.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 focus-visible:ring-primary shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90 focus-visible:ring-secondary shadow-sm',
  ghost: 'hover:bg-muted hover:text-foreground active:bg-muted/80 focus-visible:ring-muted',
  outline: 'border border-border bg-background hover:bg-muted hover:text-foreground active:bg-muted/80 focus-visible:ring-border shadow-sm',
  danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger/95 focus-visible:ring-danger shadow-sm',
};

const buttonSizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-2',
  md: 'h-10 px-4 text-body gap-2',
  lg: 'h-12 px-6 text-body gap-2.5',
  xl: 'h-14 px-8 text-lg gap-3',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
        // Hover and active states with better feedback
        'hover:transform hover:scale-[1.02] active:scale-[0.98]',
        'disabled:hover:transform-none disabled:hover:scale-100',
        // Variant and size styles
        buttonVariants[variant],
        buttonSizes[size],
        // Loading state
        isLoading && 'cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Left icon or loading indicator */}
      {isLoading ? (
        <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4 flex-shrink-0" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      
      {/* Content */}
      <span className={cn(isLoading && leftIcon && 'ml-2')}>
        {children}
      </span>
      
      {/* Right icon */}
      {rightIcon && !isLoading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};