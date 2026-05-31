// src/providers/theme-provider.tsx
'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

// Thin wrapper so theme config lives in one place and stays a client boundary.
export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>,
) {
  return (
    <NextThemesProvider
      attribute="class" // toggles the `.dark` class Tailwind v4 expects
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange // avoids flash/animation when switching themes
      {...props}
    />
  );
}
