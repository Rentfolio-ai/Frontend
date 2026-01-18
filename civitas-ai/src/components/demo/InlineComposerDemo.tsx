/**
 * InlineComposer Demo - Production Ready
 * 
 * SolidHealth.ai inspired (avatar + chat style) in sophisticated dark
 */

import React, { useState } from 'react';
import { InlineComposer, PropertyInlineComposer } from '../chat/InlineComposer';
import { AgentAvatar } from '../common/AgentAvatar';
import { designTokens } from '../../styles/design-tokens';
import { getContextDescription, getContextSuggestions } from '../../utils/composerContext';
import type { ComposerContext } from '../../utils/composerContext';

export const InlineComposerDemo: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentContext, setCurrentContext] = useState<ComposerContext>('property-detail');

  const handleSend = (message: string) => {
    console.log('Message sent:', message);
    setMessages([...messages, message]);
  };

  // Get context-aware content
  const description = getContextDescription(currentContext, { address: '123 Main St, Austin TX' });
  const contextSuggestions = getContextSuggestions(currentContext, { address: '123 Main St, Austin TX' });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.bg.app,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: designTokens.spacing.xl,
    }}>
      <div style={{
        maxWidth: '720px',
        width: '100%',
      }}>
        {/* Main Demo Card - SolidHealth.ai Style */}
        <div style={{
          backgroundColor: designTokens.colors.bg.primary,
          border: `1px solid ${designTokens.colors.border.default}`,
          borderRadius: '24px',
          padding: '40px',
          boxShadow: designTokens.shadow.xl,
        }}>
          {/* Avatar + Agent Info */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <AgentAvatar size="lg" status="online" />
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.text.primary,
                margin: 0,
                marginBottom: '8px',
                letterSpacing: designTokens.typography.letterSpacing.tight,
              }}>
                ProphetAtlas
              </h2>
              <p style={{
                fontSize: designTokens.typography.fontSize.base,
                color: designTokens.colors.text.secondary,
                margin: 0,
                lineHeight: designTokens.typography.lineHeight.relaxed,
              }}>
                {description}
              </p>
            </div>
          </div>

          {/* Context Switcher - Demo Only (excludes 'chat' - chat has main Composer) */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              fontSize: '11px',
              color: designTokens.colors.text.tertiary,
              padding: '4px 0',
              marginRight: '8px',
            }}>
              Test context:
            </div>
            {(['property-detail', 'portfolio', 'market-analysis', 'comparison'] as ComposerContext[]).map((ctx) => (
              <button
                key={ctx}
                onClick={() => setCurrentContext(ctx)}
                style={{
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: designTokens.typography.fontWeight.medium,
                  borderRadius: designTokens.border.radius.full,
                  backgroundColor: currentContext === ctx ? designTokens.colors.brand.primary : designTokens.colors.bg.tertiary,
                  color: currentContext === ctx ? '#fff' : designTokens.colors.text.tertiary,
                  border: `1px solid ${currentContext === ctx ? designTokens.colors.brand.primary : designTokens.colors.border.default}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {ctx.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Inline Composer - Context-Aware */}
          <InlineComposer
            placeholder="Ask anything"
            onSend={handleSend}
            autoFocus
          />

          {/* Context-Aware Suggestions */}
          <div style={{ marginTop: '20px' }}>
            <div style={{
              fontSize: designTokens.typography.fontSize.xs,
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.text.tertiary,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Suggestions for "{currentContext.replace('-', ' ')}"
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}>
              {contextSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion.query)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    backgroundColor: designTokens.colors.bg.secondary,
                    border: `1px solid ${designTokens.colors.border.default}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = designTokens.colors.bg.tertiary;
                    e.currentTarget.style.borderColor = designTokens.colors.border.emphasis;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = designTokens.shadow.md;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = designTokens.colors.bg.secondary;
                    e.currentTarget.style.borderColor = designTokens.colors.border.default;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{suggestion.icon}</span>
                  <span style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    fontWeight: designTokens.typography.fontWeight.medium,
                    color: designTokens.colors.text.secondary,
                  }}>
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Sent */}
          {messages.length > 0 && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: designTokens.colors.bg.secondary,
              borderRadius: '12px',
              border: `1px solid ${designTokens.colors.border.subtle}`,
            }}>
              <div style={{
                fontSize: designTokens.typography.fontSize.xs,
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.text.tertiary,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Recent Messages
              </div>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  fontSize: designTokens.typography.fontSize.sm,
                  color: designTokens.colors.text.secondary,
                  padding: '8px 0',
                  borderBottom: idx < messages.length - 1 ? `1px solid ${designTokens.colors.border.subtle}` : 'none',
                }}>
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Showcase Below */}
        <div style={{
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          {/* Compact Variant */}
          <div style={{
            padding: '24px',
            backgroundColor: designTokens.colors.bg.primary,
            border: `1px solid ${designTokens.colors.border.default}`,
            borderRadius: '16px',
          }}>
            <h3 style={{
              fontSize: designTokens.typography.fontSize.base,
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: '12px',
            }}>
              Compact Variant
            </h3>
            <InlineComposer
              placeholder="Quick question"
              variant="compact"
              onSend={handleSend}
            />
          </div>

          {/* With Quick Questions */}
          <div style={{
            padding: '24px',
            backgroundColor: designTokens.colors.bg.primary,
            border: `1px solid ${designTokens.colors.border.default}`,
            borderRadius: '16px',
          }}>
            <h3 style={{
              fontSize: designTokens.typography.fontSize.base,
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
              marginBottom: '12px',
            }}>
              With Quick Questions
            </h3>
            <InlineComposer
              placeholder="Ask about portfolio"
              quickQuestions={['Top performers?', 'Total cash flow?']}
              variant="compact"
              onSend={handleSend}
            />
          </div>
        </div>

        {/* Property Variant - Full Width */}
        <div style={{ marginTop: '16px' }}>
          <PropertyInlineComposer
            propertyAddress="123 Main St, Austin TX"
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
};
