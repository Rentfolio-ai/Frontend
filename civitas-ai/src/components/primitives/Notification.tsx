import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationProps {
  /**
   * The title of the notification
   */
  title: string;
  
  /**
   * The content message of the notification
   */
  message: string;
  
  /**
   * The type/severity of notification
   */
  type?: NotificationType;
  
  /**
   * Time in milliseconds before the notification auto-dismisses
   * Set to 0 or null to disable auto-dismiss
   */
  duration?: number | null;
  
  /**
   * Function called when the notification is dismissed
   */
  onDismiss?: () => void;
  
  /**
   * Optional animation type to use
   */
  animation?: 'fade' | 'slide-right' | 'slide-left' | 'scale';
}

/**
 * Notification component for displaying temporary messages to users
 * Supports different types, auto-dismiss, and various animations
 */
export const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  type = 'info',
  duration = 5000,
  onDismiss,
  animation = 'fade'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto-dismiss functionality
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);
  
  // Handle dismiss action
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };
  
  // If not visible, don't render anything
  if (!isVisible) return null;
  
  // Determine animation class based on prop
  const animationClass = {
    'fade': 'animate-fade-in',
    'slide-right': 'animate-slide-in-right',
    'slide-left': 'animate-slide-in-left',
    'scale': 'animate-scale-in',
  }[animation] || 'animate-fade-in';
  
  // Determine type-specific styling
  const typeStyles = {
    'info': 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
    'success': 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
    'warning': 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300',
    'error': 'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  }[type];
  
  const iconMap = {
    'info': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    'success': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    'warning': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    'error': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  };
  
  return (
    <div 
      className={`${typeStyles} ${animationClass} rounded-md border p-4 flex items-start shadow-sm`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0 mr-3">
        {iconMap[type]}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <div className="text-sm">{message}</div>
      </div>
      <button
        type="button"
        className="ml-auto -mr-1 flex-shrink-0 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <span className="sr-only">Close</span>
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Notification;