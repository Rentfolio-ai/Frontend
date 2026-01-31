/**
 * About Page - Full Page View
 * Information about Vasthu and the team
 */

import React from 'react';
import { ArrowLeft, Home, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

interface AboutPageProps {
    onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
    const TeamMember: React.FC<{
        name: string;
        role: string;
        bio: string;
    }> = ({ name, role, bio }) => (
        <div
            className="p-5 rounded-xl"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            <div className="flex items-center gap-4 mb-3">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{
                        background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                        color: '#FFFFFF',
                    }}
                >
                    {name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-base font-semibold" style={{ color: '#F1F5F9' }}>
                        {name}
                    </h3>
                    <p className="text-sm" style={{ color: '#14B8A6' }}>
                        {role}
                    </p>
                </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                {bio}
            </p>
        </div>
    );

    const StatCard: React.FC<{
        value: string;
        label: string;
    }> = ({ value, label }) => (
        <div
            className="p-5 rounded-xl text-center"
            style={{
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.2)',
            }}
        >
            <div className="text-3xl font-bold mb-1" style={{ color: '#14B8A6' }}>
                {value}
            </div>
            <div className="text-sm" style={{ color: '#CBD5E1' }}>
                {label}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#334155' }}>
            {/* Header */}
            <div
                className="flex items-center gap-4 px-6 py-4 border-b"
                style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}
            >
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#E2E8F0',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
                        About Vasthu
                    </h1>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        AI-powered real estate investment platform
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Hero Section */}
                    <div className="text-center py-8">
                        <div
                            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                            }}
                        >
                            <Home className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4" style={{ color: '#F1F5F9' }}>
                            Making Real Estate Investing Simple
                        </h2>
                        <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
                            Vasthu combines AI technology with real estate expertise to help you find, analyze,
                            and invest in properties with confidence.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard value="10K+" label="Active Users" />
                        <StatCard value="50K+" label="Properties Analyzed" />
                        <StatCard value="$2B+" label="Investment Volume" />
                    </div>

                    {/* Mission */}
                    <div
                        className="p-6 rounded-xl"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(148, 163, 184, 0.12)',
                        }}
                    >
                        <h3 className="text-xl font-semibold mb-3" style={{ color: '#F1F5F9' }}>
                            Our Mission
                        </h3>
                        <p className="text-base leading-relaxed" style={{ color: '#CBD5E1' }}>
                            We believe real estate investing should be accessible to everyone. Vasthu leverages
                            cutting-edge AI to democratize access to professional-grade investment analysis,
                            empowering both novice and experienced investors to make informed decisions.
                        </p>
                    </div>

                    {/* Team */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Meet the Team
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TeamMember
                                name="Sheenka K"
                                role="Founder & CEO"
                                bio="Passionate about leveraging AI to transform real estate investing. Former tech lead with 10+ years of experience."
                            />
                            <TeamMember
                                name="AI Team"
                                role="AI & Engineering"
                                bio="World-class engineers and researchers building the next generation of real estate intelligence."
                            />
                        </div>
                    </div>

                    {/* Technology */}
                    <div
                        className="p-6 rounded-xl"
                        style={{
                            backgroundColor: 'rgba(20, 184, 166, 0.05)',
                            border: '1px solid rgba(20, 184, 166, 0.1)',
                        }}
                    >
                        <h3 className="text-xl font-semibold mb-3" style={{ color: '#F1F5F9' }}>
                            Powered by Advanced AI
                        </h3>
                        <p className="text-base leading-relaxed mb-4" style={{ color: '#CBD5E1' }}>
                            Vasthu uses Google's Gemini 2.5 Pro and Flash models with a three-tier reasoning system:
                        </p>
                        <ul className="space-y-2">
                            {['Quick Mode for instant responses', 'Smart Mode for standard analysis', 'Deep Mode for comprehensive strategic planning'].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#CBD5E1' }}>
                                    <span style={{ color: '#14B8A6' }}>•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                            style={{
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                color: '#94A3B8',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)';
                                e.currentTarget.style.color = '#CBD5E1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                                e.currentTarget.style.color = '#94A3B8';
                            }}
                        >
                            <Github className="w-5 h-5" />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                            style={{
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                color: '#94A3B8',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)';
                                e.currentTarget.style.color = '#CBD5E1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                                e.currentTarget.style.color = '#94A3B8';
                            }}
                        >
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                            style={{
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                color: '#94A3B8',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)';
                                e.currentTarget.style.color = '#CBD5E1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                                e.currentTarget.style.color = '#94A3B8';
                            }}
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a
                            href="mailto:hello@vasthu.ai"
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                            style={{
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                color: '#94A3B8',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)';
                                e.currentTarget.style.color = '#CBD5E1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                                e.currentTarget.style.color = '#94A3B8';
                            }}
                        >
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="text-center py-4">
                        <p className="text-sm flex items-center justify-center gap-2" style={{ color: '#94A3B8' }}>
                            Made with <Heart className="w-4 h-4" style={{ color: '#EF4444' }} /> for real estate investors
                        </p>
                        <p className="text-xs mt-2" style={{ color: '#64748B' }}>
                            © 2026 Vasthu AI. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
