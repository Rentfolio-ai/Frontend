// FILE: src/components/primitives/Card.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const cardVariants = {
  default: 'bg-card border border-border/50',
  elevated: 'bg-surface-elevated border border-border/30 shadow-medium hover:shadow-hard transition-shadow duration-300',
  outlined: 'bg-transparent border-2 border-border hover:border-primary/50 transition-colors duration-300',
  glass: 'bg-black/8 dark:bg-black/5 backdrop-blur-xl border border-black/12 dark:border-black/8 shadow-soft',
  gradient: 'bg-gradient-to-br from-primary/10 to-accent-from/10 border border-primary/20 shadow-soft hover:shadow-glow transition-all duration-300',
  glow: 'bg-card border border-primary/30 shadow-glow hover:shadow-glow-lg transition-all duration-300',
};

const cardPadding = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300 hover-lift',
        cardVariants[variant],
        cardPadding[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn('text-h2 font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex items-center pt-6', className)} {...props}>
      {children}
    </div>
  );
};