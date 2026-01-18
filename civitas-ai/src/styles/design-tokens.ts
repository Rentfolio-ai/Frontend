/**
 * Design Tokens - Investment Platform
 * 
 * Philosophy (Collective Decision):
 * - Semantic naming (sidebar.bg vs bg.primary)
 * - Fewer values (4-5 per category MAX)
 * - Clear hierarchy and rhythm
 * - Investment-focused aesthetic
 */

export const designTokens = {
  // ==================
  // SEMANTIC COLORS
  // ==================
  colors: {
    // Sidebar (darker, distinct from chat)
    sidebar: {
      bg: '#0A0E14',                      // Dark slate
      surface: '#12161C',                 // Cards/sections
      hover: '#1A1E26',                   // Hover state
      border: 'rgba(255,255,255,0.06)',   // Subtle borders
    },

    // Chat (lighter than sidebar)
    chat: {
      bg: '#0F1014',                      // Base background
      surface: '#16181D',                 // Message bubbles
      elevated: '#1E2128',                // Cards/hover
      border: 'rgba(255,255,255,0.08)',   // Borders
    },

    // Investment Brand (Softer teal)
    brand: {
      primary: '#0F766E',                 // Main teal (softer)
      light: '#14B8A6',                   // Highlights/accents
      dark: '#0D6558',                    // Darker variant
      glow: 'rgba(20,184,166,0.15)',      // Glow effect
      subtle: 'rgba(15,118,110,0.12)',    // Background tint
    },

    // Text (3 levels only)
    text: {
      primary: 'rgba(255,255,255,0.98)',  // Headings
      secondary: 'rgba(255,255,255,0.75)', // Body
      tertiary: 'rgba(255,255,255,0.50)',  // Captions
    },

    // Semantic Status
    semantic: {
      success: '#52C77D',                 // Green
      successSubtle: 'rgba(82,199,125,0.12)',
      warning: '#FFB84D',                 // Amber
      warningSubtle: 'rgba(255,184,77,0.12)',
      error: '#FF6B6B',                   // Red
      errorSubtle: 'rgba(255,107,107,0.12)',
      info: '#5BA3FF',                    // Blue
      infoSubtle: 'rgba(91,163,255,0.12)',
    },

    // Legacy support (kept for backwards compatibility)
    bg: {
      app: '#0F1014',
      primary: '#16181D',
      secondary: '#1E2128',
      tertiary: '#262930',
      overlay: 'rgba(0,0,0,0.75)',
    },
    border: {
      subtle: 'rgba(255,255,255,0.06)',
      default: 'rgba(255,255,255,0.08)',
      emphasis: 'rgba(255,255,255,0.16)',
    },
  },

  // ==================
  // SPACING (5 values - 16px primary rhythm)
  // ==================
  spacing: {
    xs: '8px',      // Tight
    sm: '12px',     // Compact
    md: '16px',     // PRIMARY rhythm
    lg: '24px',     // Generous
    xl: '32px',     // Section gaps
  },

  // ==================
  // BORDER RADIUS (3 values)
  // ==================
  radius: {
    sm: '8px',      // Small elements
    md: '12px',     // PRIMARY (standard cards)
    lg: '16px',     // Large cards
    pill: '9999px', // Pill buttons
  },

  // ==================
  // TYPOGRAPHY
  // ==================
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, "SF Mono", monospace',
    },

    // Font sizes (5 values)
    fontSize: {
      xs: '11px',     // Timestamps, labels
      sm: '13px',     // Secondary text
      base: '15px',   // Body text (default)
      lg: '20px',     // Subheadings
      xl: '28px',     // Section titles
      xxl: '40px',    // Hero (rare)
    },

    // Weights (3 only)
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
    },

    letterSpacing: {
      tight: '-0.015em',
      normal: '0em',
      wide: '0.025em',
    },
  },

  // ==================
  // SHADOWS
  // ==================
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    md: '0 4px 8px rgba(0,0,0,0.15)',
    lg: '0 8px 16px rgba(0,0,0,0.2)',
    xl: '0 12px 24px rgba(0,0,0,0.25)',
    glow: '0 0 24px rgba(20,184,166,0.3)',  // Teal glow
  },

  // ==================
  // TRANSITIONS
  // ==================
  transition: {
    fast: '150ms cubic-bezier(0.4,0,0.2,1)',
    normal: '200ms cubic-bezier(0.4,0,0.2,1)',
    slow: '300ms cubic-bezier(0.4,0,0.2,1)',
  },

  // ==================
  // BORDERS
  // ==================
  border: {
    width: {
      thin: '1px',
      standard: '1.5px',
      thick: '2px',
    },
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      full: '9999px',
    },
  },

  // ==================
  // Z-INDEX
  // ==================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1400,
    tooltip: 1600,
  },
} as const;

// Export individual groups for convenience
export const { colors, spacing, typography, shadow, transition } = designTokens;
