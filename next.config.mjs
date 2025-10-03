import withPWAInit from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ['lucide-react'] },
};

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: false,                   // seguro em prod
  disable: process.env.NODE_ENV === 'development',  // 🔒 PWA OFF no dev
  buildExcludes: [/middleware-manifest\.json$/],
  // Se quiser fallback offline em prod, pode manter. No dev ficará desligado de qualquer forma:
  // fallbacks: { document: '/offline' }
});

export default withPWA(nextConfig);
