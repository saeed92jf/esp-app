// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

/**
 * Detects the locale (from URL, cookie or Accept-Language header) and
 * redirects bare paths to a locale-prefixed equivalent.
 */
export default createMiddleware(routing);

export const config = {
  // Run on every path except Next internals, API routes and static assets.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
