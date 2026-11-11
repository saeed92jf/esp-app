// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { AUTH_TOKEN_KEY } from '@/services/core/types';

const intlMiddleware = createMiddleware(routing);

/**
 * Route paths that require an active authenticated session.
 * Evaluated against normalized paths without the locale prefix (e.g. /profile, /dashboard).
 */
const PROTECTED_PREFIXES = [
  '/profile',
  '/dashboard',
  '/admin',
  '/tasks',
  '/projects',
  '/ESP-Flow',
  '/datasheet-ai',
];

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Extract potential locale and normalized path without locale segment
  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = segments.length > 0 && (routing.locales as readonly string[]).includes(segments[0]);

  // Determine active locale from segment, cookie, or default
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = hasLocale
    ? segments[0]
    : ((routing.locales as readonly string[]).includes(cookieLocale || '') ? cookieLocale! : routing.defaultLocale);

  const pathWithoutLocale = '/' + (hasLocale ? segments.slice(1).join('/') : segments.join('/'));

  // 2. Check if current route is protected
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`)
  );

  // 3. Check for auth token in cookies
  const token =
    request.cookies.get(AUTH_TOKEN_KEY)?.value ||
    request.cookies.get('esp_auth_token')?.value ||
    request.cookies.get('token')?.value;

  const hasValidToken = Boolean(
    token && token.trim().length > 0 && token !== 'undefined' && token !== 'null'
  );

  // 4. If accessing a protected route without a valid token, immediately redirect to login
  if (isProtected && !hasValidToken) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    // Preserve full intended destination with query params for seamless post-login redirect
    const returnTarget = `${pathname}${search}`;
    loginUrl.searchParams.set('redirect', returnTarget);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Delegate all locale negotiation and default routing to next-intl
  return intlMiddleware(request);
}

export const config = {
  // Run on every path except Next internals, API routes and static assets.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
