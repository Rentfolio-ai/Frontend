/**
 * Default Command Definitions
 */

import type { Command } from './types';
import { Settings, HelpCircle, Home, DollarSign, Target, Search, TrendingUp } from 'lucide-react';

export const createDefaultCommands = (callbacks: {
    openPreferences: () => void;
    openHelp: () => void;
    focusComposer: (prefix?: string) => void;
    openDealAnalyzer?: () => void;
}): Command[] => [
        // Preferences
        {
            id: 'open-preferences',
            label: 'Open Preferences',
            description: 'Configure your Buy Box & Financial DNA',
            icon: Settings,
            category: 'preference',
            keywords: ['settings', 'config', 'dna', 'preferences', 'setup'],
            shortcut: '⌘,',
            action: callbacks.openPreferences,
        },
        {
            id: 'set-strategy',
            label: 'Set Investment Strategy',
            description: 'Choose STR, LTR, or FLIP',
            icon: Target,
            category: 'preference',
            keywords: ['strategy', 'str', 'ltr', 'flip', 'rental'],
            action: callbacks.openPreferences,
        },
        {
            id: 'set-budget',
            label: 'Set Budget Range',
            description: 'Define your investment budget',
            icon: DollarSign,
            category: 'preference',
            keywords: ['budget', 'money', 'price', 'range', 'max'],
            action: callbacks.openPreferences,
        },

        // Actions
        {
            id: 'search-properties',
            label: 'Search Properties',
            description: 'Find investment properties',
            icon: Search,
            category: 'action',
            keywords: ['search', 'find', 'properties', 'scout', 'hunt', 'lookup'],
            action: () => callbacks.focusComposer('/search '),
        },
        {
            id: 'analyze-deal',
            label: 'Analyze Deal',
            description: 'Calculate ROI and cash flow',
            icon: TrendingUp,
            category: 'action',
            keywords: ['analyze', 'deal', 'roi', 'calculator', 'pnl', 'returns'],
            action: () => callbacks.focusComposer('/analyze '),
        },
        {
            id: 'market-insights',
            label: 'Get Market Insights',
            description: 'Research market trends and data',
            icon: Home,
            category: 'action',
            keywords: ['market', 'trends', 'insights', 'data', 'research'],
            action: () => callbacks.focusComposer('What are the market trends in '),
        },

        // Help
        {
            id: 'open-help',
            label: 'Open Help Center',
            description: 'View documentation and tutorials',
            icon: HelpCircle,
            category: 'help',
            keywords: ['help', 'docs', 'documentation', 'tutorial', 'guide'],
            shortcut: '⌘/',
            action: callbacks.openHelp,
        },
        {
            id: 'keyboard-shortcuts',
            label: 'View Keyboard Shortcuts',
            description: 'See all available shortcuts',
            icon: HelpCircle,
            category: 'help',
            keywords: ['keyboard', 'shortcuts', 'hotkeys', 'commands'],
            action: callbacks.openHelp,
        },
    ];
