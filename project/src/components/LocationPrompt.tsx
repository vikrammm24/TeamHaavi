import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldAlert, Crosshair, X } from 'lucide-react';
import { useLocation } from './RealtimeLocation';

const STORAGE_KEYS = {
  dismissed: 'locationPromptDismissed',
  useNearby: 'useNearbyContent',
} as const;

const getUseNearbyDefault = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.useNearby);
  if (raw === null) return true; // default on
  return raw === 'true';
};

const LocationPrompt: React.FC = () => {
  const { permission, coords, start, stop, error } = useLocation();
  const [dismissed, setDismissed] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.dismissed) === 'true');
  const [useNearby, setUseNearby] = useState<boolean>(() => getUseNearbyDefault());

  const shouldShow = useMemo(() => {
    if (dismissed) return false;
    if (permission === 'granted' && coords) return false;
    // show for prompt or denied
    return permission === 'prompt' || permission === 'denied' || (!coords && permission !== 'unsupported');
  }, [dismissed, permission, coords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.useNearby, String(useNearby));
  }, [useNearby]);

  const handleEnable = () => {
    start();
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEYS.dismissed, 'true');
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border"
          >
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Enable Location</h3>
              </div>
              <button onClick={handleDismiss} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {permission === 'denied' ? (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  <ShieldAlert className="w-5 h-5 mt-0.5" />
                  <div>
                    Location access is blocked in your browser. Please enable it in your browser site settings for better nearby content.
                  </div>
                </div>
              ) : (
                <div className="text-gray-700 text-sm">
                  Allow location to personalize your dashboard with nearby reports, community activity, and map data.
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  id="useNearbyToggle"
                  type="checkbox"
                  checked={useNearby}
                  onChange={(e) => setUseNearby(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="useNearbyToggle" className="text-sm text-gray-700">
                  Use my location to show nearby content
                </label>
              </div>

              {error && (
                <div className="text-xs text-red-600">{error}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  Not now
                </button>
                <button
                  onClick={handleEnable}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Crosshair className="w-4 h-4" />
                  Enable location
                </button>
              </div>

              {coords && (
                <div className="text-xs text-gray-500">
                  Current: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} {coords.accuracy ? `(±${Math.round(coords.accuracy)}m)` : ''}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationPrompt;
