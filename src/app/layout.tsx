// src/app/layout.tsx
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "@/providers/theme-provider";
import { TimeProvider } from "@/providers/time-provider";
import { QueryProvider } from "@/providers/query-provider";
import { DEFAULT_PRIMARY_COLOR } from "@/config/settings";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Current request locale (set by next-intl middleware). Works in the root
  // layout too, so the initial SSR has the correct lang/dir.
  const locale = await getLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";

  // Primary color default is rendered on SSR.
  // The client hook `usePrimaryColor` will sync it with the global fake API state on mount.
  const primaryColor = DEFAULT_PRIMARY_COLOR;

  return (
    <html
      lang={locale}
      dir={dir}
      // next-themes flips a class on <html>; suppress the expected SSR diff.
      suppressHydrationWarning
      className={`primary-color-${primaryColor}`}
    >
      <body className="bg-background text-foreground min-h-dvh antialiased" suppressHydrationWarning>
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
          <QueryProvider>
            <TimeProvider>{children}</TimeProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
