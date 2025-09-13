// FILE: src/pages/auth/SignUpPage.tsx
import React, { useState } from 'react';
import { Button } from '../../components/primitives/Button';
import { ThemeToggle } from '../../components/primitives/ThemeToggle';

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
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-accent-from to-primary relative overflow-hidden">
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
            Start Your Journey
          </h1>
          
          <p className="text-lg text-white/90 leading-relaxed">
            Join thousands of investors using AI to make smarter real estate decisions. 
            Get started with your free account today.
          </p>
          
          <div className="mt-8 space-y-4 text-white/80">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span>Free to start, upgrade anytime</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span>Advanced AI analysis tools</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span>Expert insights and reports</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-32 left-16 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Right Panel - Sign Up Form */}
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
            Create your account
          </h2>
          <p className="text-sm text-foreground/60 mb-8">
            Get started with your free Civitas AI account.
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
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
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-foreground/60">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign Up Form */}
          <form className="space-y-4" onSubmit={handleEmailSignUp}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
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
                  className={`w-full px-3 py-2.5 border rounded-lg bg-background text-foreground
                             placeholder:text-foreground/60 focus:outline-none focus:ring-2 
                             focus:border-transparent transition-colors ${
                               errors.firstName 
                                 ? 'border-danger focus:ring-danger' 
                                 : 'border-border focus:ring-primary'
                             }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-danger">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
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
                  className={`w-full px-3 py-2.5 border rounded-lg bg-background text-foreground
                             placeholder:text-foreground/60 focus:outline-none focus:ring-2 
                             focus:border-transparent transition-colors ${
                               errors.lastName 
                                 ? 'border-danger focus:ring-danger' 
                                 : 'border-border focus:ring-primary'
                             }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-danger">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg bg-background text-foreground
                           placeholder:text-foreground/60 focus:outline-none focus:ring-2 
                           focus:border-transparent transition-colors ${
                             errors.email 
                               ? 'border-danger focus:ring-danger' 
                               : 'border-border focus:ring-primary'
                           }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
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
                className={`w-full px-3 py-2.5 border rounded-lg bg-background text-foreground
                           placeholder:text-foreground/60 focus:outline-none focus:ring-2 
                           focus:border-transparent transition-colors ${
                             errors.password 
                               ? 'border-danger focus:ring-danger' 
                               : 'border-border focus:ring-primary'
                           }`}
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
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
                className={`w-full px-3 py-2.5 border rounded-lg bg-background text-foreground
                           placeholder:text-foreground/60 focus:outline-none focus:ring-2 
                           focus:border-transparent transition-colors ${
                             errors.confirmPassword 
                               ? 'border-danger focus:ring-danger' 
                               : 'border-border focus:ring-primary'
                           }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 text-primary focus:ring-primary border-border rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-foreground/70">
                I agree to the{' '}
                <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:text-primary/80 transition-colors">
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

          <p className="text-center text-sm text-foreground/60">
            Already have an account?{' '}
            <button
              onClick={onNavigateToSignIn}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};