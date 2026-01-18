/**
 * Design Tokens - Light Theme (SolidHealth.ai Inspired)
 * 
 * Visual System:
 * - Warm neutrals (beige/cream base)
 * - Coral/salmon accent
 * - White cards on cream background
 * - Generous spacing
 * - Subtle shadows
 */

export const lightTokens = {
  colors: {
    // Background - Warm neutrals
    bg: {
      app: '#F5F1ED',           // Warm cream (main background)
      primary: '#FFFFFF',        // White (cards, surfaces)
      secondary: '#FAF8F6',      // Soft white (secondary surfaces)
      tertiary: '#F0ECE8',       // Light beige (hover states)
    },

    // Text - Dark to light
    text: {
      primary: '#1A1A1A',        // Almost black (headings)
      secondary: '#4A4A4A',      // Dark gray (body)
      tertiary: '#8A8A8A',       // Medium gray (metadata)
      quaternary: '#B8B8B8',     // Light gray (disabled)
    },

    // Brand - Coral/Salmon accent
    brand: {
      primary: '#E77466',        // Coral (primary actions, icons)
      primaryHover: '#D95F4F',   // Darker coral (hover)
      subtle: '#FFF0EE',         // Very light coral (backgrounds)
      border: '#F5B5AD',         // Light coral (borders)
    },

    // Semantic colors
    semantic: {
      success: '#4CAF50',
      successSubtle: '#E8F5E9',
      error: '#E77466',          // Using coral as error too
      errorSubtle: '#FFF0EE',
      warning: '#FFA726',
      warningSubtle: '#FFF3E0',
      info: '#42A5F5',
      infoSubtle: '#E3F2FD',
    },

    // Borders
    border: {
      default: '#E8E4DF',        // Warm gray border
      subtle: '#F0ECE8',         // Very subtle border
      emphasis: '#D0CBC5',       // Stronger border
    },
  },

  spacing: {
    xs: '8px',
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
      lg: '20px',
      xl: '28px',
      xxl: '36px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0',
      wide: '0.01em',
    },
  },

  border: {
    radius: {
      sm: '6px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      full: '9999px',
    },
  },

  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },

  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default lightTokens;
