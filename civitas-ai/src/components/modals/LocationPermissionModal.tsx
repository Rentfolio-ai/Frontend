// FILE: src/components/modals/LocationPermissionModal.tsx
import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferencesStore } from '../../stores/preferencesStore';

const LOCATION_PERMISSION_KEY = 'vasthu-location-permission-asked';

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
          'User-Agent': 'Vasthu AI (contact@vasthu.ai)'
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

export const LocationPermissionModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { updateClientLocation } = usePreferencesStore();

  useEffect(() => {
    // Check if we've already asked for permission
    const hasAsked = localStorage.getItem(LOCATION_PERMISSION_KEY);
    
    if (!hasAsked) {
      // Show modal after a short delay (better UX)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    setIsRequesting(true);

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      handleDeny();
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

        // Mark as asked and close modal
        localStorage.setItem(LOCATION_PERMISSION_KEY, 'granted');
        setIsRequesting(false);
        setIsVisible(false);
      },
      (error) => {
        console.error('Location permission error:', error);
        localStorage.setItem(LOCATION_PERMISSION_KEY, 'denied');
        setIsRequesting(false);
        setIsVisible(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleDeny = () => {
    localStorage.setItem(LOCATION_PERMISSION_KEY, 'denied');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleDeny}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#18181c] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <button
                  onClick={handleDeny}
                  className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A27F]/20 to-[#C08B5C]/20 flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-[#D4A27F]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Enable Location</h3>
                    <p className="text-sm text-white/50 mt-0.5">For better property recommendations</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 pb-6">
                <p className="text-[15px] text-white/70 leading-relaxed">
                  Vasthu uses your location to show properties near you and provide more accurate market insights. You can change this anytime in settings.
                </p>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleDeny}
                    disabled={isRequesting}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={handleAllow}
                    disabled={isRequesting}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-[#D4A27F] to-[#C08B5C] hover:from-[#D4A27F] hover:to-[#D4A27F] text-white font-medium shadow-lg shadow-[#C08B5C]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRequesting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Requesting...
                      </span>
                    ) : (
                      'Allow Location'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
