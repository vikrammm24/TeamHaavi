import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { evaluateAward, GamificationEvent } from '../../services/gamification/rules';
import { auth, db } from '../../components/firebase/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface GamificationHistoryItem {
  id: string;
  event: GamificationEvent;
  timestamp: number;
  points: number;
  // flexible metadata container; unknown to avoid eslint any rule
  metadata?: Record<string, unknown>;
}

interface GamificationState {
  points: number;
  level: number;
  badge?: string;
  history: GamificationHistoryItem[];
}

interface AwardEventReturn {
  event: GamificationEvent;
  pointsAwarded: number;
  newTotal: number;
  newBadge?: string;
  newLevel: number;
  historyItem: GamificationHistoryItem;
}

interface GamificationContextValue extends GamificationState {
  awardEvent: (event: GamificationEvent, metadata?: Record<string, unknown>) => AwardEventReturn | null;
  reset: () => void;
}

const STORAGE_KEY = 'gamification:v1';

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);
export default GamificationContext;

const initialState: GamificationState = {
  points: 0,
  level: 1,
  badge: undefined,
  history: [],
};

function loadState(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

function persistState(state: GamificationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(() => loadState());
  const [loadedRemote, setLoadedRemote] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Load remote state once user is available
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || loadedRemote) return;
    let cancelled = false;
    (async () => {
      try {
        const ref = doc(db, 'gamification', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const remote = snap.data() as Partial<GamificationState> & { history?: GamificationHistoryItem[] };
          setState(prev => {
            const mergedPoints = Math.max(prev.points, remote.points || 0);
            const mergedHistoryMap = new Map<string, GamificationHistoryItem>();
            [...(remote.history || []), ...prev.history].forEach((h) => {
              if (h && h.id) mergedHistoryMap.set(h.id, h);
            });
            const mergedHistory = Array.from(mergedHistoryMap.values())
              .sort((a,b)=> b.timestamp - a.timestamp)
              .slice(0,200);
            return {
              points: mergedPoints,
              level: remote.level && remote.level > prev.level ? remote.level : prev.level,
              badge: remote.badge || prev.badge,
              history: mergedHistory,
            };
          });
        }
      } catch {
        // ignore fetch errors
      } finally {
        if (!cancelled) setLoadedRemote(true);
      }
    })();
    return () => { cancelled = true; };
  }, [loadedRemote]);

  useEffect(() => {
    persistState(state);
    // Debounced remote save if user logged in & remote loaded
    const user = auth.currentUser;
    if (!user || !loadedRemote) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        const ref = doc(db, 'gamification', user.uid);
        await setDoc(ref, {
          points: state.points,
          level: state.level,
          badge: state.badge || null,
          history: state.history,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch {
        // ignore save errors silently
      }
    }, 600);
  }, [state, loadedRemote]);

  const awardEvent = useCallback<GamificationContextValue['awardEvent']>((event, metadata) => {
    const { points, newTotal, badge, level } = evaluateAward(event, state.points);
    if (points === 0) return null;
    const historyItem: GamificationHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      event,
      timestamp: Date.now(),
      points,
      metadata,
    };
    setState(prev => ({
      points: newTotal,
      level,
      badge: badge ?? prev.badge,
      history: [historyItem, ...prev.history].slice(0, 200), // keep last 200
    }));
    return {
      event,
      pointsAwarded: points,
      newTotal,
      newBadge: badge,
      newLevel: level,
      historyItem,
    };
  }, [state.points]);

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<GamificationContextValue>(() => ({
    ...state,
    awardEvent,
    reset,
  }), [state, awardEvent, reset]);

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

// Hook moved to separate file to keep this file exporting a single component for fast refresh.
