/**
 * Help Modal Component
 * 
 * Displays help documentation and tips
 */

import React, { useEffect, useState } from 'react';
import { X, BookOpen, Lightbulb, AlertCircle, Rocket } from 'lucide-react';

interface HelpTopic {
    title: string;
    content: string;
}

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const topicIcons: Record<string, React.ReactNode> = {
    getting_started: <Rocket className="w-5 h-5" />,
    features: <BookOpen className="w-5 h-5" />,
    tips: <Lightbulb className="w-5 h-5" />,
    troubleshooting: <AlertCircle className="w-5 h-5" />,
};

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [topics, setTopics] = useState<Record<string, HelpTopic>>({});
    const [selectedTopic, setSelectedTopic] = useState('getting_started');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchHelp = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/help`);
                    const data = await res.json();
                    setTopics(data.content);
                } catch (error) {
                    console.error('Failed to load help:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchHelp();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0F1117] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Help & Documentation</h2>
                            <p className="text-sm text-white/50">Learn how to use Civitas</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-white/10 p-4 overflow-y-auto bg-white/[0.01] custom-scrollbar">
                        <nav className="space-y-1">
                            {Object.entries(topics).map(([key, topic]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTopic(key)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${selectedTopic === key
                                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium border border-blue-500/20'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className={selectedTopic === key ? 'text-blue-400' : 'text-white/40'}>
                                        {topicIcons[key]}
                                    </span>
                                    <span className={selectedTopic === key ? 'text-white font-semibold' : ''}>{topic.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/10"></div>
                                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    {topics[selectedTopic]?.title}
                                </h3>
                                <div className="whitespace-pre-line text-white/70 leading-relaxed">
                                    {topics[selectedTopic]?.content}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                    <p className="text-sm text-white/50 text-center">
                        Need more help? Contact{' '}
                        <a href="mailto:support@civitas.ai" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                            support@civitas.ai
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};
