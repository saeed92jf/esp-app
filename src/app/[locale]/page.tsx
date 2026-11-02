// src/app/[locale]/page.tsx
"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(
  () => import("@/modules/home/components/home-client").then((mod) => mod.HomeClient),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full flex-1 flex flex-col min-h-[var(--home-height)] h-[var(--home-height)] bg-transparent" />
    ),
  }
);

/**
 * Home route. The actual content is gated: guests see the WelcomeScreen,
 * authenticated users see the real home content.
 * Using ssr: false ensures client-side authentication from localStorage
 * hydrates cleanly without React SSR hydration mismatches.
 */
export default function HomePage() {
  return (
    <div className="w-full max-w-full flex-1 flex flex-col min-h-0 h-full">
      <HomeClient />
    </div>
  );
}
