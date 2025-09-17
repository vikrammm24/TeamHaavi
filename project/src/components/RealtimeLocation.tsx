import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon paths for Leaflet in bundlers
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ============ Location Context (Realtime) ============
export type Coordinates = {
  lat: number;
  lng: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
};

export type LocationState = {
  coords: Coordinates | null;
  timestamp: number | null;
  permission: 'prompt' | 'granted' | 'denied' | 'unsupported';
  error: string | null;
  start: () => void;
  stop: () => void;
};

const LocationContext = createContext<LocationState | null>(null);

function useGeolocationWatcher(): LocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const clearWatch = () => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const start = () => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported');
      setError('Geolocation is not supported by this browser.');
      return;
    }
    try {
      clearWatch();
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? null,
            speed: pos.coords.speed ?? null,
            heading: pos.coords.heading ?? null,
          });
          setTimestamp(pos.timestamp);
          setError(null);
        },
        (err) => {
          setError(err.message || 'Failed to get location');
          // maintain prior coords; do not clear
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  };

  const stop = () => {
    clearWatch();
  };

  useEffect(() => {
    // Check permission (best-effort)
    try {
      // @ts-ignore: PermissionName may not include 'geolocation' in TS lib
      if (navigator?.permissions?.query) {
        // @ts-ignore
        navigator.permissions.query({ name: 'geolocation' }).then((p: any) => {
          setPermission(p.state);
          p.onchange = () => setPermission(p.state);
        }).catch(() => {});
      }
    } catch { /* noop */ }

    // Autostart tracking on mount
    start();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { coords, timestamp, permission, error, start, stop };
}

export const LocationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const state = useGeolocationWatcher();
  return (
    <LocationContext.Provider value={state}>{children}</LocationContext.Provider>
  );
};

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}

// ============ Map Components ============

type LatLngTuple = [number, number];

export type IssuePin = { id: string; title: string; lat: number; lng: number };

function FollowUserOnce({ when = 'granted' as const }) {
  // Center the map once on the user location when permission granted
  const map = useMap();
  const { coords, permission } = useLocation();
  const centeredRef = useRef(false);

  useEffect(() => {
    if (!centeredRef.current && permission !== 'denied' && coords) {
      map.setView([coords.lat, coords.lng], Math.max(map.getZoom(), 15), { animate: true });
      centeredRef.current = true;
    }
  }, [coords, map, permission]);
  return null;
}

function ClickToSelect({ onSelect }: { onSelect?: (latlng: LatLngTuple) => void }) {
  useMapEvents({
    click(e) {
      if (onSelect) onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export const MapWithRealtimeLocation: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  initialCenter?: LatLngTuple;
  height?: string | number;
  selectedPosition?: LatLngTuple | null;
  onSelectPosition?: (latlng: LatLngTuple) => void;
  issues?: IssuePin[];
  followUser?: boolean;
}> = ({
  className,
  style,
  initialCenter = [40.7128, -74.006] as LatLngTuple,
  height = 360,
  selectedPosition,
  onSelectPosition,
  issues = [],
  followUser = true,
}) => {
  const { coords } = useLocation();
  const center = useMemo<LatLngTuple>(() => {
    return coords ? [coords.lat, coords.lng] as LatLngTuple : initialCenter;
  }, [coords, initialCenter]);

  // Build draggable marker icon for selection (default is ok)

  return (
    <div className={className} style={style}>
      <MapContainer center={center} zoom={13} style={{ height, width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User current location */}
        {coords && (
          <>
            <Marker position={[coords.lat, coords.lng] as LatLngTuple}>
              <Popup>
                You are here
                {coords.accuracy ? <div>±{Math.round(coords.accuracy)}m</div> : null}
              </Popup>
            </Marker>
            {typeof coords.accuracy === 'number' && (
              <Circle center={[coords.lat, coords.lng] as LatLngTuple} radius={Math.min(coords.accuracy, 200)} pathOptions={{ color: 'blue', fillOpacity: 0.1 }} />
            )}
          </>
        )}

        {/* Existing issues pins */}
        {issues.map((it) => (
          <Marker key={it.id} position={[it.lat, it.lng] as LatLngTuple}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{it.title}</div>
                <div className="text-gray-600">{it.lat.toFixed(5)}, {it.lng.toFixed(5)}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Selected position (draggable) */}
        {selectedPosition && (
          <Marker
            position={selectedPosition as LatLngTuple}
            draggable={Boolean(onSelectPosition)}
            eventHandlers={{
              dragend: (e: any) => {
                const m = e.target as L.Marker;
                const ll = m.getLatLng();
                if (onSelectPosition) onSelectPosition([ll.lat, ll.lng]);
              }
            }}
          >
            <Popup>Selected location</Popup>
          </Marker>
        )}

        {/* Click to select */}
        <ClickToSelect onSelect={onSelectPosition} />

        {/* Follow user on first fix */}
        {followUser && <FollowUserOnce />}
      </MapContainer>
    </div>
  );
};
