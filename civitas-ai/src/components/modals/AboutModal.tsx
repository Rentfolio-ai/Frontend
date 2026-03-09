/**
 * About Modal Component - Dark Mode Professional Design
 */

import React from 'react';
import { X, FileText, Shield, Book, Github, ExternalLink } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-popover rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-black/8">
                    <h2 className="text-xl font-semibold text-foreground">About Civitas AI</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/8 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* App Info */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#C08B5C] to-purple-500 flex items-center justify-center shadow-lg shadow-[#C08B5C]/20">
                            <span className="text-3xl font-bold text-foreground">A</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">Civitas AI</h3>
                        <p className="text-sm text-muted-foreground mb-3">Version 1.0.0</p>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            AI-powered real estate intelligence platform for modern investors
                        </p>
                    </div>

                    {/* Links */}
                    <div className="space-y-2 mb-6">
                        <LinkItem
                            icon={FileText}
                            label="Terms of Service"
                            href="/terms-of-service"
                        />
                        <LinkItem
                            icon={Shield}
                            label="Privacy Policy"
                            href="/privacy-policy"
                        />
                        <LinkItem
                            icon={Book}
                            label="Documentation"
                            href="/docs"
                        />
                        <LinkItem
                            icon={Github}
                            label="View on GitHub"
                            href="https://github.com/civitasai"
                        />
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-black/8 text-center">
                        <p className="text-xs text-muted-foreground/70">
                            © 2025 Civitas AI. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface LinkItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
}

const LinkItem: React.FC<LinkItemProps> = ({ icon: Icon, label, href }) => {
    const handleClick = () => {
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-black/8 bg-black/[0.02] hover:bg-black/[0.04] hover:border-black/12 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground/70" />
                <span className="text-sm font-medium text-foreground/80">{label}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
};
