import { useState } from 'react'
import { MessageSquare, History, Trash2, Edit, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatSession {
  id: string
  title: string
  timestamp: string
  isActive?: boolean
}

interface SidebarProps {
  className?: string
}

const mockChatHistory: ChatSession[] = [
  { id: '1', title: 'Property Analysis Downtown Austin', timestamp: '2 hours ago', isActive: true },
  { id: '2', title: 'Investment ROI Calculator', timestamp: 'Yesterday' },
  { id: '3', title: 'Market Trends Q4 2024', timestamp: '2 days ago' },
  { id: '4', title: 'Rental Property Comparison', timestamp: '3 days ago' },
  { id: '5', title: 'Cap Rate Analysis', timestamp: '1 week ago' },
  { id: '6', title: 'Property Valuation Report', timestamp: '1 week ago' },
  { id: '7', title: 'Investment Strategy Planning', timestamp: '2 weeks ago' },
]

export function Sidebar({ className }: SidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)

  return (
    <aside className={cn("layout-sidebar bg-surface border-r flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <Button className="w-full gradient-accent text-white hover:opacity-90 transition-opacity">
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center space-x-2 px-3 py-2 mb-2">
            <History className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-muted">Recent Chats</span>
          </div>

          <div className="space-y-1">
            {mockChatHistory.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-all duration-200 ease-out",
                  chat.isActive
                    ? "bg-primary/10 border border-primary/20 scale-[1.02]"
                    : "hover:bg-muted hover:scale-[1.01]"
                )}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
              >
                <div className="flex items-start space-x-3">
                  <MessageSquare className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    chat.isActive ? "text-primary" : "text-text-muted"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      chat.isActive ? "text-primary" : "text-foreground"
                    )}>
                      {chat.title}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {chat.timestamp}
                    </p>
                  </div>
                </div>

                {/* Action buttons (show on hover) */}
                {hoveredChat === chat.id && (
                  <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 hover:bg-muted"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 hover:bg-muted"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-text-muted hover:text-danger hover:bg-danger/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Chats
        </Button>
      </div>
    </aside>
  )
}