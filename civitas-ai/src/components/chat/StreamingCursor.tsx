// FILE: src/components/chat/StreamingCursor.tsx
/**
 * Blinking cursor animation shown at the end of streaming messages
 * Mimics GPT/Gemini/Cursor UX
 */

import React from 'react';
import { motion } from 'framer-motion';

interface StreamingCursorProps {
    /** When true, cursor blinks faster to indicate active typing */
    active?: boolean;
}

export const StreamingCursor: React.FC<StreamingCursorProps> = ({ active = true }) => {
    return (
        <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{
                duration: active ? 0.35 : 0.8,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="inline-block w-[2px] h-[1.2em] bg-[#D4A27F] ml-[1px] align-middle"
            aria-label="Typing indicator"
        />
    );
};

export default StreamingCursor;
