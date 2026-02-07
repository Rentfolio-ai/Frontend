// FILE: src/components/primitives/Toast.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
}

export function Toast({ id, message, type = 'info', duration = 5000, action, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };

  const bgColors = {
    success: 'from-green-500/90 to-emerald-600/90',
    info: 'from-blue-500/90 to-indigo-600/90',
    warning: 'from-yellow-500/90 to-orange-600/90',
    error: 'from-red-500/90 to-pink-600/90',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md bg-gradient-to-r ${bgColors[type]} min-w-[320px] max-w-md`}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>

      <div className="flex-1 text-white font-medium text-sm">
        {message}
      </div>

      {action && (
        <button
          onClick={() => {
            action.onClick();
            onClose(id);
          }}
          className="px-3 py-1 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
