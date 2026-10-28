// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { HtmlLangSync } from '@/components/layout/html-lang-sync';
import { PersianDigitsProvider } from '@/components/PersianDigitsProvider';
import { AppShell } from '@/components/layout/app-shell';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
import { routing } from '@/i18n/routing';
import { TooltipProvider } from '@/components/ui/tooltip';

// Locale-aware metadata stays here, since this layout receives `locale`.
export { generateMetadata, viewport } from '@/app/[locale]/metadata';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PersianDigitsProvider enabled={locale === 'fa'} />
      <HtmlLangSync locale={locale} />
      <TooltipProvider>
        <AppShell>{children}</AppShell>
        <ScrollToTop />
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}
