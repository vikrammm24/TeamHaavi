import axios from 'axios';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // 1) Explicit override via env at build time (Vite) or runtime via window.__API_BASE__
  const viteEnv = (import.meta as any)?.env;
  const override = viteEnv?.VITE_API_BASE || (typeof window !== 'undefined' && (window as any).__API_BASE__);
  if (override) return String(override);

  // 2) If we're in development and accessing via ngrok, use the known tunnel (can be overridden above)
  if (typeof window !== 'undefined' && window.location.hostname.includes('ngrok-free.app')) {
    return 'https://c23f03ac13b7.ngrok-free.app/api';
  }

  // 3) Otherwise use the dev proxy (Vite) or relative path
  return '/api';
};

// Create axios instance with ngrok configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to ensure headers are always sent
api.interceptors.request.use(
  (config) => {
    (config.headers as any)['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const cfg = error?.config || {};
    const isPostLike = ['post','put','patch','delete'].includes(String(cfg.method || '').toLowerCase());
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (isPostLike && (offline || error.code === 'ERR_NETWORK')) {
      // queue the request for retry
      try {
        const key = 'cc-offline-queue';
        const raw = localStorage.getItem(key);
        const q = raw ? JSON.parse(raw) : [];
        q.push({ url: cfg.url, method: cfg.method, data: cfg.data, headers: cfg.headers });
        localStorage.setItem(key, JSON.stringify(q));
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;

// Background retry when online
if (typeof window !== 'undefined') {
  const key = 'cc-offline-queue';
  const flush = async () => {
    try {
      const raw = localStorage.getItem(key);
      const q = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(q) || q.length === 0) return;
      const next = q.shift();
      localStorage.setItem(key, JSON.stringify(q));
      if (next) {
        try {
          await api.request({ url: next.url, method: next.method, data: next.data, headers: next.headers });
        } catch {
          // push back and retry later
          const again = raw ? JSON.parse(raw) : [];
          again.unshift(next);
          localStorage.setItem(key, JSON.stringify(again));
        }
      }
      if ((JSON.parse(localStorage.getItem(key) || '[]') || []).length > 0) {
        setTimeout(flush, 3000);
      }
    } catch {}
  };
  window.addEventListener('online', () => setTimeout(flush, 1000));
  // initial flush attempt
  setTimeout(flush, 2000);
}