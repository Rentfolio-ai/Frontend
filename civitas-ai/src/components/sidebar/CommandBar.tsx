/**
 * CommandBar - Search-First Entry Point
 * Investment-focused command palette for starting queries
 */

import React, { useState } from 'react';
import { Sparkles, TrendingUp, FileBarChart, Search } from 'lucide-react';
import { designTokens } from '../../styles/design-tokens';

interface CommandBarProps {
  isExpanded: boolean;
  onNewChat: () => void;
  onQuickAction?: (action: string) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const CommandBar: React.FC<CommandBarProps> = ({ 
  isExpanded, 
  onNewChat,
  onQuickAction 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  const quickActions: QuickAction[] = [
    { id: 'market-scan', label: 'Market Scan', icon: <Search size={12} /> },
    { id: 'compare', label: 'Compare', icon: <TrendingUp size={12} /> },
    { id: 'pnl', label: 'P&L Analysis', icon: <FileBarChart size={12} /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Would create new chat with initial query
      onNewChat();
      setQuery('');
    } else {
      // Empty submit = just start new chat
      onNewChat();
    }
  };

  const handleQuickAction = (actionId: string) => {
    if (onQuickAction) {
      onQuickAction(actionId);
    } else {
      onNewChat();
    }
  };

  if (!isExpanded) {
    // Collapsed: Show sparkles icon button
    return (
      <div style={{
        padding: `${designTokens.spacing.sm} 0`,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <button
          onClick={onNewChat}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: designTokens.colors.brand.primary,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all ${designTokens.transition.normal}`,
            boxShadow: designTokens.shadow.md,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.brand.dark;
            e.currentTarget.style.boxShadow = designTokens.shadow.glow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.brand.primary;
            e.currentTarget.style.boxShadow = designTokens.shadow.md;
          }}
        >
          <Sparkles size={18} style={{ color: '#FFFFFF' }} />
        </button>
      </div>
    );
  }

  // Expanded: Show full command bar
  return (
    <div style={{
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
      borderBottom: `1px solid ${designTokens.colors.sidebar.border}`,
    }}>
      {/* Command Input */}
      <form onSubmit={handleSubmit}>
        <div style={{
          position: 'relative',
          height: '44px',
        }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask ProphetAtlas anything..."
            style={{
              width: '100%',
              height: '100%',
              padding: `0 ${designTokens.spacing.sm} 0 40px`,
              backgroundColor: designTokens.colors.sidebar.surface,
              border: `1px solid ${isFocused ? designTokens.colors.brand.primary : designTokens.colors.sidebar.border}`,
              borderRadius: designTokens.radius.pill,
              color: designTokens.colors.text.primary,
              fontSize: designTokens.typography.fontSize.sm,
              outline: 'none',
              transition: `all ${designTokens.transition.normal}`,
              boxShadow: isFocused ? designTokens.shadow.glow : 'none',
            }}
          />
          {/* Icon inside input */}
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}>
            <Sparkles 
              size={16} 
              style={{ 
                color: isFocused ? designTokens.colors.brand.light : designTokens.colors.text.tertiary,
                transition: `color ${designTokens.transition.fast}`,
              }} 
            />
          </div>
        </div>
      </form>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: designTokens.spacing.xs,
        marginTop: designTokens.spacing.sm,
        flexWrap: 'wrap',
      }}>
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: `6px ${designTokens.spacing.sm}`,
              backgroundColor: 'transparent',
              border: `1px solid ${designTokens.colors.sidebar.border}`,
              borderRadius: designTokens.radius.pill,
              color: designTokens.colors.text.secondary,
              fontSize: designTokens.typography.fontSize.xs,
              fontWeight: designTokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${designTokens.transition.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = designTokens.colors.brand.subtle;
              e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
              e.currentTarget.style.color = designTokens.colors.brand.light;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
              e.currentTarget.style.color = designTokens.colors.text.secondary;
            }}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Helper Text */}
      <div style={{
        marginTop: designTokens.spacing.xs,
        fontSize: designTokens.typography.fontSize.xs,
        color: designTokens.colors.text.tertiary,
        textAlign: 'center',
      }}>
        Press <kbd style={{
          padding: '2px 6px',
          backgroundColor: designTokens.colors.sidebar.surface,
          border: `1px solid ${designTokens.colors.sidebar.border}`,
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: designTokens.typography.fontWeight.medium,
        }}>⌘K</kbd> to focus
      </div>
    </div>
  );
};
