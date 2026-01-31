// Modern Sign-Up Page - Clean and Professional
import React, { useState } from 'react';
import { authAPI } from '../../services/authApi';
import { Home } from 'lucide-react';

interface SignUpPageProps {
  onSignUp: (user: any) => void;
  onNavigateToSignIn: () => void;
  onNavigateToLanding?: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigateToSignIn, onNavigateToLanding }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // For now, simulate signup - in production this would call your API
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const userData = {
        id: Date.now().toString(),
        name: fullName,
        email: formData.email,
        avatar: `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase(),
      };

      onSignUp(userData);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create account.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await authAPI.signInWithGoogle();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to sign up with Google.',
      });
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setIsAppleLoading(true);
    try {
      // Apple sign in would go here
      console.log('Apple sign in');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to sign up with Apple.',
      });
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#F1F5F9' }}>
      <div className="w-full max-w-[520px]">
        {/* Back to Home Button */}
        {onNavigateToLanding && (
          <button
            onClick={onNavigateToLanding}
            className="flex items-center gap-2 mb-6 transition-all"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#0D9488';
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm">Back to Home</span>
          </button>
        )}

        {/* Main Auth Card */}
        <div className="rounded-2xl p-10" style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)'
        }}>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: '#1E293B',
              }}
            >
              <Home className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>
              Start your journey
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Join thousands making smarter rental investments
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-3 rounded-lg text-sm" style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#DC2626'
            }}>
              {errors.general}
            </div>
          )}

          {/* OAuth Buttons - Side by side */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Apple Button */}
            <button
              onClick={handleAppleSignUp}
              disabled={isAppleLoading}
              className="h-12 rounded-lg font-medium flex items-center justify-center transition-all disabled:opacity-50"
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#1E293B',
              }}
              onMouseEnter={(e) => {
                if (!isAppleLoading) {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="h-12 rounded-lg font-medium flex items-center justify-center transition-all disabled:opacity-50"
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#1E293B',
              }}
              onMouseEnter={(e) => {
                if (!isGoogleLoading) {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E2E8F0' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3" style={{
                backgroundColor: '#FFFFFF',
                color: '#64748B'
              }}>or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                  First name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="First name"
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: errors.firstName ? '1px solid #DC2626' : '1px solid #E2E8F0',
                    color: '#1E293B',
                  }}
                  onFocus={(e) => {
                    if (!errors.firstName) {
                      e.currentTarget.style.borderColor = '#0D9488';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.firstName ? '#DC2626' : '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                  Last name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: errors.lastName ? '1px solid #DC2626' : '1px solid #E2E8F0',
                    color: '#1E293B',
                  }}
                  onFocus={(e) => {
                    if (!errors.lastName) {
                      e.currentTarget.style.borderColor = '#0D9488';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.lastName ? '#DC2626' : '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                Email address <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: '#F8FAFC',
                  border: errors.email ? '1px solid #DC2626' : '1px solid #E2E8F0',
                  color: '#1E293B',
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.currentTarget.style.borderColor = '#0D9488';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.email ? '#DC2626' : '#E2E8F0';
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                Phone number <span className="font-normal" style={{ color: '#94A3B8' }}>(optional)</span>
              </label>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#1E293B',
                    width: '80px',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0D9488';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                >
                  <option value="US">US</option>
                  <option value="CA">CA</option>
                  <option value="GB">GB</option>
                  <option value="IN">IN</option>
                </select>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 Enter your phone number"
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#1E293B',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0D9488';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#334155';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1E293B';
              }}
            >
              {isLoading ? 'Creating account...' : 'Continue'}
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm mt-6" style={{ color: '#64748B' }}>
          Already have an account?{' '}
          <button
            onClick={onNavigateToSignIn}
            className="font-semibold transition-colors"
            style={{ color: '#0D9488' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0F766E'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#0D9488'}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
