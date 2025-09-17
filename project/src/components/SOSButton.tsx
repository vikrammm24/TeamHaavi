import React, { useEffect, useRef, useState } from 'react';
import { Siren, AlertTriangle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { auth, rtdb } from './firebase/firebase';
import { ref as dbRef, push as dbPush, set as dbSet } from 'firebase/database';
import { useNotifications } from '../contexts/useNotifications';
import { useVoiceSOS } from './sos/useVoiceSOS';
import { useUser } from '../contexts/UserContext';
import { openWhatsAppAndMaybeSms, openWhatsAppNow } from '../utils/sosMessaging';

const SOSButton: React.FC<{ className?: string }> = ({ className }) => {
  const { addNotification } = useNotifications();
  const { preferences } = useUser();
  const [sending, setSending] = useState(false);
  const [rippling, setRippling] = useState(false);
  const liveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { start, stop } = useVoiceSOS('help me');
  const lastShakeRef = useRef<number>(0);

  useEffect(() => {
    // Autostart passive listening if supported (best-effort; requires user gesture in many browsers)
    start(() => {
      // Voice keyword "help me" detected
      sendSOS();
      notifyContacts();
    });
    // Add a basic shake detector (accelerometer)
    const onMotion = (e: DeviceMotionEvent) => {
      try {
        const ax = Math.abs(e.accelerationIncludingGravity?.x || 0);
        const ay = Math.abs(e.accelerationIncludingGravity?.y || 0);
        const az = Math.abs(e.accelerationIncludingGravity?.z || 0);
        const magnitude = Math.sqrt(ax*ax + ay*ay + az*az);
        const now = Date.now();
        // Heuristic: strong movement and throttle to 3s
        if (magnitude > 28 && now - lastShakeRef.current > 3000) {
          lastShakeRef.current = now;
          sendSOS();
          notifyContacts();
        }
      } catch { /* ignore */ }
    };
    try {
      if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
        // addEventListener overload without options to avoid type issues
        window.addEventListener('devicemotion', onMotion as EventListener);
      }
    } catch { /* no-op */ }
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendSOS = async () => {
    const user = auth.currentUser;
    if (!user) {
      addNotification({ type: 'error', title: 'Login required', message: 'Please sign in to send SOS.' });
      return;
    }
    setSending(true);
    setRippling(true);
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        lat = pos.coords.latitude; lng = pos.coords.longitude;
      } catch {
        // Location may be denied; proceed with nulls
      }
      await dbPush(dbRef(rtdb, `sos_alerts/${user.uid}`), {
        uid: user.uid,
        latitude: lat,
        longitude: lng,
        timestamp: Date.now(),
        status: 'active',
      });
      // Start live tracking: write current position periodically for share links
      try {
        if (liveTimer.current) { clearInterval(liveTimer.current); }
        const writeOnce = async () => {
          try {
            const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
            await dbSet(dbRef(rtdb, `sos_live/${user.uid}/current`), {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? null,
              timestamp: Date.now(),
            });
          } catch { /* ignore */ }
        };
        await writeOnce();
        liveTimer.current = setInterval(writeOnce, 5000);
      } catch { /* ignore */ }
      addNotification({ type: 'warning', title: 'SOS sent', message: 'Your SOS alert has been sent to emergency contacts.' });
    } catch {
      addNotification({ type: 'error', title: 'SOS failed', message: 'Could not send SOS. Check permissions and network.' });
    } finally {
      setSending(false);
      // stop ripple after a moment
      setTimeout(() => setRippling(false), 1500);
    }
  };

  const buildSOSMessage = async () => {
    const base = '🚨 SOS: I need help!';
    const user = auth.currentUser;
  const parts: string[] = [base];
    // Always try to include a Google Maps link with current coordinates if possible
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      parts.push(`My location: https://maps.google.com/?q=${lat},${lng}`);
    } catch {
      // Fallback to cached last location if available
      try {
        const raw = localStorage.getItem('cc:lastLocation');
        if (raw) {
          const cached = JSON.parse(raw) as { lat: number; lng: number };
          parts.push(`My last location: https://maps.google.com/?q=${cached.lat},${cached.lng}`);
        }
      } catch { /* ignore */ }
    }
    // Optionally include app live SOS link
    if (preferences?.sosIncludeLiveLink) {
      try {
        const uid = user?.uid || 'me';
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp';
        if (preferences.sosLinkType === 'app') {
          parts.push(`Live SOS: ${origin}/sos/${uid}`);
        }
      } catch { /* ignore */ }
    }
    return parts.join('\n');
  };

  const notifyContacts = async () => {
    const mother = preferences?.sosContacts?.mother?.trim();
    const father = preferences?.sosContacts?.father?.trim();
    // Prefer father's number as requested; fallback to mother if father not set
    const numbers = father ? [father] : (mother ? [mother] : []);
    if (!numbers.length) {
      addNotification({ type: 'info', title: 'No SOS contacts', message: 'Add mother/father WhatsApp numbers in Settings.' });
      return;
    }
    const msg = await buildSOSMessage();
    // Immediately navigate to WhatsApp for the primary number
    openWhatsAppNow(numbers[0], msg);
    // Optionally open others / SMS fallback after a short delay (if any remain)
    setTimeout(() => {
      openWhatsAppAndMaybeSms(numbers.slice(1), msg, !!preferences?.sosSmsFallback);
    }, 400);
  };

  return (
    <>
    <div className="fixed bottom-20 right-5 z-50">
      {/* Ripple effect */}
      {rippling && (
        <span className="absolute inset-0 -m-6 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
      )}
      <button
        type="button"
        onClick={() => {
          // Prioritize WhatsApp navigation immediately on user gesture
          notifyContacts();
          // Perform backend writes/tracking just after initiating WhatsApp
          setTimeout(() => { sendSOS(); }, 150);
        }}
        disabled={sending}
        className={[
          'relative rounded-full shadow-xl text-white',
          'bg-red-600 hover:bg-red-700 active:bg-red-800 transition-all',
          'w-16 h-16 flex items-center justify-center',
          'ring-4 ring-red-300/40 hover:ring-red-400/50',
          sending ? 'opacity-70 cursor-not-allowed' : '',
          className || ''
        ].join(' ')}
        aria-label="Send SOS"
        title={Capacitor.isNativePlatform() ? 'Send SOS (shares GPS)' : 'Send SOS'}
      >
        {sending ? <AlertTriangle className="w-8 h-8" /> : <Siren className="w-8 h-8" />}
      </button>
    </div>
    </>
  );
};

export default SOSButton;
