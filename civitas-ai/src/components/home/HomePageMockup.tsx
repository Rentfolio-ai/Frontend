import React from 'react';
import { ChevronRight, ArrowUpRight, ArrowDownRight, MapPin } from 'lucide-react';

export const HomePageMockup: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto bg-background text-foreground font-sans selection:bg-black/12">
            <div className="max-w-[900px] mx-auto px-8 py-12 md:py-16">

                {/* Header - Stripped Down */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Pro Investor</span>
                    </div>
                    <h1 className="text-[32px] font-medium tracking-tight mb-6">Good evening, Sheen</h1>

                    <div className="flex gap-12 text-sm">
                        <div>
                            <div className="text-muted-foreground/70 mb-1">Portfolio Value</div>
                            <div className="text-xl tabular-nums">$2.4M</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground/70 mb-1">Monthly Cash Flow</div>
                            <div className="text-xl tabular-nums">$12,450/mo</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground/70 mb-1">Active Deals</div>
                            <div className="text-xl tabular-nums">4</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground/70 mb-1">YTD Return</div>
                            <div className="text-xl tabular-nums text-emerald-400">14.2%</div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-black/[0.06] mb-10"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Main Column (2/3) */}
                    <div className="md:col-span-2 space-y-12">

                        {/* Portfolio Performance Chart (Minimal Line) */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Performance</h2>
                                <div className="flex gap-4 text-[12px] text-muted-foreground/50">
                                    <span className="hover:text-foreground cursor-pointer">1M</span>
                                    <span className="hover:text-foreground cursor-pointer">3M</span>
                                    <span className="text-foreground cursor-pointer">6M</span>
                                    <span className="hover:text-foreground cursor-pointer">1Y</span>
                                </div>
                            </div>
                            <div className="h-40 border border-black/[0.04] rounded-lg relative flex items-center justify-center">
                                {/* SVG Mockup of pure line chart */}
                                <svg viewBox="0 0 100 40" className="w-full h-full text-foreground/80" preserveAspectRatio="none">
                                    {/* Grid lines */}
                                    <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
                                    <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
                                    <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
                                    {/* Simple sharp line */}
                                    <path d="M0,35 L10,32 L20,34 L30,25 L40,28 L50,15 L60,18 L70,8 L80,12 L90,5 L100,2" fill="none" stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                                </svg>
                            </div>
                        </section>

                        {/* Pipeline (List View) */}
                        <section>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Active Targets</h2>
                                <a href="#" className="text-[12px] text-muted-foreground/70 hover:text-foreground flex items-center">View Pipeline <ChevronRight className="w-3 h-3 ml-1" /></a>
                            </div>
                            <div className="divide-y divide-black/[0.04]">
                                {/* Item 1 */}
                                <div className="py-3 flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-muted-foreground/50">
                                            <MapPin className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[14px]">1204 Pine Ave, Austin TX</div>
                                            <div className="text-[12px] text-muted-foreground/70">Short-term Rental · Due Diligence</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[14px]">$425,000</div>
                                        <div className="text-[12px] text-emerald-400/80">Est. ~$3.2k/mo</div>
                                    </div>
                                </div>
                                {/* Item 2 */}
                                <div className="py-3 flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-muted-foreground/50">
                                            <MapPin className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[14px]">8902 Summit Rd, Denver CO</div>
                                            <div className="text-[12px] text-muted-foreground/70">Fix & Flip · Under Contract</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[14px]">$310,000</div>
                                        <div className="text-[12px] text-muted-foreground/70">Closing in 14d</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column (1/3) */}
                    <div className="space-y-12">

                        {/* Market Intel */}
                        <section>
                            <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-4">Market Intel</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-[12px] text-blue-400">Austin listings up</span>
                                    </div>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">Inventory in 78704 increased by 4% this week. Prices stabilizing.</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[12px] text-emerald-400">Rates dropped</span>
                                    </div>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">30-year fixed fell to 6.2%. Good time to re-evaluate Denver refi.</p>
                                </div>
                            </div>
                        </section>

                        {/* Recent Comms */}
                        <section>
                            <h2 className="text-[13px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-4">Recent</h2>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-black/8 text-muted-foreground flex items-center justify-center text-[9px] uppercase tracking-tighter shrink-0 mt-0.5">M</div>
                                    <div>
                                        <div className="text-[13px] text-foreground/80">Mark (Contractor)</div>
                                        <p className="text-[12px] text-muted-foreground/70 line-clamp-2 leading-relaxed">"Drywall quote came in. Taking a look at $4500 total..."</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-black/8 text-muted-foreground flex items-center justify-center text-[9px] uppercase tracking-tighter shrink-0 mt-0.5">S</div>
                                    <div>
                                        <div className="text-[13px] text-foreground/80">Sarah (Agent)</div>
                                        <p className="text-[12px] text-muted-foreground/70 line-clamp-2 leading-relaxed">"Offer accepted! Wiring the earnest money tomorrow morning."</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>

            </div>
        </div>
    );
};
