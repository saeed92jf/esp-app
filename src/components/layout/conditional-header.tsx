// src/components/layout/conditional-header.tsx
'use client';

import { usePathname } from '@/i18n/navigation';
import { Header } from './header';

// Routes where the global header must never appear (full-screen auth UIs).
const HIDDEN_PREFIXES = ['/login', '/register', '/welcome'];

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
