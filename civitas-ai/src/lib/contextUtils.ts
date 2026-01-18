// FILE: src/lib/contextUtils.ts
// Utility functions for populating and managing context items

import type { ContextItem } from '../types/context';
import type { ChatSession } from '../hooks/useDesktopShell';
import type { ScoutedProperty } from '../types/backendTools';

/**
 * Convert chat sessions to page contexts
 */
export const chatSessionsToContexts = (chatSessions: ChatSession[]): ContextItem[] => {
  return chatSessions
    .filter(chat => !chat.isArchived) // Don't show archived chats
    .map(chat => ({
      id: `page-${chat.id}`,
      type: 'page' as const,
      title: chat.title || 'Untitled Chat',
      subtitle: chat.messages?.[0]?.content?.substring(0, 60) + (chat.messages?.[0]?.content?.length > 60 ? '...' : ''),
      icon: chat.isPinned ? '📌' : '💬',
      timestamp: chat.timestamp || chat.createdAt,
      preview: chat.messages?.[chat.messages.length - 1]?.content?.substring(0, 100),
      metadata: {
        chatId: chat.id,
        messageCount: chat.messages?.length || 0,
        isPinned: chat.isPinned,
        isArchived: chat.isArchived,
      },
    }));
};

/**
 * Convert properties to property contexts
 */
export const propertiesToContexts = (properties: ScoutedProperty[]): ContextItem[] => {
  return properties.map(property => ({
    id: `property-${property.listing_id || property.address}`,
    type: 'property' as const,
    title: property.address,
    subtitle: property.price ? `$${property.price.toLocaleString()}` : undefined,
    icon: '🏠',
    timestamp: property.timestamp || new Date().toISOString(),
    preview: property.description?.substring(0, 100),
    metadata: {
      address: property.address,
      price: property.price,
      propertyId: property.id,
      listingId: property.listing_id,
    },
  }));
};

/**
 * Convert uploaded files to file contexts
 */
export const filesToContexts = (files: Array<{
  name: string;
  type: string;
  size: number;
  url?: string;
  timestamp?: string;
}>): ContextItem[] => {
  return files.map((file, index) => ({
    id: `file-${file.name}-${file.timestamp || index}`,
    type: 'file' as const,
    title: file.name,
    subtitle: `${(file.size / 1024).toFixed(1)} KB`,
    icon: getFileIcon(file.type),
    timestamp: file.timestamp || new Date().toISOString(),
    metadata: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: file.url,
    },
  }));
};

/**
 * Convert reports to report contexts
 */
export const reportsToContexts = (reports: Array<{
  id: string;
  title: string;
  description?: string;
  type?: string;
  generatedAt?: string;
  properties?: string[];
}>): ContextItem[] => {
  return reports.map(report => ({
    id: `report-${report.id}`,
    type: 'report' as const,
    title: report.title,
    subtitle: report.description,
    icon: '📊',
    timestamp: report.generatedAt || new Date().toISOString(),
    metadata: {
      reportType: report.type,
      generatedAt: report.generatedAt,
      properties: report.properties,
    },
  }));
};

/**
 * Get icon for file type
 */
const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
  if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
  return '📎';
};

/**
 * Extract properties from messages (from tool results)
 */
export const extractPropertiesFromMessages = (messages: any[]): ScoutedProperty[] => {
  const properties: ScoutedProperty[] = [];
  
  messages.forEach(message => {
    if (message.role === 'assistant' && message.tools) {
      message.tools.forEach((tool: any) => {
        // Check scout_properties tool
        if (tool.name === 'scout_properties' && tool.result?.properties) {
          properties.push(...tool.result.properties);
        }
        // Check other property-related tools
        if (tool.data?.properties && Array.isArray(tool.data.properties)) {
          properties.push(...tool.data.properties);
        }
      });
    }
  });
  
  // Remove duplicates based on address or listing_id
  const uniqueProperties = properties.filter((property, index, self) => {
    const identifier = property.listing_id || property.address;
    return index === self.findIndex(p => (p.listing_id || p.address) === identifier);
  });
  
  return uniqueProperties;
};

/**
 * Create custom contexts for preferences, strategies, locations, etc.
 */
export const createCustomContexts = (preferences: {
  location?: string;
  strategy?: string;
  budget?: { min?: number; max?: number };
  [key: string]: any;
}): ContextItem[] => {
  const contexts: ContextItem[] = [];

  if (preferences.location) {
    contexts.push({
      id: 'custom-location',
      type: 'custom',
      title: preferences.location,
      subtitle: 'Preferred location',
      icon: '📍',
      timestamp: new Date().toISOString(),
      metadata: {
        category: 'location',
        value: preferences.location,
      },
    });
  }

  if (preferences.strategy) {
    contexts.push({
      id: 'custom-strategy',
      type: 'custom',
      title: preferences.strategy,
      subtitle: 'Investment strategy',
      icon: '💼',
      timestamp: new Date().toISOString(),
      metadata: {
        category: 'strategy',
        value: preferences.strategy,
      },
    });
  }

  if (preferences.budget) {
    const budgetLabel = preferences.budget.min && preferences.budget.max
      ? `$${preferences.budget.min.toLocaleString()} - $${preferences.budget.max.toLocaleString()}`
      : preferences.budget.min
      ? `From $${preferences.budget.min.toLocaleString()}`
      : preferences.budget.max
      ? `Up to $${preferences.budget.max.toLocaleString()}`
      : 'Budget';

    contexts.push({
      id: 'custom-budget',
      type: 'custom',
      title: budgetLabel,
      subtitle: 'Budget range',
      icon: '💰',
      timestamp: new Date().toISOString(),
      metadata: {
        category: 'preference',
        value: preferences.budget,
      },
    });
  }

  return contexts;
};
