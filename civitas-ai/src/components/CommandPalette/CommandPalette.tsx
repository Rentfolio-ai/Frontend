/**
 * Command Palette Component
 * Spotlight-style command launcher (⌘K)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command as CommandIcon } from 'lucide-react';
import Fuse from 'fuse.js';
import type { Command, CommandGroup } from './types';
import { createDefaultCommands } from './commands';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenPreferences: () => void;
    onOpenHelp: () => void;
    onFocusComposer: (prefix?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    onOpenPreferences,
    onOpenHelp,
    onFocusComposer,
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Generate commands
    const commands = useMemo(() => createDefaultCommands({
        openPreferences: () => {
            onClose();
            onOpenPreferences();
        },
        openHelp: () => {
            onClose();
            onOpenHelp();
        },
        focusComposer: (prefix?: string) => {
            onClose();
            onFocusComposer(prefix);
        },
    }), [onClose, onOpenPreferences, onOpenHelp, onFocusComposer]);

    // Setup fuzzy search
    const fuse = useMemo(() => new Fuse(commands, {
        keys: ['label', 'description', 'keywords'],
        threshold: 0.3,
        includeScore: true,
    }), [commands]);

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) return commands;

        const results = fuse.search(query);
        return results.map(result => result.item);
    }, [query, fuse, commands]);

    // Group commands by category
    const groupedCommands = useMemo(() => {
        const groups: CommandGroup[] = [];
        const categoryLabels: Record<string, string> = {
            action: 'Actions',
            navigation: 'Navigation',
            preference: 'Preferences',
            help: 'Help & Support',
        };

        const categorized = filteredCommands.reduce((acc, cmd) => {
            if (!acc[cmd.category]) acc[cmd.category] = [];
            acc[cmd.category].push(cmd);
            return acc;
        }, {} as Record<string, Command[]>);

        Object.entries(categorized).forEach(([category, cmds]) => {
            groups.push({
                category: category as any,
                label: categoryLabels[category] || category,
                commands: cmds,
            });
        });

        return groups;
    }, [filteredCommands]);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[20vh]">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-2xl bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                        <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search commands..."
                            className="flex-1 bg-transparent text-white placeholder-white/40 text-base focus:outline-none"
                        />
                        <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-white/40 text-xs font-mono">
                            <span>ESC</span>
                        </kbd>
                    </div>

                    {/* Results */}
                    <div ref={listRef} className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {groupedCommands.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-white/40 text-sm">No commands found</p>
                            </div>
                        ) : (
                            groupedCommands.map((group, groupIdx) => (
                                <div key={group.category} className={groupIdx > 0 ? 'mt-1' : ''}>
                                    {/* Category Label */}
                                    <div className="px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider bg-white/[0.02]">
                                        {group.label}
                                    </div>

                                    {/* Commands */}
                                    {group.commands.map((command, cmdIdx) => {
                                        const globalIndex = groupedCommands
                                            .slice(0, groupIdx)
                                            .reduce((acc, g) => acc + g.commands.length, 0) + cmdIdx;
                                        const isSelected = globalIndex === selectedIndex;

                                        return (
                                            <button
                                                key={command.id}
                                                onClick={() => command.action()}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                                    isSelected
                                                        ? 'bg-blue-500/10 border-l-2 border-blue-500'
                                                        : 'border-l-2 border-transparent hover:bg-white/5'
                                                )}
                                            >
                                                {/* Icon */}
                                                {command.icon && (
                                                    <command.icon className={cn(
                                                        'w-5 h-5 flex-shrink-0',
                                                        isSelected ? 'text-blue-400' : 'text-white/40'
                                                    )} />
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-white">
                                                        {command.label}
                                                    </div>
                                                    {command.description && (
                                                        <div className="text-xs text-white/50 truncate">
                                                            {command.description}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Shortcut */}
                                                {command.shortcut && (
                                                    <kbd className="hidden sm:flex items-center px-2 py-1 rounded-md bg-white/5 text-white/40 text-xs font-mono">
                                                        {command.shortcut}
                                                    </kbd>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-white/[0.02]">
                        <div className="flex items-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white/5">↑</kbd>
                                <kbd className="px-1.5 py-0.5 rounded bg-white/5">↓</kbd>
                                <span className="ml-1">Navigate</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white/5">⏎</kbd>
                                <span className="ml-1">Select</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/30">
                            <CommandIcon className="w-3 h-3" />
                            <span>Command Palette</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
