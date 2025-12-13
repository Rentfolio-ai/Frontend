/**
 * useClipboard Hook
 * 
 * Provides copy-to-clipboard functionality with visual feedback
 */

import { useState, useCallback } from 'react';

interface UseClipboardReturn {
    copy: (text: string) => Promise<boolean>;
    copied: boolean;
    reset: () => void;
}

export function useClipboard(timeout = 2000): UseClipboardReturn {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async (text: string): Promise<boolean> => {
        if (!navigator?.clipboard) {
            console.warn('Clipboard not supported');
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, timeout);

            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            setCopied(false);
            return false;
        }
    }, [timeout]);

    const reset = useCallback(() => {
        setCopied(false);
    }, []);

    return { copy, copied, reset };
}
