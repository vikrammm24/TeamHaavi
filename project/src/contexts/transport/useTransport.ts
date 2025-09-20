import { useContext } from 'react';
import TransportContext from './TransportContext';

export const useTransport = () => {
  const ctx = useContext(TransportContext);
  if (!ctx) throw new Error('useTransport must be used within TransportProvider');
  return ctx;
};

export default useTransport;
