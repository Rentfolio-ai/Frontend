// FILE: src/data/seed.ts
import type { Message as ChatMessage } from '@/types/chat';

// Re-export the Message type
export type Message = ChatMessage;

export interface Chat {
  id: string;
  title: string;
  timestamp: string;
  messagePreview?: string;
  hasUnread?: boolean;
  date: Date;
}

export interface ToolResult {
  kind: 'roi_analysis' | 'market_data' | 'property_comparison' | 'alert';
  title: string;
  data: any;
  status: 'success' | 'warning' | 'error';
}

export interface KpiData {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

export interface Report {
  id: string;
  title: string;
  type: 'market_analysis' | 'portfolio_summary' | 'roi_analysis' | 'comparative_analysis';
  date: string;
  status: 'ready' | 'generating' | 'draft';
  size?: string;
}

// Sample chat data
export const seedChats: Chat[] = [
  {
    id: '1',
    title: 'Austin Downtown Investment Analysis',
    timestamp: '2:30 PM',
    messagePreview: 'Based on the analysis, downtown Austin shows strong investment potential...',
    hasUnread: false,
    date: new Date(2025, 8, 12, 14, 30) // Today
  },
  {
    id: '2',
    title: 'Dallas Market Comparison',
    timestamp: '11:15 AM',
    messagePreview: 'Let me compare the Dallas and Austin markets for you...',
    hasUnread: true,
    date: new Date(2025, 8, 12, 11, 15) // Today
  },
  {
    id: '3',
    title: 'Portfolio ROI Review',
    timestamp: 'Yesterday',
    messagePreview: 'Your Q3 portfolio performance shows strong growth across all metrics...',
    hasUnread: false,
    date: new Date(2025, 8, 11, 16, 45) // Yesterday
  },
  {
    id: '4',
    title: 'Houston Property Search',
    timestamp: 'Yesterday',
    messagePreview: 'I found 12 properties matching your investment criteria in Houston...',
    hasUnread: false,
    date: new Date(2025, 8, 11, 9, 30) // Yesterday
  },
  {
    id: '5',
    title: 'Cap Rate Analysis',
    timestamp: 'Sep 10',
    messagePreview: 'The average cap rate in your target area is 6.2%...',
    hasUnread: false,
    date: new Date(2025, 8, 10, 13, 20) // 2 days ago
  },
  {
    id: '6',
    title: 'Market Trends Q3 2025',
    timestamp: 'Sep 8',
    messagePreview: 'Real estate trends show continued growth in Texas markets...',
    hasUnread: false,
    date: new Date(2025, 8, 8, 10, 15) // 4 days ago
  },
  {
    id: '7',
    title: 'Property Valuation Help',
    timestamp: 'Sep 5',
    messagePreview: 'I can help you value that property using comparable sales data...',
    hasUnread: false,
    date: new Date(2025, 8, 5, 15, 30) // Last week
  },
  {
    id: '8',
    title: 'Investment Strategy Planning',
    timestamp: 'Aug 28',
    messagePreview: 'Based on your goals, I recommend focusing on cash-flowing properties...',
    hasUnread: false,
    date: new Date(2025, 7, 28, 14, 0) // Earlier
  }
];

// Sample messages for active chat
export const seedMessages: Message[] = [
  {
    id: '1',
    content: 'Hi! I\'m looking to analyze a potential investment property in downtown Austin. Can you help me understand the ROI potential?',
    role: 'user',
    timestamp: '2:30 PM'
  },
  {
    id: '2',
    content: 'I\'d be happy to help you analyze the investment potential! Let me gather some market data for downtown Austin and run a comprehensive ROI analysis.',
    role: 'assistant',
    timestamp: '2:31 PM'
  },
  {
    id: '3',
    content: 'Based on the analysis, downtown Austin shows strong investment potential with an 8.4% annual ROI and positive cash flow of $1,240/month. The market has seen 12.3% year-over-year growth, indicating a healthy appreciation trend.\n\nWould you like me to compare this with similar properties in the area or analyze specific properties you\'re considering?',
    role: 'assistant',
    timestamp: '2:32 PM'
  }
];

// Sample tool results
export const seedToolResults: ToolResult[] = [
  {
    kind: 'market_data',
    title: 'Austin Downtown Market Analysis',
    status: 'success',
    data: {
      location: 'Downtown Austin, TX',
      medianPrice: '485K',
      priceGrowth: 12.3,
      inventory: 28,
      date: 'September 2025'
    }
  },
  {
    kind: 'roi_analysis',
    title: 'Investment ROI Analysis',
    status: 'success',
    data: {
      roi: 8.4,
      capRate: 6.2,
      cashFlow: 1240,
      breakEven: 7.2
    }
  }
];

// Sample KPI data
export const seedKpis: KpiData[] = [
  {
    id: '1',
    label: 'Portfolio Value',
    value: '2.4M',
    change: '+12.3%',
    trend: 'up',
    format: 'currency'
  },
  {
    id: '2',
    label: 'Monthly Revenue',
    value: '18.5K',
    change: '+5.2%',
    trend: 'up',
    format: 'currency'
  },
  {
    id: '3',
    label: 'Avg Cap Rate',
    value: '6.8',
    change: '+0.3%',
    trend: 'up',
    format: 'percentage'
  },
  {
    id: '4',
    label: 'Occupancy Rate',
    value: '94.2',
    change: '-1.8%',
    trend: 'down',
    format: 'percentage'
  },
  {
    id: '5',
    label: 'Active Properties',
    value: 12,
    format: 'number'
  },
  {
    id: '6',
    label: 'Markets',
    value: 4,
    format: 'number'
  }
];

// Sample reports
export const seedReports: Report[] = [
  {
    id: '1',
    title: 'Q3 Portfolio Performance',
    type: 'portfolio_summary',
    date: '2 days ago',
    status: 'ready',
    size: '2.3 MB'
  },
  {
    id: '2',
    title: 'Austin Market Analysis',
    type: 'market_analysis',
    date: '1 week ago',
    status: 'ready',
    size: '1.8 MB'
  },
  {
    id: '3',
    title: 'Downtown Properties ROI',
    type: 'roi_analysis',
    date: '2 weeks ago',
    status: 'ready',
    size: '950 KB'
  },
  {
    id: '4',
    title: 'Property Comparison Report',
    type: 'comparative_analysis',
    date: 'Just now',
    status: 'generating'
  }
];

// Helper functions for generating dynamic data
export const generateTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined 
    });
  }
};

export const mockApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Property data for tools
export const sampleProperties = [
  {
    id: '1',
    address: '123 Main St, Austin, TX',
    price: 485000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    roi: 8.4,
    capRate: 6.2,
    neighborhood: 'Downtown'
  },
  {
    id: '2',
    address: '456 Oak Ave, Austin, TX',
    price: 520000,
    beds: 3,
    baths: 2.5,
    sqft: 1450,
    roi: 7.8,
    capRate: 5.9,
    neighborhood: 'East Austin'
  },
  {
    id: '3',
    address: '789 Pine St, Austin, TX',
    price: 450000,
    beds: 2,
    baths: 2,
    sqft: 1100,
    roi: 9.1,
    capRate: 6.8,
    neighborhood: 'South Austin'
  }
];