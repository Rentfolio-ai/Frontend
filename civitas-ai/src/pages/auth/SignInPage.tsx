// FILE: src/pages/auth/SignInPage.tsx
import React, { useState } from 'react';
import { Button } from '../../components/primitives/Button';

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
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(180deg, #56CCF2 0%, #2F80ED 100%)'
    }}>
      {/* Left Panel - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div 
          className="w-full max-w-md mx-auto rounded-2xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
            }}>
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to continue to Civitas
            </p>
          </div>

          <div className="space-y-6">
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
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form className="space-y-4" onSubmit={handleEmailSignIn}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => {
                    // TODO: Implement password reset flow
                    alert('Password reset functionality coming soon');
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  aria-label="Reset your password"
                >
                  Forgot password?
                </button>
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

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign up
            </button>
          </p>
          </div>
        </div>
      </div>

      {/* Right Panel - App Preview */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Civitas
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Your AI-Powered STR Investment Partner
          </p>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                role="img"
                aria-label="Chat icon"
              >
                <span className="text-2xl" aria-hidden="true">💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Chat with Civitas AI</h3>
                <p className="text-white/80 text-sm">Get instant insights and answers about STR investments, market trends, and property analysis</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                role="img"
                aria-label="Analytics icon"
              >
                <span className="text-2xl" aria-hidden="true">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Analyze Property Performance</h3>
                <p className="text-white/80 text-sm">Track revenue, occupancy rates, and ROI across your entire portfolio in real-time</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                role="img"
                aria-label="Portfolio icon"
              >
                <span className="text-2xl" aria-hidden="true">🏠</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Manage Your Portfolio</h3>
                <p className="text-white/80 text-sm">Keep all your properties organized in one place with detailed performance metrics</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                role="img"
                aria-label="Market insights icon"
              >
                <span className="text-2xl" aria-hidden="true">📈</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Market Insights & Trends</h3>
                <p className="text-white/80 text-sm">Get data-driven investment recommendations based on current market conditions</p>
              </div>
            </div>
          </div>

          {/* Preview Image Placeholder */}
          <div 
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <svg 
                  className="w-16 h-16 mx-auto mb-4 text-white/60" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  role="img"
                  aria-labelledby="app-preview-icon-title"
                  focusable="false"
                >
                  <title id="app-preview-icon-title">Home icon</title>
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <p className="text-white/60 text-sm">App Interface Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};