// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing, localeDirection, type Locale } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import '@/styles/globals.css';

/**
 * Pre-generate a static page for each supported locale at build time.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: ReactNode;
  // In Next.js 15 params is a Promise and must be awaited.
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Reject any locale that is not in our routing config.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const dir = localeDirection[locale as Locale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="bg-background text-foreground flex min-h-dvh flex-col antialiased">
        {/* Provider exposes messages to all client components. */}
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
