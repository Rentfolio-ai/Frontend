// FILE: src/components/auth/AuthRouter.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DesktopShell } from '../../layouts/DesktopShell';
import { LandingPage } from '../../pages/auth/LandingPage';
import { SignInPage } from '../../pages/auth/SignInPage';
import { SignUpPage } from '../../pages/auth/SignUpPage';
import { FAQPage } from '../../pages/public/FAQPage';
import { PrivacyPolicyPage } from '../../pages/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from '../../pages/legal/TermsOfServicePage';
import { CookiePolicyPage } from '../../pages/legal/CookiePolicyPage';
import { LocationPermissionModal } from '../modals/LocationPermissionModal';

type AuthView = 'landing' | 'signin' | 'signup' | 'faq' | 'privacy-policy' | 'terms-of-service' | 'cookie-policy';

export const AuthRouter: React.FC = () => {
  const { user, isLoading, signIn, signUp, refreshUser } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  // Reset to landing page when user logs out
  useEffect(() => {
    if (!user) {
      setAuthView('landing');
    }
  }, [user]);

  // Handle Stripe redirect query params (?payment=success or ?payment=cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');

    if (payment === 'success') {
      setPaymentMessage('Payment successful! Your Pro subscription is now active.');
      // Refresh user data to pick up new subscription tier
      if (refreshUser) refreshUser();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-dismiss after 6 seconds
      setTimeout(() => setPaymentMessage(null), 6000);
    } else if (payment === 'cancelled') {
      setPaymentMessage('Payment was cancelled. You can upgrade anytime from Settings.');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setPaymentMessage(null), 6000);
    }
  }, [refreshUser]);

  // Handle URL-based routing for legal pages (opened in new tabs)
  useEffect(() => {
    const path = window.location.pathname;
    const legalRoutes: Record<string, AuthView> = {
      '/privacy-policy': 'privacy-policy',
      '/privacy': 'privacy-policy',
      '/terms-of-service': 'terms-of-service',
      '/terms': 'terms-of-service',
      '/cookie-policy': 'cookie-policy',
    };
    const matchedView = legalRoutes[path];
    if (matchedView) {
      setAuthView(matchedView);
    }
  }, []);

  // Render legal pages regardless of auth state (accessible to everyone)
  const legalBack = () => {
    window.history.replaceState({}, '', '/');
    setAuthView('landing');
  };

  if (authView === 'privacy-policy') return <PrivacyPolicyPage onBack={legalBack} />;
  if (authView === 'terms-of-service') return <TermsOfServicePage onBack={legalBack} />;
  if (authView === 'cookie-policy') return <CookiePolicyPage onBack={legalBack} />;

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
            <h2 className="text-xl font-semibold text-foreground">Vasthu</h2>
            <p className="text-sm text-foreground/60">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main desktop shell
  if (user) {
    return (
      <>
        {paymentMessage && (
          <div
            style={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              padding: '12px 24px',
              borderRadius: 8,
              backgroundColor: paymentMessage.includes('successful') ? '#065F46' : '#7C2D12',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              cursor: 'pointer',
            }}
            onClick={() => setPaymentMessage(null)}
          >
            {paymentMessage}
          </div>
        )}
        <DesktopShell />
        <LocationPermissionModal />
      </>
    );
  }

  // If not authenticated, show auth pages
  if (authView === 'landing') {
    return (
      <LandingPage
        onNavigateToSignIn={() => setAuthView('signin')}
        onNavigateToSignUp={() => setAuthView('signup')}
        onNavigateToFAQ={() => setAuthView('faq')}
      />
    );
  }

  if (authView === 'signup') {
    return (
      <SignUpPage
        onSignUp={signUp}
        onNavigateToSignIn={() => setAuthView('signin')}
        onNavigateToLanding={() => setAuthView('landing')}
      />
    );
  }

  if (authView === 'faq') {
    return (
      <FAQPage 
        onBackToHome={() => setAuthView('landing')} 
      />
    );
  }

  return (
    <SignInPage
      onSignIn={signIn}
      onNavigateToSignUp={() => setAuthView('signup')}
      onNavigateToLanding={() => setAuthView('landing')}
    />
  );
};