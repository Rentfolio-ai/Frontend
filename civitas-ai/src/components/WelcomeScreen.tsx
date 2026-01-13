/**
 * Welcome Screen Component
 * 
 * Displays onboarding message for new users with sample queries
 */

import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

interface WelcomeScreenProps {
    onClose: () => void;
    onSelectQuery: (query: string) => void;
}

interface SampleQuery {
    query: string;
    description: string;
    icon: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClose, onSelectQuery }) => {
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [samples, setSamples] = useState<SampleQuery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOnboarding = async () => {
            try {
                const headers = {
                    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
                };

                // Fetch welcome message
                const welcomeRes = await fetch(`${import.meta.env.VITE_API_URL}/api/onboarding/welcome`, {
                    headers,
                });
                const welcomeData = await welcomeRes.json();
                setWelcomeMessage(welcomeData.message);

                // Fetch sample queries
                const samplesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/onboarding/samples`, {
                    headers,
                });
                const samplesData = await samplesRes.json();
                setSamples(samplesData.samples.slice(0, 6)); // Show first 6
            } catch (error) {
                console.error('Failed to load onboarding:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOnboarding();
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Welcome to Civitas!</h2>
                            <p className="text-sm text-gray-500">Your AI real estate assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Welcome Message */}
                <div className="mb-8 prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {welcomeMessage}
                    </div>
                </div>

                {/* Sample Queries */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Try these examples:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {samples.map((sample, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onSelectQuery(sample.query);
                                    onClose();
                                }}
                                className="group text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">{sample.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            "{sample.query}"
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">{sample.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                        Just type your question below to get started! 🚀
                    </p>
                </div>
            </div>
        </div>
    );
};
