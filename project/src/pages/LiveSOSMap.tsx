import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { onValue, ref as dbRef } from 'firebase/database';
import { rtdb } from '../components/firebase/firebase';
import { MapWithRealtimeLocation } from '../components/RealtimeLocation';

type LatLng = { lat: number; lng: number; accuracy?: number | null; timestamp?: number } | null;

const LiveSOSMap: React.FC = () => {
  const { uid } = useParams();
  const [pos, setPos] = useState<LatLng>(null);

  useEffect(() => {
    if (!uid) return;
    const off = onValue(dbRef(rtdb, `sos_live/${uid}/current`), (snap) => {
      const v = snap.val();
      if (v && typeof v.lat === 'number' && typeof v.lng === 'number') {
        setPos({ lat: v.lat, lng: v.lng, accuracy: v.accuracy ?? null, timestamp: v.timestamp ?? Date.now() });
      }
    });
    return () => off();
  }, [uid]);

  const center = useMemo(() => (pos ? [pos.lat, pos.lng] as [number, number] : undefined), [pos]);

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold mb-4">Live SOS Map {uid ? `(uid: ${uid})` : ''}</h1>
      <MapWithRealtimeLocation
        height={480}
        initialCenter={center || [17.4399, 78.4983]}
        selectedPosition={center || null}
        followUser={false}
      />
      {pos && (
        <div className="mt-2 text-sm text-gray-700">Last update: {new Date(pos.timestamp || Date.now()).toLocaleString()} • Acc: {pos.accuracy ? Math.round(pos.accuracy) + 'm' : 'n/a'}</div>
      )}
    </div>
  );
};

export default LiveSOSMap;
