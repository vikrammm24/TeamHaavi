import { useContext } from 'react';
import NotificationContext, { NotificationContextType } from './NotificationContext';

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};

export default useNotifications;
