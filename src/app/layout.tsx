// src/app/layout.tsx
import type { ReactNode } from 'react';

/**
 * Pass-through root layout.
 * The real <html>/<body> tags live in [locale]/layout.tsx so that the
 * lang/dir attributes can depend on the active locale.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
