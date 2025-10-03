// FILE: src/components/rail/ContextRail.tsx
import React, { useState } from 'react';
import { Button } from '../primitives/Button';
import { NextBestAction } from './NextBestAction';
import { KpiMiniTiles } from './KpiMiniTiles';
import { SuggestedNextSteps } from './SuggestedNextSteps';
import { MyAlerts } from '../alerts/MyAlerts';
import { ReportsList } from './ReportsList';
import { cn } from '../../lib/utils';

interface ContextRailProps {
  isCollapsed: boolean;
  onSendMessage?: (message: string) => void;
}

type TabId = 'actions' | 'suggestions' | 'alerts' | 'kpis' | 'reports';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
}

const tabs: Tab[] = [
  {
    id: 'actions',
    label: 'Actions',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    component: NextBestAction
  },
  {
    id: 'suggestions',
    label: 'Suggestions',
    icon: 'M13 2L3 14h18l-8-12z',
    component: SuggestedNextSteps
  },
  {
    id: 'alerts',
    label: 'My Alerts',
    icon: 'M10 2v20M4 7l16 10M4 17l16-10',
    component: MyAlerts
  },
  {
    id: 'kpis',
    label: 'KPIs',
    icon: 'M3 3v18h18M9 17V9M13 17v-6M17 17v-4',
    component: KpiMiniTiles
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    component: ReportsList
  }
];

export const ContextRail: React.FC<ContextRailProps> = ({ isCollapsed, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<TabId>('alerts');

  if (isCollapsed) {
    return null;
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || NextBestAction;

  return (
    <aside className="h-full bg-surface flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-border bg-surface">
                <nav className="grid grid-cols-5 gap-1 p-1 bg-muted/20 rounded-lg">{/* Updated to 5 columns */}
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
        {activeTab === 'suggestions' ? (
          <SuggestedNextSteps onActionClick={onSendMessage} />
        ) : activeTab === 'alerts' ? (
          <MyAlerts onRunSearch={(query, filters) => {
            // Construct search message for LLM
            const searchMessage = query || `Search properties${filters ? ` with filters: ${JSON.stringify(filters)}` : ''}`;
            onSendMessage?.(searchMessage);
          }} />
        ) : (
          <ActiveComponent />
        )}
      </div>
    </aside>
  );
};