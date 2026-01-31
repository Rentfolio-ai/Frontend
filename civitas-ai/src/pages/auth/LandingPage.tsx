import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, CheckCircle2, FileText, Calculator, TrendingUp } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../contexts/AuthContext';

interface LandingPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToFAQ?: () => void;
}

const TypewriterText = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const timeout2 = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout2);
  }, [blink]);

  // Typing logic
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setReverse(true);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 40 : subIndex === words[index].length ? 1000 : 70, parseInt((Math.random() * 150).toString())));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <>
      {`${words[index].substring(0, subIndex)}${blink ? "|" : " "}`}
    </>
  );
};

// Hook for recent session logic - Keep only UI related parts here
const useRecentSession = () => {
  const [recentUser, setRecentUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('civitas-recent-user');
      const timestamp = localStorage.getItem('civitas-recent-timestamp');

      if (userStr && timestamp) {
        const isRecent = (Date.now() - parseInt(timestamp)) < 86400000;
        if (isRecent) {
          setRecentUser(JSON.parse(userStr));
        } else {
          // Clean up if expired
          localStorage.removeItem('civitas-recent-user');
          localStorage.removeItem('civitas-recent-token');
          localStorage.removeItem('civitas-recent-timestamp');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return recentUser;
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
  onNavigateToFAQ,
}) => {
  const { resumeSession } = useAuth();
  const recentUser = useRecentSession();

  const handleContinue = async () => {
    const success = await resumeSession();
    if (success) {
      // Navigate to dashboard or let AuthContext user state trigger redirect
      // Assuming parent component watches 'user' and redirects.
    } else {
      // Failed (maybe expired just now), force regular sign in
      onNavigateToSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition-colors">Features</a>
            <button
              onClick={onNavigateToFAQ}
              className="hover:text-teal-700 transition-colors"
            >
              FAQ
            </button>
            <a href="#testimonials" className="hover:text-teal-700 transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            <a
              href="#demo"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Demo
            </a>

            {/* If recent user exists, show different buttons or add 'Continue' */}
            {recentUser ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleContinue}
                  className="hidden sm:block text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors"
                >
                  Continue as {recentUser.name.split(' ')[0]}
                </button>
                <button
                  onClick={onNavigateToSignIn}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Switch Account
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <button
                  onClick={onNavigateToSignIn}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onNavigateToSignUp}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              AI for Real Estate
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              The future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                rental investing
              </span>
            </h1>

            <div className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg h-20">
              Vasthu gives you an unfair advantage with{' '}
              <span className="block text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-700 animate-gradient-x mt-2">
                <TypewriterText
                  words={[
                    "AI-driven valuation.",
                    "comprehensive investment reports.",
                    "deep market intelligence."
                  ]}
                />
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              {recentUser ? (
                <button
                  onClick={handleContinue}
                  className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Continue as {recentUser.name}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={onNavigateToSignUp}
                  className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Sign Up
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                onClick={onNavigateToSignIn}
                className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-full text-lg font-medium border border-slate-200 hover:border-teal-200 hover:bg-teal-50/50 transition-all"
              >
                {recentUser ? "Switch Account" : "Sign In"}
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span>Instant Valuation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span>PDF Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span>Market Data</span>
              </div>
            </div>
          </div>

          {/* Hero Image / "Agent" Visual */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Background decorative blob */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/50 to-orange-100/50 rounded-[3rem] transform rotate-3 scale-95 blur-3xl opacity-60" />

            {/* Main Image Container */}
            <div className="relative w-full h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 p-2">
              <div className="w-full h-full bg-slate-100 rounded-[2rem] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Real Estate Agent using app"
                  className="w-full h-full object-cover object-center"
                />

                {/* Floating UI Card 1 */}
                <div className="absolute top-12 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float-slow max-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg text-green-700">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Cap Rate</p>
                      <p className="text-sm font-bold text-slate-900">7.2%</p>
                    </div>
                  </div>
                </div>

                {/* Floating UI Card 2 */}
                <div className="absolute bottom-20 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float-delayed max-w-[220px]">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700 shrink-0">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Valuation Complete</p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Cash-on-Cash ROI: 12.4% <br />
                        Monthly Cashflow: $1,240
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Insights that actually <br />
              <span className="text-teal-600">drive decisions.</span>
            </h2>
            <p className="text-lg text-slate-600">
              Stop using spreadsheets. Vasthu integrates market data and advanced financial modeling to give you the full picture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-100 hover:border-teal-100 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Investment Reports</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate comprehensive PDF reports for STR, LTR, BRRRR, and Flips. Perfect for lenders and partners.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-100 hover:border-teal-100 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Deep Valuation</h3>
              <p className="text-slate-600 leading-relaxed">
                Instant calculations for Cap Rate, Cash-on-Cash ROI, Net Operating Income, and Operating Expenses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-100 hover:border-teal-100 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Market Intelligence</h3>
              <p className="text-slate-600 leading-relaxed">
                Real-time data on rent growth, vacancy rates, and neighborhood demand to validate your assumptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-[#1E293B] text-white overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              See it in action
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              From address to full investment analysis in seconds.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold border border-slate-700">1</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Search</h4>
                  <p className="text-slate-400">Enter a location or specific property address to begin.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold border border-slate-700">2</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Valuate</h4>
                  <p className="text-slate-400">Our AI runs instant numbers: Expenses, Income, and ROI.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold border border-slate-700">3</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Decide</h4>
                  <p className="text-slate-400">Download the full report and make your offer with confidence.</p>
                </div>
              </div>
            </div>
          </div>



          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800 aspect-video group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20 shadow-xl">
                <Play className="w-8 h-8 fill-white text-white ml-1" />
              </div>
            </div>

            {/* High-Fidelity App Preview with subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-0" />
            <img
              src="/assets/app-promo.png"
              alt="Vasthu AI Dashboard Demo"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Ready to find your next deal?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Join thousands of investors using Vasthu to analyze properties in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateToSignUp}
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-full text-lg font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Get Started for Free
            </button>
            <button
              onClick={onNavigateToSignIn}
              className="w-full sm:w-auto bg-white text-slate-900 px-8 py-3.5 rounded-full text-lg font-medium border border-slate-200 hover:border-teal-300 transition-all hover:bg-teal-50"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-slate-400 text-sm ml-4">© 2026 Vasthu AI</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
