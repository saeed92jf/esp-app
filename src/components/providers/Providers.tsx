// src/components/providers/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

// Thin client wrapper so the root layout can stay a Server Component
// while next-themes (which needs the client) lives in its own boundary.
export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>,
) {
  return <NextThemesProvider {...props} />;
}
