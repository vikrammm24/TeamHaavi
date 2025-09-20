import { useEffect, useState } from 'react';
import { onValue, ref as dbRef } from 'firebase/database';
import { rtdb } from '../components/firebase/firebase';

export type Pin = { id: string; title: string; lat: number; lng: number };

export function useRealtimeReportPins(): Pin[] {
  const [pins, setPins] = useState<Pin[]>([]);

  useEffect(() => {
    const off = onValue(dbRef(rtdb, 'reports'), (snap) => {
      const root = snap.val() || {};
      const acc: Pin[] = [];
      try {
        Object.entries(root).forEach(([uid, reportsRaw]: any) => {
          const reports = reportsRaw || {};
          Object.entries(reports).forEach(([rid, r]: any) => {
            const lat = r?.lat ?? r?.coords?.lat;
            const lng = r?.lng ?? r?.coords?.lng;
            if (typeof lat === 'number' && typeof lng === 'number') {
              const title = String(r?.title || r?.message || 'Report');
              acc.push({ id: `${uid}:${rid}`, title, lat, lng });
            }
          });
        });
      } catch {
        // ignore parse errors
      }
      setPins(acc);
    });
    return () => off();
  }, []);

  return pins;
}

export function useRealtimeSOSPins(): Pin[] {
  const [pins, setPins] = useState<Pin[]>([]);

  useEffect(() => {
    const off = onValue(dbRef(rtdb, 'sos_live'), (snap) => {
      const root = snap.val() || {};
      const acc: Pin[] = [];
      try {
        Object.entries(root).forEach(([uid, v]: any) => {
          const cur = v?.current;
          const lat = cur?.lat;
          const lng = cur?.lng;
          if (typeof lat === 'number' && typeof lng === 'number') {
            acc.push({ id: `sos:${uid}`, title: `SOS ${uid.slice(0,6)}`, lat, lng });
          }
        });
      } catch {
        // ignore parse errors
      }
      setPins(acc);
    });
    return () => off();
  }, []);

  return pins;
}
