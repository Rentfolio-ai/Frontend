/**
 * Civitas Design System
 * 
 * Following Jony Ive principles:
 * - Calm, confident, restrained
 * - Warm dark palette (navy + amber accents)
 * - Generous whitespace
 * - Precision in every measurement
 */

export const theme = {
  // Base Colors - Deep navy foundation
  colors: {
    background: {
      primary: '#0a0e1a',
      secondary: '#1a2332',
      tertiary: '#252d3d',
    },
    
    surface: {
      base: 'rgba(26, 35, 50, 0.4)',
      elevated: 'rgba(37, 45, 61, 0.6)',
    },
    
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      muted: '#64748b',
    },
    
    // Amber accent - used sparingly
    accent: {
      DEFAULT: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    
    // Semantic colors - muted, non-neon
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    
    // Borders
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      medium: 'rgba(255, 255, 255, 0.08)',
      strong: 'rgba(255, 255, 255, 0.12)',
    },
  },
  
  // Gradients - very restrained
  gradients: {
    // Barely visible background depth
    ambient: 'linear-gradient(180deg, rgba(10, 14, 26, 1) 0%, rgba(15, 20, 35, 1) 50%, rgba(10, 14, 26, 1) 100%)',
    
    // Warm amber for CTAs only
    accent: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  
  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif',
    
    sizes: {
      xs: { fontSize: '0.6875rem', lineHeight: '1rem' },      // 11px/16px
      sm: { fontSize: '0.8125rem', lineHeight: '1.125rem' },  // 13px/18px
      base: { fontSize: '0.9375rem', lineHeight: '1.5rem' },  // 15px/24px
      lg: { fontSize: '1.0625rem', lineHeight: '1.75rem' },   // 17px/28px
      xl: { fontSize: '1.25rem', lineHeight: '2rem' },        // 20px/32px
    },
    
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      // NEVER use 700+ (too heavy)
    },
  },
  
  // Spacing - 4px base unit
  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
  },
  
  // Radius - subtle, consistent
  radius: {
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem',   // 24px
    full: '9999px',
  },
  
  // Shadows - minimal, purposeful
  shadows: {
    // ONLY for focus states
    focus: '0 0 0 3px rgba(245, 158, 11, 0.1)',
    
    // ONLY for elevated cards
    elevated: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  
  // Animation - fast, smooth
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// CSS Custom Properties (for Tailwind extension)
export const cssVariables = {
  '--color-bg-primary': theme.colors.background.primary,
  '--color-bg-secondary': theme.colors.background.secondary,
  '--color-bg-tertiary': theme.colors.background.tertiary,
  
  '--color-surface-base': theme.colors.surface.base,
  '--color-surface-elevated': theme.colors.surface.elevated,
  
  '--color-text-primary': theme.colors.text.primary,
  '--color-text-secondary': theme.colors.text.secondary,
  '--color-text-muted': theme.colors.text.muted,
  
  '--color-accent': theme.colors.accent.DEFAULT,
  '--color-accent-light': theme.colors.accent.light,
  '--color-accent-dark': theme.colors.accent.dark,
  
  '--gradient-ambient': theme.gradients.ambient,
  '--gradient-accent': theme.gradients.accent,
};

export type Theme = typeof theme;
