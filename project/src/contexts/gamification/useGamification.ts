import { useContext } from 'react';
import GamificationContext from './GamificationContext';

// Separated hook to satisfy fast refresh constraints.
export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
};

export default useGamification;
