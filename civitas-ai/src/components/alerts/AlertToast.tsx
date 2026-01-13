// FILE: src/components/alerts/AlertToast.tsx
/**
 * Alert Toast Component
 * 
 * Premium popup toast notification for new market alerts.
 * Auto-appears when backend sends new alerts - no user action needed.
 */

import React, { useEffect, useState } from 'react';
import { X, TrendingUp, AlertTriangle, Info, Zap, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Alert } from '../../services/alertsApi';

interface AlertToastProps {
  alert: Alert;
  onClose: () => void;
  onClick?: () => void;
  autoHideDuration?: number; // milliseconds
}

export const AlertToast: React.FC<AlertToastProps> = ({
  alert,
  onClose,
  onClick,
  autoHideDuration = 8000, // 8 seconds - more time to read
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Slide in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Progress bar countdown
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoHideDuration) * 100);
      setProgress(remaining);
    }, 50);

    // Auto-hide timer
    const hideTimer = setTimeout(() => {
      handleClose();
    }, autoHideDuration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(progressInterval);
    };
  }, [autoHideDuration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 400); // Match animation duration
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-red-500/40',
          bg: 'bg-gradient-to-br from-red-950/95 via-red-900/90 to-red-950/95',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
          icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
          badge: 'bg-red-500/20 text-red-300 border-red-500/30',
          progress: 'bg-red-500',
        };
      case 'medium':
        return {
          border: 'border-amber-500/40',
          bg: 'bg-gradient-to-br from-amber-950/95 via-amber-900/90 to-amber-950/95',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
          icon: <Zap className="w-5 h-5 text-amber-400" />,
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          progress: 'bg-amber-500',
        };
      case 'low':
        return {
          border: 'border-blue-500/40',
          bg: 'bg-gradient-to-br from-blue-950/95 via-blue-900/90 to-blue-950/95',
          glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
          icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          progress: 'bg-blue-500',
        };
      default:
        return {
          border: 'border-white/20',
          bg: 'bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95',
          glow: 'shadow-[0_0_20px_rgba(255,255,255,0.05)]',
          icon: <Info className="w-5 h-5 text-slate-400" />,
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          progress: 'bg-slate-500',
        };
    }
  };

  const styles = getSeverityStyles(alert.severity);

  // Get alert type label
  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_drop': return 'Price Drop';
      case 'new_listing': return 'New Listing';
      case 'market_trend': return 'Market Trend';
      case 'portfolio': return 'Portfolio Alert';
      default: return 'Alert';
    }
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0, scale: 0.9 }}
      animate={{
        x: isVisible ? 0 : 400,
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.9
      }}
      exit={{ x: 400, opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }}
      className={`
        w-[400px] border backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer
        ${styles.border} ${styles.bg} ${styles.glow}
        hover:scale-[1.02] transition-transform duration-200
      `}
      onClick={() => {
        onClick?.();
        handleClose();
      }}
      role="alert"
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Icon + Type Badge */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              {styles.icon}
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${styles.badge}`}>
              {getAlertTypeLabel(alert.alert_type)}
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Title */}
          <h4 className="text-white font-semibold text-sm leading-snug">
            {alert.title}
          </h4>

          {/* Summary */}
          <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
            {alert.summary}
          </p>

          {/* Property/Market Location */}
          {alert.property_address && (
            <div className="flex items-center gap-1.5 text-white/50 text-xs mt-2">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{alert.property_address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/5">
        <motion.div
          className={`h-full ${styles.progress}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
};

/**
 * Toast Container Component
 * 
 * Manages multiple toast notifications in a stacked layout.
 * Toasts appear from top-right with smooth animations.
 */
interface ToastContainerProps {
  alerts: Alert[];
  onToastClose: (alertId: string) => void;
  onToastClick?: (alert: Alert) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  alerts,
  onToastClose,
  onToastClick,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-h-[calc(100vh-2rem)] overflow-hidden">
      <AnimatePresence mode="popLayout">
        {alerts.slice(0, 5).map((alert) => (
          <motion.div
            key={alert.alert_id}
            className="pointer-events-auto"
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 300 }}
          >
            <AlertToast
              alert={alert}
              onClose={() => onToastClose(alert.alert_id)}
              onClick={() => onToastClick?.(alert)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
