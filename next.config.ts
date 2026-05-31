import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.aparat.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.cdn.asset.aparat.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.aparat.ir',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cover.aparat.ir',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },

  // List explicit dev origins. allowedDevOrigins does NOT support the '*'
  // wildcard, it matches against real hostnames. Using '*' here means no
  // origin matches, so /_next/* assets and the HMR websocket get blocked
  // when the app is opened over the LAN IP instead of localhost.
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.0.71'],

  experimental: {
    // serverActions origins DO accept wildcard patterns, so '*' is valid here.
    serverActions: { allowedOrigins: ['*'] },
  },

  async rewrites() {
    return [
      {
        source: '/api/aparat/:path*',
        destination: 'https://www.aparat.com/etc/api/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
        ],
      },
    ];
  },
};

export default nextConfig;
