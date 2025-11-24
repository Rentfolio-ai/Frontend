import React from 'react';

interface AgentAvatarSvgProps {
  className?: string;
}

export const AgentAvatarSvg: React.FC<AgentAvatarSvgProps> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Enhanced gradients for realistic 3D effect */}
        <linearGradient id="skinGrad" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#FFD5B8" />
          <stop offset="50%" stopColor="#FFCBA4" />
          <stop offset="100%" stopColor="#F4A460" />
        </linearGradient>
        
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2C1810" />
          <stop offset="100%" stopColor="#1A0F08" />
        </linearGradient>
        
        <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        
        <radialGradient id="bgGrad" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#E8F4F8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#B8E6F0" stopOpacity="0.1" />
        </radialGradient>
        
        {/* Shadow filters for depth */}
        <filter id="softShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="200" height="200" fill="url(#bgGrad)" />

      {/* Professional Suit/Blazer with realistic shading */}
      <g filter="url(#softShadow)">
        <ellipse cx="100" cy="185" rx="75" ry="45" fill="url(#blazerGrad)" />
        
        {/* Blazer lapels */}
        <path d="M 35 180 Q 35 165, 55 160 L 65 185 Z" fill="#1E3A8A" />
        <path d="M 165 180 Q 165 165, 145 160 L 135 185 Z" fill="#1E3A8A" />
        
        {/* Subtle blazer highlights */}
        <path d="M 40 175 Q 45 170, 55 168" stroke="#3B82F6" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M 160 175 Q 155 170, 145 168" stroke="#3B82F6" strokeWidth="1" opacity="0.3" fill="none" />
      </g>

      {/* Neck with realistic shading */}
      <rect x="82" y="135" width="36" height="40" fill="url(#skinGrad)" rx="10" />
      <rect x="84" y="135" width="4" height="35" fill="#F4A460" opacity="0.3" />
      <rect x="112" y="135" width="4" height="35" fill="#FFE5D0" opacity="0.3" />

      {/* Crisp white shirt collar */}
      <g>
        <path d="M 72 160 L 82 148 L 82 170 Z" fill="#FFFFFF" />
        <path d="M 128 160 L 118 148 L 118 170 Z" fill="#FFFFFF" />
        <path d="M 72 160 L 78 155" stroke="#E5E7EB" strokeWidth="1" />
        <path d="M 128 160 L 122 155" stroke="#E5E7EB" strokeWidth="1" />
      </g>

      {/* Tie - professional touch */}
      <g>
        <path d="M 100 148 L 95 165 L 100 185 L 105 165 Z" fill="#DC2626" />
        <path d="M 100 148 L 102 165 L 100 185" stroke="#991B1B" strokeWidth="1" opacity="0.5" />
        <rect x="97" y="148" width="6" height="8" fill="#DC2626" />
      </g>

      {/* Head - realistic oval with subtle shading */}
      <g filter="url(#softShadow)">
        <ellipse cx="100" cy="95" rx="45" ry="52" fill="url(#skinGrad)" />
        
        {/* Facial contour shading */}
        <ellipse cx="70" cy="105" rx="8" ry="15" fill="#F4A460" opacity="0.2" />
        <ellipse cx="130" cy="105" rx="8" ry="15" fill="#F4A460" opacity="0.2" />
      </g>

      {/* Realistic ears with detail */}
      <g>
        <ellipse cx="60" cy="95" rx="9" ry="14" fill="#FFCBA4" />
        <ellipse cx="140" cy="95" rx="9" ry="14" fill="#FFCBA4" />
        <ellipse cx="61" cy="95" rx="5" ry="8" fill="#FFB088" opacity="0.6" />
        <ellipse cx="139" cy="95" rx="5" ry="8" fill="#FFB088" opacity="0.6" />
      </g>

      {/* Modern professional hairstyle */}
      <g>
        <path d="M 55 60 Q 50 40, 70 35 Q 85 30, 100 30 Q 115 30, 130 35 Q 150 40, 145 60 Q 143 72, 140 85 L 135 70 Q 125 58, 115 52 Q 105 48, 100 48 Q 95 48, 85 52 Q 75 58, 65 70 L 60 85 Q 57 72, 55 60 Z" 
              fill="url(#hairGrad)" />
        
        {/* Hair texture and highlights */}
        <path d="M 70 50 Q 85 45, 100 44 Q 115 45, 130 50" stroke="#3D2817" strokeWidth="1.5" opacity="0.4" fill="none" />
        <path d="M 75 55 Q 88 50, 100 50 Q 112 50, 125 55" stroke="#3D2817" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M 65 65 Q 80 58, 100 57 Q 120 58, 135 65" stroke="#3D2817" strokeWidth="1" opacity="0.2" fill="none" />
      </g>

      {/* Expressive eyebrows - confident and friendly */}
      <g>
        <path d="M 70 76 Q 77 73, 86 75" stroke="#2C1810" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M 114 75 Q 123 73, 130 76" stroke="#2C1810" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Realistic eyes with depth */}
      <g>
        {/* Eye whites */}
        <ellipse cx="78" cy="90" rx="9" ry="11" fill="#FFFFFF" />
        <ellipse cx="122" cy="90" rx="9" ry="11" fill="#FFFFFF" />
        
        {/* Irises - warm hazel */}
        <circle cx="78" cy="91" r="6.5" fill="#8B6F47" />
        <circle cx="122" cy="91" r="6.5" fill="#8B6F47" />
        
        {/* Inner iris detail */}
        <circle cx="78" cy="91" r="5" fill="#6B5638" opacity="0.6" />
        <circle cx="122" cy="91" r="5" fill="#6B5638" opacity="0.6" />
        
        {/* Pupils */}
        <circle cx="78" cy="91" r="3.5" fill="#1A0F08" />
        <circle cx="122" cy="91" r="3.5" fill="#1A0F08" />
        
        {/* Eye sparkle - makes eyes alive */}
        <circle cx="79.5" cy="88.5" r="2.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="123.5" cy="88.5" r="2.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="76" cy="92" r="1" fill="#FFFFFF" opacity="0.7" />
        <circle cx="120" cy="92" r="1" fill="#FFFFFF" opacity="0.7" />
        
        {/* Upper eyelids for depth */}
        <path d="M 69 88 Q 78 85, 87 88" stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 113 88 Q 122 85, 131 88" stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        
        {/* Lower eyelash hints */}
        <path d="M 71 92 Q 78 94, 85 92" stroke="#2C1810" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M 115 92 Q 122 94, 129 92" stroke="#2C1810" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
      </g>

      {/* Refined nose with realistic shading */}
      <g>
        <path d="M 100 100 L 100 112" stroke="#FFCBA4" strokeWidth="3" strokeLinecap="round" />
        <path d="M 98 100 L 98 110" stroke="#FFE5D0" strokeWidth="1" opacity="0.5" />
        <ellipse cx="95" cy="113" rx="3" ry="2.5" fill="#FFB088" opacity="0.5" />
        <ellipse cx="105" cy="113" rx="3" ry="2.5" fill="#FFB088" opacity="0.5" />
      </g>

      {/* Warm, confident smile - friendly and professional */}
      <g>
        <path d="M 80 122 Q 84 128, 100 129 Q 116 128, 120 122" 
              stroke="#D94A6B" 
              strokeWidth="3.5" 
              fill="none" 
              strokeLinecap="round" />
        
        {/* Smile highlight for dimension */}
        <path d="M 82 123 Q 90 127, 100 127.5 Q 110 127, 118 123" 
              stroke="#FFFFFF" 
              strokeWidth="1.5" 
              fill="none" 
              strokeLinecap="round" 
              opacity="0.5" />
        
        {/* Subtle smile lines */}
        <path d="M 78 120 Q 80 122, 82 124" stroke="#FFCBA4" strokeWidth="1" opacity="0.4" fill="none" />
        <path d="M 122 120 Q 120 122, 118 124" stroke="#FFCBA4" strokeWidth="1" opacity="0.4" fill="none" />
      </g>

      {/* Rosy cheeks for warmth */}
      <ellipse cx="68" cy="108" rx="12" ry="8" fill="#FFB6C1" opacity="0.25" />
      <ellipse cx="132" cy="108" rx="12" ry="8" fill="#FFB6C1" opacity="0.25" />

      {/* Subtle chin shadow for depth */}
      <ellipse cx="100" cy="140" rx="25" ry="8" fill="#000000" opacity="0.05" />
    </svg>
  );
};