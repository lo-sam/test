// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Configuration pour les images optimisées
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  // Configuration pour les en-têtes HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
