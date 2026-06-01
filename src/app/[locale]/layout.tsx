import type { ReactNode } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import '@/app/globals.css';

// Pre-render all configured locales at build time
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Reject unknown locales -> render the not-found page
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  // Load translation messages for the active locale
  const messages = await getMessages();

  // Text direction follows the locale (Persian = RTL)
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
