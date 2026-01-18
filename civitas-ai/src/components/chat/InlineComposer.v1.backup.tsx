/**
 * InlineComposer - Ask Anywhere Component
 *
 * Inspired by SolidHealth.ai's inline chat on profile pages
 *
 * Features:
 * - Compact, single-line input
 * - Context-aware placeholder
 * - Quick question chips
 * - Can be embedded anywhere
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { designTokens } from '../../styles/design-tokens';

interface InlineComposerProps {
  placeholder?: string;
  context?: string; // e.g., "about this property", "about Austin market"
  quickQuestions?: string[];
  onSend: (message: string) => void;
  autoFocus?: boolean;
  size?: 'sm' | 'md';
}

export const InlineComposer: React.FC<InlineComposerProps> = ({
  placeholder = 'Ask a question...',
  context,
  quickQuestions = [],
  onSend,
  autoFocus = false,
  size = 'md',
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleQuickQuestion = (question: string) => {
    onSend(question);
  };

  const sizeStyles = {
    sm: {
      padding: designTokens.spacing.sm,
      fontSize: designTokens.typography.fontSize.sm,
      height: '40px',
    },
    md: {
      padding: designTokens.spacing.md,
      fontSize: designTokens.typography.fontSize.base,
      height: '48px',
    },
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Main Input */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.sm,
            backgroundColor: designTokens.colors.bg.secondary,
            border: `1.5px solid ${isFocused ? designTokens.colors.brand.primary : designTokens.colors.border.subtle}`,
            borderRadius: designTokens.border.radius.full,
            padding: sizeStyles[size].padding,
            transition: designTokens.transition.normal,
            boxShadow: isFocused ? designTokens.shadow.glow : designTokens.shadow.sm,
          }}
        >
          {/* AI Icon */}
          <Sparkles
            size={size === 'sm' ? 16 : 18}
            style={{
              color: designTokens.colors.brand.primary,
              flexShrink: 0,
            }}
          />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={context ? `${placeholder} ${context}` : placeholder}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: designTokens.colors.text.primary,
              fontSize: sizeStyles[size].fontSize,
              fontFamily: designTokens.typography.fontFamily.sans,
              lineHeight: designTokens.typography.lineHeight.normal,
            }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: size === 'sm' ? '28px' : '32px',
              height: size === 'sm' ? '28px' : '32px',
              borderRadius: designTokens.border.radius.md,
              backgroundColor: message.trim()
                ? designTokens.colors.brand.primary
                : designTokens.colors.bg.tertiary,
              border: 'none',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              transition: designTokens.transition.fast,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (message.trim()) {
                e.currentTarget.style.backgroundColor = designTokens.colors.brand.light;
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (message.trim()) {
                e.currentTarget.style.backgroundColor = designTokens.colors.brand.primary;
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <Send
              size={size === 'sm' ? 14 : 16}
              style={{
                color: message.trim() ? '#fff' : designTokens.colors.text.disabled,
              }}
            />
          </button>
        </div>
      </form>

      {/* Quick Questions */}
      {quickQuestions.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: designTokens.spacing.xs,
          marginTop: designTokens.spacing.md,
        }}>
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              style={{
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                borderRadius: designTokens.border.radius.full,
                backgroundColor: designTokens.colors.bg.tertiary,
                border: `1px solid ${designTokens.colors.border.subtle}`,
                color: designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSize.xs,
                fontWeight: designTokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: designTokens.transition.fast,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.brand.subtle;
                e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
                e.currentTarget.style.color = designTokens.colors.brand.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.bg.tertiary;
                e.currentTarget.style.borderColor = designTokens.colors.border.subtle;
                e.currentTarget.style.color = designTokens.colors.text.secondary;
              }}
            >
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Specialized variant for property details
export const PropertyInlineComposer: React.FC<{
  propertyAddress: string;
  onSend: (message: string) => void;
}> = ({ propertyAddress, onSend }) => {
  const quickQuestions = [
    'What\'s the estimated cash flow?',
    'Show rental comps nearby',
    'Compare to similar properties',
    'What are the property taxes?',
    'Is this a good investment?',
  ];

  return (
    <div style={{
      padding: designTokens.spacing.lg,
      backgroundColor: designTokens.colors.bg.secondary,
      border: `1px solid ${designTokens.colors.border.subtle}`,
      borderRadius: designTokens.border.radius.xl,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.sm,
        marginBottom: designTokens.spacing.md,
      }}>
        <Sparkles size={18} style={{ color: designTokens.colors.brand.primary }} />
        <h3 style={{
          fontSize: designTokens.typography.fontSize.base,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.text.primary,
          margin: 0,
        }}>
          Ask about this property
        </h3>
      </div>

      <InlineComposer
        placeholder="Ask a question"
        context={`about ${propertyAddress}`}
        quickQuestions={quickQuestions}
        onSend={onSend}
        size="md"
      />
    </div>
  );
};
