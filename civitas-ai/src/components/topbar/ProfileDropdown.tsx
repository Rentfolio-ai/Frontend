// FILE: src/components/topbar/ProfileDropdown.tsx
import React, { useRef, useEffect } from 'react';

interface User {
  name?: string;
  email?: string;
  avatar?: string;
}

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: (modalName: 'profile' | 'billing' | 'preferences' | 'help') => void;
  onSignOut: () => void;
  user?: User;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  onOpenModal,
  onSignOut,
  user
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-50 animate-scale-in"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-from rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">{user?.avatar || 'U'}</span>
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-foreground/60 truncate">{user?.email || 'user@example.com'}</div>
              <div className="text-xs text-success font-medium">Online</div>
            </div>
          </div>
        </div>

        <div className="py-2">
          <button
            onClick={() => {
              onOpenModal('profile');
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Settings
          </button>

          <button
            onClick={() => {
              onOpenModal('billing');
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Billing & Plans
          </button>

          <button
            onClick={() => {
              onOpenModal('preferences');
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preferences
          </button>

          <button
            onClick={() => {
              onOpenModal('help');
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help & Support
          </button>
        </div>

        <div className="py-2 border-t border-border">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/10 transition-colors flex items-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};