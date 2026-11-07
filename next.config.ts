// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const BACKEND_INTERNAL_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8080/api/v1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
transpilePackages: ['three', '@react-three/drei', '@react-three/fiber', 'troika-three-text'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.aparat.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.cdn.asset.aparat.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3.aparat.ir",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cover.aparat.ir",
        pathname: "/**",
      },
    ],
  },

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.38",
    "192.168.0.30",
    "192.168.0.242",
    "192.168.0.171",
    "192.168.0.*",
  ],

  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },

  async rewrites() {
    return [
      {
        source: "/api/real/notifications/:path*",
        destination: "/api/notifications/:path*",
      },
      {
        source: "/api/real/admin/:path*",
        destination: "/api/admin/:path*",
      },
      {
        source: "/api/real/users/:path*",
        destination: "/api/users/:path*",
      },
      {
        source: "/api/real/auth/register",
        destination: "/api/auth/register",
      },
      {
        source: "/api/real/auth/request-account",
        destination: "/api/auth/request-account",
      },
      {
        source: "/api/real/:path*",
        destination: `${BACKEND_INTERNAL_URL}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
          { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
