import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    isStreaming?: boolean;
}

interface LiveTranscriptProps {
    messages: Message[];
    currentUserTranscript?: string;
    currentAiResponse?: string;
    isUserSpeaking?: boolean;
    isAiSpeaking?: boolean;
}

export function LiveTranscript({
    messages,
    currentUserTranscript,
    currentAiResponse,
    isUserSpeaking,
    isAiSpeaking,
}: LiveTranscriptProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [displayedAiText, setDisplayedAiText] = useState('');

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentUserTranscript, displayedAiText]);

    // Word-by-word animation for AI response
    useEffect(() => {
        if (!currentAiResponse) {
            setDisplayedAiText('');
            return;
        }

        const words = currentAiResponse.split(' ');
        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex < words.length) {
                setDisplayedAiText(words.slice(0, currentIndex + 1).join(' '));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 80); // 80ms per word

        return () => clearInterval(interval);
    }, [currentAiResponse]);

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
            <AnimatePresence initial={false}>
                {/* Historical messages */}
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-5 py-3 rounded-2xl ${message.role === 'user'
                                    ? 'bg-blue-500/20 border border-blue-400/30 text-white'
                                    : 'bg-purple-500/20 border border-purple-400/30 text-white'
                                }`}
                        >
                            {/* Role indicator */}
                            <div className={`text-xs font-medium mb-1 ${message.role === 'user' ? 'text-blue-300' : 'text-purple-300'
                                }`}>
                                {message.role === 'user' ? 'You' : 'Vasthu'}
                            </div>
                            {/* Message content */}
                            <div className="text-lg leading-relaxed">
                                {message.content}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Current user transcript (while speaking) */}
                {currentUserTranscript && (
                    <motion.div
                        key="current-user"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                    >
                        <div className="max-w-[80%] px-5 py-3 rounded-2xl bg-blue-500/20 border border-blue-400/30">
                            <div className="text-xs font-medium mb-1 text-blue-300">
                                You
                                {isUserSpeaking && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="ml-2"
                                    >
                                        ●
                                    </motion.span>
                                )}
                            </div>
                            <div className="text-lg text-white leading-relaxed">
                                {currentUserTranscript.split(' ').map((word, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.15, delay: i * 0.05 }}
                                        className="inline-block mr-1"
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Current AI response (while speaking) */}
                {displayedAiText && (
                    <motion.div
                        key="current-ai"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="max-w-[80%] px-5 py-3 rounded-2xl bg-purple-500/20 border border-purple-400/30">
                            <div className="text-xs font-medium mb-1 text-purple-300">
                                Vasthu
                                {isAiSpeaking && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="ml-2"
                                    >
                                        🔊
                                    </motion.span>
                                )}
                            </div>
                            <div className="text-lg text-white leading-relaxed">
                                {displayedAiText}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {messages.length === 0 && !currentUserTranscript && !displayedAiText && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-center h-full"
                >
                    <p className="text-white/40 text-lg">Your conversation will appear here...</p>
                </motion.div>
            )}
        </div>
    );
}
