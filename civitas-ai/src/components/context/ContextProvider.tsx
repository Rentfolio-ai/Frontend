/**
 * ContextProvider - Component that automatically populates context store
 * from various data sources in the application
 */

import { useEffect } from 'react';
import { useContextStore } from '../../stores/contextStore';
import type { ChatSession } from '../../hooks/useDesktopShell';
import type { ScoutedProperty } from '../../types/backendTools';
import {
  chatSessionsToContexts,
  propertiesToContexts,
  filesToContexts,
  reportsToContexts,
  createCustomContexts,
  extractPropertiesFromMessages,
} from '../../lib/contextUtils';

interface ContextProviderProps {
  /** Chat sessions from the application */
  chatSessions?: ChatSession[];
  
  /** Properties from the current chat or portfolio */
  properties?: ScoutedProperty[];
  
  /** Uploaded files */
  files?: Array<{
    name: string;
    type: string;
    size: number;
    url?: string;
    timestamp?: string;
  }>;
  
  /** Generated reports */
  reports?: Array<{
    id: string;
    title: string;
    description?: string;
    type?: string;
    generatedAt?: string;
    properties?: string[];
  }>;
  
  /** User preferences for custom contexts */
  preferences?: {
    location?: string;
    strategy?: string;
    budget?: { min?: number; max?: number };
    [key: string]: any;
  };
  
  /** Current chat messages (to extract properties from tool results) */
  currentMessages?: any[];
}

/**
 * Component that populates the context store with data from various sources
 * Should be placed high in the component tree to ensure contexts are available
 */
export const ContextProvider: React.FC<ContextProviderProps> = ({
  chatSessions = [],
  properties = [],
  files = [],
  reports = [],
  preferences = {},
  currentMessages = [],
}) => {
  const { setAvailableContexts } = useContextStore();

  useEffect(() => {
    const allContexts = [];

    // Convert chat sessions to contexts
    if (chatSessions.length > 0) {
      allContexts.push(...chatSessionsToContexts(chatSessions));
    }

    // Convert properties to contexts
    if (properties.length > 0) {
      allContexts.push(...propertiesToContexts(properties));
    }

    // Extract properties from current messages (tool results)
    if (currentMessages.length > 0) {
      const extractedProperties = extractPropertiesFromMessages(currentMessages);
      if (extractedProperties.length > 0) {
        allContexts.push(...propertiesToContexts(extractedProperties));
      }
    }

    // Convert files to contexts
    if (files.length > 0) {
      allContexts.push(...filesToContexts(files));
    }

    // Convert reports to contexts
    if (reports.length > 0) {
      allContexts.push(...reportsToContexts(reports));
    }

    // Create custom contexts from preferences
    const customContexts = createCustomContexts(preferences);
    if (customContexts.length > 0) {
      allContexts.push(...customContexts);
    }

    // Update the context store
    setAvailableContexts(allContexts);
  }, [
    chatSessions,
    properties,
    files,
    reports,
    preferences,
    currentMessages,
    setAvailableContexts,
  ]);

  // This component doesn't render anything
  return null;
};
