import withPWA from 'next-pwa';

const runtimeCaching = [
  {
    urlPattern: ({ url }) => /\/api\/(classes|lessons|attendance)\b/.test(url.pathname),
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      networkTimeoutSeconds: 3,
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
    }
  },
  {
    urlPattern: ({ url }) => /\.(?:js|css|woff2)$/.test(url.pathname),
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'assets' }
  }
];

/** @type {import('next').NextConfig} */
const base = {
  reactStrictMode: true,
};

export default withPWA({
  ...base,
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: false,
    buildExcludes: [/middleware-manifest\.json$/],
    runtimeCaching   // << SOMENTE AQUI, sem "...runtimeCaching" no topo
  }
});
