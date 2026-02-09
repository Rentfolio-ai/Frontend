import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';

interface Section {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
  children: React.ReactNode;
  onBack: () => void;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  sections,
  children,
  onBack,
}) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white selection:bg-[#C08B5C]/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#0C0C0E]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-white/[0.06] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
            </button>
            <div className="h-4 w-[1px] bg-white/[0.1]" />
            <div>
              <h1 className="text-sm font-display font-semibold text-white tracking-wide">{title}</h1>
            </div>
          </div>
          <p className="text-xs font-sans text-white/30 hidden sm:block">
            Last updated: <span className="text-white/50">{lastUpdated}</span>
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Table of Contents Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="sticky top-28 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3">
              On this page
            </p>
            <div className="space-y-0.5 relative">
              {/* Active Indicator Line */}
              <div className="absolute left-0 w-[1px] bg-white/[0.1] h-full sm:hidden" />

              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`block w-full text-left text-[13px] py-1.5 px-3 rounded-md transition-all duration-200 border-l-[2px] ${activeSection === s.id
                      ? 'border-[#C08B5C] text-[#D4A27F] bg-[#C08B5C]/5 font-medium'
                      : 'border-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
                    }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Back to top helper */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-[11px] text-white/20 hover:text-white/50 transition-colors px-3 pt-4"
            >
              <ArrowUp className="w-3 h-3" />
              Back to top
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          <div className="prose-legal">
            {children}
          </div>

          <div className="mt-20 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-sans text-white/20">
            <p>
              This document may be updated periodically.
            </p>
            <p>
              &copy; {new Date().getFullYear()} Civitas AI. All rights reserved.
            </p>
          </div>
        </main>
      </div>

      {/* Styles */}
      <style>{`
        /* Headings */
        .prose-legal h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem; /* 24px */
          font-weight: 600;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.95);
          margin-top: 3.5rem;
          margin-bottom: 1.25rem;
          padding-top: 1rem;
          scroll-margin-top: 6rem;
          line-height: 1.3;
        }
        
        .prose-legal h2:first-child {
          margin-top: 0;
        }

        .prose-legal h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.125rem; /* 18px */
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        /* Body Text */
        .prose-legal p {
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem; /* 15px */
          line-height: 1.75; /* Relaxed reading line-height */
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 1.25rem;
        }

        /* Lists */
        .prose-legal ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .prose-legal li {
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
        }
        
        .prose-legal li::marker {
          color: rgba(255, 255, 255, 0.3);
        }

        /* Inline Elements */
        .prose-legal strong {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        .prose-legal a {
          color: #C08B5C;
          text-decoration: none;
          border-bottom: 1px solid rgba(192, 139, 92, 0.3);
          transition: all 0.2s ease;
          padding-bottom: 1px;
        }

        .prose-legal a:hover {
          color: #D4A27F;
          border-bottom-color: #D4A27F;
        }
        
        .prose-legal code {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8em;
            background: rgba(255, 255, 255, 0.08);
            padding: 0.2em 0.4em;
            border-radius: 4px;
            color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
};
