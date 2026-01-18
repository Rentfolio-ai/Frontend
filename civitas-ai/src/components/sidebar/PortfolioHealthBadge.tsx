/**
 * Portfolio Health Hero - Investment Focus
 * Full-width hero section showing portfolio health
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { designTokens } from '../../styles/design-tokens';
import { api } from '../../services/api';

interface PortfolioHealth {
  score: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  totalValue: string;
}

export const PortfolioHealthBadge: React.FC<{ isExpanded: boolean; onNavigateToPortfolio?: () => void }> = ({ 
  isExpanded,
  onNavigateToPortfolio 
}) => {
  const [health, setHealth] = useState<PortfolioHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await api.get<any>('/api/portfolio/overview');
      if (response.data) {
        setHealth({
          score: response.data.user?.healthScore || 0,
          trend: 'up',
          trendValue: '+12%',
          totalValue: response.data.healthMetrics?.[2]?.value || '$0',
        });
      }
    } catch (err) {
      console.error('Failed to fetch portfolio health:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !health) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return designTokens.colors.semantic.success;
    if (score >= 60) return designTokens.colors.brand.primary;
    if (score >= 40) return designTokens.colors.semantic.warning;
    return designTokens.colors.semantic.error;
  };

  const scoreColor = getScoreColor(health.score);

  if (!isExpanded) {
    // Collapsed: Glowing dot indicator
    return (
      <div style={{
        width: '60px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: scoreColor,
          boxShadow: `0 0 12px ${scoreColor}60, 0 0 4px ${scoreColor}80`,
        }} />
      </div>
    );
  }

  // Expanded: Full-width hero section
  return (
    <button
      onClick={onNavigateToPortfolio}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        padding: designTokens.spacing.md,
        margin: `${designTokens.spacing.sm} 0`,
        background: `linear-gradient(135deg, 
          ${designTokens.colors.sidebar.surface} 0%, 
          ${designTokens.colors.brand.subtle} 100%)`,
        border: `1px solid ${isHovered ? designTokens.colors.brand.primary : designTokens.colors.sidebar.border}`,
        borderRadius: designTokens.radius.md,
        cursor: 'pointer',
        transition: `all ${designTokens.transition.normal}`,
        boxShadow: isHovered ? designTokens.shadow.glow : 'none',
        textAlign: 'left',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: designTokens.spacing.sm,
      }}>
        <span style={{
          fontSize: designTokens.typography.fontSize.xs,
          color: designTokens.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: designTokens.typography.letterSpacing.wide,
          fontWeight: designTokens.typography.fontWeight.medium,
        }}>
          Portfolio Health
        </span>
        <ArrowRight 
          size={14} 
          style={{ 
            color: designTokens.colors.brand.light,
            opacity: isHovered ? 1 : 0,
            transition: `opacity ${designTokens.transition.fast}`,
          }} 
        />
      </div>

      {/* Score + Trend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.sm,
        marginBottom: designTokens.spacing.xs,
      }}>
        <span style={{
          fontSize: '32px',
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: scoreColor,
          lineHeight: 1,
          letterSpacing: designTokens.typography.letterSpacing.tight,
        }}>
          {health.score}
        </span>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          <span style={{
            fontSize: designTokens.typography.fontSize.xs,
            color: designTokens.colors.text.tertiary,
          }}>
            / 100
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {health.trend === 'up' ? (
              <TrendingUp size={12} style={{ color: designTokens.colors.semantic.success }} />
            ) : (
              <TrendingDown size={12} style={{ color: designTokens.colors.semantic.error }} />
            )}
            <span style={{
              fontSize: designTokens.typography.fontSize.xs,
              color: health.trend === 'up' ? designTokens.colors.semantic.success : designTokens.colors.semantic.error,
              fontWeight: designTokens.typography.fontWeight.medium,
            }}>
              {health.trendValue}
            </span>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div style={{
        fontSize: designTokens.typography.fontSize.sm,
        color: designTokens.colors.text.secondary,
        fontWeight: designTokens.typography.fontWeight.medium,
      }}>
        Total Value: <span style={{ color: designTokens.colors.text.primary }}>{health.totalValue}</span>
      </div>
    </button>
  );
};
