// Vision Sign-Up Page - Violet-branded, same auth logic
import React, { useState } from 'react';
import { authAPI } from '../../services/authApi';
import { createAccount, getIdToken } from '../../services/firebaseAuth';
import { ScanEye } from 'lucide-react';

interface VisionSignUpPageProps {
  onSignUp: (user: any) => void;
  onNavigateToSignIn: () => void;
  onNavigateToLanding?: () => void;
}

export const VisionSignUpPage: React.FC<VisionSignUpPageProps> = ({ onSignUp, onNavigateToSignIn, onNavigateToLanding }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
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

    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!acceptTerms) newErrors.terms = 'You must accept the Terms of Service and Privacy Policy';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      let idToken = 'dev-token';

      const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const isFirebaseConfigured = firebaseApiKey && !firebaseApiKey.includes('Dummy');

      if (isFirebaseConfigured) {
        const firebaseUser = await createAccount(formData.email, formData.password, fullName);
        const token = await getIdToken(firebaseUser);
        if (token) idToken = token;
      }

      const response = await authAPI.signUp({
        id_token: idToken,
        email: formData.email,
        name: fullName,
      });

      const userData = {
        id: response.user.user_id,
        name: fullName,
        email: formData.email,
        avatar: `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase(),
      };

      localStorage.setItem('civitas-user', JSON.stringify(userData));
      onSignUp(userData);
    } catch (error: any) {
      const code = error?.code;
      let message = error?.message || 'Failed to create account.';
      if (code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Try signing in instead.';
      } else if (code === 'auth/weak-password') {
        message = 'Password is too weak. Please use a stronger password.';
      } else if (code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      setErrors({ general: message });
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
      console.log('Apple sign in');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to sign up with Apple.',
      });
      setIsAppleLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl bg-[#1A1A1C] border text-[#FBF9F7] placeholder-white/20 focus:outline-none focus:ring-1 transition-all font-sans text-[15px] ${
      errors[field]
        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
        : 'border-white/[0.08] focus:border-violet-500 focus:ring-violet-500'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0C0C0E]">
      <div className="w-full max-w-[480px]">
        {/* Back to Vision Home */}
        {onNavigateToLanding && (
          <button
            onClick={onNavigateToLanding}
            className="group flex items-center gap-2 mb-8 text-white/40 hover:text-violet-400 transition-colors font-sans"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm tracking-tight">Back to Vasthu Vision</span>
          </button>
        )}

        {/* Main Auth Card */}
        <div className="rounded-2xl p-8 md:p-10 bg-[#161618] border border-white/[0.08] shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <ScanEye className="w-5 h-5 text-violet-400" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-[#FBF9F7] mb-3 tracking-tight">
              Get started with Vision
            </h1>
            <p className="text-white/50 font-sans text-[15px]">
              AI-powered property damage detection
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />
              {errors.general}
            </div>
          )}

          {/* OAuth Buttons - Side by side */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={handleAppleSignUp}
              disabled={isAppleLoading}
              className="h-12 rounded-xl font-sans font-medium flex items-center justify-center transition-all disabled:opacity-50 bg-[#1A1A1C] hover:bg-[#222224] border border-white/[0.08] text-[#FBF9F7] focus:ring-2 focus:ring-violet-500/20 outline-none"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>

            <button
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="h-12 rounded-xl font-sans font-medium flex items-center justify-center transition-all disabled:opacity-50 bg-[#1A1A1C] hover:bg-[#222224] border border-white/[0.08] text-[#FBF9F7] focus:ring-2 focus:ring-violet-500/20 outline-none"
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
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-mono">
              <span className="px-3 bg-[#161618] text-white/30">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="vision-firstName" className="block text-sm font-medium text-white/80 mb-2 font-sans">
                  First name <span className="text-red-500/80">*</span>
                </label>
                <input
                  id="vision-firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="First name"
                  className={inputClass('firstName')}
                />
              </div>

              <div>
                <label htmlFor="vision-lastName" className="block text-sm font-medium text-white/80 mb-2 font-sans">
                  Last name <span className="text-red-500/80">*</span>
                </label>
                <input
                  id="vision-lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Last name"
                  className={inputClass('lastName')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="vision-email" className="block text-sm font-medium text-white/80 mb-2 font-sans">
                Email address <span className="text-red-500/80">*</span>
              </label>
              <input
                id="vision-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={inputClass('email')}
              />
            </div>

            <div>
              <label htmlFor="vision-password" className="block text-sm font-medium text-white/80 mb-2 font-sans">
                Password <span className="text-red-500/80">*</span>
              </label>
              <input
                id="vision-password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-red-400 font-sans">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="vision-phone" className="block text-sm font-medium text-white/80 mb-2 font-sans">
                Phone number <span className="font-normal text-white/30">(optional)</span>
              </label>
              <div className="flex gap-2">
                <select
                  className="px-3 py-3 rounded-xl bg-[#1A1A1C] border border-white/[0.08] text-[#FBF9F7] text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-sans w-20 appearance-none text-center"
                >
                  <option value="US">US</option>
                  <option value="CA">CA</option>
                  <option value="GB">GB</option>
                  <option value="IN">IN</option>
                </select>
                <input
                  id="vision-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 Enter your phone number"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#1A1A1C] border border-white/[0.08] text-[#FBF9F7] placeholder-white/20 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-sans text-[15px]"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="mt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                  }}
                  className={`mt-1 w-4 h-4 rounded bg-[#1A1A1C] border cursor-pointer appearance-none checked:bg-violet-500 checked:border-violet-500 transition-colors relative flex-shrink-0
                    ${errors.terms ? 'border-red-500/50' : 'border-white/[0.2] group-hover:border-white/[0.4]'}
                  `}
                  style={{
                    backgroundImage: acceptTerms ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")" : 'none'
                  }}
                />
                <span className="text-xs leading-relaxed text-white/50 font-sans select-none">
                  I agree to the{' '}
                  <a href="/terms-of-service" target="_blank" rel="noopener noreferrer"
                    className="underline font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
                    className="underline font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}>
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-xs text-red-400 font-sans ml-7">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/10 font-sans"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm mt-8 text-white/40 font-sans">
          Already have an account?{' '}
          <button
            onClick={onNavigateToSignIn}
            className="font-semibold text-violet-400 hover:text-violet-300 transition-colors ml-1"
          >
            Sign in to Vision
          </button>
        </p>
      </div>
    </div>
  );
};
