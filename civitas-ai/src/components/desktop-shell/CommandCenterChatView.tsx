/**
 * CommandCenterChatView - Integrates Chat with Property Command Center
 * 
 * When property results are displayed:
 * - Switches to split-screen layout
 * - Shows PropertyGrid on left (60%)
 * - Shows IntelligencePane on right (40%)
 * - Shows ComparisonDock at bottom
 * 
 * When no properties:
 * - Shows normal chat view
 */

import React, { useState, useMemo, useRef } from 'react';
import type { Message } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import { CommandCenterLayout } from '../../layouts/CommandCenterLayout';
import { PropertyGrid } from '../property/PropertyGrid';
import { IntelligencePane } from '../property/IntelligencePane';
import { ComparisonDock } from '../property/ComparisonDock';
import { ContextMenu, useContextMenu, createPropertyContextMenuItems } from '../primitives/ContextMenu';
import { ChatTabView } from './ChatTabView';
import { Composer, type ComposerRef } from '../chat/Composer';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface CommandCenterChatViewProps {
  // Chat props
  messages: Message[];
  isLoading: boolean;
  userName?: string;
  userAvatar?: string;
  selectedState?: string;
  onSendMessage: (message: string) => void;
  onAction?: (actionValue: string, actionContext?: any) => void;
  onAttach?: (file: File) => void;
  attachment?: File | null;
  onClearAttachment?: () => void;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onNavigateToReports?: () => void;
  onNavigateToInvestmentPreferences?: () => void;
  onNavigateToUpgrade?: () => void;
  onOpenSidebar?: () => void;
  onNewChat?: () => void;
  thinking?: ThinkingState | null;
  completedTools?: CompletedTool[];
  reasoningSteps?: any[];
  // Thinking steps (ChatGPT-style collapsible thinking)
  thinkingSteps?: ThinkingStep[];
  thinkingIsActive?: boolean;
  thinkingIsDone?: boolean;
  thinkingElapsed?: number;
  onRefresh?: (messageId: string) => void;
  onViewDetails?: (property: any) => void;
  onCancel?: () => void;
  error?: string | null;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onNavigateBranch?: (messageId: string, direction: 'prev' | 'next') => void;
  // Chat management
  chatTitle?: string;
  chatId?: string;
  onPinChat?: (chatId: string) => void;
  onArchiveChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  isPinned?: boolean;
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
  isTemporary?: boolean;
  onToggleTemporary?: () => void;

  // Command Center props
  commandCenter: {
    selectedPropertyId: string | null;
    comparisonDockProperties: ScoutedProperty[];
    intelligencePaneView: 'details' | 'comparison';
    isPanePinned: boolean;
  };
  selectProperty: (property: ScoutedProperty) => void;
  addToComparisonDock: (property: ScoutedProperty) => void;
  removeFromComparisonDock: (propertyId: string) => void;
  clearComparisonDock: () => void;
  startComparison: () => void;
  togglePanePin: () => void;
  currentMode: any; // typed in ChatTabView
  onModeChange: (mode: any) => void;
  // Voice mode
  onVoiceTurn?: (role: 'user' | 'assistant', content: string) => void;
  onVoiceStart?: () => void;
  onVoiceNoteSaved?: (noteId: string, summary: any, details: { duration: number; persona: string; transcript: any[] }) => void;
  conversationId?: string;
}

export const CommandCenterChatView: React.FC<CommandCenterChatViewProps> = (props) => {
  const {
    messages,
    commandCenter,
    selectProperty,
    addToComparisonDock,
    removeFromComparisonDock,
    clearComparisonDock,
    startComparison,
    togglePanePin,
    onOpenDealAnalyzer,
    onSendMessage,
    onCancel,
    onAttach,
    attachment,
    onClearAttachment,
    onNavigateToInvestmentPreferences,
    isLoading,
    currentMode,
    onModeChange,
    onVoiceNoteSaved,
  } = props;

  const [contextProperty, setContextProperty] = useState<ScoutedProperty | null>(null);
  const { isOpen: isContextMenuOpen, position: contextMenuPosition, openContextMenu, closeContextMenu } = useContextMenu();
  const composerRef = useRef<ComposerRef>(null);
  const prefsStore = usePreferencesStore();

  // Extract properties from the latest tool results in messages
  const properties = useMemo(() => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'assistant') return [];

    // Look for property data in tool results
    const tools = latestMessage.tools || [];
    for (const tool of tools) {
      if (tool.name === 'scout_properties' && tool.result?.properties) {
        return tool.result.properties;
      }
      if (tool.data?.properties && Array.isArray(tool.data.properties)) {
        return tool.data.properties;
      }
    }

    return [];
  }, [messages]);

  const hasProperties = properties.length > 0;

  // Selected property object
  const selectedProperty = useMemo(() => {
    if (!commandCenter.selectedPropertyId) return null;
    return properties.find(
      (p: ScoutedProperty) => (p.listing_id || p.address) === commandCenter.selectedPropertyId
    ) || null;
  }, [properties, commandCenter.selectedPropertyId]);

  // Handlers
  const handleSelectProperty = (property: ScoutedProperty) => {
    selectProperty(property);
  };

  const handleDragStart = (property: ScoutedProperty) => {
    console.log('[CommandCenter] Drag started for property:', property.address);
  };

  const handleContextMenu = (property: ScoutedProperty, event: React.MouseEvent) => {
    setContextProperty(property);
    openContextMenu(event);
  };

  const handleDrop = (e: React.DragEvent) => {
    const propertyId = e.dataTransfer.getData('propertyId');
    const propertyData = e.dataTransfer.getData('property');

    if (propertyData) {
      try {
        const property = JSON.parse(propertyData);
        addToComparisonDock(property);
      } catch (error) {
        console.error('[CommandCenter] Failed to parse dropped property:', error);
      }
    }
  };

  // Context menu items
  const contextMenuItems = useMemo(() => {
    if (!contextProperty) return [];

    return createPropertyContextMenuItems(contextProperty, {
      onViewDetails: () => {
        selectProperty(contextProperty);
      },
      on3DView: () => {
        selectProperty(contextProperty);
        // Future: Switch to 3D view tab
      },
      onAddToComparison: () => {
        addToComparisonDock(contextProperty);
      },
      onAddToPortfolio: () => {
        console.log('[CommandCenter] Add to portfolio:', contextProperty);
        // Future: Implement portfolio integration
      },
      onCopyLink: () => {
        // Copy property URL to clipboard
        const url = `${window.location.origin}/property/${contextProperty.listing_id || encodeURIComponent(contextProperty.address)}`;
        navigator.clipboard.writeText(url);
      },
      onBookmark: () => {
        console.log('[CommandCenter] Bookmark:', contextProperty);
        // Future: Implement bookmarking
      },
      onAnalyzeDeal: onOpenDealAnalyzer
        ? () => {
          onOpenDealAnalyzer(
            contextProperty.listing_id,
            'STR',
            contextProperty.price,
            contextProperty.address
          );
        }
        : undefined,
    });
  }, [contextProperty, selectProperty, addToComparisonDock, onOpenDealAnalyzer]);

  // DISABLED: Command Center split-screen layout
  // Always show simple chat view instead of complex PropertyGrid layout
  // This fixes React hooks errors and provides a cleaner, simpler UI

  return <ChatTabView {...props} currentMode={currentMode} onModeChange={onModeChange} />;
};

