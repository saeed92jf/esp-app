// src/components/layout/header.tsx
"use client";

import { useTranslations } from "next-intl";
import { User as UserIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/modules/auth/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardAvatar } from "@/modules/dashboard/components/dashboard-avatar";
import { HelpPopover } from "@/components/layout/help-popover";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { SideMenu } from "@/components/layout/side-menu";
import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { user, loading, logout } = useAuth();

  const isAuthed = !!user && !loading;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/50 backdrop-blur-2xl">
      <div className="mx-auto flex h-header z-header w-full items-center justify-between px-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2">
          {isAuthed && <SideMenu />}
          <Link href="/" aria-label={t("brand")}>
            <Logo compact className="text-base sm:text-2xl" />
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          <LocaleSwitcher />
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <>
              <HelpPopover 
                triggerClassName={HEADER_ICON_BUTTON_CLASS}
                iconClassName={HEADER_ICON_CLASS}
              />
              <DashboardAvatar />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="hidden sm:flex text-xs h-8">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:flex text-xs h-8">
                <Link href="/register">{t("register")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
