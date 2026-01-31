// FILE: src/pages/auth/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, Home, TrendingUp, Shield, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
}

const HEADLINES = [
  {
    main: "Smart rental investing,\nsimplified",
    sub: "Leverage AI to evaluate properties and maximize rental returns"
  },
  {
    main: "Data-driven decisions\nfor rental properties",
    sub: "Get instant insights on cash flow, appreciation, and market trends"
  },
  {
    main: "Your AI-powered\nreal estate advisor",
    sub: "Analyze deals faster and invest with confidence"
  },
  {
    main: "Find your next rental\nwith intelligence",
    sub: "Uncover hidden opportunities with advanced analytics"
  },
  {
    main: "Invest smarter,\nnot harder",
    sub: "AI-backed analysis for every rental investment decision"
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
}) => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % HEADLINES.length);
        setFadeIn(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-6"
      style={{ backgroundColor: '#94A3B8' }}
    >
      {/* Background Image Overlay - subtle pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="mb-5 flex justify-center">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
              boxShadow: '0 8px 30px rgba(13,148,136,0.25)',
            }}
          >
            <Home className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Brand Name */}
        <h1 
          className="text-3xl font-bold mb-8"
          style={{ 
            color: '#0F172A',
            letterSpacing: '-0.02em',
          }}
        >
          Vasthu
        </h1>

        {/* Rotating Main Headline */}
        <div
          style={{
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 300ms ease-in-out',
            minHeight: '140px',
          }}
        >
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4 leading-tight"
            style={{ color: '#1E293B', whiteSpace: 'pre-line' }}
          >
            {HEADLINES[currentHeadline].main}
          </h2>

          {/* Tagline */}
          <p 
            className="text-base md:text-lg mb-10 max-w-xl mx-auto"
            style={{ 
              color: '#475569',
              fontWeight: 400,
            }}
          >
            {HEADLINES[currentHeadline].sub}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={onNavigateToSignUp}
            className="group relative px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
            style={{
              backgroundColor: '#0D9488',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(13,148,136,0.25)',
              minWidth: '140px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0F766E';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,148,136,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0D9488';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,148,136,0.25)';
            }}
          >
            <span>Sign Up</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onNavigateToSignIn}
            className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
            style={{
              backgroundColor: '#E2E8F0',
              color: '#0F172A',
              border: '1.5px solid #64748B',
              boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
              minWidth: '140px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#CBD5E1';
              e.currentTarget.style.borderColor = '#0D9488';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,148,136,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E2E8F0';
              e.currentTarget.style.borderColor = '#64748B';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.08)';
            }}
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: '#E2E8F0',
              border: '1px solid #64748B',
            }}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#0D9488' }} />
            <span style={{ color: '#1E293B', fontSize: '12px', fontWeight: 500 }}>
              AI Analysis
            </span>
          </div>

          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: '#E2E8F0',
              border: '1px solid #64748B',
            }}
          >
            <Shield className="w-3.5 h-3.5" style={{ color: '#0D9488' }} />
            <span style={{ color: '#1E293B', fontSize: '12px', fontWeight: 500 }}>
              Risk Insights
            </span>
          </div>

          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: '#E2E8F0',
              border: '1px solid #64748B',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#0D9488' }} />
            <span style={{ color: '#1E293B', fontSize: '12px', fontWeight: 500 }}>
              Market Data
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Fade Effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(148,163,184,0.3), transparent)',
        }}
      />
    </div>
  );
};
