/**
 * InlineComposer v2 - Production Ready
 *
 * Refined by: Steve Jobs, Jony Ive, Sam Altman, Boris Cherny, Larry & Sergey
 *
 * Key improvements:
 * - Cleaner typography (fewer sizes)
 * - Better spacing rhythm
 * - Smoother animations
 * - More intentional colors
 * - Production-grade polish
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { designTokens } from '../../styles/design-tokens';

interface InlineComposerProps {
  placeholder?: string;
  context?: string;
  description?: string;  // Context-aware description (e.g., "Ask about this property")
  quickQuestions?: string[];
  onSend: (message: string) => void;
  autoFocus?: boolean;
  variant?: 'default' | 'compact';
}

export const InlineComposer: React.FC<InlineComposerProps> = ({
  placeholder = 'Ask anything...',
  context,
  description,
  quickQuestions = [],
  onSend,
  autoFocus = false,
  variant = 'default',
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

  const isCompact = variant === 'compact';

  return (
    <div style={{ width: '100%' }}>
      {/* Description - Context-aware */}
      {description && (
        <div style={{
          fontSize: designTokens.typography.fontSize.sm,
          color: designTokens.colors.text.tertiary,
          marginBottom: '12px',
          lineHeight: designTokens.typography.lineHeight.relaxed,
        }}>
          {description}
        </div>
      )}

      {/* Main Input - Production Polish */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isCompact ? '10px' : '12px',
            padding: isCompact ? '10px 16px' : '12px 20px',
            backgroundColor: designTokens.colors.bg.secondary,
            border: `2px solid ${isFocused ? designTokens.colors.brand.primary : designTokens.colors.border.default}`,
            borderRadius: designTokens.border.radius.full,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isFocused 
              ? `0 0 0 4px ${designTokens.colors.brand.primary}20, ${designTokens.shadow.lg}`
              : designTokens.shadow.sm,
          }}
        >
          {/* AI Icon - Refined */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isCompact ? '20px' : '24px',
              height: isCompact ? '20px' : '24px',
              borderRadius: '6px',
              backgroundColor: isFocused ? designTokens.colors.brand.subtle : designTokens.colors.bg.tertiary,
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles
              size={isCompact ? 14 : 16}
              style={{
                color: isFocused ? designTokens.colors.brand.primary : designTokens.colors.text.tertiary,
                transition: 'color 0.2s ease',
              }}
            />
          </div>

          {/* Input - Better Typography */}
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
              fontSize: isCompact ? designTokens.typography.fontSize.sm : designTokens.typography.fontSize.base,
              fontFamily: designTokens.typography.fontFamily.sans,
              fontWeight: designTokens.typography.fontWeight.regular,
              lineHeight: designTokens.typography.lineHeight.normal,
              letterSpacing: designTokens.typography.letterSpacing.normal,
            }}
            className="placeholder:text-white/35"
          />

          {/* Send Button - Premium Feel */}
          <button
            type="submit"
            disabled={!message.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isCompact ? '32px' : '36px',
              height: isCompact ? '32px' : '36px',
              borderRadius: '10px',
              backgroundColor: message.trim()
                ? designTokens.colors.brand.primary
                : designTokens.colors.bg.tertiary,
              border: 'none',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              flexShrink: 0,
              boxShadow: message.trim() ? '0 2px 8px rgba(74, 123, 255, 0.25)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (message.trim()) {
                e.currentTarget.style.backgroundColor = designTokens.colors.brand.light;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 123, 255, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (message.trim()) {
                e.currentTarget.style.backgroundColor = designTokens.colors.brand.primary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(74, 123, 255, 0.25)';
              }
            }}
          >
            <Send
              size={isCompact ? 15 : 17}
              style={{
                color: message.trim() ? '#fff' : designTokens.colors.text.quaternary,
              }}
            />
          </button>
        </div>
      </form>

      {/* Quick Questions - Refined Pills */}
      {quickQuestions.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '12px',
        }}>
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              style={{
                padding: '6px 14px',
                borderRadius: designTokens.border.radius.full,
                backgroundColor: designTokens.colors.bg.secondary,
                border: `1px solid ${designTokens.colors.border.default}`,
                color: designTokens.colors.text.secondary,
                fontSize: designTokens.typography.fontSize.sm,
                fontWeight: designTokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.bg.tertiary;
                e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
                e.currentTarget.style.color = designTokens.colors.brand.primary;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designTokens.colors.bg.secondary;
                e.currentTarget.style.borderColor = designTokens.colors.border.default;
                e.currentTarget.style.color = designTokens.colors.text.secondary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
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

// Property Variant - SolidHealth.ai Style (Production)
export const PropertyInlineComposer: React.FC<{
  propertyAddress: string;
  onSend: (message: string) => void;
}> = ({ propertyAddress, onSend }) => {
  const quickQuestions = [
    'Estimated cash flow?',
    'Rental comps nearby',
    'Compare similar properties',
    'Property taxes?',
  ];

  return (
    <div style={{
      padding: '20px',
      backgroundColor: designTokens.colors.bg.secondary,
      border: `1px solid ${designTokens.colors.border.default}`,
      borderRadius: '16px',
      boxShadow: designTokens.shadow.sm,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: designTokens.colors.brand.subtle,
          }}
        >
          <Sparkles size={16} style={{ color: designTokens.colors.brand.primary }} />
        </div>
        <h3 style={{
          fontSize: designTokens.typography.fontSize.base,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.text.primary,
          margin: 0,
          lineHeight: 1,
        }}>
          Ask about this property
        </h3>
      </div>

      {/* Composer */}
      <InlineComposer
        placeholder="Type your question..."
        context={`about ${propertyAddress}`}
        quickQuestions={quickQuestions}
        onSend={onSend}
        variant="default"
      />
    </div>
  );
};
