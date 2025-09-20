// FILE: src/components/rail/ContextRail.tsx
import React, { useState } from 'react';
import { Button } from '../primitives/Button';
import { NextBestAction } from './NextBestAction';
import { KpiMiniTiles } from './KpiMiniTiles';
import { ReportsList } from './ReportsList';
import { cn } from '../../lib/utils';

interface ContextRailProps {
  isCollapsed: boolean;
}

type TabId = 'actions' | 'kpis' | 'reports';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  {
    id: 'actions',
    label: 'Next Best Action',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    component: NextBestAction
  },
  {
    id: 'kpis',
    label: 'KPIs',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    component: KpiMiniTiles
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    component: ReportsList
  }
];

export const ContextRail: React.FC<ContextRailProps> = ({ isCollapsed }) => {
  const [activeTab, setActiveTab] = useState<TabId>('actions');

  if (isCollapsed) {
    return null;
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || NextBestAction;

  return (
    <aside className="h-full bg-surface flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-border bg-surface">
        <nav className="grid grid-cols-2 gap-0">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-12 rounded-none border-b-2 transition-all duration-200 flex-col gap-1",
                activeTab === tab.id 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "border-transparent hover:bg-muted/50 hover:border-border text-foreground/70"
              )}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={tab.icon}
                />
              </svg>
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <ActiveComponent />
      </div>
    </aside>
  );
};