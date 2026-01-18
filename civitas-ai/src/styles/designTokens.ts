/**
 * Design System Tokens
 * Unified design language across the application
 */

export const colorTokens = {
  // Backgrounds
  bg: {
    primary: '#0F0F0F',
    secondary: '#191919',
    tertiary: '#1a1a1a',
    elevated: '#202020',
    hover: 'rgba(255, 255, 255, 0.06)',
    active: 'rgba(255, 255, 255, 0.08)',
  },
  
  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.20)',
    focus: 'rgba(255, 255, 255, 0.30)',
  },
  
  // Text
  text: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.70)',
    tertiary: 'rgba(255, 255, 255, 0.50)',
    disabled: 'rgba(255, 255, 255, 0.30)',
    muted: 'rgba(255, 255, 255, 0.40)',
  },
  
  // Semantic
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    feature: '#8b5cf6',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    secondary: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
    tertiary: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
  }
} as const;

export const typography = {
  // Headings
  h1: 'text-3xl font-semibold tracking-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-medium',
  h5: 'text-base font-medium',
  
  // Body
  bodyLarge: 'text-base leading-relaxed',
  body: 'text-sm leading-normal',
  bodySmall: 'text-xs leading-normal',
  caption: 'text-xs leading-tight',
  micro: 'text-[11px] leading-tight',
  
  // Special
  label: 'text-[13px] font-medium',
  button: 'text-sm font-medium',
  buttonLarge: 'text-base font-semibold',
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 30px rgba(59, 130, 246, 0.15)',
} as const;

// Component-specific tokens
export const components = {
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30',
    secondary: 'bg-white/[0.06] hover:bg-white/[0.10] active:bg-white/[0.12] text-white/90 border border-white/[0.08]',
    ghost: 'hover:bg-white/[0.06] active:bg-white/[0.08] text-white/70 hover:text-white',
    danger: 'bg-red-600/20 hover:bg-red-600/30 active:bg-red-600/40 text-red-400 border border-red-500/20',
  },
  
  card: {
    default: 'bg-white/[0.04] border border-white/[0.08] rounded-xl',
    elevated: 'bg-white/[0.06] border border-white/[0.10] rounded-xl shadow-lg',
    interactive: 'bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer',
    selected: 'bg-blue-500/10 border-blue-500/30 rounded-xl ring-2 ring-blue-500/20',
  },
  
  input: {
    default: 'bg-white/[0.05] border border-white/[0.10] rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/[0.20] focus:ring-2 focus:ring-white/[0.10] transition-all',
  },
} as const;

// Animation tokens
export const animations = {
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    base: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },
  
  hover: {
    scale: 'hover:scale-105',
    scaleSmall: 'hover:scale-102',
    lift: 'hover:-translate-y-1',
  },
} as const;
