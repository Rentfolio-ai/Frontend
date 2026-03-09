/**
 * useAppearance — Global appearance side-effect hook
 *
 * Reads preferences from Zustand (preferencesStore) and applies them to
 * the DOM via CSS classes, CSS custom properties, and data-attributes.
 *
 * Should be mounted once near the app root (e.g. App.tsx or DesktopShell).
 */

import { useEffect } from 'react';
import { usePreferencesStore } from '../stores/preferencesStore';

// ── Accent color palettes ────────────────────────────────────────────────────

const ACCENT_PALETTES: Record<string, { primary: string; hover: string; light: string; muted: string; ring: string; rgb: string }> = {
  copper:  { primary: '#C08B5C', hover: '#A8734A', light: '#D4A27F', muted: 'rgba(192,139,92,0.15)',  ring: '27 41% 55%',  rgb: '192,139,92'  },
  blue:    { primary: '#3B82F6', hover: '#2563EB', light: '#60A5FA', muted: 'rgba(59,130,246,0.15)',   ring: '217 91% 60%', rgb: '59,130,246'  },
  violet:  { primary: '#8B5CF6', hover: '#7C3AED', light: '#A78BFA', muted: 'rgba(139,92,246,0.15)',   ring: '263 70% 62%', rgb: '139,92,246'  },
  rose:    { primary: '#F43F5E', hover: '#E11D48', light: '#FB7185', muted: 'rgba(244,63,94,0.15)',    ring: '350 89% 60%', rgb: '244,63,94'   },
  amber:   { primary: '#F59E0B', hover: '#D97706', light: '#FBBF24', muted: 'rgba(245,158,11,0.15)',   ring: '38 92% 50%',  rgb: '245,158,11'  },
  emerald: { primary: '#10B981', hover: '#059669', light: '#34D399', muted: 'rgba(16,185,129,0.15)',   ring: '160 84% 39%', rgb: '16,185,129'  },
};

// ── Font size map ────────────────────────────────────────────────────────────

const FONT_SIZE_MAP: Record<string, string> = {
  small:  '13px',
  medium: '14.5px',
  large:  '16px',
};

// ── Chat density (gap between messages) ──────────────────────────────────────

const DENSITY_MAP: Record<string, string> = {
  compact:     '4px',
  comfortable: '12px',
  spacious:    '20px',
};

// ── Main hook ────────────────────────────────────────────────────────────────

export function useAppearance() {
  const theme       = usePreferencesStore((s) => s.theme);
  const accentColor = usePreferencesStore((s) => s.accentColor);
  const fontSize    = usePreferencesStore((s) => s.fontSize);
  const chatDensity = usePreferencesStore((s) => s.chatDensity);
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);
  const highContrast  = usePreferencesStore((s) => s.highContrast);

  // ── Theme (dark class on <html>) ─────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('civitas-theme', 'light');
  }, [theme]);

  // ── Accent color (CSS custom properties) ─────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    const palette = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.copper;

    root.style.setProperty('--accent-primary', palette.primary);
    root.style.setProperty('--accent-hover', palette.hover);
    root.style.setProperty('--accent-light', palette.light);
    root.style.setProperty('--accent-muted', palette.muted);
    root.style.setProperty('--accent-rgb', palette.rgb);
    // Override the HSL ring used by Tailwind
    root.style.setProperty('--ring', palette.ring);
    root.style.setProperty('--primary', palette.ring);
  }, [accentColor]);

  // ── Font size ────────────────────────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--chat-font-size', FONT_SIZE_MAP[fontSize] || '14.5px');
    root.dataset.fontSize = fontSize;
  }, [fontSize]);

  // ── Chat density ─────────────────────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--chat-density', DENSITY_MAP[chatDensity] || '12px');
    root.dataset.chatDensity = chatDensity;
  }, [chatDensity]);

  // ── Reduced motion ───────────────────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
    root.classList.toggle('reduced-motion', reducedMotion);
  }, [reducedMotion]);

  // ── High contrast ────────────────────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.highContrast = highContrast ? 'true' : 'false';
    root.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);
}
