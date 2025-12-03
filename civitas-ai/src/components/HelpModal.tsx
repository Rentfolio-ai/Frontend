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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Help & Documentation</h2>
                            <p className="text-sm text-gray-500">Learn how to use Civitas</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
                        <nav className="space-y-1">
                            {Object.entries(topics).map(([key, topic]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTopic(key)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${selectedTopic === key
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {topicIcons[key]}
                                    <span>{topic.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {topics[selectedTopic]?.title}
                                </h3>
                                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                                    {topics[selectedTopic]?.content}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600 text-center">
                        Need more help? Contact{' '}
                        <a href="mailto:support@civitas.ai" className="text-blue-600 hover:underline">
                            support@civitas.ai
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};
