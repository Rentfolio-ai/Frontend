'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if we're in development mode (localhost)
  const isDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('local'));

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    // In development, always allow access
    if (isDevelopment) {
      return;
    }

    // In production, require authentication
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router, isDevelopment]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback if provided and not authenticated (only in production)
  if (!session && !isDevelopment && fallback) {
    return <>{fallback}</>;
  }

  // Don't render anything if not authenticated (only in production - will redirect)
  if (!session && !isDevelopment) {
    return null;
  }

  // User is authenticated OR in development mode, render children
  return <>{children}</>;
}
