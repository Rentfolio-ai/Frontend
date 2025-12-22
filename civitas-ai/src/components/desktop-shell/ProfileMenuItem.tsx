import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    shortcut?: string;
    badge?: string;
    hasArrow?: boolean;
    className?: string;
}

export const ProfileMenuItem: React.FC<MenuItemProps> = ({
    icon: Icon,
    label,
    onClick,
    shortcut,
    badge,
    hasArrow,
    className = "text-white/70 hover:text-white"
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 
                  transition-all group ${className}`}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left text-sm font-medium">{label}</span>
            {shortcut && (
                <span className="text-xs text-white/30 font-mono">{shortcut}</span>
            )}
            {badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded 
                         bg-gradient-to-r from-teal-500 to-purple-500 text-white">
                    {badge}
                </span>
            )}
            {hasArrow && (
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
            )}
        </button>
    );
};
