// src/app/[locale]/page.tsx
import { AuthGate } from '@/components/auth/auth-gate';
import { HomeClient } from '@/components/home/home-client';

/**
 * Home route. The actual content is gated: guests see the WelcomeScreen,
 * authenticated users see the real home content below.
 */
export default function HomePage() {
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <HomeClient />
      </div>
    </AuthGate>
  );
}
