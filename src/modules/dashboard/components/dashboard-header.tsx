"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Bell, SlidersHorizontal } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { HelpPopover } from "@/components/layout/help-popover";
import { AppsPopover } from "@/components/layout/apps-popover";
import { DashboardAvatar } from "./dashboard-avatar";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  displayName?: string;
  userRole?: string;
  tAuth?: (key: string) => string;
  tDashboard?: (key: string, values?: any) => string;
  sidebarOpen?: boolean;
  setSidebarOpen?: (v: boolean) => void;
  linksSidebarOpen?: boolean;
  setLinksSidebarOpen?: (v: boolean) => void;
  isScrolled?: boolean;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onOpenSettings?: () => void;
}

export function DashboardHeader({
  sidebarOpen,
  setSidebarOpen,
  linksSidebarOpen,
  setLinksSidebarOpen,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenSettings,
}: DashboardHeaderProps) {
  const t = useTranslations("Dashboard");
  const isOpen = sidebarOpen ?? linksSidebarOpen ?? false;
  const toggle = () => {
    if (setSidebarOpen) setSidebarOpen(!isOpen);
    else if (setLinksSidebarOpen) setLinksSidebarOpen(!isOpen);
  };

  return (
    <AppHeader
      tag="Dashboard"
      onToggleMenu={toggle}
      isMenuOpen={isOpen}
      logoHref="/"
      position="absolute"
      rightActions={
        <>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Dashboard Settings"
              title={t("schematic.settingsButton")}
              className={cn(
                HEADER_ICON_BUTTON_CLASS,
                "relative text-foreground hover:bg-foreground/[0.08]"
              )}
            >
              <SlidersHorizontal className={HEADER_ICON_CLASS} />
            </button>
          )}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="Daily Notifications"
              title={t("notifications.title")}
              className={cn(
                HEADER_ICON_BUTTON_CLASS,
                "relative text-foreground hover:bg-foreground/[0.08]"
              )}
            >
              <Bell className={HEADER_ICON_CLASS} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2.5 end-2.5 size-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
              )}
            </button>
          )}
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
      }
    />
  );
}
