/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  timeout?: number;
}

interface ToastContextType {
  show: (message: string, variant?: ToastVariant, timeoutMs?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = 'info', timeoutMs = 2500) => {
    const id = Math.random().toString(36).slice(2);
    const toast: ToastItem = { id, message, variant, timeout: timeoutMs };
    setToasts(prev => [...prev, toast]);
    if (timeoutMs > 0) {
      window.setTimeout(() => remove(id), timeoutMs);
    }
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="fixed top-4 right-4 z-[100] space-y-3">
        <AnimatePresence initial={false}>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              className={[
                'pointer-events-auto min-w-[240px] max-w-[360px] px-4 py-3 rounded-lg shadow-xl border backdrop-blur-md',
                'bg-white/90 border-white/60',
                t.variant === 'success' && 'ring-1 ring-green-300/40',
                t.variant === 'error' && 'ring-1 ring-red-300/40',
                t.variant === 'info' && 'ring-1 ring-blue-300/40',
              ].filter(Boolean).join(' ')}
            >
              <div className="flex items-start gap-3">
                <span className={[
                  'mt-0.5 inline-block w-2 h-2 rounded-full',
                  t.variant === 'success' && 'bg-green-500',
                  t.variant === 'error' && 'bg-red-500',
                  t.variant === 'info' && 'bg-blue-500',
                ].filter(Boolean).join(' ')} />
                <p className="text-sm text-gray-800">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="ml-auto text-gray-400 hover:text-gray-700"
                  aria-label="Dismiss toast"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
