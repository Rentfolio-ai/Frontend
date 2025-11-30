// FILE: src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, type AuthResponse } from '../services/authApi';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (user: User) => void;
  signUp: (user: User) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Helper to transform API user to app user format
const transformUser = (apiUser: AuthResponse['user']): User => {
  return {
    id: apiUser.user_id,
    name: apiUser.name || apiUser.email.split('@')[0],
    email: apiUser.email,
    avatar: apiUser.name
      ? apiUser.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : apiUser.email[0].toUpperCase(),
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in storage
        const token = localStorage.getItem('civitas-token') || sessionStorage.getItem('civitas-token');
        
        if (token) {
          // Try to get current user from API
          try {
            const apiUser = await authAPI.getCurrentUser();
            const transformedUser = transformUser(apiUser);
            setUser(transformedUser);
            // Also store in localStorage for backward compatibility
            localStorage.setItem('civitas-user', JSON.stringify(transformedUser));
          } catch (error) {
            // Token might be invalid, clear it
            console.warn('Failed to get current user, clearing token:', error);
            localStorage.removeItem('civitas-token');
            sessionStorage.removeItem('civitas-token');
            localStorage.removeItem('civitas-user');
          }
        } else {
          // Fallback: check for legacy user data
    const savedUser = localStorage.getItem('civitas-user');
    if (savedUser) {
      try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('civitas-user');
      }
    }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
    setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = (userData: User) => {
    setUser(userData);
    localStorage.setItem('civitas-user', JSON.stringify(userData));
  };

  const signUp = (userData: User) => {
    setUser(userData);
    localStorage.setItem('civitas-user', JSON.stringify(userData));
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      setUser(null);
      localStorage.removeItem('civitas-user');
      localStorage.removeItem('civitas-token');
      sessionStorage.removeItem('civitas-token');
    }
  };

  const refreshUser = async () => {
    try {
      const apiUser = await authAPI.getCurrentUser();
      const transformedUser = transformUser(apiUser);
      setUser(transformedUser);
      localStorage.setItem('civitas-user', JSON.stringify(transformedUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, user might be logged out
    setUser(null);
    localStorage.removeItem('civitas-user');
      localStorage.removeItem('civitas-token');
      sessionStorage.removeItem('civitas-token');
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
