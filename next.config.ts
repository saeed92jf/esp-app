import type { NextConfig } from 'next'

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

  allowedDevOrigins: ['*'],

  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
  
  async rewrites() {
    return [
      {
        source: '/api/aparat/:path*',
        destination: 'https://www.aparat.com/etc/api/:path*',
      },
    ]
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
    ]
  },


}

export default nextConfig