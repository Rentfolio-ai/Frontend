// FILE: src/components/chat/LoadingIndicator.tsx
import { Bot } from 'lucide-react'

export function LoadingIndicator() {
  return (
    <div className="flex items-start space-x-3 sm:space-x-4">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-4 max-w-xs">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
