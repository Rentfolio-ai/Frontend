// FILE: src/components/voice/VoiceWaveform.tsx
// Simple 5-bar waveform indicator for voice mode.
// Pure CSS animations — no canvas, no AnalyserNode.

import React from 'react';

interface VoiceWaveformProps {
  /** Whether audio is actively flowing (animates bars) */
  active: boolean;
  /** Bar color — defaults to white */
  color?: string;
  /** sm = inside End button (~16px tall), md = centered display (~48px tall) */
  size?: 'sm' | 'md';
}

// Staggered delays for wave effect (seconds)
const DELAYS = [0, 0.12, 0.24, 0.12, 0];

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  active,
  color = 'white',
  size = 'md',
}) => {
  const sm = size === 'sm';
  const h = sm ? 16 : 48;
  const w = sm ? 2 : 4;
  const gap = sm ? 2 : 3;
  const idle = sm ? 3 : 6;

  return (
    <>
      <div className="flex items-end justify-center" style={{ height: h, gap }}>
        {DELAYS.map((delay, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: w,
              height: idle,
              backgroundColor: color,
              opacity: active ? 0.9 : 0.4,
              transition: active ? 'none' : 'height 0.3s ease, opacity 0.3s ease',
              animation: active
                ? `waveBar${sm ? 'Sm' : 'Md'} ${0.5 + i * 0.08}s ease-in-out ${delay}s infinite alternate`
                : 'none',
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes waveBarMd {
          from { height: 10px; }
          to { height: 42px; }
        }
        @keyframes waveBarSm {
          from { height: 3px; }
          to { height: 14px; }
        }
      `}</style>
    </>
  );
};
