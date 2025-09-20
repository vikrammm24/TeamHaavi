import { rtdb } from './firebase';
import { ref, push, set, DataSnapshot, onChildAdded } from 'firebase/database';

export interface GlobalNotificationPayload {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

export interface GlobalNotification extends GlobalNotificationPayload {
  id: string;
  timestamp: number; // epoch ms
}

const GLOBAL_PATH = '/notifications/global';

export async function pushGlobalNotification(payload: GlobalNotificationPayload) {
  const listRef = ref(rtdb, GLOBAL_PATH);
  const newRef = push(listRef);
  const data: GlobalNotification = {
    id: newRef.key || Math.random().toString(36).slice(2),
    timestamp: Date.now(),
    ...payload,
  };
  await set(newRef, data);
  return data.id;
}

export type NotificationListener = (n: GlobalNotification) => void;

export function listenGlobalNotifications(cb: NotificationListener) {
  const listRef = ref(rtdb, GLOBAL_PATH);
  // onChildAdded triggers for existing and new children
  const unsub = onChildAdded(listRef, (snap: DataSnapshot) => {
    const val = snap.val();
    if (val && val.id && val.timestamp) {
      cb(val as GlobalNotification);
    }
  });
  return () => unsub();
}

// Utility to prune old notifications client-side if desired
export function pruneOld(notifications: GlobalNotification[], max = 200) {
  if (notifications.length <= max) return notifications;
  return [...notifications].sort((a,b)=>b.timestamp - a.timestamp).slice(0, max);
}
