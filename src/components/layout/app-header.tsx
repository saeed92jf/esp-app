"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { HelpPopover } from "@/components/layout/help-popover";
import { AppsPopover } from "@/components/layout/apps-popover";
import { DashboardAvatar } from "@/modules/dashboard/components/dashboard-avatar";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";

export interface AppHeaderProps {
  /** Optional page tag / badge displayed in front of the logo in a simple font (e.g. "dashboard", "admin panel", "account") */
  tag?: React.ReactNode;
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
}

/**
 * Unified Base Header for all application pages (Home, Dashboard, Profile, Admin, etc.)
 */
export function AppHeader({
  tag,
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
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "z-[60] top-0 left-0 right-0 w-full h-[var(--header-height)] flex items-center justify-between px-2.5 sm:px-6 shrink-0 bg-transparent backdrop-blur-2xl border-none shadow-none",
        position === 'sticky' && "sticky",
        position === 'absolute' && "absolute",
        position === 'fixed' && "fixed",
        className
      )}
    >
      {/* ── Left Side: Side Menu Button + Logo + Page Tag ── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {menuTrigger ? (
          menuTrigger
        ) : showMenuButton ? (
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
        ) : null}

        {/* Brand Logo (in Anta font) */}
        <Link
          href={logoHref}
          dir="ltr"
          className="flex items-center select-none outline-none cursor-pointer transition-opacity duration-150 hover:opacity-90 shrink-0"
        >
          <Logo compact short={logoShort} className="text-[13px] sm:text-[15px]" />
        </Link>

        {/* Centralized Page Tag: UPPERCASE, bold, no dot, inline with logo */}
        {tag && (
          <div className="inline-flex items-center shrink-0 select-none ms-1.5 sm:ms-2.5 self-center leading-none" dir="ltr">
            <span className="font-sans font-bold uppercase tracking-[0.06em] text-[11px] sm:text-[15px] leading-none text-foreground select-none max-w-[100px] sm:max-w-none truncate">
              {typeof tag === "string" ? tag.replace(/^\.+/, "").toUpperCase() : tag}
            </span>
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
