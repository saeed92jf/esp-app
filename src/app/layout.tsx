// src/app/layout.tsx
import type { Metadata } from 'next';
import { Providers } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ESP App',
  description: 'ESP control panel',
};

// Fonts are self-hosted via @font-face in fonts.css and wired through
// the --font-sans token in @theme. No next/font is needed here.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html dir="rtl" lang="fa" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
