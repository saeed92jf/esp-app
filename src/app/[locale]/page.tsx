// src/app/[locale]/page.tsx

import { HomeClient } from "@/modules/home/components/home-client";

/**
 * Home route. The actual content is gated: guests see the WelcomeScreen,
 * authenticated users see the real home content below.
 */
export default function HomePage() {
  return (
    <div className="w-full max-w-full h-[var(--home-height,calc(100dvh-var(--header-height)-var(--footer-height)))] max-h-[var(--home-height,calc(100dvh-var(--header-height)-var(--footer-height)))] overflow-hidden">
      <HomeClient />
    </div>
  );
}
