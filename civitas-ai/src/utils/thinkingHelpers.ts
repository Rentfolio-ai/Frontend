// FILE: src/utils/thinkingHelpers.ts
/**
 * Helper utilities for thinking state UI components
 */

import { Brain, Sparkles, GitBranch, Route, Wrench as Tool, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SourceConfig {
    icon: LucideIcon;
    color: string;
    label: string;
    bgLight: string;
    bgDark: string;
    textLight: string;
    textDark: string;
}

/**
 * Get configuration for a thinking event source
 */
export function getSourceConfig(source: string): SourceConfig {
    const configs: Record<string, SourceConfig> = {
        'System 2 Reasoning': {
            icon: Brain,
            color: 'purple',
            label: 'Deep Reasoning',
            bgLight: 'bg-purple-100',
            bgDark: 'bg-purple-950',
            textLight: 'text-purple-700',
            textDark: 'text-purple-300',
        },
        'HyDE Generator': {
            icon: Sparkles,
            color: 'violet',
            label: 'HyDE',
            bgLight: 'bg-violet-100',
            bgDark: 'bg-violet-950',
            textLight: 'text-violet-700',
            textDark: 'text-violet-300',
        },
        'Multi-hop Reasoner': {
            icon: GitBranch,
            color: 'blue',
            label: 'Multi-hop',
            bgLight: 'bg-blue-100',
            bgDark: 'bg-blue-950',
            textLight: 'text-blue-700',
            textDark: 'text-blue-300',
        },
        'Adaptive Router': {
            icon: Route,
            color: 'emerald',
            label: 'Router',
            bgLight: 'bg-emerald-100',
            bgDark: 'bg-emerald-950',
            textLight: 'text-emerald-700',
            textDark: 'text-emerald-300',
        },
        'RAG Optimizer': {
            icon: Zap,
            color: 'amber',
            label: 'Optimizer',
            bgLight: 'bg-amber-100',
            bgDark: 'bg-amber-950',
            textLight: 'text-amber-700',
            textDark: 'text-amber-300',
        },
        'Agent Tools': {
            icon: Tool,
            color: 'slate',
            label: 'Tools',
            bgLight: 'bg-slate-100',
            bgDark: 'bg-slate-800',
            textLight: 'text-slate-700',
            textDark: 'text-slate-300',
        },
    };

    return configs[source] || configs['Agent Tools'];
}

/**
 * Get background gradient class based on source and theme
 */
export function getBackgroundGradient(source: string, isDark: boolean): string {
    const gradients = {
        light: {
            'System 2 Reasoning': 'from-purple-50/40 via-indigo-50/30 to-blue-50/40',
            'HyDE Generator': 'from-violet-50/40 to-purple-50/40',
            'Multi-hop Reasoner': 'from-blue-50/40 to-cyan-50/40',
            'Adaptive Router': 'from-emerald-50/40 to-[#D4A27F]/40',
            'RAG Optimizer': 'from-amber-50/40 to-yellow-50/40',
            'Agent Tools': 'from-slate-50/60 to-gray-50/60',
        },
        dark: {
            'System 2 Reasoning': 'from-purple-950/30 via-indigo-950/20 to-blue-950/30',
            'HyDE Generator': 'from-violet-950/30 to-purple-950/30',
            'Multi-hop Reasoner': 'from-blue-950/30 to-cyan-950/30',
            'Adaptive Router': 'from-emerald-950/30 to-[#C08B5C]/30',
            'RAG Optimizer': 'from-amber-950/30 to-yellow-950/30',
            'Agent Tools': 'from-slate-900/40 to-gray-900/40',
        },
    };

    const mode = isDark ? 'dark' : 'light';
    const sourceGradients = gradients[mode] as Record<string, string>;
    return `bg-gradient-to-r ${sourceGradients[source] || sourceGradients['Agent Tools']}`;
}

/**
 * Estimate remaining time based on source and elapsed time
 */
export function estimateCompletionTime(source: string, elapsed: number): number {
    const estimates: Record<string, number> = {
        'System 2 Reasoning': 3000, // 3s
        'HyDE Generator': 1500,     // 1.5s
        'Multi-hop Reasoner': 2000, // 2s
        'Adaptive Router': 500,     // 0.5s
        'RAG Optimizer': 300,       // 0.3s
        'Agent Tools': 1000,        // 1s
    };

    const totalEstimate = estimates[source] || 1000;
    return Math.max(0, totalEstimate - elapsed);
}

/**
 * Format thinking status with proper capitalization
 */
export function formatThinkingStatus(status: string): string {
    if (!status) return '';

    // Capitalize first letter, ensure proper punctuation
    const formatted = status.charAt(0).toUpperCase() + status.slice(1);

    // Add ellipsis for ongoing actions if not present
    if (formatted.includes('...') || formatted.endsWith('.') || formatted.endsWith('!')) {
        return formatted;
    }

    // Check if it's an ongoing action (contains "ing")
    if (formatted.includes('ing') || formatted.includes('Generating') || formatted.includes('Processing')) {
        return `${formatted}...`;
    }

    return formatted;
}

/**
 * Get border color class based on source
 */
export function getBorderColor(source: string, isDark: boolean): string {
    const borders = {
        light: {
            'System 2 Reasoning': 'border-purple-200/50',
            'HyDE Generator': 'border-violet-200/50',
            'Multi-hop Reasoner': 'border-blue-200/50',
            'Adaptive Router': 'border-emerald-200/50',
            'RAG Optimizer': 'border-amber-200/50',
            'Agent Tools': 'border-gray-200/50',
        },
        dark: {
            'System 2 Reasoning': 'border-purple-800/50',
            'HyDE Generator': 'border-violet-800/50',
            'Multi-hop Reasoner': 'border-blue-800/50',
            'Adaptive Router': 'border-emerald-800/50',
            'RAG Optimizer': 'border-amber-800/50',
            'Agent Tools': 'border-gray-700/50',
        },
    };

    const mode = isDark ? 'dark' : 'light';
    const sourceBorders = borders[mode] as Record<string, string>;
    return sourceBorders[source] || sourceBorders['Agent Tools'];
}
