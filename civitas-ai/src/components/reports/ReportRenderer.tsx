import React from 'react';
import { motion } from 'framer-motion';

interface ReportRendererProps {
  content: string;
  title: string;
  location: string;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ content, title, location }) => {
  // Parse report content into structured sections
  const parseReport = (text: string) => {
    const sections: any[] = [];
    const lines = text.split('\n');
    let currentSection: any = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Section headers (### or ==)
      if (trimmed.startsWith('###') || trimmed.match(/^={3,}/)) {
        if (currentSection) sections.push(currentSection);
        const title = trimmed.replace(/^###\s*/, '').replace(/^={3,}/, '').trim();
        currentSection = { type: 'section', title, content: [] };
      }
      // Subsection headers (---)
      else if (trimmed.match(/^-{3,}/)) {
        if (currentSection && currentSection.content.length > 0) {
          const lastItem = currentSection.content[currentSection.content.length - 1];
          if (typeof lastItem === 'string') {
            currentSection.content[currentSection.content.length - 1] = { type: 'subsection', title: lastItem, items: [] };
          }
        }
      }
      // List items (-, *, •, or numbered)
      else if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const text = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        if (currentSection) {
          const lastItem = currentSection.content[currentSection.content.length - 1];
          if (lastItem && typeof lastItem === 'object' && lastItem.type === 'subsection') {
            lastItem.items.push(text);
          } else {
            currentSection.content.push({ type: 'list-item', text });
          }
        }
      }
      // Key-value pairs (Label: Value)
      else if (trimmed.match(/^[A-Za-z\s]+:\s*.+/)) {
        const [label, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        if (currentSection) {
          currentSection.content.push({ type: 'key-value', label: label.trim(), value });
        }
      }
      // Regular text
      else if (trimmed.length > 0) {
        if (currentSection) {
          currentSection.content.push(trimmed);
        }
      }
    }
    
    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const sections = parseReport(content);

  // Extract key metrics from content
  const extractMetrics = () => {
    const metrics: any = {};
    const gradeMatch = content.match(/Investment Grade:\s*([A-D][+-]?)/i);
    const roiMatch = content.match(/ROI:\s*([\d.]+)%/i);
    const cashFlowMatch = content.match(/Monthly Cash Flow:\s*\$?([-\d,]+)/i);
    const revenueMatch = content.match(/Annual Revenue:\s*\$?([\d,]+)/i);
    
    if (gradeMatch) metrics.grade = gradeMatch[1];
    if (roiMatch) metrics.roi = roiMatch[1];
    if (cashFlowMatch) metrics.cashFlow = cashFlowMatch[1];
    if (revenueMatch) metrics.revenue = revenueMatch[1];
    
    return metrics;
  };

  const metrics = extractMetrics();

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'from-green-500 to-emerald-500';
    if (grade.startsWith('B')) return 'from-blue-500 to-cyan-500';
    if (grade.startsWith('C')) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-white/70">📍 {location}</p>
          </div>
          {metrics.grade && (
            <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getGradeColor(metrics.grade)} text-white font-bold text-2xl`}>
              {metrics.grade}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {metrics.roi && (
            <div className="rounded-lg p-4 bg-white/10">
              <p className="text-white/60 text-sm mb-1">ROI</p>
              <p className="text-2xl font-bold text-teal-300">{metrics.roi}%</p>
            </div>
          )}
          {metrics.cashFlow && (
            <div className="rounded-lg p-4 bg-white/10">
              <p className="text-white/60 text-sm mb-1">Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-white">${metrics.cashFlow}</p>
            </div>
          )}
          {metrics.revenue && (
            <div className="rounded-lg p-4 bg-white/10">
              <p className="text-white/60 text-sm mb-1">Annual Revenue</p>
              <p className="text-2xl font-bold text-white">${metrics.revenue}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Sections */}
      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="rounded-2xl p-6 bg-white/5 border border-white/10"
        >
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            {getSectionIcon(section.title)}
            {section.title}
          </h3>

          <div className="space-y-3">
            {section.content.map((item: any, itemIdx: number) => {
              // Subsection
              if (typeof item === 'object' && item.type === 'subsection') {
                return (
                  <div key={itemIdx} className="pl-4 border-l-2 border-teal-500/50">
                    <h4 className="text-lg font-semibold text-white/90 mb-2">{item.title}</h4>
                    <ul className="space-y-1">
                      {item.items.map((listItem: string, listIdx: number) => (
                        <li key={listIdx} className="text-white/70 flex items-start gap-2">
                          <span className="text-teal-400 mt-1">▸</span>
                          <span>{listItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              
              // List item
              if (typeof item === 'object' && item.type === 'list-item') {
                return (
                  <div key={itemIdx} className="flex items-start gap-2 text-white/70">
                    <span className="text-teal-400 mt-1">•</span>
                    <span>{item.text}</span>
                  </div>
                );
              }
              
              // Key-value pair
              if (typeof item === 'object' && item.type === 'key-value') {
                return (
                  <div key={itemIdx} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-white/70 font-medium">{item.label}</span>
                    <span className="text-white font-semibold">{item.value}</span>
                  </div>
                );
              }
              
              // Regular text
              return (
                <p key={itemIdx} className="text-white/80 leading-relaxed">
                  {item}
                </p>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Helper to get section icons
const getSectionIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('executive') || lower.includes('summary')) return '📋';
  if (lower.includes('revenue') || lower.includes('income')) return '💰';
  if (lower.includes('return') || lower.includes('roi')) return '📈';
  if (lower.includes('compliance') || lower.includes('regulation')) return '⚖️';
  if (lower.includes('market') || lower.includes('analysis')) return '🌍';
  if (lower.includes('startup') || lower.includes('cost')) return '💵';
  if (lower.includes('risk')) return '⚠️';
  if (lower.includes('recommendation')) return '💡';
  return '📄';
};
