'use client';

import Sidebar from './Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { NavigationBreadcrumb } from '@/components/navigation/NavigationBreadcrumb';
import React, { useState } from 'react';
import clsx from 'clsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Temporarily manage sidebar state locally until context issue is resolved
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if children is DashboardWithChat and clone with props
  const enhancedChildren = React.isValidElement(children) &&
    (children.type?.name === 'DashboardWithChat' || children.type?.displayName === 'DashboardWithChat')
    ? React.cloneElement(children as React.ReactElement<any>, { isCollapsed })
    : children;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main className={clsx(
          "flex-1 px-8 py-8 transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-64"
        )}>
          <NavigationBreadcrumb />
          {enhancedChildren}
        </main>
      </div>
    </ProtectedRoute>
  );
}