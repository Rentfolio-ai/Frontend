import React from 'react';

interface AgentAvatarSvgProps {
  className?: string;
}

export const AgentAvatarSvg: React.FC<AgentAvatarSvgProps> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Skin — warm, subtle gradient */}
        <radialGradient id="av-skin" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#F5D6B8" />
          <stop offset="60%" stopColor="#E8BFA0" />
          <stop offset="100%" stopColor="#D4A07A" />
        </radialGradient>

        {/* Hair — deep near-black with warm undertone */}
        <linearGradient id="av-hair" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#1C1612" />
          <stop offset="100%" stopColor="#0E0B08" />
        </linearGradient>

        {/* Blazer — charcoal with copper sheen */}
        <linearGradient id="av-blazer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#252228" />
          <stop offset="50%" stopColor="#1E1B20" />
          <stop offset="100%" stopColor="#17151A" />
        </linearGradient>

        {/* Shirt — warm off-white */}
        <linearGradient id="av-shirt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAF5F0" />
          <stop offset="100%" stopColor="#EDE4DA" />
        </linearGradient>

        {/* Pocket square — copper accent */}
        <linearGradient id="av-pocket" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A27F" />
          <stop offset="100%" stopColor="#C08B5C" />
        </linearGradient>

        {/* Shadow filter */}
        <filter id="av-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
          <feOffset dx="0" dy="1.5" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle noise for texture */}
        <filter id="av-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="monoNoise" />
          <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply" result="textured" />
          <feComponentTransfer in="textured">
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* ── Blazer / Shoulders ── */}
      <g filter="url(#av-shadow)">
        {/* Shoulder mass */}
        <path
          d="M 24 200 Q 24 162 52 152 L 72 148 Q 88 145 100 144 Q 112 145 128 148 L 148 152 Q 176 162 176 200 Z"
          fill="url(#av-blazer)"
        />
        {/* Blazer lapel left */}
        <path d="M 68 152 L 80 148 L 88 172 L 72 168 Z" fill="#2A262E" />
        {/* Blazer lapel right */}
        <path d="M 132 152 L 120 148 L 112 172 L 128 168 Z" fill="#2A262E" />

        {/* Lapel edge highlight */}
        <path d="M 68 152 L 80 148" stroke="#3A3540" strokeWidth="0.8" fill="none" />
        <path d="M 132 152 L 120 148" stroke="#3A3540" strokeWidth="0.8" fill="none" />

        {/* Shoulder stitching detail */}
        <path d="M 40 170 Q 55 160 72 155" stroke="#2E2A32" strokeWidth="0.6" fill="none" strokeDasharray="2 3" opacity="0.4" />
        <path d="M 160 170 Q 145 160 128 155" stroke="#2E2A32" strokeWidth="0.6" fill="none" strokeDasharray="2 3" opacity="0.4" />
      </g>

      {/* ── Shirt & collar ── */}
      <g>
        {/* Shirt V */}
        <path d="M 88 148 L 100 180 L 112 148 Z" fill="url(#av-shirt)" />

        {/* Collar left */}
        <path d="M 78 150 L 88 146 L 92 158 L 82 160 Z" fill="#FAF5F0" />
        {/* Collar right */}
        <path d="M 122 150 L 112 146 L 108 158 L 118 160 Z" fill="#FAF5F0" />

        {/* Collar shadows */}
        <path d="M 82 160 L 92 158" stroke="#DDD4CA" strokeWidth="0.7" fill="none" />
        <path d="M 118 160 L 108 158" stroke="#DDD4CA" strokeWidth="0.7" fill="none" />
      </g>

      {/* ── Pocket square (copper accent) ── */}
      <path d="M 131 168 L 136 166 L 138 176 L 133 177 Z" fill="url(#av-pocket)" opacity="0.85" />
      <path d="M 132 169 L 135 167" stroke="#E0C4A8" strokeWidth="0.5" fill="none" opacity="0.6" />

      {/* ── Neck ── */}
      <rect x="86" y="130" width="28" height="22" rx="8" fill="url(#av-skin)" />
      {/* Neck shadow */}
      <ellipse cx="100" cy="148" rx="14" ry="4" fill="#C4956A" opacity="0.2" />

      {/* ── Head ── */}
      <g filter="url(#av-shadow)">
        <ellipse cx="100" cy="88" rx="42" ry="50" fill="url(#av-skin)" />

        {/* Jawline definition */}
        <path d="M 62 100 Q 70 128 100 135 Q 130 128 138 100" fill="none" stroke="#D4A07A" strokeWidth="1" opacity="0.3" />

        {/* Cheek contour — left */}
        <ellipse cx="72" cy="100" rx="10" ry="14" fill="#D4A07A" opacity="0.12" />
        {/* Cheek contour — right */}
        <ellipse cx="128" cy="100" rx="10" ry="14" fill="#D4A07A" opacity="0.12" />

        {/* Forehead highlight */}
        <ellipse cx="100" cy="62" rx="22" ry="10" fill="#FAE5D2" opacity="0.25" />
      </g>

      {/* ── Ears ── */}
      <g>
        <ellipse cx="60" cy="90" rx="7" ry="12" fill="#E8BFA0" />
        <ellipse cx="140" cy="90" rx="7" ry="12" fill="#E8BFA0" />
        <ellipse cx="60.5" cy="90" rx="4" ry="7" fill="#D4A07A" opacity="0.35" />
        <ellipse cx="139.5" cy="90" rx="4" ry="7" fill="#D4A07A" opacity="0.35" />
      </g>

      {/* ── Hair ── */}
      <g>
        {/* Main hair volume */}
        <path
          d="M 58 56 Q 54 38 72 30 Q 86 24 100 24 Q 114 24 128 30 Q 146 38 142 56 Q 140 68 138 78 L 134 66 Q 126 54 116 48 Q 108 44 100 44 Q 92 44 84 48 Q 74 54 66 66 L 62 78 Q 60 68 58 56 Z"
          fill="url(#av-hair)"
        />
        {/* Side taper left */}
        <path d="M 60 78 Q 59 85 60 90" stroke="url(#av-hair)" strokeWidth="3" fill="none" opacity="0.6" />
        {/* Side taper right */}
        <path d="M 140 78 Q 141 85 140 90" stroke="url(#av-hair)" strokeWidth="3" fill="none" opacity="0.6" />

        {/* Hair part line */}
        <path d="M 82 34 Q 92 30 100 30" stroke="#2A1E14" strokeWidth="0.8" fill="none" opacity="0.4" />

        {/* Subtle hair strands */}
        <path d="M 72 44 Q 85 38 100 37 Q 115 38 128 44" stroke="#261C12" strokeWidth="0.7" fill="none" opacity="0.2" />
        <path d="M 68 52 Q 84 44 100 43 Q 116 44 132 52" stroke="#261C12" strokeWidth="0.6" fill="none" opacity="0.15" />
      </g>

      {/* ── Eyebrows — groomed, confident arch ── */}
      <g>
        <path d="M 72 74 Q 78 71 86 73" stroke="#1C1612" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 114 73 Q 122 71 128 74" stroke="#1C1612" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Brow highlight */}
        <path d="M 73 73 Q 78 70.5 85 72.5" stroke="#3A2E22" strokeWidth="0.6" fill="none" opacity="0.3" />
        <path d="M 115 72.5 Q 122 70.5 127 73" stroke="#3A2E22" strokeWidth="0.6" fill="none" opacity="0.3" />
      </g>

      {/* ── Eyes — proportionate, warm ── */}
      <g>
        {/* Eye sockets — subtle shadow */}
        <ellipse cx="80" cy="86" rx="11" ry="7" fill="#D4A07A" opacity="0.1" />
        <ellipse cx="120" cy="86" rx="11" ry="7" fill="#D4A07A" opacity="0.1" />

        {/* Sclera */}
        <ellipse cx="80" cy="87" rx="8" ry="6.5" fill="#FEFEFE" />
        <ellipse cx="120" cy="87" rx="8" ry="6.5" fill="#FEFEFE" />

        {/* Iris — warm brown */}
        <circle cx="80" cy="87.5" r="4.5" fill="#5C432E" />
        <circle cx="120" cy="87.5" r="4.5" fill="#5C432E" />

        {/* Iris detail ring */}
        <circle cx="80" cy="87.5" r="3.5" fill="none" stroke="#7A5C42" strokeWidth="0.6" opacity="0.5" />
        <circle cx="120" cy="87.5" r="3.5" fill="none" stroke="#7A5C42" strokeWidth="0.6" opacity="0.5" />

        {/* Pupil */}
        <circle cx="80" cy="87.5" r="2.5" fill="#0E0B08" />
        <circle cx="120" cy="87.5" r="2.5" fill="#0E0B08" />

        {/* Catchlight — top-right */}
        <circle cx="81.5" cy="86" r="1.8" fill="#FFFFFF" opacity="0.9" />
        <circle cx="121.5" cy="86" r="1.8" fill="#FFFFFF" opacity="0.9" />
        {/* Secondary catchlight */}
        <circle cx="78.5" cy="89" r="0.7" fill="#FFFFFF" opacity="0.5" />
        <circle cx="118.5" cy="89" r="0.7" fill="#FFFFFF" opacity="0.5" />

        {/* Upper eyelid crease */}
        <path d="M 72 84.5 Q 80 81.5 88 84.5" stroke="#B08D6E" strokeWidth="1" fill="none" opacity="0.35" />
        <path d="M 112 84.5 Q 120 81.5 128 84.5" stroke="#B08D6E" strokeWidth="1" fill="none" opacity="0.35" />

        {/* Lower lash line */}
        <path d="M 73 89 Q 80 91 87 89" stroke="#8B7460" strokeWidth="0.6" fill="none" opacity="0.25" />
        <path d="M 113 89 Q 120 91 127 89" stroke="#8B7460" strokeWidth="0.6" fill="none" opacity="0.25" />

        {/* Eyelashes — subtle top line */}
        <path d="M 72 85 Q 80 82 88 85" stroke="#1C1612" strokeWidth="1.4" fill="none" opacity="0.5" />
        <path d="M 112 85 Q 120 82 128 85" stroke="#1C1612" strokeWidth="1.4" fill="none" opacity="0.5" />
      </g>

      {/* ── Nose ── */}
      <g>
        {/* Bridge */}
        <path d="M 100 78 L 100 104" stroke="#D4A07A" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
        {/* Bridge highlight */}
        <path d="M 99 80 L 99 102" stroke="#FAE5D2" strokeWidth="0.8" opacity="0.3" />
        {/* Nostrils */}
        <ellipse cx="96" cy="106" rx="2.5" ry="2" fill="#C4956A" opacity="0.35" />
        <ellipse cx="104" cy="106" rx="2.5" ry="2" fill="#C4956A" opacity="0.35" />
        {/* Nose tip */}
        <ellipse cx="100" cy="105" rx="4" ry="2.5" fill="url(#av-skin)" opacity="0.5" />
      </g>

      {/* ── Mouth — closed, composed, slight smile ── */}
      <g>
        {/* Lip line */}
        <path
          d="M 88 117 Q 94 119 100 118.5 Q 106 119 112 117"
          stroke="#B5766A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Upper lip cupid's bow */}
        <path d="M 93 117 Q 96.5 115.5 100 116 Q 103.5 115.5 107 117" fill="#C4867A" opacity="0.5" />
        {/* Lower lip highlight */}
        <ellipse cx="100" cy="120" rx="7" ry="2.5" fill="#D4978A" opacity="0.2" />
        {/* Subtle smile crease */}
        <path d="M 86 117 Q 87 118 88 118" stroke="#C4956A" strokeWidth="0.6" fill="none" opacity="0.3" />
        <path d="M 114 117 Q 113 118 112 118" stroke="#C4956A" strokeWidth="0.6" fill="none" opacity="0.3" />
      </g>

      {/* ── Chin highlight ── */}
      <ellipse cx="100" cy="130" rx="8" ry="4" fill="#FAE5D2" opacity="0.12" />

      {/* ── 5-o'clock shadow (very subtle) ── */}
      <g opacity="0.06">
        <ellipse cx="100" cy="125" rx="20" ry="10" fill="#1C1612" />
        <ellipse cx="80" cy="115" rx="6" ry="8" fill="#1C1612" />
        <ellipse cx="120" cy="115" rx="6" ry="8" fill="#1C1612" />
      </g>
    </svg>
  );
};
