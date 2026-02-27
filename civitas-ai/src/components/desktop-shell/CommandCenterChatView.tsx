/**
 * CommandCenterChatView - Wraps ChatTabView.
 *
 * Previously integrated a split-screen Property Command Center layout.
 * That layout is disabled; this component now passes all props straight
 * through to ChatTabView.
 */

import React from 'react';
import type { Message } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import type { ThinkingStep } from '@/hooks/useThinkingQueue';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import { ChatTabView } from './ChatTabView';

interface CommandCenterChatViewProps {
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
  thinkingSteps?: ThinkingStep[];
  thinkingIsActive?: boolean;
  thinkingIsDone?: boolean;
  thinkingElapsed?: number;
  nativeThinkingText?: string | null;
  activeModelLabel?: string;
  onRefresh?: (messageId: string) => void;
  onViewDetails?: (property: any) => void;
  onCancel?: () => void;
  error?: string | null;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onNavigateBranch?: (messageId: string, direction: 'prev' | 'next') => void;
  chatTitle?: string;
  chatId?: string;
  onPinChat?: (chatId: string) => void;
  onArchiveChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  isPinned?: boolean;
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
  isTemporary?: boolean;
  onToggleTemporary?: () => void;
  onNavigateToTeams?: () => void;
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
  currentMode: any;
  onModeChange: (mode: any) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  onVoiceTurn?: (role: 'user' | 'assistant', content: string) => void;
  onVoiceStart?: () => void;
  conversationId?: string;
  onOpenIntegrations?: () => void;
  onSendComplete?: (summary: string) => void;
  onBuyTokenPack?: () => void;
}

export const CommandCenterChatView: React.FC<CommandCenterChatViewProps> = (props) => {
  return <ChatTabView {...props} currentMode={props.currentMode} onModeChange={props.onModeChange} />;
};
