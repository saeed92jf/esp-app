'use client';

import { usePathname } from '@/i18n/navigation';
import { Footer } from './footer';

// Routes where the footer must never appear (e.g. full-screen flow editors).
const HIDDEN_PREFIXES = ['/ESP-Flow', '/aparat', '/dashboard'];

export function ConditionalFooter() {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (hidden) return null;
  return <Footer />;
}
