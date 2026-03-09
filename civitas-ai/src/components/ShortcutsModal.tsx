import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command, Settings, Maximize2 } from 'lucide-react';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ShortcutCategory {
    title: string;
    items: Array<{
        label: string;
        keys: string[];
        icon?: React.ReactNode;
    }>;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    const categories: ShortcutCategory[] = [
        {
            title: 'General',
            items: [
                { label: 'Focus Chat Input', keys: ['⌘', 'K'], icon: <Keyboard className="w-4 h-4" /> },
                { label: 'Toggle Wide Mode', keys: ['⌘', '⇧', 'F'], icon: <Maximize2 className="w-4 h-4" /> },
                { label: 'Open Preferences', keys: ['⌘', ','], icon: <Settings className="w-4 h-4" /> },
                { label: 'Show Keyboard Shortcuts', keys: ['⌘', '/'], icon: <Keyboard className="w-4 h-4" /> },
                { label: 'Stop Generation', keys: ['Esc'], icon: <X className="w-4 h-4" /> },
            ]
        },
        // {
        //   title: 'Navigation',
        //   items: [
        //     { label: 'Search Chats', keys: ['⌘', 'F'], icon: <Search className="w-4 h-4" /> },
        //     { label: 'Toggle Sidebar', keys: ['⌘', 'B'], icon: <Layout className="w-4 h-4" /> },
        //   ]
        // }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-popover border border-black/8 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-black/8 bg-black/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-black/8 flex items-center justify-center">
                                    <Command className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Keyboard Shortcuts</h2>
                                    <p className="text-sm text-muted-foreground">Power user navigation</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-black/5 text-muted-foreground/70 hover:text-foreground transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Shortcuts Grid */}
                        <div className="p-6">
                            <div className="space-y-8">
                                {categories.map((category) => (
                                    <div key={category.title}>
                                        <h3 className="text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-4">
                                            {category.title}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {category.items.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] border border-black/[0.05] hover:bg-black/[0.05] transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-black/5 text-muted-foreground group-hover:text-foreground group-hover:bg-black/8 transition-colors">
                                                            {item.icon}
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {item.keys.map((key, i) => (
                                                            <kbd
                                                                key={i}
                                                                className="min-w-[24px] h-7 px-2 flex items-center justify-center rounded-lg bg-black/[0.07] border-b-2 border-black/[0.05] text-[11px] font-bold text-foreground font-mono"
                                                            >
                                                                {key}
                                                            </kbd>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-black/8 bg-black/[0.02] text-center">
                            <p className="text-xs text-muted-foreground/50">
                                Press <kbd className="font-mono text-muted-foreground">Esc</kbd> to close
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
