// src/app/[locale]/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Search, LayoutGrid, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Localized home page.
 * Renders the hero, a search box and a grid of quick-access cards.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  // Re-enable static rendering inside the page itself.
  setRequestLocale(locale);

  return <HomeContent />;
}

/**
 * Separated so the synchronous `useTranslations` hook can be used
 * (hooks cannot run in an async server component).
 */
function HomeContent() {
  const t = useTranslations('Home');
  const tCommon = useTranslations('Common');

  // Quick-access cards. Titles use Home namespace keys in a real app;
  // kept inline-translated here for the scaffold.
  const cards = [
    { icon: LayoutGrid, key: 'quickAccess' },
    { icon: Star, key: 'quickAccess' },
    { icon: Clock, key: 'quickAccess' },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{t('heroTitle')}</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
          {t('heroSubtitle')}
        </p>

        {/* Search box — icon placed with logical inset so it flips in RTL */}
        <div className="relative mx-auto mt-8 max-w-md">
          <Search
            className="text-muted-foreground pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            // `dir="auto"` lets the input mirror based on typed content.
            dir="auto"
            placeholder={tCommon('searchPlaceholder')}
            aria-label={tCommon('search')}
            className="ps-9"
          />
        </div>
      </section>

      {/* Quick-access grid */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">{t('quickAccess')}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, key }, i) => (
            <Card
              key={i}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <Icon className="text-primary size-6" aria-hidden="true" />
                <CardTitle className="mt-2">{t(key)}</CardTitle>
                <CardDescription dir="auto">
                  {t('heroSubtitle')}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
