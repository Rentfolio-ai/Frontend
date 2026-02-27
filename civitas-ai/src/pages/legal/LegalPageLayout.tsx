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
    <div className="min-h-screen bg-white text-[#1A1A1A] selection:bg-[#C08B5C]/20">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#EBEBEA] bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-[#FAFAF9] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-[#ABABAB] group-hover:text-[#6F6F6F] transition-colors" />
            </button>
            <div className="h-4 w-[1px] bg-[#EBEBEA]" />
            <h1 className="text-[14px] font-semibold text-[#1A1A1A] tracking-tight">{title}</h1>
          </div>
          <p className="text-[12px] text-[#ABABAB] hidden sm:block">
            Last updated: <span className="text-[#6F6F6F]">{lastUpdated}</span>
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Table of Contents Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="sticky top-28 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] px-3">
              On this page
            </p>
            <div className="space-y-0.5">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`block w-full text-left text-[13px] py-1.5 px-3 rounded-md transition-all duration-200 border-l-[2px] ${activeSection === s.id
                      ? 'border-[#C08B5C] text-[#C08B5C] bg-[#C08B5C]/[0.04] font-medium'
                      : 'border-transparent text-[#6F6F6F] hover:text-[#1A1A1A] hover:bg-[#FAFAF9]'
                    }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-[11px] text-[#ABABAB] hover:text-[#6F6F6F] transition-colors px-3 pt-4"
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

          <div className="mt-20 pt-8 border-t border-[#EBEBEA] flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px] text-[#ABABAB]">
            <p>This document may be updated periodically.</p>
            <p>&copy; {new Date().getFullYear()} Civitas AI. All rights reserved.</p>
          </div>
        </main>
      </div>

      <style>{`
        .prose-legal h2 {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #1A1A1A;
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
          font-size: 1.125rem;
          font-weight: 600;
          color: #1A1A1A;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        .prose-legal p {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: #6F6F6F;
          margin-bottom: 1.25rem;
        }

        .prose-legal ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .prose-legal li {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: #6F6F6F;
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
        }

        .prose-legal li::marker {
          color: #ABABAB;
        }

        .prose-legal strong {
          color: #1A1A1A;
          font-weight: 600;
        }

        .prose-legal a {
          color: #C08B5C;
          text-decoration: none;
          border-bottom: 1px solid rgba(192, 139, 92, 0.3);
          transition: all 0.15s ease;
          padding-bottom: 1px;
        }

        .prose-legal a:hover {
          color: #A0714A;
          border-bottom-color: #A0714A;
        }

        .prose-legal code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8em;
          background: #F5F5F4;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          color: #1A1A1A;
        }
      `}</style>
    </div>
  );
};
