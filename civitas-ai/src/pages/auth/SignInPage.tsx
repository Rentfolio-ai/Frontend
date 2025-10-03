// FILE: src/pages/auth/SignInPage.tsx
import React, { useState } from 'react';
import { Button } from '../../components/primitives/Button';
import { ThemeToggle } from '../../components/primitives/ThemeToggle';

interface SignInPageProps {
  onSignIn: (user: any) => void;
  onNavigateToSignUp: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSignIn, onNavigateToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      onSignIn({
        id: '1',
        name: 'John Doe',
        email: email,
        avatar: 'JD'
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    // Simulate Google OAuth
    setTimeout(() => {
      onSignIn({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'JD',
        provider: 'google'
      });
      setIsGoogleLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-primary to-accent-from relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative z-10 max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-8 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to Civitas AI
          </h1>
          
          <p className="text-lg text-white/90 leading-relaxed">
            Your intelligent real estate investment assistant. Analyze properties, 
            generate reports, and discover opportunities with AI-powered insights.
          </p>
          
          <div className="mt-8 space-y-4 text-white/80">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span>AI-powered property analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span>Comprehensive market reports</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span>Investment opportunity discovery</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 max-w-lg lg:max-w-md xl:max-w-lg mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Civitas AI</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-foreground mb-2">
            Sign in to your account
          </h2>
          <p className="text-sm text-foreground/60 mb-8">
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
            variant="outline"
            className="w-full h-12"
            leftIcon={
              !isGoogleLoading && (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )
            }
          >
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-foreground/60">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form className="space-y-4" onSubmit={handleEmailSignIn}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground
                           placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary 
                           focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground
                           placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary 
                           focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground/70">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-12"
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/60">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};