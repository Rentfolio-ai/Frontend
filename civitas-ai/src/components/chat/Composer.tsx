// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Paperclip, ArrowUp, MapPin, Square, Smile } from 'lucide-react';
import { QuickPreferencesChip } from './QuickPreferencesChip';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { AttachmentPreview, generateThumbnail } from '../FileAttachment';
import { EmojiPicker } from './EmojiPicker';




export interface ComposerProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'rows' | 'disabled' | 'onKeyDown' | 'placeholder'> {
  onSend?: (message: string) => void;
  onStop?: () => void;
  onAttach?: (file: File) => void;
  attachment?: File | null;
  onClearAttachment?: () => void;
  onOpenPreferences?: () => void;
}

export interface ComposerRef {
  setInput: (text: string) => void;
  focus: () => void;
}

export const Composer = forwardRef<ComposerRef, ComposerProps>(({ onSend, onStop, onAttach, attachment, onClearAttachment, onOpenPreferences, ...rest }, ref) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [shouldFocusAfterSet, setShouldFocusAfterSet] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotating placeholder suggestions
  const placeholders = [
    "Ask, search, or make anything...",
    "Find investment properties in San Francisco...",
    "Analyze this property for STR potential...",
    "Compare these properties side by side...",
    "What's the cap rate for this deal?...",
    "Generate a full investment report...",
    "Search for ADU-friendly properties...",
    "Calculate my cash-on-cash return...",
    "Find flip opportunities under $500k...",
  ];

  const { updateClientLocation, clientLocation } = usePreferencesStore();

  const allCommands = useMemo(() => {
    const systemCommands = [
      { id: '/analyze', label: '/analyze - Market analysis', icon: '📈', content: null },
      { id: '/compare', label: '/compare - Property comparison', icon: '⚖️', content: null },
      { id: '/report', label: '/report - Generate report', icon: '📄', content: null },
      { id: '/search', label: '/search - Find properties', icon: '🔍', content: null },
    ];

    return systemCommands;
  }, []);

  const [filteredCommands, setFilteredCommands] = useState(allCommands);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    if (shouldFocusAfterSet && textareaRef.current) {
      textareaRef.current.focus();
      setShouldFocusAfterSet(false);
    }
  }, [shouldFocusAfterSet]);

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  useImperativeHandle(ref, () => ({
    setInput: (text: string) => {
      setMessage(text);
      setShouldFocusAfterSet(true);
    },
    focus: () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      if (onStop) onStop();
      return;
    }

    if ((!message.trim() && !attachment)) return;

    setIsLoading(true);
    if (onSend) onSend(message);

    setMessage('');
    if (onClearAttachment) onClearAttachment();

    // Reset local loading state after a delay if parent doesn't unset it (safety fallback)
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to send
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as any);
      return;
    }

    // Enter without shift to send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }

    if (showCommands) {
      if (e.key === 'Escape') {
        setShowCommands(false);
      }
      // Add arrow key navigation later if needed
    } else {
      if (e.key === '/' && message === '') {
        setShowCommands(true);
        setFilteredCommands(allCommands);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.startsWith('/')) {
      const searchTerm = value.toLowerCase();
      const matches = allCommands.filter((cmd: { id: string; label: string; icon: string; content: string | null; trigger?: string; }) =>
        // Match system commands by ID (e.g. /analyze)
        (cmd.id.startsWith('/') && cmd.id.toLowerCase().startsWith(searchTerm)) ||
        // Match user presets by trigger (e.g. /flip)
        (cmd.trigger && cmd.trigger.toLowerCase().startsWith(searchTerm))
      );
      setFilteredCommands(matches);
      setShowCommands(matches.length > 0);
    } else {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (cmdId: string) => {
    const cmd = allCommands.find((c: any) => c.id === cmdId);
    if (!cmd) return;

    if (cmd.content) {
      // User Preset: Replace with content
      setMessage(cmd.content);
    } else {
      // System Command: Append command
      setMessage(cmd.id + ' ');
    }

    setShowCommands(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Generate thumbnail for images
      if (file.type.startsWith('image/')) {
        try {
          const thumb = await generateThumbnail(file);
          setThumbnail(thumb);
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
          setThumbnail(undefined);
        }
      } else {
        setThumbnail(undefined);
      }

      if (onAttach) onAttach(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessage(message + emoji);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);

    setMessage(newMessage);
    setShowEmojiPicker(false);

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // Reverse geocode coordinates to city name
  const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    try {
      // Check cache first
      const cacheKey = `geocode_${lat.toFixed(4)}_${lon.toFixed(4)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { cityName, timestamp } = JSON.parse(cached);
        // Cache for 7 days
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          return cityName;
        }
      }

      // Fetch from Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
        {
          headers: {
            'User-Agent': 'Civitas AI (contact@civitas.ai)' // Required by Nominatim
          }
        }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();

      // Extract city name (try different fields)
      const cityName = data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.name ||
        'Unknown Location';

      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({
        cityName,
        timestamp: Date.now()
      }));

      return cityName;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const handleDetectLocation = () => {
    if (isLocating) return;

    setIsLocating(true);
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // First update with coordinates
        updateClientLocation({ latitude, longitude, accuracy });

        // Then fetch city name
        const cityName = await reverseGeocode(latitude, longitude);

        // Update with city name
        if (cityName) {
          updateClientLocation({ latitude, longitude, accuracy, cityName });
        }

        setIsLocating(false);
      },
      (error) => {
        // Provide user-friendly error messages
        let errorMessage = "Error detecting location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "An unknown error occurred while detecting location.";
        }

        console.error(errorMessage, error);
        setIsLocating(false);

        // Optional: Show toast/notification to user
        // toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="relative">
      {showCommands && (
        <div className="absolute bottom-full mb-2 w-full bg-[#1A1D24] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredCommands.map((cmd: any) => (
            <button
              key={cmd.id}
              onClick={() => handleCommandSelect(cmd.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">
                {cmd.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{cmd.label.split(' - ')[0]}</div>
                <div className="text-xs text-white/40 truncate">{cmd.label.split(' - ')[1]}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="relative rounded-xl bg-[#2C2C2C] border border-white/[0.08] hover:border-white/[0.15] focus-within:border-white/[0.2] transition-colors shadow-lg">

        {attachment && (
          <div className="mx-4 mt-4">
            <div className="inline-block w-32">
              <AttachmentPreview
                file={attachment}
                thumbnail={thumbnail}
                onRemove={() => {
                  if (onClearAttachment) onClearAttachment();
                  setThumbnail(undefined);
                }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex flex-col">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[placeholderIndex]}
            className="w-full bg-transparent text-white placeholder-white/40 px-4 py-3.5 min-h-[52px] max-h-[160px] resize-none focus:outline-none custom-scrollbar text-[15px] leading-normal"
            style={{ height: '52px' }}
            disabled={isLoading}
            {...rest}
          />


          <div className="px-3 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Quick Preferences Chip */}
              {onOpenPreferences && (
                <QuickPreferencesChip 
                  onOpenFullPreferences={onOpenPreferences}
                  className="mr-1"
                />
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-md text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                title="Attach file"
                disabled={isLoading}
              >
                <Paperclip className="w-[18px] h-[18px]" />
              </button>

              {/* Emoji Picker Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 rounded-md text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                  title="Add emoji"
                  disabled={isLoading}
                >
                  <Smile className="w-[18px] h-[18px]" />
                </button>
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  onEmojiSelect={handleEmojiSelect}
                />
              </div>

              {/* Location Button */}
              {clientLocation?.cityName ? (
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLoading || isLocating}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.06] text-white/70 hover:bg-white/[0.08] hover:text-white/90 transition-colors text-[11px]"
                  title={`${clientLocation.cityName}`}
                >
                  <MapPin className="w-3 h-3" />
                  <span className="max-w-[80px] truncate">{clientLocation.cityName}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="p-1.5 rounded-md text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                  title="Detect location"
                  disabled={isLoading || isLocating}
                >
                  <MapPin className={`w-[18px] h-[18px] ${isLocating ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={(!message.trim() && !attachment && !isLoading) || (isLoading && !onStop)}
              className={`p-2 rounded-lg transition-all ${isLoading
                ? 'bg-white/[0.08] hover:bg-white/[0.12] text-white/80'
                : message.trim() || attachment
                  ? 'bg-white hover:bg-white/90 text-black shadow-sm'
                  : 'bg-white/[0.06] text-white/30 cursor-not-allowed'
                }`}
            >
              {isLoading && onStop ? (
                <Square className="w-[18px] h-[18px] fill-current" />
              ) : (
                <ArrowUp className="w-[18px] h-[18px] stroke-[2.5]" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
