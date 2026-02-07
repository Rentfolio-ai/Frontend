import React from 'react';
import { Search } from 'lucide-react';

interface SearchFloatingButtonProps {
    onClick: () => void;
}

export const SearchFloatingButton: React.FC<SearchFloatingButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed top-4 right-4 z-30 p-3 bg-gradient-to-br from-[#C08B5C] to-[#A8734A] rounded-full shadow-lg hover:shadow-[#C08B5C]/30 hover:scale-110 transition-all duration-200 group"
            aria-label="Search chats"
        >
            <Search className="w-5 h-5 text-white" />

            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Search Chats
            </span>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-[#C08B5C]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
        </button>
    );
};
