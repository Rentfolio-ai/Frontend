// FILE: src/components/chat/ToolCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ToolCard as ToolCardType } from '@/types/chat'

interface ToolCardProps {
  tool: ToolCardType
}

export function ToolCard({ tool }: ToolCardProps) {
  const statusColors: Record<string, string> = {
    running: 'border-warning bg-warning/5',
    completed: 'border-success bg-success/5',
    success: 'border-success bg-success/5',
    warning: 'border-warning bg-warning/5',
    error: 'border-danger bg-danger/5'
  }

  return (
    <Card className={cn("border-l-4", statusColors[tool.status])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{tool.title}</h4>
            <p className="text-xs text-text-muted mt-1">{tool.description}</p>
            
            {tool.status === 'completed' && tool.data && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(tool.data).map(([key, value]) => {
                  let displayValue: string;
                  
                  if (value == null) {
                    displayValue = '—';
                  } else if (typeof value === 'object') {
                    try {
                      displayValue = JSON.stringify(value);
                    } catch {
                      displayValue = '[Complex Object]';
                    }
                  } else {
                    displayValue = String(value);
                  }
                  
                  return (
                    <div key={key} className="text-center p-2 rounded border">
                      <div className="font-medium">{displayValue}</div>
                      <div className="text-text-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className={cn(
            "w-2 h-2 rounded-full ml-3 mt-1",
            tool.status === 'running' && "bg-warning animate-pulse",
            tool.status === 'completed' && "bg-success",
            tool.status === 'error' && "bg-danger"
          )} />
        </div>
      </CardContent>
    </Card>
  )
}
