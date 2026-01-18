/**
 * Design Tokens - Real Estate Portfolio Identity (v2)
 * 
 * Warm, approachable, premium
 * - Soft neutral background (not cream, not dark)
 * - Muted teal accent (professional but friendly)
 * - Property photos are hero
 * - Modern but human typography
 */

export const portfolioTokens = {
  colors: {
    // Background - Soft neutrals
    bg: {
      app: '#F8F9FA',              // Soft off-white
      primary: '#FFFFFF',          // Pure white (cards)
      secondary: '#F1F3F5',        // Light gray (sections)
      tertiary: '#E9ECEF',         // Medium gray (hover)
    },

    // Text - Natural hierarchy
    text: {
      primary: '#212529',          // Near black (headings)
      secondary: '#495057',        // Dark gray (body)
      tertiary: '#6C757D',         // Medium gray (metadata)
      muted: '#ADB5BD',            // Light gray (disabled)
    },

    // Brand - Muted teal (professional but approachable)
    brand: {
      primary: '#0D9488',          // Teal
      primaryHover: '#0F766E',     // Darker teal
      subtle: '#CCFBF1',           // Very light teal
      border: '#5EEAD4',           // Light teal
    },

    // Semantic colors (natural, not harsh)
    semantic: {
      success: '#10B981',          // Green (positive)
      successSubtle: '#D1FAE5',
      error: '#EF4444',            // Red (critical)
      errorSubtle: '#FEE2E2',
      warning: '#F59E0B',          // Amber (attention)
      warningSubtle: '#FEF3C7',
      info: '#3B82F6',             // Blue (neutral)
      infoSubtle: '#DBEAFE',
    },

    // Borders - Subtle
    border: {
      default: '#DEE2E6',          // Light border
      subtle: '#E9ECEF',           // Very subtle
      emphasis: '#ADB5BD',         // Strong border
      accent: '#0D9488',           // Brand border
    },

    // Overlay for property cards
    overlay: {
      dark: 'rgba(0, 0, 0, 0.4)',
      darker: 'rgba(0, 0, 0, 0.6)',
    },
  },

  spacing: {
    xs: '6px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px',
  },

  typography: {
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
      xxxl: '40px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0',
      wide: '0.02em',
    },
  },

  border: {
    radius: {
      sm: '6px',
      md: '10px',
      lg: '14px',
      xl: '18px',
      full: '9999px',
    },
  },

  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.10)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 12px 36px rgba(0, 0, 0, 0.15)',
  },

  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default portfolioTokens;
