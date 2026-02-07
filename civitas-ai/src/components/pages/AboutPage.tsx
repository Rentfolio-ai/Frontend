/**
 * About Page — Redesigned
 * Compact, elegant brand and team page
 */

import React from 'react';
import { ArrowLeft, Home, Github, Twitter, Linkedin, Mail, Heart, Zap, Brain, Target } from 'lucide-react';

interface AboutPageProps {
    onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
    const stats = [
        { value: '10K+', label: 'Active Users' },
        { value: '50K+', label: 'Properties Analyzed' },
        { value: '$2B+', label: 'Investment Volume' },
    ];

    const team = [
        { name: 'Sheenka K', role: 'Founder & CEO', bio: 'Passionate about leveraging AI to transform real estate investing. Former tech lead with 10+ years of experience.' },
        { name: 'AI Team', role: 'AI & Engineering', bio: 'World-class engineers building the next generation of real estate intelligence.' },
    ];

    const techFeatures = [
        { icon: Zap, label: 'Quick Mode', desc: 'Instant responses' },
        { icon: Brain, label: 'Smart Mode', desc: 'Standard analysis' },
        { icon: Target, label: 'Deep Mode', desc: 'Strategic planning' },
    ];

    const socials = [
        { icon: Github, href: 'https://github.com' },
        { icon: Twitter, href: 'https://twitter.com' },
        { icon: Linkedin, href: 'https://linkedin.com' },
        { icon: Mail, href: 'mailto:hello@vasthu.ai' },
    ];

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-white/90">About Vasthu</h1>
                    <p className="text-[11px] text-white/35">AI-powered real estate platform</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Hero */}
                    <div className="text-center py-5">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#A8734A] to-[#C08B5C] flex items-center justify-center shadow-lg shadow-[#C08B5C]/20">
                            <Home className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white/90 mb-2">Making Real Estate Investing Simple</h2>
                        <p className="text-[13px] text-white/45 leading-relaxed max-w-md mx-auto">
                            Vasthu combines AI with real estate expertise to help you find, analyze, and invest in properties with confidence.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2.5">
                        {stats.map(s => (
                            <div key={s.label} className="text-center py-3.5 rounded-xl bg-[#C08B5C]/[0.06] border border-[#C08B5C]/15">
                                <div className="text-xl font-bold text-[#D4A27F] mb-0.5">{s.value}</div>
                                <div className="text-[10px] text-white/40">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Mission */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                        <h3 className="text-[13px] font-semibold text-white/80 mb-2">Our Mission</h3>
                        <p className="text-[12px] text-white/45 leading-relaxed">
                            We believe real estate investing should be accessible to everyone. Vasthu leverages cutting-edge AI to democratize access to professional-grade investment analysis.
                        </p>
                    </div>

                    {/* Team */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Team</h2>
                        <div className="grid grid-cols-2 gap-2.5">
                            {team.map(t => (
                                <div key={t.name} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8734A] to-[#C08B5C] flex items-center justify-center text-sm font-bold text-white">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-[12px] font-semibold text-white/80">{t.name}</h3>
                                            <p className="text-[10px] text-[#D4A27F]">{t.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-white/40 leading-relaxed">{t.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Technology */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Technology</h2>
                        <div className="rounded-xl bg-[#C08B5C]/[0.04] border border-[#C08B5C]/10 p-4">
                            <h3 className="text-[13px] font-semibold text-white/80 mb-3">Powered by Advanced AI</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {techFeatures.map(tf => {
                                    const Icon = tf.icon;
                                    return (
                                        <div key={tf.label} className="text-center p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.04]">
                                            <Icon className="w-4 h-4 text-[#D4A27F] mx-auto mb-1.5" />
                                            <div className="text-[11px] font-medium text-white/70">{tf.label}</div>
                                            <div className="text-[10px] text-white/30">{tf.desc}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Social + Footer */}
                    <div className="text-center py-3">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            {socials.map(s => {
                                const Icon = s.icon;
                                return (
                                    <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                                       className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                                        <Icon className="w-3.5 h-3.5 text-white/40 hover:text-white/60" />
                                    </a>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-white/30 flex items-center justify-center gap-1">
                            Made with <Heart className="w-3 h-3 text-rose-400" /> for real estate investors
                        </p>
                        <p className="text-[10px] text-white/20 mt-1">&copy; 2026 Vasthu AI. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
