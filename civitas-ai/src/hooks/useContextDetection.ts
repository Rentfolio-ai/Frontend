// FILE: src/hooks/useContextDetection.ts
// Hook for detecting @ character and managing context picker state

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ContextDetection, ContextItem } from '../types/context';

interface UseContextDetectionOptions {
  /** Trigger character (default: @) */
  trigger?: string;
  
  /** Callback when context is selected */
  onContextSelect?: (context: ContextItem) => void;
  
  /** Callback when picker should open */
  onPickerOpen?: () => void;
  
  /** Callback when picker should close */
  onPickerClose?: () => void;
}

interface UseContextDetectionReturn {
  /** Current detection state */
  detection: ContextDetection;
  
  /** Whether picker should be shown */
  showPicker: boolean;
  
  /** Current query after @ */
  query: string;
  
  /** Handle input change */
  handleInputChange: (value: string, selectionStart: number) => void;
  
  /** Insert a context at the current position */
  insertContext: (context: ContextItem) => string;
  
  /** Close the picker */
  closePicker: () => void;
  
  /** Reset detection state */
  reset: () => void;
}

/**
 * Hook to detect @ character and manage context picker
 */
export const useContextDetection = (
  options: UseContextDetectionOptions = {}
): UseContextDetectionReturn => {
  const { 
    trigger = '@',
    onContextSelect,
    onPickerOpen,
    onPickerClose,
  } = options;

  const [detection, setDetection] = useState<ContextDetection>({
    hasAt: false,
    atPosition: -1,
    query: '',
    isActive: false,
  });

  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Store the last @ position to track context
  const lastAtPositionRef = useRef(-1);

  /**
   * Detect @ character and extract query
   */
  const detectAt = useCallback((value: string, cursor: number): ContextDetection => {
    // Find the last @ before or at cursor position
    let atPosition = -1;
    
    for (let i = cursor - 1; i >= 0; i--) {
      if (value[i] === trigger) {
        // Check if this @ is at the start or preceded by whitespace
        if (i === 0 || /\s/.test(value[i - 1])) {
          atPosition = i;
          break;
        }
      }
      // Stop if we hit whitespace without finding @
      if (/\s/.test(value[i])) {
        break;
      }
    }

    if (atPosition === -1) {
      return {
        hasAt: false,
        atPosition: -1,
        query: '',
        isActive: false,
      };
    }

    // Extract query between @ and cursor
    const query = value.substring(atPosition + 1, cursor);
    
    // Check if there's whitespace in the query (means @ is no longer active)
    const hasWhitespace = /\s/.test(query);

    return {
      hasAt: true,
      atPosition,
      query: hasWhitespace ? '' : query,
      isActive: !hasWhitespace && cursor > atPosition,
    };
  }, [trigger]);

  /**
   * Handle input change and update detection
   */
  const handleInputChange = useCallback((value: string, selectionStart: number) => {
    setInputValue(value);
    setCursorPosition(selectionStart);

    const newDetection = detectAt(value, selectionStart);
    setDetection(newDetection);

    // Show picker if @ is active
    if (newDetection.isActive && !showPicker) {
      setShowPicker(true);
      lastAtPositionRef.current = newDetection.atPosition;
      onPickerOpen?.();
    } else if (!newDetection.isActive && showPicker) {
      setShowPicker(false);
      onPickerClose?.();
    }
  }, [detectAt, showPicker, onPickerOpen, onPickerClose]);

  /**
   * Insert a context at the detected @ position
   * Returns the new input value with context inserted
   */
  const insertContext = useCallback((context: ContextItem): string => {
    if (!detection.hasAt || detection.atPosition === -1) {
      return inputValue;
    }

    // Create context mention string
    const mention = `@${context.title}`;
    
    // Replace from @ position to cursor with the mention
    const before = inputValue.substring(0, detection.atPosition);
    const after = inputValue.substring(cursorPosition);
    
    // Add space after mention if there isn't one
    const needsSpace = after.length > 0 && !/^\s/.test(after);
    const newValue = before + mention + (needsSpace ? ' ' : '') + after;

    // Update state
    setInputValue(newValue);
    setShowPicker(false);
    setDetection({
      hasAt: false,
      atPosition: -1,
      query: '',
      isActive: false,
    });

    // Notify
    onContextSelect?.(context);
    onPickerClose?.();

    return newValue;
  }, [detection, inputValue, cursorPosition, onContextSelect, onPickerClose]);

  /**
   * Close the picker
   */
  const closePicker = useCallback(() => {
    setShowPicker(false);
    onPickerClose?.();
  }, [onPickerClose]);

  /**
   * Reset detection state
   */
  const reset = useCallback(() => {
    setDetection({
      hasAt: false,
      atPosition: -1,
      query: '',
      isActive: false,
    });
    setShowPicker(false);
    setInputValue('');
    setCursorPosition(0);
    lastAtPositionRef.current = -1;
  }, []);

  return {
    detection,
    showPicker,
    query: detection.query,
    handleInputChange,
    insertContext,
    closePicker,
    reset,
  };
};

/**
 * Hook to extract selected contexts from input text
 * Useful for parsing @mentions before sending to backend
 */
export const useExtractContexts = () => {
  const extractContexts = useCallback((text: string, availableContexts: ContextItem[]): {
    contexts: ContextItem[];
    cleanedText: string;
  } => {
    const mentionRegex = /@([^\s@]+)/g;
    const matches = Array.from(text.matchAll(mentionRegex));
    
    const contexts: ContextItem[] = [];
    
    matches.forEach(match => {
      const mentionText = match[1];
      
      // Find matching context
      const context = availableContexts.find(c => 
        c.title.toLowerCase() === mentionText.toLowerCase() ||
        c.title.toLowerCase().includes(mentionText.toLowerCase())
      );
      
      if (context && !contexts.find(c => c.id === context.id)) {
        contexts.push(context);
      }
    });

    // For now, keep the mentions in the text
    // Could optionally clean them out: const cleanedText = text.replace(mentionRegex, '').trim();
    const cleanedText = text;

    return { contexts, cleanedText };
  }, []);

  return { extractContexts };
};
