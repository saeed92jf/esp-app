// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

/**
 * Central i18n routing definition.
 * Every supported locale and the URL-prefix strategy live here so that
 * middleware, navigation helpers and layouts share a single source of truth.
 */
export const routing = defineRouting({
  // All locales the app can serve.
  locales: ['fa', 'en'],

  // Fallback locale when no match is found.
  defaultLocale: 'fa',

  // Always show the locale segment (e.g. /fa, /en) — never a bare "/".
  localePrefix: 'always',
});

// Strongly-typed union of valid locales: "fa" | "en".
export type Locale = (typeof routing.locales)[number];

/**
 * Maps each locale to its writing direction.
 * Consumed by the <html dir> attribute in the locale layout.
 */
export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = {
  fa: 'rtl',
  en: 'ltr',
};

/**
 * Human-readable labels for the locale switcher UI.
 */
export const localeLabels: Record<Locale, string> = {
  fa: 'فارسی',
  en: 'English',
};
