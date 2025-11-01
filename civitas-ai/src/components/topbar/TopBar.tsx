// FILE: src/components/topbar/TopBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../primitives/Button';
import { ThemeToggle } from '../primitives/ThemeToggle';
import { Tooltip } from '../primitives/Tooltip';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsModal } from '../settings/SettingsModal';
import { HelpModal } from '../help/HelpModal';
import { ProfileDropdown } from './ProfileDropdown';

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleRail: () => void;
  isRailCollapsed: boolean;
  onNewChat?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onToggleRail,
  isRailCollapsed,
  onNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log('Search:', searchQuery);
  };

  const handleKeyboardShortcut = (e: React.KeyboardEvent) => {
    // ⌘K or Ctrl+K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      (e.target as HTMLInputElement).focus();
    }
  };

  return (
    <header className="h-topbar flex items-center justify-between px-6 bg-surface border-b border-border">
  {/* Left section: Logo, sidebar toggle, and new chat */}
  <div className="flex items-center gap-4">
        <Tooltip content="Toggle sidebar">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="w-10 h-10 p-0 rounded-lg hover:bg-muted/70 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </Tooltip>

        <div className="flex items-center gap-3">
          {/* New Chat Button */}
          <Tooltip content="Start a new chat">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewChat}
              className="w-10 h-10 p-0 rounded-lg hover:bg-primary/20 transition-all duration-200"
              aria-label="Start new chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          </Tooltip>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-h2 font-bold text-foreground">
              Civitas AI
            </span>
          </div>
        </div>
      </div>

      {/* Center section: Global search */}
      <div className="flex-1 max-w-xl mx-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative group">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 group-focus-within:text-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search conversations, properties, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyboardShortcut}
              className="w-full pl-12 pr-24 py-3 bg-muted/50 border border-border rounded-xl
                         text-foreground placeholder:text-foreground/50
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background
                         hover:bg-muted/70 hover:border-border/80
                         transition-all duration-200"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <kbd className="px-2 py-1 text-xs font-medium text-foreground/60 bg-background border border-border rounded-md shadow-sm">
                  ⌘
                </kbd>
                <kbd className="px-2 py-1 text-xs font-medium text-foreground/60 bg-background border border-border rounded-md shadow-sm">
                  K
                </kbd>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Right section: Controls and profile */}
      <div className="flex items-center gap-3">
        {/* Right rail toggle */}
        <Tooltip content={isRailCollapsed ? 'Show context panel' : 'Hide context panel'}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRail}
            className="w-10 h-10 p-0 rounded-lg hover:bg-muted/70 transition-all duration-200"
            aria-label={isRailCollapsed ? 'Show context panel' : 'Hide context panel'}
          >
            <svg
              className={cn(
                "w-5 h-5 transition-all duration-200",
                isRailCollapsed ? "rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
        </Tooltip>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile */}
        <div className="relative" ref={profileDropdownRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleProfileDropdown}
            className="w-auto h-10 px-3 gap-3 rounded-full hover:bg-muted/70 transition-all duration-200 min-w-0 max-w-64"
            aria-label="Account menu"
            aria-expanded={isProfileDropdownOpen}
          >
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent-from rounded-full flex items-center justify-center ring-2 ring-background shadow-sm flex-shrink-0">
              <span className="text-xs font-semibold text-white">
                {user?.avatar || 'U'}
              </span>
            </div>
            <div className="hidden sm:block text-left min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-foreground/60 truncate">{user?.email || 'user@example.com'}</div>
            </div>
            <svg
              className={cn(
                "w-4 h-4 text-foreground/40 transition-transform duration-200 flex-shrink-0 ml-2",
                isProfileDropdownOpen ? "rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {/* Dropdown Menu */}
          <ProfileDropdown
            isOpen={isProfileDropdownOpen}
            onClose={() => setIsProfileDropdownOpen(false)}
            onOpenModal={(modalName) => {
              switch (modalName) {
                case 'profile':
                case 'billing':
                case 'preferences':
                  setIsSettingsOpen(true);
                  break;
                case 'help':
                  setIsHelpOpen(true);
                  break;
              }
            }}
            onSignOut={signOut}
            user={user || undefined}
          />
        </div>
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </header>
  );
};