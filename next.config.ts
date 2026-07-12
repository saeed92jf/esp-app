// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
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

  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.71"],

  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },

  async rewrites() {
    return [];
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
