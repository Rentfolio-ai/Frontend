import React from 'react';

/* ─── Deal Underwriting Mockup (Large Scale) ──────────────────────────── */
export const DealUnderwritingMockup: React.FC = () => (
  <div className="w-full flex flex-col gap-4 p-4 bg-gradient-to-b from-[#FAFAF9]/50 to-transparent">
    <div className="flex gap-4">
      <div className="w-[120px] h-[88px] rounded-xl bg-[#F5F0EB] flex-shrink-0 overflow-hidden relative shadow-sm border border-[#EBEBEA]/80">
        <svg viewBox="0 0 120 88" className="w-full h-full opacity-50">
          <path d="M25 62 L60 32 L95 62" stroke="#A8734A" strokeWidth="2.5" fill="none" />
          <rect x="38" y="48" width="16" height="14" rx="2" fill="#A8734A" opacity="0.25" />
          <rect x="62" y="42" width="16" height="20" rx="2" fill="#A8734A" opacity="0.25" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-[#1A1A1A] truncate">4821 Cedar Ridge Dr</div>
        <div className="text-[12px] text-[#ABABAB] mt-1">Austin, TX 78745</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[14px] font-bold text-[#1A1A1A]">$485,000</span>
          <span className="text-[11px] text-[#ABABAB]">3bd / 2ba / 1,840 sqft</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Cap Rate', value: '7.2%', color: '#059669' },
        { label: 'CoC ROI', value: '14.1%', color: '#C08B5C' },
        { label: 'Cash Flow', value: '$842/mo', color: '#4F46E5' },
      ].map((m) => (
        <div key={m.label} className="bg-white rounded-xl p-3 border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="text-[11px] text-[#ABABAB] mb-1">{m.label}</div>
          <div className="text-[18px] font-bold" style={{ color: m.color }}>{m.value}</div>
        </div>
      ))}
    </div>

    <div className="flex items-end gap-1 px-1 h-[72px]">
      {[40, 55, 48, 65, 72, 60, 78, 85, 70, 90, 82, 95].map((h, i) => (
        <div key={i} className="flex-1 rounded-t-sm" style={{
          height: `${h}%`,
          background: i >= 10 ? '#C08B5C' : i >= 8 ? '#D4A27F' : '#EBEBEA',
        }} />
      ))}
    </div>

    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 shadow-[0_1px_2px_rgba(16,185,129,0.08)]">
      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 ring-2 ring-emerald-200/50" />
      <span className="text-[12px] font-semibold text-emerald-700">AI Verdict: Strong Buy</span>
      <span className="text-[11px] text-emerald-600 ml-auto font-medium">Score 92/100</span>
    </div>
  </div>
);

/* ─── AI Chat Modes Mockup (Large Scale) ──────────────────────────────── */
export const AIChatModesMockup: React.FC = () => (
  <div className="w-full flex flex-col p-4 bg-gradient-to-b from-[#FAFAF9]/40 to-transparent">
    <div className="flex gap-1.5 mb-4">
      {[
        { label: 'Deep Search', color: '#C08B5C', active: true },
        { label: 'Deep Research', color: '#4F46E5', active: false },
        { label: 'Expert Strategist', color: '#7C3AED', active: false },
      ].map((tab) => (
        <div key={tab.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{
          background: tab.active ? `${tab.color}12` : 'transparent',
          color: tab.active ? tab.color : '#ABABAB',
          border: tab.active ? `1px solid ${tab.color}30` : '1px solid transparent',
        }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: tab.color, opacity: tab.active ? 1 : 0.3 }} />
          {tab.label}
        </div>
      ))}
    </div>

    <div className="flex-1 flex flex-col gap-3 mb-4">
      <div className="self-end max-w-[72%] px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-[#1A1A1A] text-white text-[12px] leading-relaxed">
        Find me properties in Austin under $500k with 7%+ cap rate
      </div>
      <div className="self-start max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[12px] text-[#3D3D3D] leading-relaxed">
        Found 4 properties matching your criteria. The top-ranked deal at 4821 Cedar Ridge shows a 7.2% cap rate with strong rent growth potential...
      </div>
      <div className="self-start max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[11px] text-[#6F6F6F] leading-relaxed">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-semibold text-emerald-700">Property Card</span>
        </div>
        4821 Cedar Ridge Dr &middot; $485,000 &middot; Cap 7.2% &middot; Score 92
      </div>
    </div>

    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#E5E5E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="w-2 h-2 rounded-full bg-[#C08B5C]" />
      <span className="text-[11px] text-[#ABABAB] flex-1">Ask Vasthu anything...</span>
      <div className="w-6 h-6 rounded-md bg-[#1A1A1A] flex items-center justify-center">
        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 9V3M6 3L3.5 5.5M6 3l2.5 2.5" />
        </svg>
      </div>
    </div>
  </div>
);

/* ─── Market Intelligence Mockup (Large Scale) ────────────────────────── */
export const MarketIntelMockup: React.FC = () => (
  <div className="w-full flex flex-col gap-4 p-4 bg-gradient-to-b from-[#FAFAF9]/40 to-transparent">
    <div className="flex items-center justify-between">
      <div className="text-[12px] text-[#6F6F6F] font-medium">Median Rent Trends</div>
      <div className="flex gap-3">
        {[
          { label: 'Austin', color: '#C08B5C' },
          { label: 'Dallas', color: '#4F46E5' },
          { label: 'Miami', color: '#059669' },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="w-2 h-[3px] rounded-full" style={{ background: c.color }} />
            <span className="text-[10px] text-[#ABABAB]">{c.label}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="relative h-[100px]">
      <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
        <path d="M0 75 Q38 70 75 62 T150 50 T225 38 T300 25" fill="none" stroke="#C08B5C" strokeWidth="2.5" opacity="0.8" />
        <path d="M0 80 Q38 75 75 72 T150 62 T225 52 T300 42" fill="none" stroke="#4F46E5" strokeWidth="2.5" opacity="0.6" />
        <path d="M0 70 Q38 65 75 65 T150 55 T225 45 T300 32" fill="none" stroke="#059669" strokeWidth="2.5" opacity="0.6" />
        <path d="M0 75 Q38 70 75 62 T150 50 T225 38 T300 25 L300 100 L0 100 Z" fill="#C08B5C" opacity="0.05" />
      </svg>
    </div>

    <div>
      <div className="text-[11px] text-[#ABABAB] mb-2 font-medium">Demand Heatmap</div>
      <div className="grid grid-cols-8 gap-1">
        {[0.2,0.4,0.6,0.3,0.8,0.5,0.7,0.4, 0.5,0.7,0.9,0.6,0.4,0.8,0.3,0.6, 0.3,0.5,0.7,0.9,0.6,0.4,0.8,0.5].map((v, i) => (
          <div key={i} className="h-[14px] rounded-sm" style={{
            background: `rgba(192,139,92,${v * 0.55 + 0.1})`,
          }} />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-[#ABABAB] mt-1.5 px-0.5">
        <span>Low demand</span>
        <span>High demand</span>
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
            className={`w-4 h-4 rounded-md flex items-center justify-center ${
              idx === 0 ? 'bg-[#C08B5C]/10 text-[#C08B5C]' : idx === 1 ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
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
          <span key={cat} className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
            i === 0 ? 'bg-[#C08B5C]/10 text-[#C08B5C] border border-[#C08B5C]/20' : 'bg-[#F5F5F3] text-[#ABABAB]'
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
          <span key={tab} className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
            i === 0 ? 'bg-[#C08B5C]/10 text-[#C08B5C] border border-[#C08B5C]/20' : 'bg-[#F5F5F3] text-[#ABABAB]'
          }`}>{tab}</span>
        ))}
      </div>
    </div>

    <div className="flex gap-1.5">
      {['Active 11', 'Under Contract 7', 'Closed 6'].map((s, i) => (
        <div key={s} className={`px-2 py-1 rounded-md text-[9px] font-medium ${
          i === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#F5F5F3] text-[#ABABAB]'
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
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
              p.score >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>{p.score}</span>
            <span className={`text-[9px] font-medium ${
              p.verdict === 'Strong Buy' ? 'text-emerald-600' : p.verdict === 'Buy' ? 'text-blue-600' : 'text-amber-600'
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
    <div className="w-[188px] bg-[#161619] p-4 flex-shrink-0 hidden sm:flex flex-col border-r border-white/[0.05]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-5 h-5 rounded bg-[#C08B5C]" />
        <span className="text-[11px] font-semibold text-white/80">Vasthu</span>
      </div>
      <div className="space-y-1">
        {['Dashboard', 'Deep Search', 'Deep Research', 'Expert Strategist', 'Teams', 'Marketplace', 'Reports'].map((item, i) => (
          <div key={item} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[10px] ${i === 0 ? 'bg-white/[0.11] text-white' : 'text-white/45'}`}>
            <div className={`w-3.5 h-3.5 rounded-[4px] ${i === 0 ? 'bg-[#C08B5C]/70' : 'bg-white/10'}`} />
            {item}
          </div>
        ))}
      </div>
      <div className="mt-auto pt-4">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.04]">
          <div className="w-5 h-5 rounded-full bg-white/15" />
          <span className="text-[9px] text-white/30">J. Smith</span>
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
          <div className="px-2.5 py-1 rounded-md bg-[#1A1A1A] text-[9px] font-medium text-white">Export PDF</div>
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
