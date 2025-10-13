import React from 'react';

interface AgentAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex-shrink-0`}>
      <div 
        className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
          boxShadow: '0px 4px 12px rgba(59, 130, 246, 0.25)'
        }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            {/* Gradients for 3D effect */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFDDC1" />
              <stop offset="100%" stopColor="#FFCBA4" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A3728" />
              <stop offset="100%" stopColor="#6B4423" />
            </linearGradient>
            <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <radialGradient id="bgGrad" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#E3F2FD" />
              <stop offset="100%" stopColor="#BBDEFB" />
            </radialGradient>
          </defs>

          {/* Background with gradient */}
          <rect width="200" height="200" fill="url(#bgGrad)" />

          {/* Shoulders/Blazer - navy blue */}
          <ellipse cx="100" cy="180" rx="70" ry="40" fill="url(#blazerGrad)" />
          <path d="M 40 180 Q 40 160, 60 155 L 70 180 Z" fill="#1E3A8A" />
          <path d="M 160 180 Q 160 160, 140 155 L 130 180 Z" fill="#1E3A8A" />

          {/* Neck */}
          <rect x="85" y="130" width="30" height="35" fill="url(#skinGrad)" rx="8" />

          {/* White shirt collar */}
          <path d="M 75 155 L 85 145 L 85 165 Z" fill="#FFFFFF" />
          <path d="M 125 155 L 115 145 L 115 165 Z" fill="#FFFFFF" />

          {/* Head - oval shape */}
          <ellipse cx="100" cy="95" rx="42" ry="50" fill="url(#skinGrad)" />

          {/* Ears */}
          <ellipse cx="62" cy="95" rx="8" ry="12" fill="#FFCBA4" />
          <ellipse cx="138" cy="95" rx="8" ry="12" fill="#FFCBA4" />
          <ellipse cx="63" cy="95" rx="4" ry="6" fill="#FFB088" opacity="0.6" />
          <ellipse cx="137" cy="95" rx="4" ry="6" fill="#FFB088" opacity="0.6" />

          {/* Hair - modern professional style */}
          <path d="M 58 65 Q 55 45, 70 40 Q 85 35, 100 35 Q 115 35, 130 40 Q 145 45, 142 65 Q 140 75, 138 85 Q 135 70, 125 62 Q 115 55, 100 54 Q 85 55, 75 62 Q 65 70, 62 85 Q 60 75, 58 65 Z" 
                fill="url(#hairGrad)" />
          
          {/* Forehead hair detail */}
          <path d="M 70 55 Q 85 50, 100 50 Q 115 50, 130 55" stroke="#3D2817" strokeWidth="1.5" fill="none" opacity="0.3" />

          {/* Eyebrows - natural, confident */}
          <path d="M 72 78 Q 78 75, 84 77" stroke="#3D2817" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 116 77 Q 122 75, 128 78" stroke="#3D2817" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Eyes - friendly and warm */}
          <ellipse cx="80" cy="90" rx="8" ry="10" fill="#FFFFFF" />
          <ellipse cx="120" cy="90" rx="8" ry="10" fill="#FFFFFF" />
          
          {/* Irises - warm brown */}
          <circle cx="80" cy="91" r="5.5" fill="#5D4E37" />
          <circle cx="120" cy="91" r="5.5" fill="#5D4E37" />
          
          {/* Pupils */}
          <circle cx="80" cy="91" r="3" fill="#2C1810" />
          <circle cx="120" cy="91" r="3" fill="#2C1810" />
          
          {/* Eye highlights - makes them sparkle */}
          <circle cx="81.5" cy="89" r="2" fill="#FFFFFF" opacity="0.9" />
          <circle cx="121.5" cy="89" r="2" fill="#FFFFFF" opacity="0.9" />
          <circle cx="78" cy="92" r="0.8" fill="#FFFFFF" opacity="0.6" />
          <circle cx="118" cy="92" r="0.8" fill="#FFFFFF" opacity="0.6" />

          {/* Subtle eyelids for depth */}
          <path d="M 72 88 Q 80 86, 88 88" stroke="#3D2817" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M 112 88 Q 120 86, 128 88" stroke="#3D2817" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />

          {/* Nose - subtle and refined */}
          <path d="M 100 100 L 100 110" stroke="#FFCBA4" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="96" cy="111" rx="2.5" ry="2" fill="#FFB088" opacity="0.5" />
          <ellipse cx="104" cy="111" rx="2.5" ry="2" fill="#FFB088" opacity="0.5" />

          {/* Confident smile - friendly but professional */}
          <path d="M 82 120 Q 85 125, 100 126 Q 115 125, 118 120" 
                stroke="#D94A6B" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round" />
          
          {/* Smile highlight */}
          <path d="M 84 121 Q 90 124, 100 124.5 Q 110 124, 116 121" 
                stroke="#FFFFFF" 
                strokeWidth="1.5" 
                fill="none" 
                strokeLinecap="round" 
                opacity="0.4" />

          {/* Slight smile lines for warmth */}
          <path d="M 81 118 Q 80 120, 81 122" stroke="#FFCBA4" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M 119 118 Q 120 120, 119 122" stroke="#FFCBA4" strokeWidth="1" fill="none" opacity="0.3" />

          {/* Rosy cheeks - friendly touch */}
          <ellipse cx="70" cy="105" rx="8" ry="6" fill="#FFB6C1" opacity="0.25" />
          <ellipse cx="130" cy="105" rx="8" ry="6" fill="#FFB6C1" opacity="0.25" />

          {/* Subtle shadow under chin for depth */}
          <ellipse cx="100" cy="135" rx="35" ry="8" fill="#000000" opacity="0.05" />

          {/* Small house pin on blazer */}
          <g transform="translate(125, 165)">
            <circle r="6" fill="#F59E0B" />
            <path d="M -2.5 0 L 0 -2.5 L 2.5 0 L 2.5 3 L -2.5 3 Z" fill="#1E40AF" />
            <rect x="-0.8" y="1.5" width="1.6" height="1.5" fill="#F59E0B" />
          </g>
        </svg>
      </div>
    </div>
  );
};
