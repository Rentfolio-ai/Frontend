import React from 'react';

interface AgentAvatarSvgProps {
  className?: string;
}

export const AgentAvatarSvg: React.FC<AgentAvatarSvgProps> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Gradients for 3D effect */}
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" className="agent-avatar-skin-start" />
          <stop offset="100%" className="agent-avatar-skin-end" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" className="agent-avatar-hair-start" />
          <stop offset="100%" className="agent-avatar-hair-end" />
        </linearGradient>
        <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" className="agent-avatar-blazer-start" />
          <stop offset="100%" className="agent-avatar-blazer-end" />
        </linearGradient>
        <radialGradient id="bgGrad" cx="50%" cy="30%">
          <stop offset="0%" className="agent-avatar-bg-start" />
          <stop offset="100%" className="agent-avatar-bg-end" />
        </radialGradient>
      </defs>

      {/* Background with gradient */}
      <rect width="200" height="200" fill="url(#bgGrad)" />

      {/* Shoulders/Blazer */}
      <ellipse cx="100" cy="180" rx="70" ry="40" fill="url(#blazerGrad)" />
      <path d="M 40 180 Q 40 160, 60 155 L 70 180 Z" className="agent-avatar-blazer-accent" />
      <path d="M 160 180 Q 160 160, 140 155 L 130 180 Z" className="agent-avatar-blazer-accent" />

      {/* Neck */}
      <rect x="85" y="130" width="30" height="35" fill="url(#skinGrad)" rx="8" />

      {/* White shirt collar */}
      <path d="M 75 155 L 85 145 L 85 165 Z" className="agent-avatar-shirt" />
      <path d="M 125 155 L 115 145 L 115 165 Z" className="agent-avatar-shirt" />

      {/* Head - oval shape */}
      <ellipse cx="100" cy="95" rx="42" ry="50" fill="url(#skinGrad)" />

      {/* Ears */}
      <ellipse cx="62" cy="95" rx="8" ry="12" className="agent-avatar-ear" />
      <ellipse cx="138" cy="95" rx="8" ry="12" className="agent-avatar-ear" />
      <ellipse cx="63" cy="95" rx="4" ry="6" className="agent-avatar-ear-inner" />
      <ellipse cx="137" cy="95" rx="4" ry="6" className="agent-avatar-ear-inner" />

      {/* Hair - modern professional style */}
      <path d="M 58 65 Q 55 45, 70 40 Q 85 35, 100 35 Q 115 35, 130 40 Q 145 45, 142 65 Q 140 75, 138 85 Q 135 70, 125 62 Q 115 55, 100 54 Q 85 55, 75 62 Q 65 70, 62 85 Q 60 75, 58 65 Z" 
            fill="url(#hairGrad)" />
      
      {/* Forehead hair detail */}
      <path d="M 70 55 Q 85 50, 100 50 Q 115 50, 130 55" className="agent-avatar-hair-detail" strokeWidth="1.5" fill="none" />

      {/* Eyebrows - natural, confident */}
      <path d="M 72 78 Q 78 75, 84 77" className="agent-avatar-eyebrow" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 116 77 Q 122 75, 128 78" className="agent-avatar-eyebrow" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Eyes - friendly and warm */}
      <ellipse cx="80" cy="90" rx="8" ry="10" className="agent-avatar-eye-white" />
      <ellipse cx="120" cy="90" rx="8" ry="10" className="agent-avatar-eye-white" />
      
      {/* Irises - warm brown */}
      <circle cx="80" cy="91" r="5.5" className="agent-avatar-iris" />
      <circle cx="120" cy="91" r="5.5" className="agent-avatar-iris" />
      
      {/* Pupils */}
      <circle cx="80" cy="91" r="3" className="agent-avatar-pupil" />
      <circle cx="120" cy="91" r="3" className="agent-avatar-pupil" />
      
      {/* Eye highlights - makes them sparkle */}
      <circle cx="81.5" cy="89" r="2" className="agent-avatar-eye-highlight-primary" />
      <circle cx="121.5" cy="89" r="2" className="agent-avatar-eye-highlight-primary" />
      <circle cx="78" cy="92" r="0.8" className="agent-avatar-eye-highlight-secondary" />
      <circle cx="118" cy="92" r="0.8" className="agent-avatar-eye-highlight-secondary" />

      {/* Subtle eyelids for depth */}
      <path d="M 72 88 Q 80 86, 88 88" className="agent-avatar-eyelid" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 112 88 Q 120 86, 128 88" className="agent-avatar-eyelid" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Nose - subtle and refined */}
      <path d="M 100 100 L 100 110" className="agent-avatar-nose" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="96" cy="111" rx="2.5" ry="2" className="agent-avatar-nostril" />
      <ellipse cx="104" cy="111" rx="2.5" ry="2" className="agent-avatar-nostril" />

      {/* Confident smile - friendly but professional */}
      <path d="M 82 120 Q 85 125, 100 126 Q 115 125, 118 120" 
            className="agent-avatar-smile" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" />
      
      {/* Smile highlight */}
      <path d="M 84 121 Q 90 124, 100 124.5 Q 110 124, 116 121" 
            className="agent-avatar-smile-highlight" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round" />

      {/* Slight smile lines for warmth */}
      <path d="M 81 118 Q 80 120, 81 122" className="agent-avatar-smile-line" strokeWidth="1" fill="none" />
      <path d="M 119 118 Q 120 120, 119 122" className="agent-avatar-smile-line" strokeWidth="1" fill="none" />

      {/* Rosy cheeks - friendly touch */}
      <ellipse cx="70" cy="105" rx="8" ry="6" className="agent-avatar-cheek" />
      <ellipse cx="130" cy="105" rx="8" ry="6" className="agent-avatar-cheek" />

      {/* Subtle shadow under chin for depth */}
      <ellipse cx="100" cy="135" rx="35" ry="8" className="agent-avatar-shadow" />

      {/* Small house pin on blazer */}
      <g transform="translate(125, 165)">
        <circle r="6" className="agent-avatar-pin-bg" />
        <path d="M -2.5 0 L 0 -2.5 L 2.5 0 L 2.5 3 L -2.5 3 Z" className="agent-avatar-pin-house" />
        <rect x="-0.8" y="1.5" width="1.6" height="1.5" className="agent-avatar-pin-door" />
      </g>
    </svg>
  );
};
