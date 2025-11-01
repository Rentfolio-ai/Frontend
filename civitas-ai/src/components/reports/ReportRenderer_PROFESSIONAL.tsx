import React from 'react';
import { motion } from 'framer-motion';

interface ReportRendererProps {
  content: string;
  title: string;
  location: string;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ content, title, location }) => {
  // Extract structured data
  const extractMetrics = () => {
    const metrics: any = {};
    const occupancyMatch = content.match(/(?:Expected Occupancy|Occupancy Rate):\s*(\d+)%/i);
    const monthlyRevenueMatch = content.match(/Monthly Revenue[^:]*:\s*\$?([\d,]+)/i);
    const roiMatch = content.match(/(?:Cash-on-Cash ROI|ROI)[^:]*:\s*([\d.]+)%/i);
    const gradeMatch = content.match(/Investment Grade:\s*([A-D][+-]?)/i);
    const annualRevenueMatch = content.match(/Annual Revenue[^:]*:\s*\$?([\d,]+)/i);
    const capRateMatch = content.match(/Cap Rate[^:]*:\s*([\d.]+)%/i);
    
    if (occupancyMatch) metrics.occupancy = occupancyMatch[1];
    if (monthlyRevenueMatch) metrics.monthlyRevenue = monthlyRevenueMatch[1].replace(/,/g, '');
    if (roiMatch) metrics.roi = roiMatch[1];
    if (gradeMatch) metrics.grade = gradeMatch[1];
    if (annualRevenueMatch) metrics.annualRevenue = annualRevenueMatch[1].replace(/,/g, '');
    if (capRateMatch) metrics.capRate = capRateMatch[1];
    
    return metrics;
  };

  const parseProperties = () => {
    const properties: any[] = [];
    const lines = content.split('\n');
    let currentProperty: any = null;
    let nextLineIsAddress = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Property header marker (--- PROPERTY #X ---)
      if (line.match(/^---\s*PROPERTY\s*#?\d+\s*---/i)) {
        // Save previous property if it has an address
        if (currentProperty && currentProperty.address) {
          properties.push(currentProperty);
        }
        // Start new property (but don't add to array yet - wait for address)
        currentProperty = {
          address: '',
          details: {}
        };
        nextLineIsAddress = true;
        continue;
      }
      
      // Property with address in same line (📍 format)
      if (line.match(/^📍\s+.+/)) {
        // Save previous property if it has an address
        if (currentProperty && currentProperty.address) {
          properties.push(currentProperty);
        }
        const addressMatch = line.match(/📍\s+(.+)/);
        currentProperty = {
          address: addressMatch ? addressMatch[1].trim() : '',
          details: {}
        };
        nextLineIsAddress = false;
        continue;
      }
      
      // Capture address on the line after --- PROPERTY #X ---
      if (nextLineIsAddress && line.length > 0) {
        // Skip if line looks like it might be a key:value pair or section header
        if (!line.includes(':') && !line.match(/^[A-Z\s]{10,}$/)) {
          if (currentProperty) {
            currentProperty.address = line;
          }
          nextLineIsAddress = false;
          continue;
        }
      }
      
      // Parse property details (key: value pairs)
      if (currentProperty && currentProperty.address && line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z\s]/g, '');
        
        if (cleanKey.includes('type')) currentProperty.details.type = value;
        else if (cleanKey.includes('price') || cleanKey.includes('asking')) currentProperty.details.price = value;
        else if (cleanKey.includes('revenue potential') || cleanKey.includes('annual revenue')) currentProperty.details.revenue = value;
        else if (cleanKey.includes('why')) currentProperty.details.reasoning = value;
        else if (cleanKey.includes('nightly') && cleanKey.includes('rate')) currentProperty.details.nightlyRate = value;
        else if (cleanKey.includes('occupancy')) currentProperty.details.occupancy = value;
        else if (cleanKey.includes('roi')) currentProperty.details.roi = value;
      }
    }
    
    // Don't forget the last property
    if (currentProperty && currentProperty.address) {
      properties.push(currentProperty);
    }
    
    return properties;
  };

  const parseSections = () => {
    const sections: any[] = [];
    const lines = content.split('\n');
    let currentSection: any = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.match(/^📍\s+\d+/) || trimmed.match(/^---\s*PROPERTY/i)) continue;
      
      if (trimmed.match(/^[🏛️📊📋🎯⚠️✅💰📈⚖️🌍💵💡🏠📄]/)) {
        if (currentSection) sections.push(currentSection);
        const title = trimmed.replace(/^[🏛️📊📋🎯⚠️✅💰📈⚖️🌍💵💡🏠📄]\s*/, '').trim();
        currentSection = { title, emoji: trimmed[0], items: [] };
      }
      else if (trimmed.match(/^[A-Z][A-Z\s]{8,}$/)) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: trimmed, emoji: null, items: [] };
      }
      else if (trimmed.match(/^[-•*▸]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const text = trimmed.replace(/^[-•*▸]\s+/, '').replace(/^\d+\.\s+/, '');
        if (currentSection) {
          currentSection.items.push({ type: 'list', text });
        }
      }
      else if (trimmed.match(/^[A-Za-z\s]+:\s*.+/) && !trimmed.startsWith('http')) {
        const [label, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        if (currentSection && label.length < 50) {
          currentSection.items.push({ type: 'keyvalue', label: label.trim(), value });
        }
      }
      else if (trimmed.length > 0 && !trimmed.match(/^={3,}/) && !trimmed.match(/^-{3,}/)) {
        if (currentSection) {
          currentSection.items.push({ type: 'text', text: trimmed });
        }
      }
    }
    
    if (currentSection) sections.push(currentSection);
    return sections.filter(s => s.items.length > 0);
  };

  const metrics = extractMetrics();
  const properties = parseProperties();
  const sections = parseSections();

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#374151', lineHeight: '1.7' }}>
      {/* Executive Summary */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
          Executive Summary
        </h2>
        <p className="text-base text-gray-700 leading-relaxed">
          Comprehensive investment analysis for <span className="font-semibold text-gray-900">{location}</span> short-term rental opportunities. This report provides detailed insights into market conditions, property-specific projections, and investment recommendations.
        </p>
      </motion.section>

      {/* Market Overview Metrics - Inline */}
      {(metrics.occupancy || metrics.monthlyRevenue || metrics.roi) && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-500">
            Market Overview
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-base text-gray-700 mb-4">
              Based on current market analysis, the {location} short-term rental market demonstrates strong investment potential with the following key indicators:
            </p>
            <div className="grid grid-cols-3 gap-6 my-6">
              {metrics.occupancy && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Expected Occupancy</div>
                  <div className="text-3xl font-bold text-blue-600">{metrics.occupancy}%</div>
                </div>
              )}
              {metrics.monthlyRevenue && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Monthly Revenue</div>
                  <div className="text-3xl font-bold text-emerald-600">{formatCurrency(metrics.monthlyRevenue)}</div>
                </div>
              )}
              {metrics.roi && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Cash-on-Cash ROI</div>
                  <div className="text-3xl font-bold text-purple-600">{metrics.roi}%</div>
                </div>
              )}
            </div>
            <p className="text-base text-gray-700">
              These figures represent average performance across comparable properties in the market, providing a baseline for investment expectations.
            </p>
          </div>
        </motion.section>
      )}

      {/* Properties */}
      {properties.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
            Property Analysis
          </h2>
          <p className="text-base text-gray-700 mb-6">
            The following {properties.length} {properties.length === 1 ? 'property has' : 'properties have'} been identified as strong investment opportunities based on market data, location analysis, and revenue potential.
          </p>

          <div className="space-y-8">
            {properties.map((property, idx) => (
              <div key={idx} className="border-l-4 border-indigo-400 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Property #{idx + 1}: {property.address}
                </h3>
                
                <div className="space-y-3 mb-4">
                  {property.details.type && (
                    <p className="text-base text-gray-700">
                      <span className="font-medium text-gray-900">Property Type:</span> {property.details.type}
                    </p>
                  )}
                  {property.details.price && (
                    <p className="text-base text-gray-700">
                      <span className="font-medium text-gray-900">Asking Price:</span> {property.details.price}
                    </p>
                  )}
                  {property.details.nightlyRate && (
                    <p className="text-base text-gray-700">
                      <span className="font-medium text-gray-900">Projected Nightly Rate:</span> <span className="text-emerald-600 font-semibold">{property.details.nightlyRate}</span>
                    </p>
                  )}
                  {property.details.occupancy && (
                    <p className="text-base text-gray-700">
                      <span className="font-medium text-gray-900">Expected Occupancy:</span> <span className="text-blue-600 font-semibold">{property.details.occupancy}</span>
                    </p>
                  )}
                  {property.details.roi && (
                    <p className="text-base text-gray-700">
                      <span className="font-medium text-gray-900">Estimated ROI:</span> <span className="text-purple-600 font-semibold">{property.details.roi}</span>
                    </p>
                  )}
                  {property.details.revenue && (
                    <p className="text-base text-gray-700">
                      <span className="font-medium text-gray-900">Revenue Potential:</span> {property.details.revenue}
                    </p>
                  )}
                </div>

                {property.details.reasoning && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mt-4">
                    <p className="text-sm font-semibold text-indigo-900 mb-2">
                      Investment Rationale
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed">{property.details.reasoning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Additional Sections */}
      {sections.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          {sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300 flex items-center gap-2">
                {section.emoji && <span>{section.emoji}</span>}
                {section.title}
              </h2>

              <div className="space-y-4 text-base text-gray-700">
                {section.items.map((item: any, itemIdx: number) => {
                  if (item.type === 'list') {
                    return (
                      <div key={itemIdx} className="flex items-start gap-3">
                        <span className="text-gray-400 mt-1.5 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{item.text}</span>
                      </div>
                    );
                  }

                  if (item.type === 'keyvalue') {
                    return (
                      <p key={itemIdx} className="leading-relaxed">
                        <span className="font-medium text-gray-900">{item.label}:</span> {item.value}
                      </p>
                    );
                  }

                  return (
                    <p key={itemIdx} className="leading-relaxed">
                      {item.text}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.section>
      )}
    </div>
  );
};
