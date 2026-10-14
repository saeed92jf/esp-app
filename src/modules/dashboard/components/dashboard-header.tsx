"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AppHeader } from "@/components/layout/app-header";

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
}

export function DashboardHeader({
  sidebarOpen,
  setSidebarOpen,
  linksSidebarOpen,
  setLinksSidebarOpen,
}: DashboardHeaderProps) {
  const t = useTranslations("Dashboard");
  const isOpen = sidebarOpen ?? linksSidebarOpen ?? false;
  const toggle = () => {
    if (setSidebarOpen) setSidebarOpen(!isOpen);
    else if (setLinksSidebarOpen) setLinksSidebarOpen(!isOpen);
  };

  return (
    <AppHeader
      tag={t("title")}
      onToggleMenu={toggle}
      isMenuOpen={isOpen}
      logoHref="/"
      position="absolute"
    />
  );
}
