import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import { GeoJSON } from 'react-leaflet';
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
          try {
            localStorage.setItem('cc:lastLocation', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
          } catch { /* ignore */ }
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

const blueIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FollowUserOnce() {
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

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const tick = () => {
      try { map.invalidateSize(); } catch {}
    };
    const t = setTimeout(tick, 0);
    window.addEventListener('resize', tick);
    return () => { clearTimeout(t); window.removeEventListener('resize', tick); };
  }, [map]);
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
  reportPins?: IssuePin[];
  sosPins?: IssuePin[];
  geojsonUrl?: string;
  showGeo?: boolean;
  followUser?: boolean;
}> = ({
  className,
  style,
  initialCenter = [40.7128, -74.006] as LatLngTuple,
  height = 360,
  selectedPosition,
  onSelectPosition,
  issues = [],
  reportPins = [],
  sosPins = [],
  geojsonUrl,
  showGeo = true,
  followUser = true,
}) => {
  const { coords } = useLocation();
  const center = useMemo<LatLngTuple>(() => {
    return coords ? [coords.lat, coords.lng] as LatLngTuple : initialCenter;
  }, [coords, initialCenter]);

  const [geoData, setGeoData] = useState<any | null>(null);
  useEffect(() => {
    let active = true;
    if (geojsonUrl && showGeo) {
      fetch(geojsonUrl)
        .then((r) => r.json())
        .then((j) => { if (active) setGeoData(j); })
        .catch(() => { if (active) setGeoData(null); });
    } else {
      setGeoData(null);
    }
    return () => { active = false; };
  }, [geojsonUrl, showGeo]);

  // Build draggable marker icon for selection (default is ok)

  return (
    <div className={className} style={{ ...(style || {}), position: 'relative' }}>
      <MapContainer center={center} zoom={13} style={{ height, width: '100%' }} scrollWheelZoom>
        <InvalidateSizeOnMount />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* GeoJSON overlay */}
        {showGeo && geoData && (
          <GeoJSON data={geoData as any} style={() => ({ color: '#10b981', weight: 2, fillOpacity: 0.08 })}>
          </GeoJSON>
        )}

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

        {/* Existing issues pins (fallback/misc) */}
        {issues.map((it) => (
          <Marker key={`issue:${it.id}`} position={[it.lat, it.lng] as LatLngTuple} icon={blueIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{it.title}</div>
                <div className="text-gray-600">{it.lat.toFixed(5)}, {it.lng.toFixed(5)}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Report pins (blue) */}
        {reportPins.map((it) => (
          <Marker key={`report:${it.id}`} position={[it.lat, it.lng] as LatLngTuple} icon={blueIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{it.title || 'Report'}</div>
                <div className="text-gray-600">{it.lat.toFixed(5)}, {it.lng.toFixed(5)}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* SOS pins (red) */}
        {sosPins.map((it) => (
          <Marker key={`sos:${it.id}`} position={[it.lat, it.lng] as LatLngTuple} icon={redIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{it.title || 'SOS'}</div>
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
      {/* Simple legend overlay */}
      <div style={{ position: 'absolute', right: 8, bottom: 8, pointerEvents: 'none' }}>
        <div className="bg-white/90 rounded shadow px-3 py-2 text-xs text-gray-800" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-2">
            <span style={{ width: 10, height: 10, background: '#3b82f6', display: 'inline-block', borderRadius: 2 }}></span>
            Reports
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ width: 10, height: 10, background: '#ef4444', display: 'inline-block', borderRadius: 2 }}></span>
            SOS
          </div>
        </div>
      </div>
    </div>
  );
};
