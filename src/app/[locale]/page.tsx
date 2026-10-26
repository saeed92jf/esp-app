// src/app/[locale]/page.tsx

import { HomeClient } from "@/modules/home/components/home-client";

/**
 * Home route. The actual content is gated: guests see the WelcomeScreen,
 * authenticated users see the real home content below.
 */
export default function HomePage() {
  return (
    <div className="w-full max-w-full flex-1 flex flex-col min-h-0 h-full">
      <HomeClient />
    </div>
  );
}
