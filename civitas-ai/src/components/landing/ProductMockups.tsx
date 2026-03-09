import React from 'react';

/* ─── Deal Underwriting Mockup (Large Scale) ──────────────────────────── */
export const DealUnderwritingMockup: React.FC = () => (
  <div className="w-full h-full flex flex-col gap-4 p-5 rounded-[24px] bg-gradient-to-br from-black/[0.03] to-transparent backdrop-blur-2xl border border-black/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(0,0,0,0.06)] overflow-hidden relative">
    {/* Subtle internal glow */}
    <div className="absolute top-0 right-0 w-48 h-48 bg-[#C08B5C]/10 blur-[64px] pointer-events-none rounded-full" />

    <div className="flex gap-4 relative z-10">
      <div className="w-[120px] h-[88px] rounded-xl bg-gradient-to-br from-black/[0.08] to-black/[0.02] flex-shrink-0 overflow-hidden relative shadow-[0_8px_16px_rgba(0,0,0,0.4)] border border-black/[0.08]">
        <svg viewBox="0 0 120 88" className="w-full h-full opacity-40">
          <path d="M25 62 L60 32 L95 62" stroke="#C08B5C" strokeWidth="2.5" fill="none" />
          <rect x="38" y="48" width="16" height="14" rx="2" fill="#C08B5C" opacity="0.3" />
          <rect x="62" y="42" width="16" height="20" rx="2" fill="#C08B5C" opacity="0.3" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-[15px] font-bold text-foreground tracking-tight truncate">4821 Cedar Ridge Dr</div>
        <div className="text-[12px] text-muted-foreground font-medium mt-0.5">Austin, TX 78745</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[14px] font-black text-[#E2A76F] drop-shadow-[0_0_8px_rgba(226,167,111,0.4)]">$485,000</span>
          <span className="text-[11px] text-muted-foreground/70 font-medium">3bd / 2ba / 1,840 sqft</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 relative z-10">
      {[
        { label: 'Cap Rate', value: '7.2%', color: '#34D399', glow: 'rgba(52,211,153,0.2)' },
        { label: 'CoC ROI', value: '14.1%', color: '#E2A76F', glow: 'rgba(226,167,111,0.2)' },
        { label: 'Cash Flow', value: '$842/mo', color: '#A78BFA', glow: 'rgba(167,139,250,0.2)' },
      ].map((m) => (
        <div key={m.label} className="bg-black/[0.02] rounded-xl p-3 border border-black/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ backgroundColor: m.glow }} />
          <div className="text-[11px] text-muted-foreground font-medium tracking-wide mb-1 relative z-10">{m.label}</div>
          <div className="text-[18px] font-bold tracking-tight relative z-10 drop-shadow-md" style={{ color: m.color }}>{m.value}</div>
        </div>
      ))}
    </div>

    <div className="flex items-end gap-1 px-1 h-[64px] relative z-10 mt-1">
      {[40, 55, 48, 65, 72, 60, 78, 85, 70, 90, 82, 95].map((h, i) => (
        <div key={i} className="flex-1 rounded-t-[2px] shadow-[0_0_12px_rgba(192,139,92,0.15)] transition-all" style={{
          height: `${h}%`,
          background: i >= 10 ? 'linear-gradient(to top, #A77B4F, #E2A76F)' : i >= 8 ? 'linear-gradient(to top, #8B6940, #C08B5C)' : 'rgba(0,0,0,0.06)',
        }} />
      ))}
    </div>

    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 shadow-[0_8px_16px_rgba(16,185,129,0.1)] relative z-10 mt-1">
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 ring-4 ring-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
      <span className="text-[13px] font-bold text-emerald-300 tracking-tight">AI Verdict: Strong Buy</span>
      <span className="text-[12px] text-emerald-400/70 ml-auto font-bold tracking-tight bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">92/100</span>
    </div>
  </div>
);

/* ─── AI Chat Modes Mockup (Large Scale) ──────────────────────────────── */
export const AIChatModesMockup: React.FC = () => (
  <div className="w-full h-full flex flex-col p-5 rounded-[24px] bg-gradient-to-br from-[#F7ECE2] to-[#F3E4D6] border border-black/[0.06] shadow-[0_24px_64px_rgba(0,0,0,0.08)] relative overflow-hidden">
    {/* Ambient Glow */}
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#4F46E5]/10 blur-[80px] pointer-events-none rounded-full" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#C08B5C]/10 blur-[80px] pointer-events-none rounded-full" />

    <div className="flex gap-2 mb-5 relative z-10">
      {[
        { label: 'Deep Search', color: '#E2A76F', active: true },
        { label: 'Deep Research', color: '#A78BFA', active: false },
        { label: 'Analyst', color: '#34D399', active: false },
      ].map((tab) => (
        <div key={tab.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all" style={{
          background: tab.active ? `rgba(192,139,92,0.15)` : 'rgba(0,0,0,0.03)',
          color: tab.active ? tab.color : 'rgba(0,0,0,0.4)',
          border: tab.active ? `1px solid rgba(192,139,92,0.3)` : '1px solid rgba(0,0,0,0.04)',
          boxShadow: tab.active ? `0 4px 12px rgba(192,139,92,0.1)` : 'none',
        }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: tab.color, opacity: tab.active ? 1 : 0.3, boxShadow: tab.active ? `0 0 6px ${tab.color}` : 'none' }} />
          {tab.label}
        </div>
      ))}
    </div>

    <div className="flex-1 flex flex-col gap-4 mb-4 relative z-10">
      {/* User Bubble */}
      <div className="self-end max-w-[75%] px-4 py-3 rounded-[20px] rounded-br-[4px] bg-black/[0.05] border border-black/[0.04] text-foreground text-[13px] leading-[1.6] font-medium tracking-tight shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
        Find me properties in Austin under $500k with 7%+ cap rate
      </div>

      {/* AI Bubble */}
      <div className="self-start max-w-[85%] px-4 py-3 rounded-[20px] rounded-tl-[4px] bg-gradient-to-br from-white to-[#FCF8F4] border border-[#C08B5C]/20 shadow-[0_12px_32px_rgba(0,0,0,0.06)] text-[13px] text-foreground leading-[1.6] font-medium tracking-tight relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C08B5C]/[0.02] to-transparent pointer-events-none" />
        Found 4 properties matching your criteria. The top-ranked deal at 4821 Cedar Ridge shows a 7.2% cap rate with strong rent growth potential.

        {/* Nested Property Card inside Chat */}
        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-black/[0.06] flex items-center gap-3 hover:border-[#C08B5C]/40 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-lg bg-black/[0.04] border border-black/[0.08] flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C08B5C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold text-foreground tracking-tight truncate group-hover:text-[#E2A76F] transition-colors">4821 Cedar Ridge Dr</div>
            <div className="text-[11px] text-muted-foreground tracking-wide mt-0.5">$485,000 • Cap 7.2%</div>
          </div>
          <div className="ml-auto flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
      </div>
    </div>

    {/* Chat Input */}
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/[0.02] border border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)] relative z-10 group hover:border-black/[0.12] transition-all">
      <div className="w-2.5 h-2.5 rounded-full bg-[#E2A76F] shadow-[0_0_8px_rgba(226,167,111,0.6)]" />
      <span className="text-[13px] text-muted-foreground/50 flex-1 font-medium tracking-wide">Ask Vasthu anything...</span>
      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#C08B5C] to-[#8B6940] flex items-center justify-center shadow-[0_2px_8px_rgba(192,139,92,0.4)] group-hover:shadow-[0_4px_12px_rgba(192,139,92,0.6)] group-hover:scale-105 transition-all cursor-pointer">
        <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 10V2M6 2L3 5M6 2l3 3" />
        </svg>
      </div>
    </div>
  </div>
);

/* ─── Market Intelligence Mockup (Large Scale) ────────────────────────── */
export const MarketIntelMockup: React.FC = () => (
  <div className="w-full h-full flex flex-col gap-6 p-5 rounded-[24px] bg-gradient-to-br from-[#FCF8F4]/80 to-[#F7ECE2]/90 backdrop-blur-3xl border border-black/[0.06] shadow-[0_24px_64px_rgba(0,0,0,0.08)] relative overflow-hidden">
    <div className="absolute top-[-30%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/5 blur-[80px] pointer-events-none rounded-full" />
    <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#C08B5C]/10 blur-[80px] pointer-events-none rounded-full" />

    {/* Header */}
    <div className="flex items-center justify-between relative z-10">
      <div className="text-[14px] text-foreground font-bold tracking-tight">Median Rent Trends</div>
      <div className="flex gap-4 bg-black/[0.02] px-3 py-1.5 rounded-full border border-black/[0.05]">
        {[
          { label: 'Austin', color: '#E2A76F' },
          { label: 'Dallas', color: '#A78BFA' },
          { label: 'Miami', color: '#34D399' },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-1 rounded-full shadow-[0_0_6px_currentColor]" style={{ background: c.color, color: c.color }} />
            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">{c.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Chart */}
    <div className="relative h-[120px] w-full z-10 flex-[1.5]">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px border-b border-black/[0.05] border-dashed" />)}
      </div>

      <svg viewBox="0 -10 300 120" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] overflow-visible" preserveAspectRatio="none">

        {/* Glow Filters */}
        <defs>
          <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Lines */}
        <path d="M0 65 Q40 60 75 52 T150 40 T225 28 T300 15" fill="none" stroke="url(#austinGrad)" strokeWidth="3" filter="url(#glow1)" />
        <path d="M0 75 Q40 70 75 67 T150 55 T225 45 T300 35" fill="none" stroke="url(#dallasGrad)" strokeWidth="2.5" opacity="0.8" />
        <path d="M0 55 Q40 50 75 50 T150 45 T225 35 T300 25" fill="none" stroke="url(#miamiGrad)" strokeWidth="2.5" opacity="0.8" />

        {/* Fill Under Main Line */}
        <path d="M0 65 Q40 60 75 52 T150 40 T225 28 T300 15 L300 120 L0 120 Z" fill="url(#fillGrad)" opacity="0.4" />

        <defs>
          <linearGradient id="austinGrad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B6940" />
            <stop offset="100%" stopColor="#E2A76F" />
          </linearGradient>
          <linearGradient id="dallasGrad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5B21B6" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="miamiGrad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#065F46" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C08B5C" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C08B5C" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    {/* Heatmap */}
    <div className="relative z-10 flex-1 flex flex-col justify-end bg-black/20 p-4 rounded-2xl border border-black/[0.04]">
      <div className="text-[12px] text-foreground/70 font-bold tracking-tight mb-2.5">Hyper-local Demand Heatmap</div>
      <div className="grid grid-cols-8 gap-1.5">
        {[0.2, 0.4, 0.6, 0.3, 0.85, 0.5, 0.7, 0.4, 0.5, 0.7, 0.95, 0.6, 0.4, 0.8, 0.3, 0.6, 0.3, 0.5, 0.7, 0.9, 0.6, 0.4, 0.8, 0.5].map((v, i) => (
          <div key={i} className="h-[18px] rounded-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" style={{
            background: `rgba(226,167,111,${v * 0.8 + 0.1})`, // E2A76F gold
            boxShadow: v > 0.8 ? `0 0 12px rgba(226,167,111,${v * 0.5})` : 'none',
          }} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-medium text-muted-foreground/70 mt-3 pt-2 border-t border-black/[0.06]">
        <span className="uppercase tracking-wider">Cool Market</span>
        <span className="uppercase tracking-wider text-[#E2A76F]">Hot Market</span>
      </div>
    </div>
  </div>
);

/* ─── Voice & Communication Mockup ────────────────────────────────────── */
export const VoiceCommunicationMockup: React.FC = () => (
  <div className="w-full flex flex-col gap-4 p-4 bg-gradient-to-b from-[#FAFAF9]/40 to-transparent">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[12px] text-[#6F6F6F] font-medium">Voice Session</div>
        <div className="text-[9px] text-[#ABABAB] mt-0.5">Nashville investor briefing</div>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] font-semibold text-emerald-700">Recording</span>
      </div>
    </div>

    <div className="rounded-xl border border-[#E5E5E4] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-[#ABABAB] uppercase tracking-wider">Live waveform</span>
        <span className="text-[9px] font-medium text-[#6F6F6F]">00:42</span>
      </div>
      <div className="relative h-[54px] rounded-lg bg-[#FAFAF9] border border-[#EBEBEA] overflow-hidden px-2 flex items-center">
        <div className="absolute inset-y-0 left-[62%] w-px bg-[#C08B5C]/30" />
        <div className="absolute right-2 top-1.5 text-[8px] text-[#ABABAB]">Now</div>
        <div className="flex items-end gap-[2px] w-full h-[36px]">
          {[10, 16, 22, 35, 45, 32, 18, 14, 28, 52, 68, 54, 40, 26, 18, 24, 44, 66, 74, 58, 42, 28, 20, 14].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${h}%`,
                background: i > 10 && i < 20 ? 'rgba(192,139,92,0.7)' : 'rgba(171,171,171,0.35)',
              }}
            />
          ))}
        </div>
      </div>
    </div>

    <div className="space-y-2.5">
      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-full bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[9px] font-semibold text-[#C08B5C]">You</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-medium text-[#6F6F6F]">Investor</span>
            <span className="text-[8px] text-[#ABABAB]">00:18</span>
          </div>
          <div className="text-[11px] text-[#3D3D3D] leading-relaxed">
            Show me Nashville rentals above 8% cap with low rehab risk.
          </div>
        </div>
      </div>
      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[8px] font-semibold text-blue-600">AI</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-medium text-[#6F6F6F]">Vasthu AI</span>
            <span className="text-[8px] text-[#ABABAB]">00:23</span>
          </div>
          <div className="text-[11px] text-[#3D3D3D] leading-relaxed">
            Found 6 matches. Top result is a 3BR at $320K with 9.1% cap and stable rent comps.
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 pt-2">
      {['Email summary', 'Send text', 'Call lender'].map((label, idx) => (
        <div key={label} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10px] text-[#6F6F6F] font-medium">
          <span
            className={`w-4 h-4 rounded-md flex items-center justify-center ${idx === 0 ? 'bg-[#C08B5C]/10 text-[#C08B5C]' : idx === 1 ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
              }`}
          >
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {idx === 0 && <path d="M2 3.5h8v5H2zM2 4l4 2.5L10 4" />}
              {idx === 1 && <path d="M2.5 3.5h7v5h-7zM4.5 8.5l1.3-1h3.7" />}
              {idx === 2 && <path d="M3.2 2.6l1.6-.6 1 2-1 .8a6.8 6.8 0 002.4 2.4l.8-1 2 1-.6 1.6a1 1 0 01-1 .6A6.4 6.4 0 012.6 3.6a1 1 0 01.6-1z" />}
            </svg>
          </span>
          {label}
        </div>
      ))}
    </div>
  </div>
);

/* ─── Marketplace Mockup ─────────────────────────────────────────────── */
export const MarketplaceMockup: React.FC = () => (
  <div className="w-full flex flex-col gap-3 p-4 bg-gradient-to-b from-[#FAFAF9]/40 to-transparent">
    <div className="flex items-center justify-between">
      <div className="text-[12px] text-[#6F6F6F] font-medium">Marketplace</div>
      <div className="flex gap-1">
        {['Agents', 'Lenders', 'Contractors'].map((cat, i) => (
          <span key={cat} className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${i === 0 ? 'bg-[#C08B5C]/10 text-[#C08B5C] border border-[#C08B5C]/20' : 'bg-[#F5F5F3] text-[#ABABAB]'
            }`}>{cat}</span>
        ))}
      </div>
    </div>

    <div className="space-y-2">
      {[
        { name: 'Jennifer Park', role: 'RE Agent - Austin, TX', rating: '4.9', deals: '142' },
        { name: 'David Nguyen', role: 'Mortgage Broker - Miami, FL', rating: '4.8', deals: '89' },
        { name: 'Maria Santos', role: 'Contractor - Phoenix, AZ', rating: '4.7', deals: '203' },
      ].map(p => (
        <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EBEBEA] to-[#D4A27F]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[12px] font-bold text-[#6F6F6F]">{p.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-[#1A1A1A] truncate">{p.name}</div>
            <div className="text-[10px] text-[#ABABAB]">{p.role}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[11px] font-semibold text-[#1A1A1A]">{p.rating} ★</div>
            <div className="text-[9px] text-[#ABABAB]">{p.deals} deals</div>
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <svg viewBox="0 0 12 12" className="w-3 h-3 text-[#ABABAB]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="5" cy="5" r="3.5" /><path d="M7.5 7.5L10 10" /></svg>
      <span className="text-[10px] text-[#ABABAB]">Search professionals...</span>
    </div>
  </div>
);

/* ─── Portfolio Strategy Mockup ──────────────────────────────────────── */
export const PortfolioStrategyMockup: React.FC = () => (
  <div className="w-full flex flex-col gap-4 p-4 bg-gradient-to-b from-[#FAFAF9]/40 to-transparent">
    <div className="flex items-center justify-between">
      <div className="text-[12px] text-[#6F6F6F] font-medium">Portfolio Overview</div>
      <span className="text-[10px] text-emerald-600 font-semibold">+12.4% YTD</span>
    </div>

    <div className="grid grid-cols-4 gap-2">
      {[
        { label: 'Properties', value: '8' },
        { label: 'Total Value', value: '$3.2M' },
        { label: 'Avg Cap', value: '7.8%' },
        { label: 'Cash Flow', value: '$6.4K/mo' },
      ].map(s => (
        <div key={s.label} className="bg-white rounded-xl p-2 border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-center">
          <div className="text-[14px] font-bold text-[#1A1A1A]">{s.value}</div>
          <div className="text-[8px] text-[#ABABAB] mt-0.5 uppercase tracking-wider">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-3">
      <div className="text-[9px] text-[#ABABAB] font-medium mb-2">Portfolio Growth</div>
      <svg viewBox="0 0 280 60" className="w-full h-[60px]">
        <defs>
          <linearGradient id="portfolioGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#C08B5C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C08B5C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="0,55 23,50 47,45 70,42 93,38 117,35 140,30 163,28 187,22 210,18 233,15 256,10 280,8 280,60 0,60" fill="url(#portfolioGrad)" />
        <polyline points="0,55 23,50 47,45 70,42 93,38 117,35 140,30 163,28 187,22 210,18 233,15 256,10 280,8" fill="none" stroke="#C08B5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    <div className="space-y-1.5">
      {[
        { addr: '4821 Cedar Ridge', city: 'Austin, TX', roi: '+14.1%', tier: 'A' },
        { addr: '1203 Oak Park Blvd', city: 'Nashville, TN', roi: '+11.8%', tier: 'A' },
        { addr: '887 Riverside Dr', city: 'Phoenix, AZ', roi: '+9.2%', tier: 'B' },
      ].map(p => (
        <div key={p.addr} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#FAFAF9] transition-colors">
          <div>
            <div className="text-[11px] font-medium text-[#1A1A1A]">{p.addr}</div>
            <div className="text-[9px] text-[#ABABAB]">{p.city}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-emerald-600">{p.roi}</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#F5F5F3] text-[#6F6F6F]">Tier {p.tier}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Deal Pipeline Mockup ────────────────────────────────────────────── */
export const DealPipelineMockup: React.FC = () => (
  <div className="w-full flex flex-col gap-3 p-4 bg-gradient-to-b from-[#FAFAF9]/40 to-transparent">
    <div className="flex items-center justify-between">
      <div className="text-[12px] text-[#6F6F6F] font-medium">Deal Pipeline</div>
      <div className="flex gap-1">
        {['All (24)', 'Saved (9)', 'Portfolio (6)'].map((tab, i) => (
          <span key={tab} className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${i === 0 ? 'bg-[#C08B5C]/10 text-[#C08B5C] border border-[#C08B5C]/20' : 'bg-[#F5F5F3] text-[#ABABAB]'
            }`}>{tab}</span>
        ))}
      </div>
    </div>

    <div className="flex gap-1.5">
      {['Active 11', 'Under Contract 7', 'Closed 6'].map((s, i) => (
        <div key={s} className={`px-2 py-1 rounded-md text-[9px] font-medium ${i === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#F5F5F3] text-[#ABABAB]'
          }`}>{s}</div>
      ))}
    </div>

    <div className="space-y-2">
      {[
        { addr: '4821 Cedar Ridge Dr', city: 'Austin, TX', price: '$485,000', cap: '7.2%', score: 92, verdict: 'Strong Buy' },
        { addr: '1203 Oak Park Blvd', city: 'Nashville, TN', price: '$320,000', cap: '8.4%', score: 88, verdict: 'Buy' },
        { addr: '887 Riverside Dr', city: 'Phoenix, AZ', price: '$275,000', cap: '6.9%', score: 74, verdict: 'Hold' },
      ].map(p => (
        <div key={p.addr} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5F5F3] to-[#E8E6E2] border border-[#EBEBEA] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-[#1A1A1A] truncate">{p.addr}</div>
            <div className="text-[9px] text-[#ABABAB]">{p.city} &middot; {p.price} &middot; Cap {p.cap}</div>
            <div className="text-[8px] text-[#ABABAB] mt-0.5">DOM 13 &middot; Rehab est. $18k</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${p.score >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>{p.score}</span>
            <span className={`text-[9px] font-medium ${p.verdict === 'Strong Buy' ? 'text-emerald-600' : p.verdict === 'Buy' ? 'text-blue-600' : 'text-amber-600'
              }`}>{p.verdict}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#C08B5C]/[0.06] border border-[#C08B5C]/20 shadow-[0_1px_2px_rgba(192,139,92,0.06)]">
      <svg viewBox="0 0 12 12" className="w-3 h-3 text-[#C08B5C]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6h8M6 2v8" /></svg>
      <span className="text-[10px] font-medium text-[#C08B5C]">Run pipeline analysis</span>
      <span className="ml-auto text-[9px] text-[#A8734A] font-medium">2 mins</span>
    </div>
  </div>
);

/* ─── Teams & Partnerships Mockup ────────────────────────────────────── */
export const TeamsMockup: React.FC = () => (
  <div className="w-full flex flex-col gap-3 p-4 bg-gradient-to-b from-[#FAFAF9]/40 to-transparent">
    <div className="flex items-center justify-between">
      <div className="text-[12px] text-[#6F6F6F] font-medium">Partnership</div>
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
        <span className="text-[9px] font-semibold text-violet-700">3 partners</span>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-2">
      {[
        { label: 'Partners', value: '3' },
        { label: 'Properties', value: '5' },
        { label: 'Total Equity', value: '$1.4M' },
        { label: 'Revenue', value: '$8.2K/mo' },
      ].map(s => (
        <div key={s.label} className="bg-white rounded-xl p-2 border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-center">
          <div className="text-[13px] font-bold text-[#1A1A1A]">{s.value}</div>
          <div className="text-[7px] text-[#ABABAB] mt-0.5 uppercase tracking-wider">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="space-y-1.5">
      {[
        { name: 'Sarah Chen', role: 'Lead Investor', equity: '50%', color: '#C08B5C' },
        { name: 'Mike Torres', role: 'Partner', equity: '30%', color: '#4F46E5' },
        { name: 'Ava Patel', role: 'Advisor', equity: '20%', color: '#7C3AED' },
      ].map(p => (
        <div key={p.name} className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}15` }}>
            <span className="text-[10px] font-bold" style={{ color: p.color }}>{p.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-[#1A1A1A]">{p.name}</div>
            <div className="text-[9px] text-[#ABABAB]">{p.role}</div>
          </div>
          <span className="text-[10px] font-semibold text-[#6F6F6F]">{p.equity}</span>
        </div>
      ))}
    </div>

    <div className="rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-2.5 space-y-2">
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[8px] font-bold text-[#C08B5C]">S</span>
        </div>
        <div className="text-[10px] text-[#3D3D3D] leading-relaxed">Should we move on the Cedar Ridge deal? Numbers look solid.</div>
      </div>
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-[#4F46E5]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[8px] font-bold text-[#4F46E5]">M</span>
        </div>
        <div className="text-[10px] text-[#3D3D3D] leading-relaxed">Agreed — let&apos;s lock in the equity split and submit the offer.</div>
      </div>
    </div>
  </div>
);

/* ─── Hero Screenshot Mockup ──────────────────────────────────────────── */
export const HeroScreenshot: React.FC = () => (
  <div className="w-full bg-[#FAFAF9] flex">
    {/* Sidebar */}
    <div className="w-[188px] bg-background p-4 flex-shrink-0 hidden sm:flex flex-col border-r border-black/[0.05]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-5 h-5 rounded bg-[#C08B5C]" />
        <span className="text-[11px] font-semibold text-foreground/80">Vasthu</span>
      </div>
      <div className="space-y-1">
        {['Dashboard', 'Deep Search', 'Deep Research', 'Expert Strategist', 'Teams', 'Marketplace', 'Reports'].map((item, i) => (
          <div key={item} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[10px] ${i === 0 ? 'bg-black/[0.08] text-white' : 'text-muted-foreground/70'}`}>
            <div className={`w-3.5 h-3.5 rounded-[4px] ${i === 0 ? 'bg-[#C08B5C]/70' : 'bg-black/8'}`} />
            {item}
          </div>
        ))}
      </div>
      <div className="mt-auto pt-4">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-black/[0.03]">
          <div className="w-5 h-5 rounded-full bg-black/10" />
          <span className="text-[9px] text-muted-foreground/50">J. Smith</span>
        </div>
      </div>
    </div>

    {/* Main content */}
    <div className="flex-1 p-4 sm:p-5 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13px] font-semibold text-[#1A1A1A]">Property Analysis</div>
          <div className="text-[10px] text-[#ABABAB] mt-0.5">4821 Cedar Ridge Dr, Austin TX</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[9px] font-semibold text-emerald-700">Score 92</div>
          <div className="px-2.5 py-1 rounded-md bg-background text-[9px] font-medium text-foreground">Export PDF</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {[
          { label: 'List Price', value: '$485,000', sub: '' },
          { label: 'Cap Rate', value: '7.2%', sub: '+0.4% vs avg' },
          { label: 'Monthly Cash Flow', value: '$842', sub: 'After PITI' },
          { label: 'CoC Return', value: '14.1%', sub: 'Year 1' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-2.5 border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="text-[8px] text-[#ABABAB] uppercase tracking-wider">{m.label}</div>
            <div className="text-[14px] font-bold text-[#1A1A1A] mt-0.5">{m.value}</div>
            {m.sub && <div className="text-[8px] text-emerald-600 mt-0.5">{m.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Chart placeholder */}
        <div className="col-span-2 bg-white rounded-xl border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-3">
          <div className="text-[9px] text-[#ABABAB] font-medium mb-2">Projected Cash Flow (30yr)</div>
          <svg viewBox="0 0 300 60" className="w-full h-[52px]" preserveAspectRatio="none">
            <path d="M0 50 L25 48 L50 46 L75 44 L100 41 L125 37 L150 33 L175 30 L200 26 L225 22 L250 18 L275 14 L300 10" fill="none" stroke="#D6D5D2" strokeWidth="1.5" />
            <path d="M0 52 L25 50 L50 48 L75 47 L100 45 L125 43 L150 39 L175 35 L200 30 L225 26 L250 20 L275 14 L300 9" fill="none" stroke="#C08B5C" strokeWidth="2.2" />
            <path d="M0 52 L25 50 L50 48 L75 47 L100 45 L125 43 L150 39 L175 35 L200 30 L225 26 L250 20 L275 14 L300 9 L300 60 L0 60 Z" fill="rgba(192,139,92,0.1)" />
          </svg>
        </div>

        {/* AI verdict */}
        <div className="bg-white rounded-xl border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-[#ABABAB] font-medium">AI Verdict</div>
            <span className="text-[8px] text-emerald-600 font-semibold">96% confidence</span>
          </div>
          <div>
            <div className="text-[16px] font-bold text-emerald-600">Strong Buy</div>
            <div className="text-[8px] text-[#6F6F6F] mt-1 leading-relaxed">Above-average cap rate with strong rent growth fundamentals in a growing market.</div>
          </div>
          <div className="flex gap-1 mt-1.5">
            {['Growth', 'Cash Flow', 'Low Risk'].map((tag) => (
              <span key={tag} className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
