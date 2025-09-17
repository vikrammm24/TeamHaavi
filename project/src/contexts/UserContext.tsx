import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'authority' | 'professional';
  avatar?: string;
}

interface Preferences {
  useNearbyContent: boolean;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  preferences: Preferences;
  setPreferences: (update: Partial<Preferences>) => void;
  aiMatchingResults?: any;
  aiAnalyticsData?: any;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const PREFERENCES_KEY = 'userPreferences';
const USER_KEY = 'currentUser';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [preferences, setPreferencesState] = useState<Preferences>(() => {
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      return raw ? JSON.parse(raw) : { useNearbyContent: true } as Preferences;
    } catch {
      return { useNearbyContent: true };
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const setPreferences = (update: Partial<Preferences>) => {
    setPreferencesState(prev => {
      const next = { ...prev, ...update };
      try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthenticated, preferences, setPreferences }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};