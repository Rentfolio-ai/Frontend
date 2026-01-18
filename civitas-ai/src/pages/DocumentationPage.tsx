/**
 * Documentation Page
 * User guides, API documentation, and tutorials
 */

import React, { useState } from 'react';
import { ArrowLeft, Search, BookOpen, Code, Zap, FileText, Video, ExternalLink } from 'lucide-react';
import { designTokens } from '../styles/design-tokens';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: DocItem[];
}

interface DocItem {
  title: string;
  description: string;
  url?: string;
  type: 'guide' | 'api' | 'video' | 'article';
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Zap size={20} />,
    items: [
      {
        title: 'Quick Start Guide',
        description: 'Get up and running with Vasthu in 5 minutes',
        type: 'guide',
      },
      {
        title: 'Your First Property Analysis',
        description: 'Learn how to analyze your first investment property',
        type: 'guide',
      },
      {
        title: 'Understanding Investment Metrics',
        description: 'Deep dive into ROI, Cap Rate, Cash Flow, and more',
        type: 'article',
      },
      {
        title: 'Video Tutorial: Platform Overview',
        description: 'Watch a complete walkthrough of Vasthu features',
        type: 'video',
      },
    ],
  },
  {
    id: 'features',
    title: 'Features & Guides',
    icon: <BookOpen size={20} />,
    items: [
      {
        title: 'AI Chat Assistant',
        description: 'How to get the most out of ProphetAtlas AI',
        type: 'guide',
      },
      {
        title: 'Portfolio Management',
        description: 'Track and manage your investment portfolio',
        type: 'guide',
      },
      {
        title: 'Property Comparison Tool',
        description: 'Compare multiple properties side-by-side',
        type: 'guide',
      },
      {
        title: 'Reports & Exports',
        description: 'Generate and export detailed investment reports',
        type: 'guide',
      },
      {
        title: 'Market Analysis',
        description: 'Understand market trends and opportunities',
        type: 'article',
      },
      {
        title: 'Setting Investment Criteria',
        description: 'Configure your preferences for AI recommendations',
        type: 'guide',
      },
    ],
  },
  {
    id: 'api',
    title: 'API Documentation',
    icon: <Code size={20} />,
    items: [
      {
        title: 'REST API Overview',
        description: 'Introduction to Vasthu REST API endpoints',
        type: 'api',
      },
      {
        title: 'Authentication',
        description: 'API keys, OAuth, and authentication methods',
        type: 'api',
      },
      {
        title: 'Property Data API',
        description: 'Fetch property data programmatically',
        type: 'api',
      },
      {
        title: 'Analysis API',
        description: 'Trigger property analysis via API',
        type: 'api',
      },
      {
        title: 'Webhooks',
        description: 'Real-time notifications for portfolio events',
        type: 'api',
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Topics',
    icon: <FileText size={20} />,
    items: [
      {
        title: 'Custom Financial Models',
        description: 'Build and import your own financial models',
        type: 'article',
      },
      {
        title: 'Data Sources & Accuracy',
        description: 'Understanding where our data comes from',
        type: 'article',
      },
      {
        title: 'Integrations',
        description: 'Connect Vasthu with your existing tools',
        type: 'guide',
      },
      {
        title: 'Best Practices',
        description: 'Tips from successful real estate investors',
        type: 'article',
      },
    ],
  },
];

interface DocumentationPageProps {
  onBack?: () => void;
}

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter docs
  const filteredSections = docSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
  })).filter(section => section.items.length > 0);

  const getTypeIcon = (type: DocItem['type']) => {
    switch (type) {
      case 'guide': return <BookOpen size={16} />;
      case 'api': return <Code size={16} />;
      case 'video': return <Video size={16} />;
      case 'article': return <FileText size={16} />;
    }
  };

  const getTypeBadge = (type: DocItem['type']) => {
    const styles: Record<DocItem['type'], { bg: string; color: string }> = {
      guide: { bg: designTokens.colors.brand.subtle, color: designTokens.colors.brand.light },
      api: { bg: 'rgba(139, 92, 246, 0.12)', color: '#A78BFA' },
      video: { bg: 'rgba(239, 68, 68, 0.12)', color: '#F87171' },
      article: { bg: 'rgba(59, 130, 246, 0.12)', color: '#60A5FA' },
    };

    return (
      <span style={{
        padding: `4px ${designTokens.spacing.xs}`,
        backgroundColor: styles[type].bg,
        color: styles[type].color,
        borderRadius: designTokens.radius.sm,
        fontSize: '11px',
        fontWeight: designTokens.typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        {getTypeIcon(type)}
        {type}
      </span>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.chat.bg,
      padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: designTokens.spacing.xl,
      }}>
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing.xs,
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
              backgroundColor: 'transparent',
              color: designTokens.colors.text.secondary,
              border: 'none',
              borderRadius: designTokens.radius.md,
              fontSize: '14px',
              fontWeight: designTokens.typography.fontWeight.medium,
              cursor: 'pointer',
              marginBottom: designTokens.spacing.md,
              transition: `all ${designTokens.transition.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = designTokens.colors.brand.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = designTokens.colors.text.secondary;
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        )}
        <h1 style={{
          fontSize: '32px',
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.text.primary,
          marginBottom: designTokens.spacing.sm,
        }}>
          Documentation
        </h1>
        <p style={{
          fontSize: '15px',
          color: designTokens.colors.text.tertiary,
          margin: 0,
        }}>
          Learn how to use Vasthu and master real estate investing
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Search & Filter */}
        <div style={{
          display: 'flex',
          gap: designTokens.spacing.md,
          marginBottom: designTokens.spacing.lg,
          flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: designTokens.colors.text.tertiary,
              }}
            />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md} ${designTokens.spacing.sm} 48px`,
                backgroundColor: designTokens.colors.chat.surface,
                border: `1px solid ${designTokens.colors.sidebar.border}`,
                borderRadius: designTokens.radius.md,
                color: designTokens.colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                transition: `all ${designTokens.transition.fast}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: designTokens.spacing.xs }}>
            {['all', 'guide', 'api', 'video', 'article'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
                  backgroundColor: selectedCategory === category ? designTokens.colors.brand.primary : designTokens.colors.chat.surface,
                  color: selectedCategory === category ? '#FFFFFF' : designTokens.colors.text.secondary,
                  border: `1px solid ${selectedCategory === category ? designTokens.colors.brand.primary : designTokens.colors.sidebar.border}`,
                  borderRadius: designTokens.radius.pill,
                  fontSize: '13px',
                  fontWeight: designTokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${designTokens.transition.fast}`,
                  textTransform: 'capitalize',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Documentation Sections */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: designTokens.spacing.lg,
        }}>
          {filteredSections.map((section) => (
            <div
              key={section.id}
              style={{
                backgroundColor: designTokens.colors.chat.surface,
                borderRadius: designTokens.radius.md,
                padding: designTokens.spacing.lg,
                border: `1px solid ${designTokens.colors.sidebar.border}`,
              }}
            >
              {/* Section Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.sm,
                marginBottom: designTokens.spacing.md,
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: designTokens.radius.md,
                  backgroundColor: designTokens.colors.brand.subtle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: designTokens.colors.brand.light,
                }}>
                  {section.icon}
                </div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  color: designTokens.colors.text.primary,
                  margin: 0,
                }}>
                  {section.title}
                </h2>
              </div>

              {/* Doc Items */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: designTokens.spacing.sm,
              }}>
                {section.items.map((item, index) => (
                  <button
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: designTokens.spacing.xs,
                      padding: designTokens.spacing.md,
                      backgroundColor: designTokens.colors.chat.elevated,
                      border: `1px solid ${designTokens.colors.sidebar.border}`,
                      borderRadius: designTokens.radius.md,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: `all ${designTokens.transition.fast}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = designTokens.colors.brand.primary;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = designTokens.colors.sidebar.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                      {getTypeBadge(item.type)}
                      <ExternalLink size={14} style={{ color: designTokens.colors.text.tertiary }} />
                    </div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      color: designTokens.colors.text.primary,
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: designTokens.colors.text.tertiary,
                      lineHeight: 1.5,
                    }}>
                      {item.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSections.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
            backgroundColor: designTokens.colors.chat.surface,
            borderRadius: designTokens.radius.md,
            border: `1px solid ${designTokens.colors.sidebar.border}`,
          }}>
            <p style={{
              fontSize: '15px',
              color: designTokens.colors.text.tertiary,
              margin: 0,
            }}>
              No documentation found matching your search. Try different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
