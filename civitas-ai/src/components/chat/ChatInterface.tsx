import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  tools?: ToolCard[]
}

interface ToolCard {
  id: string
  title: string
  description: string
  status: 'running' | 'completed' | 'error'
  data?: any
}

interface ChatInterfaceProps {
  className?: string
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hello! I\'m Civitas AI, your real estate investment assistant. I can help you analyze properties, calculate ROI, and provide market insights. What would you like to explore today?',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    type: 'user',
    content: 'I\'m looking at a property in downtown Austin. Can you help me analyze its investment potential?',
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: '3',
    type: 'assistant',
    content: 'I\'d be happy to help you analyze that Austin property! To provide the most accurate investment analysis, I\'ll need some key information. Let me run a few tools to get started.',
    timestamp: new Date(Date.now() - 180000),
    tools: [
      {
        id: 'market-analysis',
        title: 'Market Analysis - Austin Downtown',
        description: 'Analyzing local market trends, comparable sales, and rental rates',
        status: 'completed',
        data: { medianPrice: '$650K', rentRate: '$2,800/month', appreciation: '8.2%' }
      },
      {
        id: 'roi-calculator',
        title: 'ROI Calculator',
        description: 'Calculating potential returns based on market data',
        status: 'completed',
        data: { capRate: '6.8%', cashFlow: '$420/month', roi: '12.3%' }
      }
    ]
  }
]

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue,
        timestamp: new Date(),
      }
      
      setMessages([...messages, newMessage])
      setInputValue('')
      setIsTyping(true)
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'I\'m analyzing your request. This is a simulated response to demonstrate the chat interface.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiResponse])
        setIsTyping(false)
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
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
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-surface p-3 sm:p-4">
        <div className="flex items-end space-x-2 sm:space-x-3">
          <Button variant="ghost" size="icon" className="mb-2 w-8 h-8 sm:w-10 sm:h-10">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about real estate investments..."
              className={cn(
                "w-full resize-none rounded-lg border bg-background px-4 py-3 pr-12",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "text-sm placeholder:text-text-muted min-h-[48px] max-h-32"
              )}
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="absolute right-2 bottom-2 w-8 h-8 gradient-accent"
              size="icon"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" className="mb-2 w-8 h-8 sm:w-10 sm:h-10">
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.type === 'user'
  const timestamp = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={cn("flex items-start space-x-3 sm:space-x-4", isUser && "flex-row-reverse space-x-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-muted" : "bg-primary"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 space-y-2", isUser && "items-end")}>
        <div className={cn(
          "rounded-lg p-3 sm:p-4 max-w-full sm:max-w-2xl",
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted"
        )}>
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>

        {/* Tool Cards */}
        {message.tools && (
          <div className="space-y-3 max-w-full sm:max-w-2xl">
            {message.tools.map((tool) => (
              <ToolCardComponent key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Message Actions */}
        <div className={cn(
          "flex items-center space-x-2 text-xs text-text-muted",
          isUser && "justify-end"
        )}>
          <span>{timestamp}</span>
          {!isUser && (
            <div className="hidden sm:flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <ThumbsDown className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToolCardComponent({ tool }: { tool: ToolCard }) {
  const statusColors = {
    running: 'border-warning bg-warning/5',
    completed: 'border-success bg-success/5',
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
                {Object.entries(tool.data).map(([key, value]) => (
                  <div key={key} className="text-center p-2 rounded border">
                    <div className="font-medium">{value as string}</div>
                    <div className="text-text-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
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