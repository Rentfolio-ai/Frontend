import React from 'react';

interface VisionProductPageProps {
  onBackToApp: () => void;
  onGoToAI: () => void;
}

export const VisionProductPage: React.FC<VisionProductPageProps> = ({ onBackToApp, onGoToAI }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-lg text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Vasthu Vision</h1>
        <p className="text-foreground/60">AI-powered property vision analysis. Coming soon.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onBackToApp} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition">
            Back
          </button>
          <button onClick={onGoToAI} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
            Go to Vasthu AI
          </button>
        </div>
      </div>
    </div>
  );
};
