const CACHE_NAME = 'cityconnect-v1';
const APP_SHELL = [
  './',
  './index.html',
  './assets/index-*.js',
  './assets/index-*.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Network-first for API, cache-first for app shell
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request).then((res) => {
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
