// FILE: src/hooks/useToast.ts
import { useState, useCallback } from 'react';
import type { ToastProps } from '../components/primitives/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastProps['type'] = 'info',
    action?: ToastProps['action'],
    duration = 5000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36);
    
    const newToast: ToastProps = {
      id,
      message,
      type,
      action,
      duration,
      onClose: (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const success = useCallback((message: string, action?: ToastProps['action']) => {
    showToast(message, 'success', action);
  }, [showToast]);

  const error = useCallback((message: string, action?: ToastProps['action']) => {
    showToast(message, 'error', action);
  }, [showToast]);

  const info = useCallback((message: string, action?: ToastProps['action']) => {
    showToast(message, 'info', action);
  }, [showToast]);

  const warning = useCallback((message: string, action?: ToastProps['action']) => {
    showToast(message, 'warning', action);
  }, [showToast]);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    success,
    error,
    info,
    warning,
    closeToast
  };
}
