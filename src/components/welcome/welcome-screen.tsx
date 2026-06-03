/* src/components/welcome/welcome-screen.tsx */

'use client';

import { useTranslations } from 'next-intl';
import { PUBLIC_WELCOME_ITEMS } from '@/config/navigation';
import { FeatureCard } from '@/components/shared/feature-card';

/**
 * Public landing screen for unauthenticated visitors.
 * Renders the same FeatureCard used on Home, fed only by
 * PUBLIC_WELCOME_ITEMS (the multimedia group).
 *
 * Named export `WelcomeScreen` to match the import in auth-gate.tsx
 * and to stay consistent with the rest of the components.
 */
export function WelcomeScreen(): import('react/jsx-runtime').JSX.Element {
  const tWelcome = useTranslations('Welcome');
  const tItems = useTranslations('Menu.items');
  const tDesc = useTranslations('Menu.descriptions');

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
      {/* Hero header */}
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {tWelcome('title')}
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg">
          {tWelcome('subtitle')}
        </p>
      </header>

      {/* Card grid — identical look to Home */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PUBLIC_WELCOME_ITEMS.map((item) => (
          <FeatureCard
            key={item.href}
            href={item.href}
            title={tItems(item.labelKey)}
            description={tDesc(item.labelKey)}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
}
