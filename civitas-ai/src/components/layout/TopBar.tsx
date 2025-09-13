import { useState } from 'react'
import { Search, Moon, Sun, User, ChevronDown, Menu, PanelRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopBarProps {
  isDark: boolean
  onThemeToggle: () => void
  isMobile?: boolean
  onToggleSidebar?: () => void
  onToggleRightRail?: () => void
}

export function TopBar({ 
  isDark, 
  onThemeToggle, 
  isMobile = false, 
  onToggleSidebar, 
  onToggleRightRail 
}: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header className="layout-topbar border-b bg-surface/95 backdrop-blur-sm supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-6">
        
        {/* Left: Mobile Menu + Logo/Title */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="w-8 h-8 md:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-h2 font-bold text-foreground hidden sm:block">Civitas AI</h1>
          </div>
        </div>

        {/* Center: Search/Command */}
        <div className={cn(
          "flex-1 max-w-md transition-all duration-300",
          isMobile ? "mx-4" : "mx-8"
        )}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={isMobile ? "Search..." : "Search or ask a question..."}
              className={cn(
                "w-full pl-10 pr-16 py-2 rounded-lg border bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "text-sm placeholder:text-text-muted"
              )}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border text-text-muted hidden sm:block">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleRightRail}
              className="w-8 h-8 md:hidden"
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="w-8 h-8 sm:w-9 sm:h-9"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              className={cn(
                "flex items-center space-x-2",
                isMobile ? "px-2" : "px-3"
              )}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              {!isMobile && (
                <>
                  <span className="text-sm font-medium text-foreground hidden sm:block">John Doe</span>
                  <ChevronDown className="w-3 h-3 text-text-muted hidden sm:block" />
                </>
              )}
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-surface shadow-lg z-50 animate-scale-in">
                <div className="p-1">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors">
                    Preferences
                  </button>
                  <hr className="my-1 border-border" />
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-danger transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}