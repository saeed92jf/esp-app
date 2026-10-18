"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { HelpPopover } from "@/components/layout/help-popover";
import { AppsPopover } from "@/components/layout/apps-popover";
import { NotificationsPopover } from "./notifications/notifications-popover";
import { DashboardSettingsPopover } from "./settings/dashboard-settings-popover";
import { DashboardAvatar } from "./dashboard-avatar";
import type { TabId } from "../config/modules-registry";
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
  onOpenSettings?: () => void;
  currentTab?: TabId;
  onChangeTab?: (tab: TabId) => void;
  tabWidgets?: Record<TabId, string[]>;
  onToggleWidgetInTab?: (tabId: TabId, widgetId: string) => void;
  slideRailItems?: string[];
  onToggleSlideRailItem?: (id: string) => void;
  onResetCurrentTab?: (tabId?: TabId) => void;
}

export function DashboardHeader({
  sidebarOpen,
  setSidebarOpen,
  linksSidebarOpen,
  setLinksSidebarOpen,
  notifications,
  tasks,
  unreadNotificationsCount = 0,
  onOpenSettings,
  currentTab,
  onChangeTab,
  tabWidgets,
  onToggleWidgetInTab,
  slideRailItems,
  onToggleSlideRailItem,
  onResetCurrentTab,
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
          {tabWidgets && onToggleWidgetInTab ? (
            <DashboardSettingsPopover
              currentTab={currentTab}
              onChangeTab={onChangeTab}
              tabWidgets={tabWidgets}
              onToggleWidgetInTab={onToggleWidgetInTab}
              slideRailItems={slideRailItems}
              onToggleSlideRailItem={onToggleSlideRailItem}
              onResetCurrentTab={onResetCurrentTab}
              triggerClassName={HEADER_ICON_BUTTON_CLASS}
              iconClassName={HEADER_ICON_CLASS}
            />
          ) : onOpenSettings ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onOpenSettings}
                    aria-label="Dashboard Settings"
                    className={HEADER_ICON_BUTTON_CLASS}
                  >
                    <SlidersHorizontal className={HEADER_ICON_CLASS} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                  {t("schematic.settingsButton")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}

          <NotificationsPopover
            notifications={notifications}
            tasks={tasks}
            unreadCount={unreadNotificationsCount}
            triggerClassName={HEADER_ICON_BUTTON_CLASS}
            iconClassName={HEADER_ICON_CLASS}
          />

          <ThemeToggle />
          <LocaleSwitcher />
          <HelpPopover
            triggerClassName={HEADER_ICON_BUTTON_CLASS}
            iconClassName={HEADER_ICON_CLASS}
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

