import { useState, useEffect } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { RightRail } from './RightRail'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isDark, setIsDark] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showRightRail, setShowRightRail] = useState(true)

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