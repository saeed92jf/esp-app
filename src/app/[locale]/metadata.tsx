// app/metadata.ts
import type { Metadata, Viewport } from 'next';
import { getTranslations } from 'next-intl/server';

// Locale-aware metadata generator. Reads all user-facing strings from the
// "Metadata" namespace of the active locale so each language renders its own
// title/description. Re-exported (as `generateMetadata`) from the locale layout.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Scope translations to the "Metadata" namespace for the current locale.
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: 'ESP Team' }],
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      // Helps crawlers/social cards know the content language.
      locale,
    },
  };
}

// Viewport is locale-independent, so it stays a static export.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
