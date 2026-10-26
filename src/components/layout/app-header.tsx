"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { HelpPopover } from "@/components/layout/help-popover";
import { AppsPopover } from "@/components/layout/apps-popover";
import { NotificationsPopover } from "@/modules/dashboard/components/notifications/notifications-popover";
import { DashboardAvatar } from "@/modules/dashboard/components/dashboard-avatar";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import {
  HEADER_ICON_BUTTON_CLASS,
  HEADER_ICON_CLASS,
  isPanelBackgroundRoute,
} from "@/lib/constants";

export interface AppHeaderProps {
  /** Optional background variant: 'panel' for non-white pages, 'default' for standard white. Auto-detected from route if omitted. */
  variant?: "default" | "panel";
  /** Optional page tag / badge displayed in front of the logo in a simple font (e.g. "dashboard", "admin panel", "account") */
  tag?: React.ReactNode;
  /** Optional secondary sub-tag displayed after tag with a breadcrumb arrow (e.g. "overview") */
  subTag?: React.ReactNode;
  /** Custom click handler for toggling the page's side menu */
  onToggleMenu?: () => void;
  /** Whether the side menu is currently open */
  isMenuOpen?: boolean;
  /** Whether to show the side menu button on the left (default: true) */
  showMenuButton?: boolean;
  /** Custom menu trigger component (e.g. <SideMenu /> on Home) */
  menuTrigger?: React.ReactNode;
  /** Custom link URL for the brand logo (default: "/") */
  logoHref?: string;
  /** Whether to display abbreviated brand logo (ESP CORE instead of EUROSLOT PARS CORE) */
  logoShort?: boolean;
  /** Custom actions on the right side. Defaults to ThemeToggle, LocaleSwitcher, Help, Apps, Avatar */
  rightActions?: React.ReactNode;
  /** Children rendered between left group and right controls */
  children?: React.ReactNode;
  /** Position style of the header: 'sticky' | 'absolute' | 'fixed' (default: 'sticky') */
  position?: 'sticky' | 'absolute' | 'fixed';
  /** Extra container className */
  className?: string;
  /** Whether to show notifications popover when logged in (default: true) */
  showNotifications?: boolean;
}

/**
 * Unified Base Header for all application pages (Home, Dashboard, Profile, Admin, etc.)
 */
export function AppHeader({
  variant,
  tag,
  subTag,
  onToggleMenu,
  isMenuOpen,
  showMenuButton = true,
  menuTrigger,
  logoHref = "/",
  logoShort = true,
  rightActions,
  children,
  position = 'sticky',
  className,
  showNotifications = true,
}: AppHeaderProps) {
  const { user } = useAuth();
  const tHeader = useTranslations("Header");
  const locale = useLocale();
  const isFa = locale === "fa";
  const pathname = usePathname();

  const isPanelBg =
    variant !== undefined
      ? variant === "panel"
      : isPanelBackgroundRoute(pathname);

  let displayTag: React.ReactNode = tag;
  if (typeof tag === "string") {
    const cleanKey = tag.toLowerCase().trim().replace(/^\.+/, "");
    if (tHeader.has(`tags.${cleanKey}`)) {
      displayTag = tHeader(`tags.${cleanKey}`);
    } else {
      displayTag = tag;
    }
    if (!isFa && typeof displayTag === "string") {
      displayTag = displayTag.toUpperCase();
    }
  }

  let displaySubTag: React.ReactNode = subTag;
  if (typeof subTag === "string") {
    const cleanSubKey = subTag.toLowerCase().trim().replace(/^\.+/, "");
    if (tHeader.has(`tags.${cleanSubKey}`)) {
      displaySubTag = tHeader(`tags.${cleanSubKey}`);
    } else {
      displaySubTag = subTag;
    }
    if (!isFa && typeof displaySubTag === "string") {
      displaySubTag = displaySubTag.toUpperCase();
    }
  }

  return (
    <header
      className={cn(
        "top-0 z-[60] left-0 right-0 w-full h-[var(--header-height)] min-h-[var(--header-height)] max-h-[var(--header-height)] flex items-center justify-between ps-0 pe-2.5 sm:pe-6 shrink-0 backdrop-blur-xl border-none transition-colors shadow-none box-border",
        position === 'absolute' ? 'absolute' : position === 'fixed' ? 'fixed' : 'sticky',
        isPanelBg
          ? "bg-panel/80 dark:bg-background/80"
          : "bg-background/80 dark:bg-background/80",
        className
      )}
    >
      {/* ── Left Side: Side Menu Button + Logo + Page Tag ── */}
      <div className="flex items-center min-w-0">
        {(menuTrigger || showMenuButton) && (
          <div className="w-[52px] sm:w-[64px] h-[var(--header-height)] flex items-center justify-center shrink-0">
            {menuTrigger ? (
              menuTrigger
            ) : (
              <button
                type="button"
                onClick={onToggleMenu}
                aria-label="Menu"
                className={cn(
                  HEADER_ICON_BUTTON_CLASS,
                  isMenuOpen && "bg-foreground/[0.08] text-foreground"
                )}
              >
                <AnimatedHamburger isOpen={Boolean(isMenuOpen)} />
              </button>
            )}
          </div>
        )}

        {/* Brand Logo (in Anta font) */}
        <Link
          href={logoHref}
          dir="ltr"
          className={cn(
            "flex items-center select-none outline-none cursor-pointer transition-opacity duration-150 hover:opacity-90 shrink-0",
            (menuTrigger || showMenuButton) ? "ms-0.5 sm:ms-1" : "ps-2.5 sm:ps-6"
          )}
        >
          <Logo compact short={logoShort} className="text-[13px] sm:text-[15px]" />
        </Link>

        {/* Centralized Page Tag: Breadcrumb Arrow > and Tag Name */}
        {tag && (
          <div className="inline-flex items-center gap-1 sm:gap-1.5 shrink-0 select-none ms-1.5 sm:ms-2.5 self-center">
            <ChevronRight
              className="size-3.5 sm:size-4 text-muted-foreground/60 rtl:rotate-180 shrink-0 stroke-[2.2]"
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-[12px] sm:text-[14px] text-foreground font-bold select-none max-w-[120px] sm:max-w-none truncate",
                isFa
                  ? "relative -top-[1.5px] sm:-top-[2px] tracking-normal leading-tight"
                  : "uppercase tracking-[0.06em] leading-none"
              )}
            >
              {displayTag}
            </span>
            {subTag && (
              <>
                <ChevronRight
                  className="size-3.5 sm:size-4 text-muted-foreground/60 rtl:rotate-180 shrink-0 stroke-[2.2]"
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "text-[12px] sm:text-[14px] text-foreground font-bold select-none max-w-[120px] sm:max-w-none truncate",
                    isFa
                      ? "relative -top-[1.5px] sm:-top-[2px] tracking-normal leading-tight"
                      : "uppercase tracking-[0.06em] leading-none"
                  )}
                >
                  {displaySubTag}
                </span>
              </>
            )}
          </div>
        )}

        {children}
      </div>

      {/* ── Right Side: Controls & User Menu ── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 origin-right rtl:origin-left">
        {rightActions ? (
          rightActions
        ) : (
          <>
            <ThemeToggle />
            <LocaleSwitcher />
            <HelpPopover
              triggerClassName={HEADER_ICON_BUTTON_CLASS}
              iconClassName={HEADER_ICON_CLASS}
            />
            {user && showNotifications && (
              <NotificationsPopover
                triggerClassName={HEADER_ICON_BUTTON_CLASS}
                iconClassName="size-5 shrink-0"
              />
            )}
            <AppsPopover
              triggerClassName={cn(HEADER_ICON_BUTTON_CLASS, "hidden xs:inline-flex")}
              iconClassName={HEADER_ICON_CLASS}
            />
            <DashboardAvatar />
          </>
        )}
      </div>
    </header>
  );
}
