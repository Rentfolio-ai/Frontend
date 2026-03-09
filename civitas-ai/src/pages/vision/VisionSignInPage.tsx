// Vision Sign-In Page - Violet-branded, same auth logic
import React, { useState } from 'react';
import { authAPI } from '../../services/authApi';
import { Building2, ScanEye } from 'lucide-react';

interface VisionSignInPageProps {
  onSignIn: (user: any) => void;
  onNavigateToSignUp: () => void;
  onNavigateToLanding?: () => void;
}

export const VisionSignInPage: React.FC<VisionSignInPageProps> = ({ onSignIn, onNavigateToSignUp, onNavigateToLanding }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [showSSOInput, setShowSSOInput] = useState(false);
  const [ssoEmail, setSSOEmail] = useState('');
  const [errors, setErrors] = useState<{ general?: string }>({});

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authAPI.signInWithGoogle();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to sign in with Google.',
      });
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      console.log('Apple sign in');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to sign in with Apple.',
      });
      setIsAppleLoading(false);
    }
  };

  const handleSSOSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoEmail.trim()) {
      setErrors({ general: 'Please enter your work email' });
      return;
    }
    console.log('SSO sign in with:', ssoEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-[480px]">
        {/* Back to Vision Home */}
        {onNavigateToLanding && (
          <button
            onClick={onNavigateToLanding}
            className="group flex items-center gap-2 mb-8 text-muted-foreground/70 hover:text-violet-400 transition-colors font-sans"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm tracking-tight">Back to Vasthu Vision</span>
          </button>
        )}

        {/* Main Auth Card */}
        <div className="rounded-2xl p-8 md:p-10 bg-card border border-black/[0.08] shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <ScanEye className="w-5 h-5 text-violet-400" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground font-sans text-[15px]">
              Sign in to continue to Vasthu Vision
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />
              {errors.general}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-8">
            {/* Apple Button */}
            <button
              onClick={handleAppleSignIn}
              disabled={isAppleLoading}
              className="w-full h-12 rounded-xl font-sans font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-50 bg-input hover:bg-muted border border-black/[0.08] text-foreground focus:ring-2 focus:ring-violet-500/20 outline-none"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full h-12 rounded-xl font-sans font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-50 bg-input hover:bg-muted border border-black/[0.08] text-foreground focus:ring-2 focus:ring-violet-500/20 outline-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/[0.08]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-mono">
              <span className="px-3 bg-card text-muted-foreground/50">or continue with</span>
            </div>
          </div>

          {/* SSO Toggle/Form */}
          {!showSSOInput ? (
            <button
              onClick={() => setShowSSOInput(true)}
              className="w-full h-12 rounded-xl font-sans font-medium flex items-center justify-center gap-2 transition-all bg-transparent hover:bg-black/[0.02] border border-black/[0.08] hover:border-black/[0.12] text-foreground/70"
            >
              <Building2 className="w-5 h-5 opacity-70" />
              <span>Use Single Sign-On (SSO)</span>
            </button>
          ) : (
            <form onSubmit={handleSSOSignIn} className="space-y-4">
              <div>
                <label htmlFor="sso-email-vision" className="block text-sm font-medium text-foreground/80 mb-2 font-sans">
                  Work email
                </label>
                <input
                  id="sso-email-vision"
                  type="email"
                  value={ssoEmail}
                  onChange={(e) => setSSOEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-input border border-black/[0.08] text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-sans text-[15px]"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl font-semibold text-[15px] transition-all bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/10"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSSOInput(false);
                    setSSOEmail('');
                  }}
                  className="px-6 h-11 rounded-xl font-medium text-[15px] transition-colors bg-transparent border border-black/[0.08] text-muted-foreground hover:text-foreground/80 hover:bg-black/[0.02]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Link */}
          <p className="text-center text-sm mt-8 text-muted-foreground/70 font-sans">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="font-semibold text-violet-400 hover:text-violet-300 transition-colors ml-1"
            >
              Sign up for Vision
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
