import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Sparkles, Settings, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message, ToolCard } from '@/types/chat'
import { ActionButtons } from './ActionButtons'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { EnhancedSmartInput } from '@/components/EnhancedSmartInput'
import { PreferencesModal } from '@/components/PreferencesModal'
import { KeyboardHintsToggle } from '@/components/KeyboardHints'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { HelpModal } from '@/components/HelpModal'
import { FAQModal } from '@/components/FAQModal'
import { Tooltip } from '@/components/Tooltip'
import { useContextualHelp, ContextualHelp } from '@/components/ContextualHelp'
import { EmptyChat } from '@/components/EmptyStates'
import { usePreferencesStore } from '@/stores/preferencesStore'

interface ChatInterfaceProps {
  className?: string
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hello! I\'m ProphetAtlas, your all-knowing real estate intelligence assistant. I can help you analyze properties, calculate ROI, provide market insights, and generate comprehensive reports. What would you like to explore today?',
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
  const [showPreferences, setShowPreferences] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const smartInputRef = useRef<{ focus: () => void }>(null)
  const timerRef = useRef<number | null>(null)

  const { showKeyboardHints, setShowKeyboardHints } = usePreferencesStore()
  const {
    showHelp: showContextualHelp,
    helpConfig,
    showFirstVisitHelp,
    showEmptyInputHelp,
    dismissHelp
  } = useContextualHelp()

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('civitas-has-visited')
    if (!hasVisited) {
      setShowWelcome(true)
      localStorage.setItem('civitas-has-visited', 'true')
    }
  }, [])

  // Show contextual help on first visit
  useEffect(() => {
    if (messages.length === 0) {
      showFirstVisitHelp()
    }
  }, [])

  // Show empty input help after 30 seconds of inactivity
  useEffect(() => {
    if (messages.length > 0 && inputValue === '') {
      const timeout = setTimeout(() => {
        showEmptyInputHelp()
      }, 30000)

      return () => clearTimeout(timeout)
    }
  }, [messages.length, inputValue])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusInput: () => smartInputRef.current?.focus(),
    onOpenBookmarks: () => console.log('Open bookmarks'), // TODO: Implement
    onSearchChats: () => console.log('Search chats'), // TODO: Implement
    onOpenHelp: () => setShowFAQ(true),
    onEscape: () => {
      setShowHelp(false)
      setShowWelcome(false)
      setShowPreferences(false)
      setShowFAQ(false)
      dismissHelp()
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup effect to clear the timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const handleSendMessage = (content?: string) => {
    const messageContent = content || inputValue.trim()

    if (messageContent) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: messageContent,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, newMessage])
      setInputValue('')
      setIsTyping(true)

      // Clear any existing timer
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }

      // Simulate AI response and store the timer ID
      timerRef.current = setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'I\'m analyzing your request. This is a simulated response to demonstrate the chat interface.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiResponse])
        setIsTyping(false)

        // Reset the timer ref
        timerRef.current = null
      }, 2000) as unknown as number
    }
  }



  const handleAction = async (actionValue: string) => {
    if (['generate_report', 'view_report', 'navigate_market_insights'].includes(actionValue)) {
      const infoMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Those legacy dashboards are no longer part of this demo, but I can keep helping you right here in chat.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, infoMessage])
      return
    }

    if (actionValue === 'skip') {
      console.log('User skipped action')
    }
  }

  return (
    <div className={cn("flex flex-col h-full relative", className)}>
      {/* Welcome Screen */}
      {showWelcome && (
        <WelcomeScreen
          onClose={() => setShowWelcome(false)}
          onSelectQuery={(query) => {
            setShowWelcome(false)
            handleSendMessage(query)
          }}
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      )}

      {/* FAQ Modal */}
      {showFAQ && (
        <FAQModal
          isOpen={showFAQ}
          onClose={() => setShowFAQ(false)}
        />
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesModal
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}

      {/* Header Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Tooltip content="FAQ & Help" shortcut="⌘/">
          <button
            onClick={() => setShowFAQ(true)}
            className="p-2 rounded-lg backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-white/60" />
          </button>
        </Tooltip>

        <Tooltip content="Preferences" shortcut="⌘,">
          <button
            onClick={() => setShowPreferences(true)}
            className="p-2 rounded-lg backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
          >
            <Settings className="w-5 h-5 text-white/60" />
          </button>
        </Tooltip>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {/* Contextual Help */}
        {showContextualHelp && helpConfig && (
          <ContextualHelp {...helpConfig} onDismiss={dismissHelp} />
        )}

        {/* Empty State */}
        {messages.length === 0 && !showWelcome && (
          <EmptyChat onSuggestionClick={handleSendMessage} />
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onAction={handleAction}
              index={index}
            />
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3"
          >
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(59, 130, 246, 0.1)',
                  '0 0 0 8px rgba(59, 130, 246, 0)',
                  '0 0 0 0 rgba(59, 130, 246, 0)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
            </motion.div>
            <div className="flex-1 max-w-xs">
              <div className="rounded-2xl rounded-tl-sm backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-4">
                <div className="flex gap-1.5">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-blue-400/60"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-cyan-400/60"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-purple-400/60"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Enhanced Smart Input */}
      <div className="p-4 sm:p-6 border-t border-white/[0.05] bg-gradient-to-b from-transparent to-black/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <EnhancedSmartInput
            ref={smartInputRef}
            onSubmit={handleSendMessage}
            autoFocus={true}
          />
        </div>
      </div>

      {/* Keyboard Hints Toggle */}
      {showKeyboardHints && (
        <KeyboardHintsToggle onClick={() => setShowKeyboardHints(!showKeyboardHints)} />
      )}
    </div>
  )
}

function MessageBubble({
  message,
  onAction,
  index
}: {
  message: Message;
  onAction: (action: string) => void;
  index: number;
}) {
  const isUser = message.type === 'user'
  const timestamp = message.timestamp instanceof Date
    ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar - Glassy orb */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.05 + 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-xl border",
          isUser
            ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/20"
            : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/20"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-purple-300" />
        ) : (
          <Sparkles className="w-4 h-4 text-blue-400" />
        )}
      </motion.div>

      {/* Message Content - Translucent bubble */}
      <div className={cn(
        "flex-1 space-y-2 max-w-[55%]",
        isUser && "items-end"
      )}>
        <motion.div
          whileHover={{ y: -1 }}
          className={cn(
            "rounded-2xl backdrop-blur-xl border p-4 transition-all duration-200",
            isUser
              ? "rounded-tr-sm bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/20 ml-auto shadow-lg shadow-blue-500/5"
              : "rounded-tl-sm bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
          )}
        >
          <p className={cn(
            "text-sm leading-relaxed",
            isUser ? "text-white/95" : "text-white/85"
          )}>
            {message.content}
          </p>
        </motion.div>

        {/* Tool Cards - Nested translucent cards */}
        {message.tools && (
          <div className="space-y-2">
            {message.tools.map((tool, toolIndex) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + toolIndex * 0.1 }}
              >
                <ToolCardComponent tool={tool} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {message.action && !isUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ActionButtons action={message.action} onAction={onAction} />
          </motion.div>
        )}

        {/* Timestamp - Subtle */}
        <div className={cn(
          "flex items-center gap-2 text-[10px] text-white/30 font-medium px-1",
          isUser && "justify-end"
        )}>
          <span>{timestamp}</span>
        </div>
      </div>
    </motion.div>
  )
}

function ToolCardComponent({ tool }: { tool: ToolCard }) {
  const statusConfig = {
    running: {
      color: 'border-amber-400/20 bg-amber-500/5',
      dot: 'bg-amber-400',
      icon: '⚡'
    },
    completed: {
      color: 'border-emerald-400/20 bg-emerald-500/5',
      dot: 'bg-emerald-400',
      icon: '✓'
    },
    success: {
      color: 'border-emerald-400/20 bg-emerald-500/5',
      dot: 'bg-emerald-400',
      icon: '✓'
    },
    warning: {
      color: 'border-amber-400/20 bg-amber-500/5',
      dot: 'bg-amber-400',
      icon: '⚠'
    },
    error: {
      color: 'border-red-400/20 bg-red-500/5',
      dot: 'bg-red-400',
      icon: '✕'
    }
  }

  const status = statusConfig[tool.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl backdrop-blur-xl border p-4 transition-all",
        status.color
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs">{status.icon}</span>
            <h4 className="font-medium text-sm text-white/90 truncate">{tool.title}</h4>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{tool.description}</p>

          {tool.status === 'completed' && tool.data && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Object.entries(tool.data).map(([key, value]) => (
                <div key={key} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center">
                  <div className="text-sm font-semibold text-white/90">{value as string}</div>
                  <div className="text-[10px] text-white/40 mt-0.5 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.div
          animate={tool.status === 'running' ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            "w-2 h-2 rounded-full flex-shrink-0 mt-1",
            status.dot
          )}
        />
      </div>
    </motion.div>
  )
}
