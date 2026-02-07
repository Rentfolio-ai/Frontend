/**
 * Design Tokens - Vasthu AI Investment Platform
 * 
 * Philosophy (Warm Light Theme - Jan 18, 2026):
 * - WARM CREAM THEME for real estate luxury & trust
 * - Inspired by SolidHealth.ai, Stripe, high-end real estate sites
 * - Warm beige/cream instead of sterile white
 * - Higher contrast for better readability
 * - WCAG AAA compliant for accessibility
 * - Refined copper brand (#A8734A) for contrast
 * - System fonts for performance & native feel
 */

export const designTokens = {
  // ==================
  // COLORS (WARM LIGHT THEME)
  // ==================
  colors: {
    // Backgrounds (Dark gray - EVEN DARKER!)
    bg: {
      app: '#94A3B8',           // Slate-400 (DARK GRAY!)
      base: '#64748B',          // Slate-500 (very dark surfaces)
      elevated: '#E2E8F0',      // Slate-200 for cards (light contrast)
      hover: '#475569',         // Slate-600 (darker hover)
      popup: '#FFFFFF',         // White modals
      overlay: 'rgba(15,23,42,0.70)',  // Darker backdrop
      border: '#111114',        // Slate-700 borders (very dark!)
    },

    // Brand (Copper for warm backgrounds)
    brand: {
      primary: '#A8734A',                 // Teal-600 (main brand)
      light: '#C08B5C',                   // Teal-500 (highlights)
      dark: '#0F766E',                    // Teal-700 (depth)
      darker: '#115E59',                  // Teal-800 (backgrounds)
      glow: 'rgba(13,148,136,0.15)',      // Slightly stronger glow on cream
      subtle: '#F0FDFA',                  // Teal-50 (very light tint)
      subtleBorder: '#CCFBF1',            // Teal-100 (light tint border)
    },

    // Text (Higher contrast for warm backgrounds)
    text: {
      primary: '#1A1A1A',        // Near black (stronger contrast)
      body: '#3D3D3D',           // Dark charcoal (body text)
      secondary: '#6B6B6B',      // Medium gray (captions)
      tertiary: '#9E9E9E',       // Light gray (disabled, hints)
      inverse: '#FFFFFF',        // White (for dark backgrounds/buttons)
    },

    // Borders (Dark gray - very visible)
    border: {
      subtle: '#64748B',                      // Slate-500
      default: '#111114',                     // Slate-700 (VERY DARK!)
      emphasis: '#18181c',                    // Slate-800 (even darker!)
      focus: '#C08B5C',                       // Brighter copper for visibility
    },

    // Semantic colors (Slate theme)
    semantic: {
      success: '#059669',                     // Emerald-600
      successBg: '#ECFDF5',                   // Emerald-50
      warning: '#EA580C',                     // Orange-600
      warningBg: '#FFF7ED',                   // Orange-50
      error: '#DC2626',                       // Red-600
      errorBg: '#FEF2F2',                     // Red-50
      info: '#0284C7',                        // Sky-600
      infoBg: '#F0F9FF',                      // Sky-50
    },

    // Surface overlays (Slate theme)
    overlay: {
      light: 'rgba(15,23,42,0.02)',           // Subtle slate tint
      medium: 'rgba(15,23,42,0.05)',          // Light slate tint
      heavy: 'rgba(15,23,42,0.50)',           // Slate backdrop
      blur: 'rgba(15,23,42,0.60)',            // Slate blur
    },

    // Legacy support (EVEN DARKER!)
    sidebar: {
      bg: '#475569',                          // Slate-600 (DARKER!)
      surface: '#CBD5E1',                     // Slate-300 cards
      hover: '#111114',                       // Slate-700 (darker hover)
      border: '#18181c',                      // Slate-800 (very dark border)
    },
    chat: {
      bg: '#64748B',                          // Slate-500 (DARKER!)
      surface: '#475569',                     // Slate-600
      elevated: '#CBD5E1',                    // Slate-300 for cards
      border: '#18181c',                      // Slate-800 (very dark border)
    },
  },

  // ==================
  // TYPOGRAPHY
  // ==================
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji"',
      mono: 'ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", monospace',
    },

    // Font sizes (expanded, accessibility-focused)
    fontSize: {
      xs: '12px',     // Minimum size (captions, timestamps)
      sm: '14px',     // Secondary text, labels
      base: '16px',   // PRIMARY body text (increased from 15px)
      lg: '18px',     // Large body, emphasis
      xl: '24px',     // Section titles (increased from 20px)
      '2xl': '32px',  // Page headers (increased from 28px)
      '3xl': '48px',  // Hero text (new)
    },

    // Weights (added bold for emphasis)
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,      // NEW - for strong emphasis
    },

    lineHeight: {
      tight: 1.3,     // Headlines
      normal: 1.6,    // Body (increased for readability)
      relaxed: 1.8,   // Long-form content
    },

    letterSpacing: {
      tighter: '-0.02em',  // Large headlines
      tight: '-0.01em',    // Small headlines
      normal: '0em',       // Body
      wide: '0.05em',      // UPPERCASE labels
    },
  },

  // ==================
  // SPACING (expanded scale - 8px grid system)
  // ==================
  spacing: {
    0: '0px',
    1: '4px',      // Micro spacing (NEW)
    2: '8px',      // Tight
    3: '12px',     // Compact
    4: '16px',     // BASE rhythm
    5: '20px',     // Comfortable (NEW)
    6: '24px',     // Generous
    8: '32px',     // Section gaps
    10: '40px',    // Large sections (NEW)
    12: '48px',    // Extra large (NEW)
    16: '64px',    // Hero spacing (NEW)
    20: '80px',    // Mega spacing (NEW)
  },

  // ==================
  // BORDER RADIUS
  // ==================
  radius: {
    sm: '8px',      // Small elements
    md: '12px',     // Standard cards
    lg: '16px',     // Large cards
    xl: '20px',     // Extra large
    full: '9999px', // Pill buttons
  },

  // ==================
  // SHADOWS (Slate theme - crisp, modern)
  // ==================
  shadow: {
    sm: '0 1px 2px 0 rgba(15,23,42,0.05)',        // Slate-900 soft
    md: '0 4px 6px -1px rgba(15,23,42,0.10)',     // Slate-900 medium
    lg: '0 10px 15px -3px rgba(15,23,42,0.10)',   // Slate-900 large
    xl: '0 20px 25px -5px rgba(15,23,42,0.10)',   // Slate-900 XL
    '2xl': '0 25px 50px -12px rgba(15,23,42,0.25)', // Slate-900 2XL
    glow: '0 0 0 4px rgba(13,148,136,0.15)',      // Teal glow
    inner: 'inset 0 2px 4px 0 rgba(15,23,42,0.05)', // Slate inner
  },

  // ==================
  // GLOWS (Slate theme - clean focus rings)
  // ==================
  glow: {
    brand: '0 0 0 4px rgba(13,148,136,0.15)',    // Teal focus ring
    success: '0 0 0 4px rgba(5,150,105,0.15)',   // Emerald focus ring
    error: '0 0 0 4px rgba(220,38,38,0.15)',     // Red focus ring
  },

  // ==================
  // BLUR (modern glass effect)
  // ==================
  blur: {
    sm: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
  },

  // ==================
  // TRANSITIONS (refined timing)
  // ==================
  transition: {
    fast: '120ms cubic-bezier(0.4,0,0.2,1)',    // Micro-interactions
    normal: '200ms cubic-bezier(0.4,0,0.2,1)',  // Standard
    slow: '300ms cubic-bezier(0.4,0,0.2,1)',    // Deliberate
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
export const { colors, spacing, typography, shadow, transition, blur, glow } = designTokens;
