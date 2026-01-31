// FILE: src/components/chat/StreamingText.tsx
/**
 * StreamingText - ChatGPT-style token-by-token text streaming
 * Shows text appearing character-by-character with blinking cursor
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StreamingTextProps {
  content: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  content,
  speed = 20,
  onComplete,
  className = ''
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    // Reset when content changes
    setDisplayedContent('');
    setCurrentIndex(0);
    setShowCursor(true);
    setIsComplete(false);
  }, [content]);
  
  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (!isComplete && content.length > 0) {
      // Finished streaming
      setIsComplete(true);
      setShowCursor(false);
      onComplete?.();
    }
  }, [content, currentIndex, speed, onComplete, isComplete]);
  
  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span>{displayedContent}</span>
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-purple-500 ml-1 -mb-0.5"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </span>
  );
};

/**
 * StreamingMarkdown - For markdown content that streams
 * Use when you want streaming effect with markdown support
 */
interface StreamingMarkdownProps extends StreamingTextProps {
  renderMarkdown?: (content: string) => React.ReactNode;
}

export const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  content,
  speed = 20,
  onComplete,
  className = '',
  renderMarkdown
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    setDisplayedContent('');
    setCurrentIndex(0);
    setShowCursor(true);
  }, [content]);
  
  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (content.length > 0) {
      setShowCursor(false);
      onComplete?.();
    }
  }, [content, currentIndex, speed, onComplete]);
  
  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {renderMarkdown ? renderMarkdown(displayedContent) : displayedContent}
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-purple-500 ml-1"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
};
