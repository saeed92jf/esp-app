// src/components/layout/conditional-header.tsx
'use client';

import { usePathname } from '@/i18n/navigation';
import { Header } from './header';

// Routes where the global header must never appear (full-screen flow editors, dashboards, dedicated search, dictionary, and did-you-know).
// RULE: Any module that ships its own AppHeader in its layout MUST be listed here to prevent duplicate headers.
const HIDDEN_PREFIXES = [
  '/ESP-Flow',
  '/dashboard',
  '/admin',
  '/search',
  '/dictionary',
  '/did-you-know',
  '/community',
  '/profile',
  '/projects',
  '/tasks',
  '/customers',
  '/assets',
  '/directory',
  '/bug-reports',
  // Modules with their own AppHeader in layout — adding here prevents double header
  '/engineering',
];

/**
 * Decides header visibility by ROUTE, not by auth state.
 * The Header itself swaps guest buttons <-> user menu based on auth.
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (hidden) return null;
  return <Header />;
}
