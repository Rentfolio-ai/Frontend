import React, { useMemo } from 'react';
import { AvatarSize } from '@/types/enums';
import type { AvatarSize as AvatarSizeType } from '@/types/enums';

interface UserAvatarProps {
  name: string;
  size?: AvatarSizeType;
  className?: string;
}

// Extract initials from name (Unicode-safe) - moved outside component for stable reference
const getInitials = (fullName: string): string => {
  if (!fullName || !fullName.trim()) return 'U';
  
  // Filter out empty segments and use Unicode-safe indexing
  const names = fullName.trim().split(' ').filter(n => n.length > 0);
  if (names.length === 0) return 'U';
  
  if (names.length === 1) {
    // Single name: take first character (Unicode-safe)
    const chars = Array.from(names[0]);
    return chars[0] ? chars[0].toUpperCase() : 'U';
  }
  
  // First and last name initials (Unicode-safe)
  const firstChars = Array.from(names[0]);
  const lastChars = Array.from(names[names.length - 1]);
  const firstInitial = firstChars[0] ? firstChars[0].toUpperCase() : '';
  const lastInitial = lastChars[0] ? lastChars[0].toUpperCase() : '';
  
  return (firstInitial + lastInitial) || 'U';
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = AvatarSize.Medium, className = '' }) => {
  const sizeClasses: Record<AvatarSizeType, string> = {
    [AvatarSize.Small]: 'w-8 h-8 text-xs',
    [AvatarSize.Medium]: 'w-10 h-10 text-sm',
    [AvatarSize.Large]: 'w-12 h-12 text-base'
  };

  // Memoize initials calculation to avoid recomputing on every render
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div 
      className={`${sizeClasses[size]} ${className} flex-shrink-0 rounded-full flex items-center justify-center font-semibold transition-all duration-200 hover:scale-105`}
      style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        color: '#ffffff',
        boxShadow: '0px 2px 8px rgba(30, 64, 175, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}
      title={name}
    >
      {initials}
    </div>
  );
};
