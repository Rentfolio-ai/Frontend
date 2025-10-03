import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { RightRail } from './RightRail'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isDark, setIsDark] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showRightRail, setShowRightRail] = useState(true)
  
  // Sample chat history data - in a real app, this would be loaded from an API or state management
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'Property Analysis Downtown Austin', timestamp: '2 hours ago', isActive: true },
    { id: '2', title: 'Investment ROI Calculator', timestamp: 'Yesterday' },
    { id: '3', title: 'Market Trends Q4 2024', timestamp: '2 days ago' },
    { id: '4', title: 'Rental Property Comparison', timestamp: '3 days ago' },
    { id: '5', title: 'Cap Rate Analysis', timestamp: '1 week ago' },
  ])

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark)
    setIsDark(shouldBeDark)
    
    // Apply theme to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Auto-collapse sidebar and right rail on mobile
      if (mobile) {
        setShowSidebar(false)
        setShowRightRail(false)
      } else {
        setShowSidebar(true)
        setShowRightRail(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleThemeToggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    // Update localStorage
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    
    // Apply to document
    if (newIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <TopBar 
        isDark={isDark} 
        onThemeToggle={handleThemeToggle}
        isMobile={isMobile}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onToggleRightRail={() => setShowRightRail(!showRightRail)}
      />
      
      {/* Main Content Area */}
      <div className="flex relative">
        {/* Sidebar Overlay for Mobile */}
        {isMobile && showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Left Sidebar */}
        <Sidebar 
          chatHistory={chatHistory}
          onNewChat={() => {
            // Create a new chat
            const newId = Date.now().toString();
            const newChat = {
              id: newId,
              title: 'New Chat',
              timestamp: 'Just now',
              isActive: true
            };
            
            // Update existing chats to not be active
            const updatedHistory = chatHistory.map(chat => ({
              ...chat,
              isActive: false
            }));
            
            // Add new chat to history
            setChatHistory([newChat, ...updatedHistory]);
          }}
          onSelectChat={(id) => {
            // Set the selected chat as active and others as inactive
            const updatedHistory = chatHistory.map(chat => ({
              ...chat,
              isActive: chat.id === id
            }));
            
            setChatHistory(updatedHistory);
          }}
          onEditChat={(id) => {
            // Handle edit chat functionality
            console.log(`Edit chat with id: ${id}`);
            
            // Example implementation:
            // Prompt the user for a new title
            const chat = chatHistory.find(c => c.id === id);
            if (chat) {
              const newTitle = prompt("Enter new chat title:", chat.title);
              if (newTitle) {
                const updatedHistory = chatHistory.map(c => 
                  c.id === id ? { ...c, title: newTitle } : c
                );
                setChatHistory(updatedHistory);
              }
            }
          }}
          onMoreChat={(id) => {
            // Handle more options functionality
            console.log(`More options for chat with id: ${id}`);
            
            // Example implementation:
            // Confirm deletion of chat
            const confirmDelete = window.confirm("Delete this chat?");
            if (confirmDelete) {
              const updatedHistory = chatHistory.filter(chat => chat.id !== id);
              setChatHistory(updatedHistory);
            }
          }}
          clearAllChats={() => {
            // Confirm before clearing all chats
            const confirmClear = window.confirm("Are you sure you want to clear all chats? This action cannot be undone.");
            if (confirmClear) {
              setChatHistory([]);
            }
          }}
          className={cn(
            "transition-transform duration-300 ease-in-out z-50",
            isMobile ? "fixed left-0 top-topbar h-[calc(100vh-theme(spacing.topbar))]" : "",
            isMobile && !showSidebar ? "-translate-x-full" : "translate-x-0",
            !showSidebar && !isMobile ? "hidden" : ""
          )}
        />
        
        {/* Center Content */}
        <main className={cn(
          "flex-1 min-h-[calc(100vh-theme(spacing.topbar))] transition-all duration-300",
          "bg-background",
          !showSidebar && !isMobile ? "ml-0" : "",
          !showRightRail && !isMobile ? "mr-0" : ""
        )}>
          {children}
        </main>
        
        {/* Right Rail */}
        <RightRail 
          className={cn(
            "transition-transform duration-300 ease-in-out",
            isMobile ? "fixed right-0 top-topbar h-[calc(100vh-theme(spacing.topbar))] z-40" : "",
            isMobile && !showRightRail ? "translate-x-full" : "translate-x-0",
            !showRightRail && !isMobile ? "hidden" : ""
          )}
        />
      </div>
    </div>
  )
}