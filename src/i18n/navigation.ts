// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation primitives.
 * Always import Link / useRouter / redirect from here instead of "next/link"
 * or "next/navigation" so the active locale prefix is preserved automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
