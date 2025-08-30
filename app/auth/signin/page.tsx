'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket, UserPlus, LogIn } from 'lucide-react';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we're in development mode (localhost)
  const isDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('local'));

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    // Check if we should show signup tab by default
    const _mode = searchParams.get('mode');
    if (_mode === 'signup') {
      setActiveTab('signup');
    }
  }, [router, searchParams]);

  const handleGoogleAuth = async (mode: 'signin' | 'signup') => {
    setLoading(true);
    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
        // You can add custom parameters here if needed for signup vs signin
      });
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    if (demoLoading) return;

    setDemoLoading(true);

    // Just navigate directly - middleware allows everything in development
    router.push('/dashboard');
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Rentfolio AI
          </h2>
          <p className="mt-2 text-gray-300">
            {activeTab === 'signin' ? 'Welcome back! Sign in to continue' : 'Join thousands of investors using AI-powered analytics'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            {/* Tab Navigation */}
            <div className="flex rounded-lg bg-white/5 p-1 mb-4">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'signin'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>

            <CardTitle className="text-center text-white">
              {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demo Access Button - Only show in development */}
            {isDevelopment && (
              <Button
                onClick={handleDemoAccess}
                disabled={demoLoading}
                variant="outline"
                className="w-full bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
                size="lg"
              >
                {demoLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4 mr-2" />
                )}
                Skip to Dashboard (Dev)
              </Button>
            )}

            {isDevelopment && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>
            )}

            <Button
              onClick={() => handleGoogleAuth(activeTab)}
              disabled={loading}
              className="w-full bg-white text-gray-900 hover:bg-gray-100"
              size="lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {activeTab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
            </Button>

            {/* Benefits for signup tab */}
            {activeTab === 'signup' && (
              <div className="bg-white/5 rounded-lg p-4 mt-4">
                <h4 className="text-white font-medium mb-2">What you&apos;ll get:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• AI-powered portfolio analytics</li>
                  <li>• Real-time market insights</li>
                  <li>• Property performance tracking</li>
                  <li>• Investment optimization tools</li>
                </ul>
              </div>
            )}

            <div className="text-center text-xs text-gray-400">
              By {activeTab === 'signin' ? 'signing in' : 'creating an account'}, you agree to our{' '}
              <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
            </div>
          </CardContent>
        </Card>

        {/* Switch between signin/signup */}
        <div className="text-center">
          <p className="text-gray-400">
            {activeTab === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {activeTab === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
