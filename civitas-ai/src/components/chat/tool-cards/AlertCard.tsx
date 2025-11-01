// FILE: src/components/chat/tool-cards/AlertCard.tsx
import React from 'react';
import { Button } from '../../primitives/Button';

interface AlertData {
  title: string;
  message: string;
  action?: string;
}

interface AlertCardProps {
  data: AlertData;
  onAction?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ data, onAction }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <div>
      <div className="font-semibold">{data.title}</div>
      <div className="text-sm text-foreground/60 mt-1">{data.message}</div>
      {data.action && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={onAction}
          disabled={!onAction}
        >
          {data.action}
        </Button>
      )}
    </div>
  </div>
);
