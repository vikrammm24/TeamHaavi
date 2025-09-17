import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { listenGlobalNotifications, GlobalNotification } from '../components/firebase/notifications';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source?: 'local' | 'firebase';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Local storage persistence for read IDs (so Firebase-fed ones don't reappear as unread)
  const READ_KEY = 'notifications:readIds';
  const initialRead = (() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      if (!raw) return new Set<string>();
      return new Set<string>(JSON.parse(raw));
    } catch { return new Set<string>(); }
  })();
  const readIdsRef = useRef<Set<string>>(initialRead);
  const persistRead = () => {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(Array.from(readIdsRef.current)));
  } catch {
      // Swallow persistence errors (private / Safari incognito quota etc.)
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>(() => [
    {
      id: 'welcome-local',
      type: 'info',
      title: 'Welcome to CityConnect',
      message: 'Start reporting issues to improve your community',
      timestamp: new Date(),
      read: readIdsRef.current.has('welcome-local'),
      source: 'local'
    }
  ]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      source: 'local'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    readIdsRef.current.add(id);
    persistRead();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Firebase listener
  useEffect(() => {
    const unsubscribe = listenGlobalNotifications((gn: GlobalNotification) => {
      setNotifications(prev => {
        if (prev.some(p => p.id === gn.id)) return prev; // dedupe
        const notif: Notification = {
          id: gn.id,
            type: gn.type,
            title: gn.title,
            message: gn.message,
            timestamp: new Date(gn.timestamp),
            read: readIdsRef.current.has(gn.id),
            source: 'firebase'
        };
        const merged = [notif, ...prev].sort((a,b)=>b.timestamp.getTime()-a.timestamp.getTime());
        return merged.slice(0, 250); // cap
      });
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      clearNotifications,
      unreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};