/**
 * Integration OAuth Callback Page
 * Handles OAuth redirects from external platforms
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, CheckCircle, XCircle, Home } from 'lucide-react';

export const IntegrationCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your account...');
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get OAuth params from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const platformParam = searchParams.get('platform') || state?.split(':')[0] || 'unknown';
      
      setPlatform(platformParam);

      // Handle OAuth error
      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        return;
      }

      // Validate params
      if (!code || !state) {
        setStatus('error');
        setMessage('Invalid authorization response');
        return;
      }

      setMessage('Exchanging authorization code...');

      // Exchange code for tokens
      const response = await fetch(`/api/integrations/${platformParam}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to connect integration');
      }

      // Success!
      setStatus('success');
      setMessage('Successfully connected! Syncing your portfolios...');

      // Wait a moment then redirect
      setTimeout(() => {
        // Redirect to portfolio page
        navigate('/portfolio?syncing=true');
      }, 2000);

    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to connect. Please try again.');
    }
  };

  const handleRetry = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.08] flex items-center justify-center">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-white mb-2">
            {status === 'loading' && 'Connecting...'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h1>

          {/* Platform */}
          {platform && (
            <p className="text-sm text-white/60 mb-4 capitalize">
              {platform}
            </p>
          )}

          {/* Message */}
          <p className="text-white/70 mb-6">
            {message}
          </p>

          {/* Loading dots */}
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Action buttons */}
          {status === 'success' && (
            <button
              onClick={() => navigate('/portfolio')}
              className="mt-4 px-6 py-3 bg-white hover:bg-white/90 text-[#1a1a1a] rounded-lg font-medium transition-all"
            >
              View Portfolios
            </button>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-white hover:bg-white/90 text-[#1a1a1a] rounded-lg font-medium transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.10] text-white rounded-lg font-medium transition-all"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          )}

          {/* Help text */}
          <p className="mt-6 text-xs text-white/40">
            {status === 'loading' && 'This may take a few moments...'}
            {status === 'success' && 'Your portfolios will appear shortly'}
            {status === 'error' && 'If this persists, contact support'}
          </p>
        </div>

        {/* Info box */}
        {status === 'success' && (
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-sm text-white/60 text-center">
              💡 Your portfolios are syncing in the background. You can continue using the app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
