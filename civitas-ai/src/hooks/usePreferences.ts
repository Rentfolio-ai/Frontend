// FILE: src/hooks/usePreferences.ts
import { useState } from 'react';

export function usePreferences() {
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = typeof window !== 'undefined' 
      ? window.localStorage.getItem('civitas-email-notifications') 
      : null;
    if (!saved) return true;
    
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to parse email notifications setting:', error);
      return true;
    }
  });

  const [marketAlerts, setMarketAlerts] = useState(() => {
    const saved = typeof window !== 'undefined' 
      ? window.localStorage.getItem('civitas-market-alerts') 
      : null;
    if (!saved) return true;
    
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to parse market alerts setting:', error);
      return true;
    }
  });

  const updateEmailNotifications = (value: boolean) => {
    setEmailNotifications(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('civitas-email-notifications', JSON.stringify(value));
    }
  };

  const updateMarketAlerts = (value: boolean) => {
    setMarketAlerts(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('civitas-market-alerts', JSON.stringify(value));
    }
  };

  return {
    emailNotifications,
    marketAlerts,
    updateEmailNotifications,
    updateMarketAlerts
  };
}
