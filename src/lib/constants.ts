// src/lib/constants.ts
export const HEADER_ICON_BUTTON_CLASS = "size-[32px] sm:size-[36px] rounded-full flex items-center justify-center shrink-0 text-foreground/75 hover:text-foreground bg-transparent hover:bg-foreground/[0.07] active:scale-95 cursor-pointer outline-none border-none shadow-none transition-colors duration-150";
export const HEADER_ICON_CLASS = "size-5 shrink-0";

// Global layout dimensions (kept in sync with src/styles/tokens/layout.css)
export const HEADER_HEIGHT_PX = 64;
export const FOOTER_HEIGHT_PX = 44;
export const FOOTER_HEIGHT_MOBILE_PX = 40;

/**
 * Routes where the page background is non-white (specifically `bg-panel` / #f0f3f8 in light mode,
 * dark:bg-background in dark mode).
 * Header and Footer must match this background (Header with transparency and backdrop blur).
 */
export const PANEL_BACKGROUND_PREFIXES = [
  '/dashboard/tasks',
  '/dashboard/projects',
  '/dashboard/profile',
  '/did-you-know',
  '/dictionary',
];

export function isPanelBackgroundRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const pathWithoutQuery = pathname.split('?')[0].split('#')[0];
  const cleanPath = pathWithoutQuery.replace(/^\/(?:fa|en)(?=\/|$)/, '') || '/';
  return PANEL_BACKGROUND_PREFIXES.some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
  );
}

