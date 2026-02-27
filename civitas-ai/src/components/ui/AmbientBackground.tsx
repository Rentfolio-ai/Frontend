import React from 'react';

type AmbientVariant = 'home' | 'deals' | 'reports' | 'teams';

interface AmbientBackgroundProps {
  variant?: AmbientVariant;
}

interface OrbDef {
  color: string;
  opacity: number;
  size: string;
  position: string;
  blur: string;
}

const VARIANTS: Record<AmbientVariant, OrbDef[]> = {
  home: [
    { color: '#C08B5C', opacity: 0.02, size: '400px', position: '-top-[100px] -right-[80px]', blur: '160px' },
    { color: '#8B5C5C', opacity: 0.015, size: '300px', position: '-bottom-[80px] -left-[60px]', blur: '140px' },
  ],
  deals: [
    { color: '#4A6FA5', opacity: 0.02, size: '380px', position: '-bottom-[80px] -left-[80px]', blur: '160px' },
    { color: '#5C6B8B', opacity: 0.015, size: '280px', position: '-top-[60px] -right-[50px]', blur: '140px' },
  ],
  reports: [
    { color: '#2D8B5C', opacity: 0.02, size: '350px', position: '-top-[80px] -left-[60px]', blur: '160px' },
    { color: '#3A7A8B', opacity: 0.015, size: '300px', position: 'top-[40%] -right-[50px]', blur: '140px' },
  ],
  teams: [
    { color: '#7C5CBF', opacity: 0.02, size: '350px', position: '-top-[60px] left-[30%]', blur: '160px' },
    { color: '#C08B5C', opacity: 0.012, size: '280px', position: '-bottom-[60px] -right-[50px]', blur: '140px' },
  ],
};

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ variant = 'home' }) => {
  const orbs = VARIANTS[variant];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${orb.position}`}
          style={{
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            opacity: orb.opacity,
            filter: `blur(${orb.blur})`,
          }}
        />
      ))}
    </div>
  );
};
