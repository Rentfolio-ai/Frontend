// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Paperclip, ArrowUp, MapPin, Square } from 'lucide-react';
import { QuickPreferencesChip } from './QuickPreferencesChip';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { AttachmentPreview, generateThumbnail } from '../FileAttachment';




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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      <div className={`relative transition-all duration-300 rounded-3xl ${isLoading ? 'bg-black/20 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]' : 'bg-transparent'
        }`}>

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
            placeholder="Ask about properties, markets, or analyze a deal..."
            className="w-full bg-transparent text-white placeholder-white/40 px-6 py-5 min-h-[60px] max-h-[160px] resize-none focus:outline-none custom-scrollbar text-[15px] leading-relaxed font-light"
            style={{ height: '60px' }}
            disabled={isLoading}
            {...rest}
          />

          <div className="px-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <QuickPreferencesChip onOpenFullPreferences={onOpenPreferences || (() => { })} />

              <div className="h-4 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent mx-2" />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 -ml-2 rounded-xl text-white/50 hover:text-white transition-all duration-200 group hover:scale-[1.15] active:scale-95"
                title="Attach file - Upload photos, reports, or docs"
                disabled={isLoading}
              >
                <Paperclip className="w-5 h-5 group-hover:drop-shadow-[0_0_10px_rgba(96,165,250,0.7)] transition-all" />
              </button>

              {/* Location Button or City Badge */}
              {clientLocation?.cityName ? (
                // Show city badge when location is detected
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLoading || isLocating}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-all text-[11px] font-medium group"
                  title={`${clientLocation.cityName}\nLat: ${clientLocation.latitude.toFixed(4)}, Lon: ${clientLocation.longitude.toFixed(4)}${clientLocation.accuracy ? `\nAccuracy: ±${Math.round(clientLocation.accuracy)}m` : ''}`}
                >
                  <MapPin className="w-3 h-3 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                  <span className="max-w-[100px] truncate">{clientLocation.cityName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </button>
              ) : (
                // Show icon button when no location
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className={`p-2 rounded-xl transition-all duration-200 group relative hover:scale-[1.15] active:scale-95 ${clientLocation
                    ? 'text-blue-400'
                    : 'text-white/50 hover:text-white'
                    }`}
                  title={clientLocation ? "Location detected - Click to update" : "Detect location - Auto-fill your current city"}
                  disabled={isLoading || isLocating}
                >
                  <MapPin className={`w-5 h-5 transition-all ${isLocating ? 'animate-pulse' : ''} ${clientLocation ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'group-hover:drop-shadow-[0_0_10px_rgba(96,165,250,0.7)]'}`} />
                  {clientLocation && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-black animate-pulse shadow-lg shadow-blue-500/50" />
                  )}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={(!message.trim() && !attachment && !isLoading) || (isLoading && !onStop)}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 group relative overflow-hidden ${isLoading
                ? 'bg-white/10 hover:bg-white/15 text-white scale-100'
                : message.trim() || attachment
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30 text-white scale-100'
                  : 'bg-white/5 text-white/20 scale-95 cursor-not-allowed'
                }`}
            >
              {/* Shimmer effect on hover */}
              {(message.trim() || attachment) && !isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              )}
              {isLoading && onStop ? (
                <Square className="w-3 h-3 fill-current relative z-10" />
              ) : (
                <ArrowUp className="w-4 h-4 relative z-10" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
