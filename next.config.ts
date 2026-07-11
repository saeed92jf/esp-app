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

  allowedDevOrigins: ["localhost", "192.168.109.97"],

  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },

  // ─── Rewrites ────────────────────────────────────────────────────────────
  // توضیح: rewrite قبلی برای /api/aparat/:path* حذف شد.
  // حالا یک route handler واقعی در src/app/api/aparat/[...path]/route.ts
  // این درخواست‌ها را مدیریت می‌کند و Next.js Data Cache روی آن اعمال می‌شود.
  // rewrite ساده از Data Cache عبور می‌کرد و هیچ caching ای نداشت.
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
