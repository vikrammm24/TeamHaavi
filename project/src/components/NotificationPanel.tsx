import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Clock, Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, markAsRead, clearNotifications } = useNotifications();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate brief loading phase for skeleton (in case realtime data arrives fast it's minimal)
    const t = setTimeout(() => setInitialLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Ensure a portal root exists (once) at document.body level to escape any stacking contexts
  let portalRoot = document.getElementById('notification-portal-root');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'notification-portal-root';
    portalRoot.style.position = 'relative';
    portalRoot.style.zIndex = '2147483640'; // near max safe integer for z-index layering
    document.body.appendChild(portalRoot);
  }

  const panelContent = (
    <>
      {/* Backdrop (transparent clickable area) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2147483636] bg-black/30 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-notifications-title"
        className="fixed top-20 right-4 w-[22rem] max-w-[92vw] rounded-2xl border z-[2147483637] max-h-[72vh] flex flex-col overflow-hidden isolate backdrop-blur-xl bg-white/75 dark:bg-[#1f2937e6] border-white/50 shadow-[0_8px_28px_-4px_rgba(0,0,0,0.25),_0_0_0_1px_rgba(255,255,255,0.4)]"
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/40 bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-green-400/10 backdrop-blur-sm">
        <h3 id="cc-notifications-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Notifications
        </h3>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-xs font-medium px-2 py-1 rounded-md bg-white/40 hover:bg-white/60 dark:bg-white/10 dark:hover:bg-white/20 text-blue-700 dark:text-blue-300 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
  <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-white/60 via-white/50 to-white/30 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/20">
        {initialLoading ? (
          <div className="p-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="cc-skeleton h-4 w-2/3" />
                <div className="cc-skeleton h-3 w-11/12" />
                <div className="cc-skeleton h-3 w-5/6" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => markAsRead(notification.id)}
              className={`group relative p-4 pr-5 cursor-pointer transition-all duration-300 border-b last:border-b-0 border-white/40 dark:border-white/10 ${
                !notification.read
                  ? 'bg-gradient-to-r from-blue-50/80 to-cyan-50/70 dark:from-blue-900/40 dark:to-cyan-900/30 backdrop-blur-sm hover:brightness-105 shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
                  : 'hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-start space-x-3 relative">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(notification.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-snug break-words">
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-[10px] uppercase tracking-wide text-blue-600 dark:text-blue-300 font-semibold">New</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
    </>
  );

  return createPortal(panelContent, portalRoot);
};

export default NotificationPanel;