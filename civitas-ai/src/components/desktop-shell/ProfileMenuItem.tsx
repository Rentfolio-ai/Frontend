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
    className = "text-foreground/70 hover:text-foreground"
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-black/5 
                  transition-all group ${className}`}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left text-sm font-medium">{label}</span>
            {shortcut && (
                <span className="text-xs text-muted-foreground/50 font-mono">{shortcut}</span>
            )}
            {badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded 
                         bg-gradient-to-r from-[#C08B5C] to-purple-500 text-white">
                    {badge}
                </span>
            )}
            {hasArrow && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            )}
        </button>
    );
};
