import withPWA from 'next-pwa';
const withPWAConfigured = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  fallbacks: {},
  runtimeCaching: [
    { urlPattern: ({url}) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly' }
  ],
});
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/api/:path*', headers: [
      { key: 'Cache-Control', value: 'no-store' },
      { key: 'CDN-Cache-Control', value: 'no-store' },
      { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
    ]}];
  },
};
export default withPWAConfigured(nextConfig);
