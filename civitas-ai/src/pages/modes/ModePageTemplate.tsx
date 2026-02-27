import React from 'react';
import { ArrowRightIcon } from '../../components/ui/CustomIcons';
import { Logo } from '../../components/ui/Logo';

export interface ModeCapability {
  title: string;
  description: string;
}

export interface ModeStep {
  num: string;
  title: string;
  description: string;
}

export interface ModePageConfig {
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  accentColorLight: string;
  icon: React.ReactNode;
  capabilities: ModeCapability[];
  steps: ModeStep[];
  mockup: React.ReactNode;
}

interface ModePageTemplateProps {
  config: ModePageConfig;
  onNavigateToSignUp: () => void;
  onNavigateToHome: () => void;
}

export const ModePageTemplate: React.FC<ModePageTemplateProps> = ({
  config,
  onNavigateToSignUp,
  onNavigateToHome,
}) => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans antialiased overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EBEBEA]">
        <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={onNavigateToHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo variant="dark" showText={false} className="w-[22px] h-[22px]" />
            <span className="text-[14px] font-semibold text-[#1A1A1A] tracking-tight">Vasthu</span>
            <span className="text-[13px] text-[#ABABAB] ml-1">/ {config.name}</span>
          </button>
          <button
            onClick={onNavigateToSignUp}
            className="text-[13px] text-white px-4 py-[6px] rounded-full font-medium transition-all duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:translate-y-[-1px]"
            style={{ backgroundColor: config.accentColor }}
          >
            Try {config.name} free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-6">
        <div className="max-w-[680px] mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: `${config.accentColor}12` }}>
            {config.icon}
          </div>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold text-[#1A1A1A] leading-[1.1] tracking-[-0.025em] mb-5">
            {config.tagline}
          </h1>
          <p className="text-[17px] text-[#6F6F6F] leading-[1.65] mb-8 max-w-[520px] mx-auto">
            {config.description}
          </p>
          <button
            onClick={onNavigateToSignUp}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-medium text-[14px] transition-all duration-150 shadow-[0_3px_10px_rgba(0,0,0,0.12)] hover:translate-y-[-1px]"
            style={{ backgroundColor: config.accentColor }}
          >
            Get started with {config.name} <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 md:py-28 px-6 bg-[#FAFAF9]">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold text-[#1A1A1A] tracking-[-0.02em] mb-12 text-center">
            What {config.name} can do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.capabilities.map((cap) => (
              <div key={cap.title} className="p-6 rounded-2xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-[#D4D4D3] transition-all duration-200">
                <div
                  className="w-2 h-2 rounded-full mb-4"
                  style={{ backgroundColor: config.accentColor }}
                />
                <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-2">{cap.title}</h3>
                <p className="text-[14px] text-[#6F6F6F] leading-[1.65]">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold text-[#1A1A1A] tracking-[-0.02em] mb-12 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {config.steps.map((step) => (
              <div key={step.num} className="rounded-2xl p-5 bg-white border border-[#F0EFED] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div
                  className="text-[48px] font-bold leading-none mb-3 tracking-tight"
                  style={{ color: `${config.accentColor}30` }}
                >
                  {step.num}
                </div>
                <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-2">{step.title}</h3>
                <p className="text-[14px] text-[#6F6F6F] leading-[1.65]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Mockup */}
      <section className="py-20 md:py-28 px-6 bg-[#FAFAF9]">
        <div className="max-w-[640px] mx-auto">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold text-[#1A1A1A] tracking-[-0.02em] mb-10 text-center">
            {config.name} in action
          </h2>
          <div className="relative rounded-2xl border border-[#E5E5E4] bg-white overflow-hidden ring-1 ring-black/[0.02] shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_4px_14px_rgba(0,0,0,0.05),0_14px_30px_rgba(0,0,0,0.05)]">
            {config.mockup}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-[600px] mx-auto text-center">
          <h3 className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-4">
            Ready to try {config.name}?
          </h3>
          <p className="text-[15px] text-[#ABABAB] mb-8">
            Start free and see what {config.name} mode can do for your investment strategy.
          </p>
          <button
            onClick={onNavigateToSignUp}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold text-[14px] transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:translate-y-[-1px]"
            style={{ backgroundColor: config.accentColor }}
          >
            Get started free <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="py-8 px-6 border-t border-[#EBEBEA]">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between">
          <span className="text-[#ABABAB] text-[12px]">&copy; {new Date().getFullYear()} Civitas AI</span>
          <button onClick={onNavigateToHome} className="text-[12px] text-[#ABABAB] hover:text-[#6F6F6F] transition-colors duration-150">
            Back to home
          </button>
        </div>
      </footer>
    </div>
  );
};
