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
    [AvatarSize.Small]: 'w-6 h-6 text-[10px]',
    [AvatarSize.Medium]: 'w-8 h-8 text-xs',
    [AvatarSize.Large]: 'w-10 h-10 text-sm'
  };

  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div 
      className={`${sizeClasses[size]} ${className} flex-shrink-0 rounded-full flex items-center justify-center font-medium`}
      style={{
        background: 'rgba(0, 0, 0, 0.05)',
        color: 'rgba(255, 255, 255, 0.7)',
      }}
      title={name}
    >
      {initials}
    </div>
  );
};
