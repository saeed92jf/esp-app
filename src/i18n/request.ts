// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/**
 * Server-side per-request i18n config.
 * Resolves the active locale and lazy-loads the matching message bundle
 * so each request only ships the translations it needs.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale comes from the [locale] segment.
  const requested = await requestLocale;

  // Guard against unknown locales; fall back to the default.
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Dynamic import keeps unused locale bundles out of the request.
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
