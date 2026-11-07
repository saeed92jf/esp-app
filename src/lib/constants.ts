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
  '/tasks',
  '/projects',
  '/customers',
  '/profile',
  '/community',
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


/**
 * Global Header Popover Content Style
 * Unified dimensions, max-height, backdrop, borders, fillets, and shadows for header dropdowns.
 */
export const HEADER_POPOVER_CONTENT_CLASS = 
  "relative w-[calc(100vw-24px)] max-w-[380px] sm:w-[380px] h-[520px] sm:h-[560px] max-h-[calc(100dvh-var(--header-height)-1.25rem)] flex flex-col p-0 bg-popover rounded-[22px] sm:rounded-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border border-border/40 z-[100] overflow-hidden";

/**
 * Global Header Popover Scroll Viewport Container
 * Provides generous clearance (padding-end: 22px-26px) so the scrollbar track NEVER overlaps the cards or items.
 */
export const HEADER_POPOVER_BODY_CLASS = 
  "flex flex-col w-full ps-3.5 sm:ps-4 pe-5.5 sm:pe-6.5 pt-[52px] sm:pt-[56px] pb-4";
