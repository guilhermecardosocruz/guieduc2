// Versão do SW — incremente para forçar update
self.__SW_VERSION = 'v3-' + Date.now();

self.addEventListener('install', (evt) => {
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  clients.claim();
});

// NUNCA cachear /api/*
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  // demais requests seguem o padrão do workbox/next-pwa
});
