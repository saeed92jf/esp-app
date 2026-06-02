// src/app/layout.tsx
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import {
  DEFAULT_PRIMARY_COLOR,
  PRIMARY_COLOR_STORAGE_KEY,
} from '@/config/settings';
import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Current request locale (set by next-intl middleware). Works in the root
  // layout too, so the initial SSR has the correct lang/dir.
  const locale = await getLocale();
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  // Primary color is read from the cookie on the server (single source of
  // truth). Applied as a class on <html> => no inline script, no FOUC.
  const cookieStore = await cookies();
  const primaryColor =
    cookieStore.get(PRIMARY_COLOR_STORAGE_KEY)?.value ?? DEFAULT_PRIMARY_COLOR;

  return (
    <html
      lang={locale}
      dir={dir}
      // next-themes flips a class on <html>; suppress the expected SSR diff.
      suppressHydrationWarning
      className={`primary-color-${primaryColor}`}
    >
      <body className="bg-background text-foreground min-h-dvh antialiased">
        {/*
          ThemeProvider lives in the ROOT layout, which never re-renders on a
          locale switch. So the <script> next-themes injects is only ever
          rendered on the server => the "script tag while rendering" warning
          can no longer happen.
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
