import React, { useEffect, useMemo } from 'react';

const ringUrl = 'https://actions.google.com/sounds/v1/alarms/phone_alerts_and_rings.ogg';

export interface FakeCallModalProps {
  open: boolean;
  callerName?: string;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ open, callerName = 'Mom', onAccept, onDecline }) => {
  const audio = useMemo(() => {
    try { return new Audio(ringUrl); } catch { return null; }
  }, []);

  useEffect(() => {
    if (open) {
      try { if (audio) { audio.loop = true; audio.play(); } } catch { /* ignore */ }
    } else {
      try { if (audio) { audio.pause(); audio.currentTime = 0; } } catch { /* ignore */ }
    }
    return () => { try { if (audio) audio.pause(); } catch { /* ignore */ } };
  }, [open, audio]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-green-600 text-white p-6 text-center">
          <div className="text-sm opacity-80">Incoming Call</div>
          <div className="text-2xl font-bold mt-1">{callerName}</div>
        </div>
        <div className="p-6 flex items-center justify-center gap-10">
          <button
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm"
            aria-label="Decline"
          >
            ✕
          </button>
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm"
            aria-label="Accept"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default FakeCallModal;
