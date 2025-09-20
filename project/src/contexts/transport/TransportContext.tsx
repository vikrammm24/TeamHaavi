import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getDynamicSuggestions, RouteSuggestion } from '../../services/transport/optimizer';

interface TransportContextValue {
  origin: string;
  destination: string;
  setOrigin: (o: string) => void;
  setDestination: (d: string) => void;
  suggestions: RouteSuggestion[];
  refresh: () => Promise<void>;
  loading: boolean;
}

const TransportContext = createContext<TransportContextValue | undefined>(undefined);

export const TransportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [origin, setOrigin] = useState('Secunderabad Station');
  const [destination, setDestination] = useState('City Center');
  const [suggestions, setSuggestions] = useState<RouteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDynamicSuggestions(origin, destination);
      setSuggestions(data);
    } finally {
      setLoading(false);
    }
  }, [origin, destination]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 120000); // refresh every 2 min
    return () => clearInterval(id);
  }, [refresh]);

  const value = useMemo<TransportContextValue>(() => ({
    origin,
    destination,
    setOrigin,
    setDestination,
    suggestions,
    refresh,
    loading,
  }), [origin, destination, suggestions, refresh, loading]);

  return <TransportContext.Provider value={value}>{children}</TransportContext.Provider>;
};

export default TransportContext;
