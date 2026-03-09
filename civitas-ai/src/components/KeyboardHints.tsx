/**
 * Keyboard Hints Component
 * 
 * Shows available keyboard shortcuts
 */

import React from 'react';
import { Command } from 'lucide-react';

export const KeyboardHints: React.FC = () => {
    const shortcuts = [
        { keys: ['⌘', 'K'], description: 'Focus search' },
        { keys: ['⌘', 'B'], description: 'Bookmarks' },
        { keys: ['⌘', 'F'], description: 'Search chats' },
        { keys: ['⌘', '/'], description: 'Help' },
        { keys: ['Esc'], description: 'Close' }
    ];

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
            <div className="flex items-center gap-2 mb-3">
                <Command className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h3>
            </div>

            <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{shortcut.description}</span>
                        <div className="flex gap-1">
                            {shortcut.keys.map((key, i) => (
                                <kbd
                                    key={i}
                                    className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono text-gray-700"
                                >
                                    {key}
                                </kbd>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Keyboard Hints Toggle
 * 
 * Button to show/hide keyboard hints
 */
export const KeyboardHintsToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-4 right-4 w-10 h-10 bg-muted text-foreground rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            title="Keyboard shortcuts"
        >
            <Command className="w-5 h-5" />
        </button>
    );
};
