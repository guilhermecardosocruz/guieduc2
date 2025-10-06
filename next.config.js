/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  fallbacks: {},
  runtimeCaching: [
    // NUNCA cachear API
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      method: 'GET',
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      method: 'POST',
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      method: 'PATCH',
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      method: 'DELETE',
    },
    // Demais requests seguem o padrão do Workbox (ou você pode adicionar regras aqui)
  ],
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
  },
  // Headers extra para CDN impedir cache agressivo (Vercel etc.)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
