// FILE: src/components/chat/KeyboardShortcutsModal.tsx
import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Shortcut {
    keys: string[];
    description: string;
    category: string;
}

const shortcuts: Shortcut[] = [
    // Composer
    { keys: ['⌘', 'K'], description: 'Focus composer / search', category: 'Composer' },
    { keys: ['⌘', '↵'], description: 'Send message', category: 'Composer' },
    { keys: ['↑'], description: 'Edit last message (when empty)', category: 'Composer' },
    { keys: ['⇧', '↵'], description: 'New line in message', category: 'Composer' },

    // Navigation
    { keys: ['⌘', 'F'], description: 'Search in conversation', category: 'Navigation' },
    { keys: ['⌘', '/'], description: 'Show shortcuts', category: 'Navigation' },
    { keys: ['⌘', ','], description: 'Open preferences', category: 'Navigation' },
    { keys: ['Esc'], description: 'Close dialogs / Cancel', category: 'Navigation' },

    // Search
    { keys: ['↵'], description: 'Next search result', category: 'Search' },
    { keys: ['⇧', '↵'], description: 'Previous search result', category: 'Search' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const categories = Array.from(new Set(shortcuts.map(s => s.category)));

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                                <Command className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
                                <p className="text-xs text-white/50">Work faster with these shortcuts</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {categories.map((category) => (
                            <div key={category} className="mb-6 last:mb-0">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                                    {category}
                                </h3>
                                <div className="space-y-2">
                                    {shortcuts
                                        .filter((s) => s.category === category)
                                        .map((shortcut, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <span className="text-sm text-white/80">{shortcut.description}</span>
                                                <div className="flex items-center gap-1">
                                                    {shortcut.keys.map((key, keyIndex) => (
                                                        <React.Fragment key={keyIndex}>
                                                            <kbd className="px-2 py-1 text-xs font-semibold text-white/90 bg-white/10 border border-white/20 rounded shadow-sm min-w-[28px] text-center">
                                                                {key}
                                                            </kbd>
                                                            {keyIndex < shortcut.keys.length - 1 && (
                                                                <span className="text-white/40 text-xs mx-0.5">+</span>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-white/10 bg-white/5">
                        <p className="text-xs text-white/40 text-center">
                            Press <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded">⌘/</kbd> anytime to show this menu
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
