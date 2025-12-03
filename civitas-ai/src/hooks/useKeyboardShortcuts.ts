/**
 * Keyboard Shortcuts Hook
 * 
 * Provides keyboard shortcuts for navigation and actions
 */

import { useEffect } from 'react';

interface KeyboardShortcutsProps {
    onFocusInput: () => void;
    onOpenBookmarks: () => void;
    onSearchChats: () => void;
    onOpenHelp: () => void;
    onEscape: () => void;
}

export const useKeyboardShortcuts = ({
    onFocusInput,
    onOpenBookmarks,
    onSearchChats,
    onOpenHelp,
    onEscape
}: KeyboardShortcutsProps) => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const isMod = e.metaKey || e.ctrlKey;

            // Cmd/Ctrl + K - Focus search
            if (isMod && e.key === 'k') {
                e.preventDefault();
                onFocusInput();
            }

            // Cmd/Ctrl + B - Open bookmarks
            if (isMod && e.key === 'b') {
                e.preventDefault();
                onOpenBookmarks();
            }

            // Cmd/Ctrl + F - Search chats
            if (isMod && e.key === 'f') {
                e.preventDefault();
                onSearchChats();
            }

            // Cmd/Ctrl + / - Open help
            if (isMod && e.key === '/') {
                e.preventDefault();
                onOpenHelp();
            }

            // Escape - Close modals/clear
            if (e.key === 'Escape') {
                onEscape();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onFocusInput, onOpenBookmarks, onSearchChats, onOpenHelp, onEscape]);
};
