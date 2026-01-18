/**
 * Reading Comfort Settings Component
 * 
 * Accessibility-focused settings for reading AI responses
 * Based on Steve Jobs (focus), Sam Altman (accessibility), Jony Ive (restraint)
 * 
 * Features:
 * - Text size adjustment (14-18px)
 * - Line spacing (tight/normal/relaxed)
 * - Bold text toggle
 * - Respects system preferences
 */

import React from 'react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { Type, AlignLeft, Bold } from 'lucide-react';

export const ReadingComfortSettings: React.FC = () => {
  const { readingPreferences, setReadingPreferences } = usePreferencesStore();

  const textSizes = [14, 15, 16, 17, 18] as const;
  const lineSpacingOptions = [
    { value: 'tight' as const, label: 'Tight', lineHeight: '1.5' },
    { value: 'normal' as const, label: 'Normal', lineHeight: '1.6' },
    { value: 'relaxed' as const, label: 'Relaxed', lineHeight: '1.8' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-white/90 mb-1">Reading Comfort</h3>
        <p className="text-xs text-white/50">Adjust how AI responses are displayed</p>
      </div>

      {/* Text Size */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-white/70">
          <Type className="w-4 h-4" />
          <span>Text Size</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 w-12">Small</span>
          <input
            type="range"
            min="14"
            max="18"
            step="1"
            value={readingPreferences.textSize}
            onChange={(e) => setReadingPreferences({ textSize: parseInt(e.target.value) as any })}
            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-white
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:hover:bg-white/90
                     [&::-webkit-slider-thumb]:transition-colors"
          />
          <span className="text-xs text-white/40 w-12 text-right">Large</span>
        </div>
        <div className="text-center">
          <span className="text-xs text-white/60 tabular-nums">{readingPreferences.textSize}px</span>
        </div>
      </div>

      {/* Line Spacing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-white/70">
          <AlignLeft className="w-4 h-4" />
          <span>Line Spacing</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {lineSpacingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setReadingPreferences({ lineSpacing: option.value })}
              className={`
                px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                ${readingPreferences.lineSpacing === option.value
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/[0.02] text-white/60 border border-white/[0.06] hover:bg-white/[0.04] hover:text-white/80'
                }
              `}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{option.lineHeight}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bold Text */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-white/70">
          <Bold className="w-4 h-4" />
          <span>Text Weight</span>
        </div>
        <label className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
          <input
            type="checkbox"
            checked={readingPreferences.boldText}
            onChange={(e) => setReadingPreferences({ boldText: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-white/10 text-white
                     focus:ring-2 focus:ring-white/20 focus:ring-offset-0
                     cursor-pointer"
          />
          <div className="flex-1">
            <div className="text-sm text-white/90">Bold Text</div>
            <div className="text-xs text-white/50 mt-0.5">Easier to read for some users</div>
          </div>
        </label>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-white/70">Preview</div>
        <div 
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
          style={{
            fontSize: `${readingPreferences.textSize}px`,
            lineHeight: lineSpacingOptions.find(o => o.value === readingPreferences.lineSpacing)?.lineHeight,
            fontWeight: readingPreferences.boldText ? 600 : 400
          }}
        >
          <p className="text-white/80">
            This is how AI responses will appear with your current settings. The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </div>

      {/* System Integration Note */}
      <div className="text-xs text-white/40 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
        <strong className="text-white/60">Tip:</strong> These settings work alongside your system accessibility preferences. 
        Changes made in iOS/macOS Settings (Larger Text, Bold Text) will be respected.
      </div>
    </div>
  );
};
