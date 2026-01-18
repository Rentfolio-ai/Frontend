/**
 * System Accessibility Preferences
 * 
 * Detects and respects iOS/macOS system-wide accessibility settings:
 * - Larger Text (Dynamic Type)
 * - Bold Text
 * - Increase Contrast
 * 
 * Philosophy: Respect user's system choices, don't override them
 */

/**
 * Detect if user has enabled Bold Text (iOS/macOS)
 * This is a system-wide setting
 */
export function detectSystemBoldText(): boolean {
  // Check if font-weight is heavier than normal
  // iOS/macOS automatically makes all text bold when Bold Text is enabled
  const testElement = document.createElement('div');
  testElement.style.fontWeight = '400';
  testElement.style.visibility = 'hidden';
  document.body.appendChild(testElement);
  
  const computedWeight = window.getComputedStyle(testElement).fontWeight;
  document.body.removeChild(testElement);
  
  // If computed weight > 400, system Bold Text is likely enabled
  return parseInt(computedWeight) > 400;
}

/**
 * Detect system font scale (iOS Dynamic Type)
 * Returns multiplier (1.0 = 100%, 1.2 = 120%)
 */
export function detectSystemFontScale(): number {
  // Check if browser supports Dynamic Type
  // Safari on iOS adjusts font size based on user's Accessibility settings
  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const baseFontSize = 16; // Default browser font size
  
  return fontSize / baseFontSize;
}

/**
 * Detect if Increase Contrast is enabled (iOS/macOS)
 */
export function detectSystemHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Apply system preferences to CSS variables
 * Call this on app mount
 */
export function applySystemPreferences(): void {
  const root = document.documentElement;
  
  // Detect system settings
  const fontScale = detectSystemFontScale();
  const boldText = detectSystemBoldText();
  const highContrast = detectSystemHighContrast();
  
  // Apply to CSS variables
  root.style.setProperty('--system-font-scale', fontScale.toString());
  root.style.setProperty('--system-bold-text', boldText ? '600' : '400');
  root.style.setProperty('--system-contrast-boost', highContrast ? '0.15' : '0');
  
  console.log('[SystemPreferences] Applied:', { fontScale, boldText, highContrast });
}

/**
 * Listen for system preference changes
 * macOS users can change accessibility settings without restarting
 */
export function watchSystemPreferences(callback: () => void): () => void {
  // Watch for contrast changes
  const contrastQuery = window.matchMedia('(prefers-contrast: more)');
  const handleChange = () => {
    applySystemPreferences();
    callback();
  };
  
  contrastQuery.addEventListener('change', handleChange);
  
  // Cleanup
  return () => {
    contrastQuery.removeEventListener('change', handleChange);
  };
}
