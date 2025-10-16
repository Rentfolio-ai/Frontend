// FILE: src/hooks/usePreferences.ts
import { useState } from 'react';

export function usePreferences() {
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = typeof window !== 'undefined' 
      ? window.localStorage.getItem('civitas-email-notifications') 
      : null;
    return saved ? JSON.parse(saved) : true;
  });

  const [marketAlerts, setMarketAlerts] = useState(() => {
    const saved = typeof window !== 'undefined' 
      ? window.localStorage.getItem('civitas-market-alerts') 
      : null;
    return saved ? JSON.parse(saved) : true;
  });

  const updateEmailNotifications = (value: boolean) => {
    setEmailNotifications(value);
    window.localStorage.setItem('civitas-email-notifications', JSON.stringify(value));
  };

  const updateMarketAlerts = (value: boolean) => {
    setMarketAlerts(value);
    window.localStorage.setItem('civitas-market-alerts', JSON.stringify(value));
  };

  return {
    emailNotifications,
    marketAlerts,
    updateEmailNotifications,
    updateMarketAlerts
  };
}
