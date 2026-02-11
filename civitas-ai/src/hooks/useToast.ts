/**
 * Toast Hook
 * Hook for showing toast notifications
 */

import { useCallback } from 'react';
import { create } from 'zustand';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastStore {
    toasts: ToastItem[];
    showToast: (message: string, type?: ToastType, action?: ToastItem['action']) => void;
    closeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    showToast: (message, type = 'info', action) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, message, type, action }],
        }));
    },
    closeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));

// Convenience hook
export function useToast() {
    const { toasts, showToast, closeToast } = useToastStore();

    // Memoize convenience wrappers so consumers can safely use them
    // as useCallback / useEffect dependencies without infinite loops.
    const toast = useCallback((message: string) => showToast(message, 'info'), [showToast]);
    const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
    const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
    const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

    return {
        toasts,
        closeToast,
        toast,
        success,
        error,
        warning,
        info,
        showToast,
    };
}
