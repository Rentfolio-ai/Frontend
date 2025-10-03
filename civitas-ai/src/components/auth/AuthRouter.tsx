// FILE: src/components/auth/AuthRouter.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DesktopShell } from '../../layouts/DesktopShell';
import { DemoShell } from '../../layouts/DemoShell';
import { SignInPage } from '../../pages/auth/SignInPage';
import { SignUpPage } from '../../pages/auth/SignUpPage';

type AuthView = 'signin' | 'signup';
type AppView = 'main' | 'demo';

export const AuthRouter: React.FC = () => {
  const { user, isLoading, signIn, signUp } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [appView, setAppView] = useState<AppView>(() => {
    // Check if the demo view is requested via URL parameter or local storage
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get('view');
    const storedView = localStorage.getItem('civitas-app-view');
    
    if (demoParam === 'demo') return 'demo';
    return storedView === 'demo' ? 'demo' : 'main';
  });

  // Store the current view preference
  useEffect(() => {
    localStorage.setItem('civitas-app-view', appView);
  }, [appView]);
  
  // Add a keyboard shortcut (Alt+D) to toggle demo view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+D to toggle demo view
      if (e.altKey && e.key === 'd') {
        setAppView(prev => prev === 'main' ? 'demo' : 'main');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Civitas AI</h2>
            <p className="text-sm text-foreground/60">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the selected app view
  if (user) {
    return appView === 'demo' ? <DemoShell /> : <DesktopShell />;
  }

  // If not authenticated, show auth pages
  if (authView === 'signup') {
    return (
      <SignUpPage
        onSignUp={signUp}
        onNavigateToSignIn={() => setAuthView('signin')}
      />
    );
  }

  return (
    <SignInPage
      onSignIn={signIn}
      onNavigateToSignUp={() => setAuthView('signup')}
    />
  );
};