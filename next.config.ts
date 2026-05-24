import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      'localhost',
      'www.aparat.com',
      'static.cdn.asset.aparat.com',
      's3.aparat.ir',
      'cover.aparat.ir'
    ],
    formats: ['image/avif', 'image/webp'],
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
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
        ],
      },
    ]
  },
}

export default nextConfig