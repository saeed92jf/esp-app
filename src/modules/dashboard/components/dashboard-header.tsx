"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { HelpPopover } from "@/components/layout/help-popover";
import { AppsPopover } from "@/components/layout/apps-popover";
import { NotificationsPopover } from "./notifications/notifications-popover";
import { DashboardAvatar } from "./dashboard-avatar";
import { cn } from "@/lib/utils";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import type {
  DashboardNotificationItem,
  DashboardTask,
} from "../services/dashboard.service";

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
  notifications?: DashboardNotificationItem[];
  tasks?: DashboardTask[];
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export function DashboardHeader({
  sidebarOpen,
  setSidebarOpen,
  linksSidebarOpen,
  setLinksSidebarOpen,
  notifications,
  tasks,
  unreadNotificationsCount = 0,
  isScrolled = false,
}: DashboardHeaderProps) {
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
      position="sticky"
      className={cn(
        "sticky top-0 z-[60] shadow-none",
        isScrolled && "border-b border-border/40"
      )}
      rightActions={
        <>
          <ThemeToggle />
          <LocaleSwitcher />
          <HelpPopover
            triggerClassName={HEADER_ICON_BUTTON_CLASS}
            iconClassName={HEADER_ICON_CLASS}
          />
          <NotificationsPopover
            notifications={notifications}
            tasks={tasks}
            unreadCount={unreadNotificationsCount}
            triggerClassName={HEADER_ICON_BUTTON_CLASS}
            iconClassName="size-5 shrink-0"
          />
          <AppsPopover
            triggerClassName={HEADER_ICON_BUTTON_CLASS}
            iconClassName={HEADER_ICON_CLASS}
          />
          <DashboardAvatar />
        </>
      }
    />
  );
}


