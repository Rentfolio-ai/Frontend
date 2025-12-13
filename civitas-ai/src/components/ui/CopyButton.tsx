/**
 * CopyButton Component
 * 
 * Reusable button for copying text to clipboard with visual feedback
 */

import React from 'react';
import { Check, Copy } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface CopyButtonProps {
    text: string;
    label?: string;
    className?: string;
    showLabel?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
    text,
    label = 'Copy',
    className = '',
    showLabel = false
}) => {
    const { copy, copied } = useClipboard();

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await copy(text);
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.05] transition-all ${className}`}
            title={copied ? 'Copied!' : label}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 text-green-400" />
                    {showLabel && <span className="text-xs text-green-400">Copied!</span>}
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4" />
                    {showLabel && <span className="text-xs">{label}</span>}
                </>
            )}
        </button>
    );
};
