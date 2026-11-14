// src/app/[locale]/page.tsx
"use client";

import dynamic from "next/dynamic";

const CoffeeZheenHomeView = dynamic(
  () =>
    import("@/modules/home/components/coffee-zheen-home-view").then(
      (mod) => mod.CoffeeZheenHomeView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full flex-1 flex flex-col min-h-[70vh] bg-transparent" />
    ),
  }
);

/**
 * Coffee Zheen Home Route.
 * Pure Café Management & Operations Portal for Coffee Zheen.
 */
export default function HomePage() {
  return (
    <div className="w-full max-w-full flex-1 flex flex-col min-h-0 h-full">
      <CoffeeZheenHomeView />
    </div>
  );
}
