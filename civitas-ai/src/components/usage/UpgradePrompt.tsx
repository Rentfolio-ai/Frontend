/**
 * Upgrade Prompt - Inline prompt for premium features
 * Shows when user tries to use a gated feature
 */

import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface UpgradePromptProps {
    feature: string;
    description: string;
    onUpgrade: () => void;
    onDismiss: () => void;
    isVisible: boolean;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
    feature,
    description,
    onUpgrade,
    onDismiss,
    isVisible,
}) => {
    if (!isVisible) return null;

    return (
        <div className="mb-4 p-4 rounded-lg border border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-purple-500/5 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-1">
                        Upgrade to use {feature}
                    </h3>
                    <p className="text-xs text-white/60 mb-3">
                        {description}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onUpgrade}
                            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 rounded-md text-white text-xs font-semibold transition-all"
                        >
                            View plans
                        </button>
                        <button
                            onClick={onDismiss}
                            className="px-3 py-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/5 text-xs font-medium transition-all"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 text-white/40" />
                </button>
            </div>
        </div>
    );
};

/**
 * Query Limit Prompt - Shows when user reaches query limit
 */
export const QueryLimitPrompt: React.FC<{
    onUpgrade: () => void;
    isVisible: boolean;
}> = ({ onUpgrade, isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="mb-4 p-4 rounded-lg border border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-red-500/5 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
                <div className="text-2xl">🚀</div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-1">
                        You've reached your monthly limit
                    </h3>
                    <p className="text-xs text-white/60 mb-3">
                        Upgrade to Professional for unlimited queries and advanced features
                    </p>
                    <button
                        onClick={onUpgrade}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 rounded-lg text-white text-sm font-semibold transition-all shadow-lg shadow-teal-500/20"
                    >
                        Upgrade now
                    </button>
                </div>
            </div>
        </div>
    );
};
