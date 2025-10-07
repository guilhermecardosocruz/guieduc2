/* global workbox */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Apenas ativa quando workbox está disponível (next-pwa injeta workbox)
if (typeof workbox !== 'undefined') {
  // HTML/doc: Network-first com fallback offline
  workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages',
      networkTimeoutSeconds: 4,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })
      ]
    })
  );

  // Static assets do Next (_next/static): Cache-first + immutable
  workbox.routing.registerRoute(
    ({url}) => url.pathname.startsWith('/_next/static/'),
    new workbox.strategies.CacheFirst({
      cacheName: 'next-static',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 })
      ]
    })
  );

  // Imagens públicas: Stale-While-Revalidate
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 })
      ]
    })
  );

  // APIs GET (mesmo host): Network-first com fallback cache
  workbox.routing.registerRoute(
    ({url, request}) => url.origin === self.location.origin && request.method === 'GET' && url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api',
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 })
      ]
    })
  );

  // Fallback offline para navegação
  workbox.routing.setCatchHandler(async ({event}) => {
    if (event.request.destination === 'document') {
      return caches.match('/offline');
    }
    return Response.error();
  });
}
