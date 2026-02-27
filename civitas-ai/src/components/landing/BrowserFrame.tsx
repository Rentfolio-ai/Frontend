import React from 'react';

interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
  className?: string;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  children,
  url = 'app.vasthu.ai',
  className = '',
}) => (
  <div className={`rounded-xl overflow-hidden border border-[#E8E8E5] shadow-[0_8px_60px_rgba(0,0,0,0.08)] bg-white ${className}`}>
    {/* Toolbar */}
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F7F7F5] border-b border-[#E8E8E5]">
      {/* Traffic lights */}
      <div className="flex gap-[6px]">
        <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
        <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
        <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
      </div>

      {/* Address bar */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-1.5 px-3 py-[3px] rounded-md bg-white border border-[#E8E8E5] max-w-[260px] w-full">
          <svg viewBox="0 0 12 12" className="w-[10px] h-[10px] text-[#CCC] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6" cy="6" r="4" />
            <path d="M6 2C7.5 2 9 3.8 9 6s-1.5 4-3 4S3 8.2 3 6s1.5-4 3-4M2 6h8" />
          </svg>
          <span className="text-[10px] text-[#999] truncate">{url}</span>
        </div>
      </div>

      <div className="w-[52px]" />
    </div>

    {/* Content */}
    {children}
  </div>
);
