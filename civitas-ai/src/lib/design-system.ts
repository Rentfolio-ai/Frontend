/**
 * Design System: Jony Ive-approved design tokens.
 * 
 * Single source of truth for colors, spacing, typography, and gradients.
 * All values are exact and intentional.
 */

export const designSystem = {
  // Colors
  colors: {
    background: {
      base: '#0a0a0f',
      surface1: '#0f172a',
      surface2: '#1e293b',
      surface3: '#334155',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d1d5db',
      muted: '#9ca3af',
    },
    accent: {
      primary: '#8b5cf6',
      primaryLight: '#a78bfa',
      primaryDark: '#7c3aed',
      secondary: '#6366f1',
      secondaryLight: '#818cf8',
      secondaryDark: '#4f46e5',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.2)',
      active: 'rgba(139, 92, 246, 0.5)',
      error: 'rgba(239, 68, 68, 0.3)',
    },
  },

  // Spacing (4px base unit)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },

  // Border radius
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Typography
  typography: {
    title: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.4',
      color: '#ffffff',
    },
    body: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.6',
      color: '#d1d5db',
    },
    meta: {
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '1.5',
      color: '#9ca3af',
    },
  },

  // Gradients
  gradients: {
    ambient: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.08) 0%, rgba(10, 10, 15, 0) 60%)',
    accent: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    aiGlow: 'linear-gradient(90deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 50%, rgba(139, 92, 246, 0.2) 100%)',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  },

  // Icon sizes
  iconSize: {
    sm: '16px',
    md: '20px',
    lg: '24px',
  },
} as const;

// Helper functions
export const getConfidenceColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return designSystem.colors.semantic.success;
    case 'medium':
      return designSystem.colors.accent.primary;
    case 'low':
      return designSystem.colors.semantic.warning;
  }
};

export const getPriceSignalColor = (signal: 'good' | 'fair' | 'high') => {
  switch (signal) {
    case 'good':
      return designSystem.colors.semantic.success;
    case 'fair':
      return designSystem.colors.accent.primary;
    case 'high':
      return designSystem.colors.semantic.warning;
  }
};
