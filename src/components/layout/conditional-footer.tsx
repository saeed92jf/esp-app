'use client';

import { usePathname } from '@/i18n/navigation';
import { isPanelBackgroundRoute } from '@/lib/constants';
import { Footer } from './footer';

/**
 * Unified application footer rendered across all pages in the root locale layout.
 * Displays as an in-flow full-width continuation of content matching page background.
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  const isPanelBg = isPanelBackgroundRoute(pathname);

  return <Footer variant={isPanelBg ? 'panel' : 'default'} />;
}

