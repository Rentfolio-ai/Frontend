import { useCallback, useRef, useEffect } from 'react';
import type { Message } from '../types/chat';
import type { TabType, AgentMode } from './useDesktopShell';
import { usePreferencesStore } from '../stores/preferencesStore';

// ── Types ────────────────────────────────────────────────────────────

export interface AppElement {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
}

export interface AppSnapshot {
  activeTab: TabType;
  currentMode: AgentMode;
  composerText: string;
  isStreaming: boolean;
  messageCount: number;
  lastAssistantMessage: string | null;
  lastToolsUsed: string[];
  bookmarkCount: number;
  reportsCount: number;
  dealsPipeline: { active: number; under_contract: number; closed: number; lost: number } | null;
  favoriteMarkets: string[];
  budgetRange: { min: number; max: number } | null;
  defaultStrategy: string | null;
  elements: AppElement[];
}

// ── Hook ─────────────────────────────────────────────────────────────

interface UseAppStateBridgeOptions {
  activeTab: TabType;
  currentMode: AgentMode;
  isStreaming: boolean;
  messages: Message[];
  bookmarkCount: number;
  reportsCount?: number;
  dealsPipeline?: { active: number; under_contract: number; closed: number; lost: number };
}

export function useAppStateBridge({
  activeTab,
  currentMode,
  isStreaming,
  messages,
  bookmarkCount,
  reportsCount = 0,
  dealsPipeline,
}: UseAppStateBridgeOptions) {
  const { favoriteMarkets, budgetRange, defaultStrategy } = usePreferencesStore();

  // Refs track latest values so getSnapshot never reads stale closures
  const activeTabRef = useRef(activeTab);
  const currentModeRef = useRef(currentMode);
  const isStreamingRef = useRef(isStreaming);
  const messagesRef = useRef(messages);
  const bookmarkCountRef = useRef(bookmarkCount);
  const reportsCountRef = useRef(reportsCount);
  const dealsPipelineRef = useRef(dealsPipeline);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { currentModeRef.current = currentMode; }, [currentMode]);
  useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { bookmarkCountRef.current = bookmarkCount; }, [bookmarkCount]);
  useEffect(() => { reportsCountRef.current = reportsCount; }, [reportsCount]);
  useEffect(() => { dealsPipelineRef.current = dealsPipeline; }, [dealsPipeline]);

  const getSnapshot = useCallback((): AppSnapshot => {
    const msgs = messagesRef.current;

    // Find last assistant message
    let lastAssistantMessage: string | null = null;
    let lastToolsUsed: string[] = [];

    for (let i = msgs.length - 1; i >= 0; i--) {
      const msg = msgs[i];
      if (msg.role === 'assistant' && msg.content) {
        lastAssistantMessage = msg.content.slice(0, 500);
        if (msg.tools && Array.isArray(msg.tools)) {
          lastToolsUsed = msg.tools
            .map((t: any) => t.title || t.kind || '')
            .filter(Boolean);
        }
        break;
      }
    }

    // Collect interactive elements with data-wand-id
    const elements: AppElement[] = [];
    try {
      const nodes = document.querySelectorAll('[data-wand-id]');
      nodes.forEach((node) => {
        const el = node as HTMLElement;
        elements.push({
          id: el.dataset.wandId || '',
          type: el.dataset.wandType || el.tagName.toLowerCase(),
          label: el.dataset.wandLabel || el.textContent?.trim().slice(0, 50) || '',
          enabled: !el.hasAttribute('disabled') && !el.classList.contains('disabled'),
        });
      });
    } catch {
      // SSR safety
    }

    return {
      activeTab: activeTabRef.current,
      currentMode: currentModeRef.current,
      composerText: '',
      isStreaming: isStreamingRef.current,
      messageCount: msgs.length,
      lastAssistantMessage,
      lastToolsUsed,
      bookmarkCount: bookmarkCountRef.current,
      reportsCount: reportsCountRef.current,
      dealsPipeline: dealsPipelineRef.current || null,
      favoriteMarkets: favoriteMarkets || [],
      budgetRange: budgetRange || null,
      defaultStrategy: defaultStrategy || null,
      elements,
    };
  }, [favoriteMarkets, budgetRange, defaultStrategy]);

  const getUserPreferences = useCallback(() => {
    return {
      favoriteMarkets: favoriteMarkets || [],
      budgetRange: budgetRange || null,
      defaultStrategy: defaultStrategy || null,
    };
  }, [favoriteMarkets, budgetRange, defaultStrategy]);

  return { getSnapshot, getUserPreferences };
}
