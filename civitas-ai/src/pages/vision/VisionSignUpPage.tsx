import React, { useState } from 'react';

interface VisionSignUpPageProps {
  onSignUp: (email: string, password: string) => Promise<void>;
  onNavigateToSignIn: () => void;
  onNavigateToLanding: () => void;
}

export const VisionSignUpPage: React.FC<VisionSignUpPageProps> = ({ onSignUp, onNavigateToSignIn, onNavigateToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSignUp(email, password);
    } catch (err: any) {
      setError(err?.message || 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Create Vision Account</h1>
          <p className="text-foreground/60 text-sm">AI-powered property vision analysis</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center space-y-2 text-sm">
          <button onClick={onNavigateToSignIn} className="text-primary hover:underline">Already have an account?</button>
          <span className="text-foreground/30 mx-2">|</span>
          <button onClick={onNavigateToLanding} className="text-foreground/60 hover:underline">Back</button>
        </div>
      </div>
    </div>
  );
};
