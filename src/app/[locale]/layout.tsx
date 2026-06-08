// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { ConditionalHeader } from '@/components/layout/conditional-header';
import { HtmlLangSync } from '@/components/layout/html-lang-sync';
import { routing } from '@/i18n/routing';

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
      <HtmlLangSync locale={locale} />
      <ConditionalHeader />
      {children}
    </NextIntlClientProvider>
  );
}
