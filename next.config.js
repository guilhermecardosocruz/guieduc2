/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: false,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  // Se você quiser um SW custom (opcional), depois trocamos por swSrc
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: true
  },
  poweredByHeader: false,
  // Headers (cache) — ver seção 3
  async headers() {
    return [
      // Cache forte para assets imutáveis gerados na build
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      // Icons e manifest — cache longo (pode renovar quando trocar ícones/manifest)
      {
        source: '/(icons|manifest).:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800' }
        ]
      },
      // SW — precisa revalidar
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' }
        ]
      }
    ];
  }
};

module.exports = withPWA(nextConfig);

/* (append-only example)
  // Exemplo adicional (opcional)
  // {
  //   source: '/(robots|sitemap).txt',
  //   headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }]
  // }
*/
