// src/app/[locale]/page.tsx

import { HomeClient } from "@/modules/home/components/home-client";

/**
 * Home route. The actual content is gated: guests see the WelcomeScreen,
 * authenticated users see the real home content below.
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-full px-4 py-10">
      <HomeClient />
    </div>
  );
}
