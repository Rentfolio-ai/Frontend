// FILE: src/pages/auth/SignInPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep Purple Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#1B0034] via-[#3B0A72] to-[#6E00FF]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      {/* Animated Glow Layers */}
      <motion.div
        className="absolute -z-10 w-[700px] h-[700px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(0,199,140,0.3), transparent 70%)", top: "20%", left: "10%" }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -z-10 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(110,0,255,0.25), transparent 70%)", bottom: "15%", right: "10%" }}
        animate={{ scale: [1, 0.95, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(110,0,255,0.3)" }}
          className="w-full max-w-md mx-auto rounded-3xl shadow-2xl backdrop-blur-lg bg-white/95 p-10 transition-all duration-500"
        >
          {/* Logo and Title */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 via-teal-500 to-green-400 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter Tight, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
              Sign in to continue to Civitas
            </p>
          </motion.div>

          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
          {/* Google Sign In */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              variant="outline"
              className="w-full h-12 bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 ease-in-out"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500, letterSpacing: '0.05em' }}>Or continue with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form className="space-y-6" onSubmit={handleEmailSignIn}>
            {/* Email Field */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.label 
                htmlFor="email" 
                className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                  emailFocused || email 
                    ? 'top-2 text-xs text-[#6E00FF]' 
                    : 'top-4 text-sm text-gray-500'
                }`}
              >
                Email address
              </motion.label>
              <motion.input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                whileFocus={{ scale: 1.01 }}
                className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 rounded-xl bg-white text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#6E00FF]/20 focus:border-[#6E00FF]
                           transition-all duration-300"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.label 
                htmlFor="password" 
                className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                  passwordFocused || password 
                    ? 'top-2 text-xs text-[#6E00FF]' 
                    : 'top-4 text-sm text-gray-500'
                }`}
              >
                Password
              </motion.label>
              <motion.input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                whileFocus={{ scale: 1.01 }}
                className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 rounded-xl bg-white text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#6E00FF]/20 focus:border-[#6E00FF]
                           transition-all duration-300"
              />
            </motion.div>

            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  rememberMe 
                    ? 'bg-gradient-to-r from-[#6E00FF] to-[#00C78C] border-transparent' 
                    : 'border-gray-300 bg-white'
                }`}>
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer select-none" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>
                  Remember me
                </label>
              </motion.div>

              <motion.button 
                type="button"
                onClick={() => {
                  // TODO: Implement password reset flow
                }}
                whileHover={{ scale: 1.05, x: 2 }}
                className="text-sm font-medium text-[#6E00FF] hover:text-[#00C78C] transition-colors"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
                aria-label="Reset your password"
              >
                Forgot password?
              </motion.button>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,199,140,0.6)" }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-4 bg-gradient-to-r from-[#6E00FF] to-[#00C78C] text-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16px' }}
            >
              {/* Shimmer effect */}
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </span>
            </motion.button>
          </form>

          <motion.p 
            className="text-center text-sm text-gray-600"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Don't have an account?{' '}
            <motion.button
              onClick={onNavigateToSignUp}
              whileHover={{ scale: 1.05 }}
              className="font-semibold text-[#6E00FF] hover:text-[#00C78C] transition-colors"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
            >
              Sign up
            </motion.button>
          </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-16">
        <div className="max-w-lg relative z-10">
          <motion.h2 
            className="text-5xl font-bold mb-4 text-white"
            style={{ fontFamily: 'Inter Tight, system-ui, sans-serif', letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Welcome to Civitas
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-12"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400, lineHeight: '1.6' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your AI-Powered STR Investment Partner
          </motion.p>
          
          <div className="space-y-6 mb-10">
            <motion.div 
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm" 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,199,140,0.2)' }}
                role="img"
                aria-label="Chat icon"
              >
                <span className="text-2xl" aria-hidden="true">💬</span>
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Chat with Civitas AI</h3>
                <p className="text-gray-300 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.5' }}>Get instant insights and answers about STR investments, market trends, and property analysis</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm" 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,199,140,0.2)' }}
                role="img"
                aria-label="Analytics icon"
              >
                <span className="text-2xl" aria-hidden="true">📊</span>
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Analyze Property Performance</h3>
                <p className="text-gray-300 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.5' }}>Track revenue, occupancy rates, and ROI across your entire portfolio in real-time</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm" 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,199,140,0.2)' }}
                role="img"
                aria-label="Portfolio icon"
              >
                <span className="text-2xl" aria-hidden="true">🏠</span>
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Manage Your Portfolio</h3>
                <p className="text-gray-300 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.5' }}>Keep all your properties organized in one place with detailed performance metrics</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm" 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,199,140,0.2)' }}
                role="img"
                aria-label="Market insights icon"
              >
                <span className="text-2xl" aria-hidden="true">📈</span>
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Market Insights & Trends</h3>
                <p className="text-gray-300 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.5' }}>Get data-driven investment recommendations based on current market conditions</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
      </div>
    </main>
  );
};
