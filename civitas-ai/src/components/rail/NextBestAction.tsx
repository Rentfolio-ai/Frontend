// FILE: src/components/rail/NextBestAction.tsx
import React from 'react';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';

interface NextAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'analysis' | 'alert' | 'opportunity' | 'follow_up';
  action: string;
}

const sampleActions: NextAction[] = [
  {
    id: '1',
    title: 'Review Market Alert',
    description: 'Austin downtown prices increased 15% - consider accelerating investment timeline',
    priority: 'high',
    type: 'alert',
    action: 'View Details'
  },
  {
    id: '2',
    title: 'Complete ROI Analysis',
    description: 'Finish analyzing the 3 properties you saved from yesterday\'s search',
    priority: 'medium',
    type: 'analysis',
    action: 'Continue Analysis'
  },
  {
    id: '3',
    title: 'New Opportunity',
    description: 'Found 2 properties matching your criteria in desired neighborhoods',
    priority: 'medium',
    type: 'opportunity',
    action: 'View Properties'
  },
  {
    id: '4',
    title: 'Follow up: Property Visit',
    description: 'Schedule visit for 123 Main St based on positive analysis results',
    priority: 'low',
    type: 'follow_up',
    action: 'Schedule'
  }
];

export const NextBestAction: React.FC = () => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="default" size="sm">Low</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return (
          <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'analysis':
        return (
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'opportunity':
        return (
          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'follow_up':
        return (
          <svg className="w-4 h-4 text-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="text-h2">Next Best Actions</h3>
      </div>

      <div className="space-y-3">
        {sampleActions.map(action => (
          <Card key={action.id} padding="sm" className="hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(action.type)}
                  <h4 className="font-semibold text-sm">{action.title}</h4>
                </div>
                {getPriorityBadge(action.priority)}
              </div>

              {/* Description */}
              <p className="text-sm text-foreground/70 leading-relaxed">
                {action.description}
              </p>

              {/* Action Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-center"
              >
                {action.action}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sampleActions.length === 0 && (
        <div className="text-center py-8 text-foreground/60">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p className="text-sm">All caught up!</p>
          <p className="text-xs mt-1">No pending actions</p>
        </div>
      )}
    </div>
  );
};