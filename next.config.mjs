/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Duplicate homepage URLs should permanently (301) point to the canonical homepage
  async redirects() {
    return [
      { source: '/index', destination: '/', statusCode: 301 },
      { source: '/index.html', destination: '/', statusCode: 301 },
      { source: '/alternative/pocket-instapaper-alternatives', destination: '/alternative/pocket-alternatives', statusCode: 301 },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
