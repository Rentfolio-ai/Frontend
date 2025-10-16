// FILE: src/hooks/useLayout.ts
import { useState, useEffect } from 'react';

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  isActive?: boolean;
}

export function useLayout(initialChatHistory: ChatSession[] = []) {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightRail, setShowRightRail] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(initialChatHistory);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark);
    setIsDark(shouldBeDark);
    
    // Apply theme to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar and right rail on mobile
      if (mobile) {
        setShowSidebar(false);
        setShowRightRail(false);
      } else {
        setShowSidebar(true);
        setShowRightRail(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleThemeToggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Update localStorage
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
    // Apply to document
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return {
    isDark,
    isMobile,
    showSidebar,
    setShowSidebar,
    showRightRail,
    setShowRightRail,
    chatHistory,
    setChatHistory,
    handleThemeToggle
  };
}
