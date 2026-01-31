// FILE: src/components/PropertySearchV2.tsx
/**
 * V2 Property Search Component
 * 
 * Displays streaming property search results with:
 * - Real-time thinking indicators
 * - Progressive property loading
 * - Streaming AI insights
 * - Modern ChatGPT-like UX
 */

import { useEffect } from 'react';
import { useV2PropertyStream, usePropertyQueryParser } from '../hooks/useV2PropertyStream';
import type { PropertySearchQuery } from '../services/v2PropertyApi';

// ============================================================================
// Types
// ============================================================================

interface PropertySearchV2Props {
  query: PropertySearchQuery | string;
  onComplete?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function PropertySearchV2({ query, onComplete }: PropertySearchV2Props) {
  console.log('[PropertySearchV2] 🎉 Component mounted! Query:', query);

  const {
    isSearching,
    isStreamingAI,
    isComplete,
    thinkingMessage,
    progress,
    properties,
    totalFound,
    marketContext,
    aiInsights,
    error,
    searchProperties,
    cancelSearch,
    regenerateInsights,
  } = useV2PropertyStream({
    onAIComplete: () => {
      console.log('[PropertySearchV2] ✅ AI Complete callback');
      onComplete?.();
    },
  });

  const { parseQuery } = usePropertyQueryParser();

  // Start search when component mounts
  useEffect(() => {
    console.log('[PropertySearchV2] 🚀 useEffect triggered, starting search...');
    const searchQuery = typeof query === 'string' ? parseQuery(query) : query;
    console.log('[PropertySearchV2] 📊 Parsed query:', searchQuery);
    searchProperties(searchQuery);

    return () => {
      console.log('[PropertySearchV2] 🧹 Cleanup: canceling search');
      cancelSearch();
    };
  }, []); // Empty deps - only run once on mount

  // ============================================================================
  // Render: Thinking Indicator
  // ============================================================================

  if (thinkingMessage) {
    return (
      <div className="property-search-v2-thinking">
        <div className="thinking-content">
          <div className="thinking-spinner" />
          <span className="thinking-message">{thinkingMessage}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Error
  // ============================================================================

  if (error) {
    return (
      <div className="property-search-v2-error">
        <div className="error-icon">❌</div>
        <div className="error-message">{error}</div>
        <button
          className="retry-button"
          onClick={() => {
            const searchQuery = typeof query === 'string' ? parseQuery(query) : query;
            searchProperties(searchQuery);
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ============================================================================
  // Render: Properties Grid
  // ============================================================================

  return (
    <div className="property-search-v2-results">
      {/* Header */}
      {properties?.length > 0 && (
        <div className="results-header">
          <h3 className="results-title">
            Found {totalFound} Properties
          </h3>
          {marketContext && (
            <div className="market-stats">
              <div className="stat">
                <span className="stat-label">Avg Price:</span>
                <span className="stat-value">
                  ${marketContext.avg_price?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Median:</span>
                <span className="stat-value">
                  ${marketContext.median_price?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">$/sqft:</span>
                <span className="stat-value">
                  ${marketContext.avg_price_per_sqft?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Properties Grid */}
      {properties?.length > 0 && (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-header">
                <h4 className="property-address">{property.address}</h4>
                <p className="property-city">
                  {property.city}, {property.state} {property.zip_code}
                </p>
              </div>

              <div className="property-price">
                ${property.price.toLocaleString()}
              </div>

              <div className="property-details">
                <span className="detail">{property.beds} bed</span>
                <span className="detail-separator">•</span>
                <span className="detail">{property.baths} bath</span>
                <span className="detail-separator">•</span>
                <span className="detail">{property.sqft} sqft</span>
              </div>

              {property.year_built && (
                <div className="property-year">
                  Built {property.year_built}
                </div>
              )}

              {property.estimated_rent && (
                <div className="property-rent">
                  Est. Rent: ${property.estimated_rent}/mo
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      {(aiInsights || isStreamingAI) && (
        <div className="ai-insights-section">
          <div className="ai-insights-header">
            <span className="ai-icon">🤖</span>
            <h4 className="ai-title">AI Investment Analysis</h4>
            {isStreamingAI && (
              <span className="ai-status">Generating...</span>
            )}
            {isComplete && aiInsights && (
              <button
                className="regenerate-button"
                onClick={regenerateInsights}
                title="Regenerate insights"
              >
                🔄
              </button>
            )}
          </div>

          <div className="ai-insights-content">
            <p className="ai-text">
              {aiInsights}
              {isStreamingAI && <span className="ai-cursor" />}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Styles (CSS-in-JS for quick implementation)
// ============================================================================

// Note: Move these to a proper CSS/SCSS file in production

const styles = `
.property-search-v2-thinking {
  padding: 1.5rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%);
  border-radius: 12px;
  margin: 1rem 0;
}

.thinking-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.thinking-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.thinking-message {
  color: #1565c0;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.property-search-v2-error {
  padding: 2rem;
  text-align: center;
  background: #ffebee;
  border-radius: 12px;
  margin: 1rem 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  color: #c62828;
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.property-search-v2-results {
  margin: 1rem 0;
}

.results-header {
  margin-bottom: 1.5rem;
}

.results-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.market-stats {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat {
  display: flex;
  gap: 0.5rem;
}

.stat-label {
  color: #666;
}

.stat-value {
  color: #333;
  font-weight: 600;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.property-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.property-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
}

.property-address {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem 0;
}

.property-city {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.property-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin: 1rem 0;
}

.property-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.detail-separator {
  color: #ccc;
}

.property-year,
.property-rent {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
}

.ai-insights-section {
  background: linear-gradient(135deg, #fff3e0 0%, #f3e5f5 100%);
  border: 2px solid #ffe082;
  border-radius: 12px;
  padding: 1.5rem;
  animation: slideIn 0.5s ease;
}

.ai-insights-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.ai-icon {
  font-size: 1.5rem;
}

.ai-title {
  flex: 1;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.ai-status {
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
}

.regenerate-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.regenerate-button:hover {
  opacity: 1;
}

.ai-text {
  color: #444;
  line-height: 1.6;
  margin: 0;
}

.ai-cursor {
  display: inline-block;
  width: 8px;
  height: 18px;
  background: #667eea;
  margin-left: 2px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
`;

// Inject styles (for quick implementation)
if (typeof document !== 'undefined') {
  const styleId = 'property-search-v2-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}
