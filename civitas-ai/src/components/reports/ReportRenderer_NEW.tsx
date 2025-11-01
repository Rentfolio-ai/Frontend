import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Home, MapPin, Calendar, Award, AlertCircle, CheckCircle } from 'lucide-react';

interface ReportRendererProps {
  content: string;
  title: string;
  location: string;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ content, title, location }) => {
  // Extract structured data from content
  const extractMetrics = () => {
    const metrics: any = {};
    
    // Extract key metrics
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
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Property header (address with pin emoji or "PROPERTY" keyword)
      if (line.match(/^📍\s+\d+/) || line.match(/^---\s*PROPERTY/i)) {
        if (currentProperty) properties.push(currentProperty);
        
        const addressMatch = line.match(/📍\s+(.+)/);
        currentProperty = {
          address: addressMatch ? addressMatch[1].trim() : line.replace(/^---\s*PROPERTY\s*\d+:\s*/i, '').trim(),
          details: {}
        };
      }
      // Extract property details
      else if (currentProperty && line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z\s]/g, '');
        
        if (cleanKey.includes('type')) currentProperty.details.type = value;
        else if (cleanKey.includes('price')) currentProperty.details.price = value;
        else if (cleanKey.includes('revenue potential')) currentProperty.details.revenue = value;
        else if (cleanKey.includes('why')) currentProperty.details.reasoning = value;
        else if (cleanKey.includes('nightly') && cleanKey.includes('rate')) currentProperty.details.nightlyRate = value;
        else if (cleanKey.includes('occupancy')) currentProperty.details.occupancy = value;
        else if (cleanKey.includes('roi')) currentProperty.details.roi = value;
      }
    }
    
    if (currentProperty) properties.push(currentProperty);
    return properties;
  };

  const parseSections = () => {
    const sections: any[] = [];
    const lines = content.split('\n');
    let currentSection: any = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip property-related lines (handled separately)
      if (trimmed.match(/^📍\s+\d+/) || trimmed.match(/^---\s*PROPERTY/i)) continue;
      
      // Section headers (emoji headers or all caps)
      if (trimmed.match(/^[🏛️📊📋🎯⚠️✅💰📈⚖️🌍💵💡🏠📄]/)) {
        if (currentSection) sections.push(currentSection);
        const title = trimmed.replace(/^[🏛️📊📋🎯⚠️✅💰📈⚖️🌍💵💡🏠📄]\s*/, '').trim();
        currentSection = { title, emoji: trimmed[0], items: [] };
      }
      else if (trimmed.match(/^[A-Z][A-Z\s]{8,}$/)) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: trimmed, emoji: null, items: [] };
      }
      // List items
      else if (trimmed.match(/^[-•*▸]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const text = trimmed.replace(/^[-•*▸]\s+/, '').replace(/^\d+\.\s+/, '');
        if (currentSection) {
          currentSection.items.push({ type: 'list', text });
        }
      }
      // Key-value pairs
      else if (trimmed.match(/^[A-Za-z\s]+:\s*.+/) && !trimmed.startsWith('http')) {
        const [label, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        if (currentSection && label.length < 50) {
          currentSection.items.push({ type: 'keyvalue', label: label.trim(), value });
        }
      }
      // Regular paragraphs
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

  const getGradeColor = (grade: string) => {
    const letter = grade[0];
    if (letter === 'A') return 'from-emerald-500 to-green-600';
    if (letter === 'B') return 'from-blue-500 to-cyan-600';
    if (letter === 'C') return 'from-amber-500 to-orange-600';
    return 'from-rose-500 to-red-600';
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Executive Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border-l-4 border-blue-500"
      >
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          Executive Summary
        </h2>
        <p className="text-white/80 leading-relaxed text-lg">
          Comprehensive investment analysis for <span className="font-semibold text-white">{location}</span> short-term rental opportunities.
        </p>
      </motion.div>

      {/* Hero Metrics Section */}
      {(metrics.occupancy || metrics.monthlyRevenue || metrics.roi) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/20 backdrop-blur-sm shadow-xl"
        >
          {/* Grade Badge */}
          {metrics.grade && (
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-white/80 mb-1">Investment Grade</h3>
                <p className="text-sm text-white/50">Overall property rating</p>
              </div>
              <div className={`px-8 py-4 rounded-2xl bg-gradient-to-r ${getGradeColor(metrics.grade)} shadow-lg`}>
                <p className="text-5xl font-black text-white tracking-tight">{metrics.grade}</p>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 divide-x divide-white/10">
            {metrics.occupancy && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <TrendingUp className="w-5 h-5 text-blue-300" />
                  </div>
                  <p className="text-xs uppercase font-bold tracking-wider text-white/50">Expected Occupancy</p>
                </div>
                <p className="text-4xl font-bold text-white">{metrics.occupancy}%</p>
              </div>
            )}
            
            {metrics.monthlyRevenue && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <DollarSign className="w-5 h-5 text-emerald-300" />
                  </div>
                  <p className="text-xs uppercase font-bold tracking-wider text-white/50">Monthly Revenue (avg)</p>
                </div>
                <p className="text-4xl font-bold text-white">{formatCurrency(metrics.monthlyRevenue)}</p>
              </div>
            )}
            
            {metrics.roi && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Award className="w-5 h-5 text-purple-300" />
                  </div>
                  <p className="text-xs uppercase font-bold tracking-wider text-white/50">Cash-on-Cash ROI (avg)</p>
                </div>
                <p className="text-4xl font-bold text-white">{metrics.roi}%</p>
              </div>
            )}
          </div>

          {/* Bottom Summary */}
          <div className="p-6 bg-white/5 border-t border-white/10">
            <p className="text-white/80 leading-relaxed text-base">
              <span className="font-semibold text-white">Bottom line?</span> The {location} market is showing solid fundamentals for STR investing. With the right property and management, you're looking at healthy returns.
            </p>
          </div>
        </motion.div>
      )}

      {/* Property Breakdown */}
      {properties.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Section Header */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-l-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-white/10">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Property Analysis</h2>
            </div>
            <p className="text-white/70 text-base leading-relaxed ml-14">
              Detailed breakdown of {properties.length} {properties.length === 1 ? 'property' : 'properties'} with rankings and investment potential.
            </p>
          </div>

          {properties.map((property, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
            >
              {/* Property Header */}
              <div className="p-5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-300 flex-shrink-0 mt-1" />
                    <h3 className="text-2xl font-bold text-white">{property.address}</h3>
                  </div>
                </div>
              </div>

              {/* Property Details Grid */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  {property.details.type && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs uppercase font-semibold tracking-wider text-white/50 mb-2">Type</p>
                      <p className="text-lg font-semibold text-white">{property.details.type}</p>
                    </div>
                  )}
                  
                  {property.details.price && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs uppercase font-semibold tracking-wider text-white/50 mb-2">Asking Price</p>
                      <p className="text-lg font-semibold text-white">{property.details.price}</p>
                    </div>
                  )}
                  
                  {property.details.nightlyRate && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs uppercase font-semibold tracking-wider text-white/50 mb-2">Nightly Rate</p>
                      <p className="text-lg font-semibold text-emerald-300">{property.details.nightlyRate}</p>
                    </div>
                  )}
                  
                  {property.details.occupancy && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs uppercase font-semibold tracking-wider text-white/50 mb-2">Occupancy</p>
                      <p className="text-lg font-semibold text-blue-300">{property.details.occupancy}</p>
                    </div>
                  )}
                  
                  {property.details.roi && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs uppercase font-semibold tracking-wider text-white/50 mb-2">ROI</p>
                      <p className="text-lg font-semibold text-purple-300">{property.details.roi}</p>
                    </div>
                  )}
                  
                  {property.details.revenue && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs uppercase font-semibold tracking-wider text-white/50 mb-2">Revenue Potential</p>
                      <p className="text-lg font-semibold text-white">{property.details.revenue}</p>
                    </div>
                  )}
                </div>

                {/* Reasoning */}
                {property.details.reasoning && (
                  <div className="mt-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-sm font-semibold text-indigo-300 mb-2">💡 Why this property?</p>
                    <p className="text-white/80 leading-relaxed">{property.details.reasoning}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Additional Sections */}
      {sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              Additional Analysis
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Supporting insights, market data, and recommendations.
            </p>
          </div>
          
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="rounded-2xl p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2 pb-3 border-b border-white/10">
                {section.emoji && <span className="text-2xl">{section.emoji}</span>}
                {section.title}
              </h3>

          <div className="space-y-4">
            {section.items.map((item: any, itemIdx: number) => {
              if (item.type === 'list') {
                return (
                  <div key={itemIdx} className="flex items-start gap-3 text-white/80">
                    <span className="text-purple-400 mt-1 flex-shrink-0">▸</span>
                    <span className="leading-relaxed">{item.text}</span>
                  </div>
                );
              }

              if (item.type === 'keyvalue') {
                return (
                  <div key={itemIdx} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-white/60 font-medium">{item.label}</span>
                    <span className="text-white font-semibold">{item.value}</span>
                  </div>
                );
              }

              return (
                <p key={itemIdx} className="text-white/80 leading-relaxed text-base">
                  {item.text}
                </p>
              );
            })}
          </div>
        </motion.div>
      ))}
        </motion.div>
      )}
    </div>
  );
};
