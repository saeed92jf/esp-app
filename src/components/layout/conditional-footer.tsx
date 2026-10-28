'use client';

import { usePathname } from '@/i18n/navigation';
import { isPanelBackgroundRoute } from '@/lib/constants';
import { Footer } from './footer';

/**
 * Unified application footer rendered across all pages in the root locale layout.
 * Displays as an in-flow full-width continuation of content matching page background.
 */
// Routes where the global footer must not appear (e.g. dedicated search with its own Google-style footer).
const HIDDEN_FOOTER_PREFIXES = ['/search', '/ESP-Flow'];

export function ConditionalFooter() {
  const pathname = usePathname();
  const hidden = HIDDEN_FOOTER_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (hidden) return null;

  const isPanelBg = isPanelBackgroundRoute(pathname);
  return <Footer variant={isPanelBg ? 'panel' : 'default'} />;
}

