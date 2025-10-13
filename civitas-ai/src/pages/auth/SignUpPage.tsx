// FILE: src/pages/auth/SignUpPage.tsx
import React, { useState } from 'react';
import { Button } from '../../components/primitives/Button';

interface SignUpPageProps {
  onSignUp: (user: any) => void;
  onNavigateToSignIn: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigateToSignIn }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      onSignUp({
        id: '1',
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        avatar: formData.firstName.charAt(0) + formData.lastName.charAt(0)
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    
    // Simulate Google OAuth
    setTimeout(() => {
      onSignUp({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'JD',
        provider: 'google'
      });
      setIsGoogleLoading(false);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(180deg, #56CCF2 0%, #2F80ED 100%)'
    }}>
      {/* Left Panel - Sign Up Form */}
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
              Create Your Account
            </h1>
            <p className="text-sm text-gray-600">
              Start your STR investment journey with Civitas
            </p>
          </div>

          <div className="space-y-6">
          {/* Google Sign Up */}
          <Button
            onClick={handleGoogleSignUp}
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

          {/* Email Sign Up Form */}
          <form className="space-y-4" onSubmit={handleEmailSignUp}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg bg-white text-gray-900
                             placeholder:text-gray-400 focus:outline-none focus:ring-2 
                             focus:border-transparent transition-colors ${
                               errors.firstName 
                                 ? 'border-red-500 focus:ring-red-500' 
                                 : 'border-gray-300 focus:ring-blue-500'
                             }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg bg-white text-gray-900
                             placeholder:text-gray-400 focus:outline-none focus:ring-2 
                             focus:border-transparent transition-colors ${
                               errors.lastName 
                                 ? 'border-red-500 focus:ring-red-500' 
                                 : 'border-gray-300 focus:ring-blue-500'
                             }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg bg-white text-gray-900
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 
                           focus:border-transparent transition-colors ${
                             errors.email 
                               ? 'border-red-500 focus:ring-red-500' 
                               : 'border-gray-300 focus:ring-blue-500'
                           }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg bg-white text-gray-900
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 
                           focus:border-transparent transition-colors ${
                             errors.password 
                               ? 'border-red-500 focus:ring-red-500' 
                               : 'border-gray-300 focus:ring-blue-500'
                           }`}
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg bg-white text-gray-900
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 
                           focus:border-transparent transition-colors ${
                             errors.confirmPassword 
                               ? 'border-red-500 focus:ring-red-500' 
                               : 'border-gray-300 focus:ring-blue-500'
                           }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                I agree to the{' '}
                <a 
                  href="/terms-of-service" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-12"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onNavigateToSignIn}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </button>
          </p>
          </div>
        </div>
      </div>

      {/* Right Panel - App Preview */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-4">
            Start Your Journey
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of investors using AI for smarter STR decisions
          </p>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Free to Start</h3>
                <p className="text-white/80 text-sm">Begin with essential features, upgrade anytime as your portfolio grows</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Powered Analysis</h3>
                <p className="text-white/80 text-sm">Get instant property valuations, ROI projections, and market insights</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Comprehensive Reports</h3>
                <p className="text-white/80 text-sm">Track performance metrics, generate tax reports, and monitor occupancy rates</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Expert Insights</h3>
                <p className="text-white/80 text-sm">Access market trends, investment opportunities, and data-driven recommendations</p>
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
                <svg className="w-16 h-16 mx-auto mb-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
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