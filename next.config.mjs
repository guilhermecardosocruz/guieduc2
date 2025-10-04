import initPWA from 'next-pwa';

const withPWA = initPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: false,
  buildExcludes: [/middleware-manifest\.json$/],
  // (opcional) adicione runtimeCaching aqui depois, NUNCA no root export
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
