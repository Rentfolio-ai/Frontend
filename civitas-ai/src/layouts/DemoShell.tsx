// FILE: src/layouts/DemoShell.tsx
import React, { useEffect, useState } from 'react';
import { TopBar } from '../components/topbar/TopBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { DemoPage } from '../pages/DemoPage';

export const DemoShell: React.FC = () => {
  // State for collapsing UI elements
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);
  
  // Theme state
  const [theme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' && window.localStorage.getItem('civitas-theme') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Toggle functions
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  
  const handleToggleRail = () => {
    setIsRailCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <TopBar 
        onToggleSidebar={handleToggleSidebar}
        onToggleRail={handleToggleRail}
        isRailCollapsed={isRailCollapsed}
      />
      
      {/* Main content area with sidebar */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-0' : 'w-sidebar border-r border-border'
        }`}>
          <Sidebar isCollapsed={isSidebarCollapsed} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          <DemoPage />
        </div>
      </div>
    </div>
  );
};

export default DemoShell;