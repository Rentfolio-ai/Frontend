// FILE: src/pages/auth/SignUpPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/primitives/Button';
import { FeatureShowcase } from '../../components/auth/FeatureShowcase';
import { CivitasLogo } from '../../components/auth/CivitasLogo';
import { authAPI } from '../../services/authApi';

interface SignUpPageProps {
  onSignUp: (user: any) => void;
  onNavigateToSignIn: () => void;
}

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigateToSignIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): PasswordRequirements => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordRequirements).every((req) => req);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await authAPI.signUp({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim() || undefined,
        accept_terms: acceptTerms,
      });

      // Transform API response to match expected user format
      const userData = {
        id: response.user.user_id,
        name: response.user.name || formData.name || response.user.email.split('@')[0],
        email: response.user.email,
        avatar: response.user.name
          ? response.user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
          : response.user.email[0].toUpperCase(),
      };

      onSignUp(userData);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await authAPI.signInWithGoogle();
      // Note: OAuth redirect will happen, so this may not complete
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to sign up with Google. Please try again.',
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex" style={{ backgroundColor: '#0F0E23' }}>
      {/* Left Column - Sign-Up Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-12 lg:px-16">
        <motion.div
          className="w-full max-w-md mx-auto rounded-2xl p-10"
          style={{
            backgroundColor: '#1E1B4B',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <CivitasLogo size={64} showText={true} />
            <motion.p
              className="text-white text-base font-medium mt-4"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Create your account
            </motion.p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <motion.div
              className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.general}
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Google Sign Up Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
          <Button
            onClick={handleGoogleSignUp}
            isLoading={isGoogleLoading}
            variant="outline"
                className="w-full h-12 bg-white text-gray-900 border-0 hover:bg-gray-50 transition-all duration-300"
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
            </motion.div>

            {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span
                  className="px-2 text-white/60"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500, letterSpacing: '0.05em' }}
                >
                  OR CONTINUE WITH EMAIL
                </span>
            </div>
          </div>

          {/* Email Sign Up Form */}
            <form className="space-y-5" onSubmit={handleEmailSignUp}>
              {/* Name Field (Optional) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Name (optional)"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
                    border border-white/20 transition-all duration-300 focus:outline-none focus:ring-2
                    focus:border-purple-500 focus:ring-purple-500/20"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                />
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email address"
                  className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
                    border transition-all duration-300 focus:outline-none focus:ring-2
                    ${
                             errors.email 
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-white/20 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20'
                           }`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              />
              {errors.email && (
                  <p className="mt-1 text-xs text-red-400" role="alert">
                    {errors.email}
                  </p>
              )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="relative">
              <input
                id="password"
                name="password"
                    type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Password"
                    className={`w-full px-4 py-3 pr-12 rounded-lg bg-white text-gray-900 placeholder:text-gray-400
                      border transition-all duration-300 focus:outline-none focus:ring-2
                      ${
                             errors.password 
                          ? 'border-red-500 focus:ring-red-500/20'
                          : formData.password && !isPasswordValid
                          ? 'border-yellow-500 focus:ring-yellow-500/20'
                          : formData.password && isPasswordValid
                          ? 'border-[#10B981] focus:ring-[#10B981]/20'
                          : 'border-white/20 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20'
                           }`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              {errors.password && (
                  <p className="mt-1 text-xs text-red-400" role="alert">
                    {errors.password}
                  </p>
                )}
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-white/60 mb-1">Password requirements:</p>
                    <div className="space-y-0.5 text-xs">
                      <div className={`flex items-center gap-2 ${passwordRequirements.minLength ? 'text-green-400' : 'text-white/40'}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          {passwordRequirements.minLength ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
                        </svg>
                        Minimum 8 characters
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasUppercase ? 'text-green-400' : 'text-white/40'}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          {passwordRequirements.hasUppercase ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        At least one uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-400' : 'text-white/40'}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          {passwordRequirements.hasNumber ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        At least one number
                      </div>
                    </div>
            </div>
                )}
              </motion.div>

              {/* Terms and Conditions */}
              <motion.div
                className="flex items-start gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-all duration-200 border-white/30"
                  style={{
                    backgroundColor: acceptTerms ? 'transparent' : 'transparent',
                    background: acceptTerms ? 'linear-gradient(to right, #8B5CF6, #10B981)' : 'transparent',
                    borderColor: acceptTerms ? 'transparent' : 'rgba(255, 255, 255, 0.3)',
                  }}
                  onClick={() => setAcceptTerms(!acceptTerms)}
                >
                  {acceptTerms && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
              )}
            </div>
                <label
                  htmlFor="terms"
                  className="text-sm text-white cursor-pointer select-none"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.5' }}
                >
                I agree to the{' '}
                <a 
                  href="/terms-of-service" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                    className="hover:underline transition-colors"
                    style={{ color: '#B794F6' }}
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                    className="hover:underline transition-colors"
                    style={{ color: '#B794F6' }}
                >
                  Privacy Policy
                </a>
              </label>
              </motion.div>
              {errors.terms && (
                <p className="text-xs text-red-400 -mt-4" role="alert">
                  {errors.terms}
                </p>
              )}

              {/* Sign Up Button */}
              <motion.button
              type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="relative w-full py-3.5 text-white rounded-lg font-bold overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '16px',
                  background: 'linear-gradient(to right, #8B5CF6, #10B981)',
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    'Sign up'
                  )}
                </span>
              </motion.button>
          </form>

            {/* Sign In Link */}
            <motion.p
              className="text-center text-sm text-white"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
            Already have an account?{' '}
            <button
              onClick={onNavigateToSignIn}
                className="font-semibold hover:underline transition-colors"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#B794F6' }}
            >
              Sign in
            </button>
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Feature Showcase */}
      <div className="hidden lg:flex lg:w-[55%] items-center justify-center" style={{ backgroundColor: '#0F0E23' }}>
        <FeatureShowcase />
      </div>
    </main>
  );
};
