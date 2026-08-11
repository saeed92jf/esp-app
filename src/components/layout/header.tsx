// src/components/layout/header.tsx
"use client";

import { useTranslations } from "next-intl";
import { User as UserIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/modules/auth/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { UserMenu } from "../user/user-menu";
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
      <div className="mx-auto flex h-header z-header w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {isAuthed && <SideMenu />}
          <Link href="/" aria-label={t("brand")}>
            <Logo compact className="text-xl sm:text-2xl" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="scale-90" />
          <LocaleSwitcher className="scale-90" />
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <UserMenu
              isAuthenticated
              name={(locale === "fa" && user.fullNameFa) ? user.fullNameFa : user.fullName}
              email={user.email}
              role={user.role}
              imageUrl={user.avatar || user.imageUrl}
              size="lg"
              onLogout={logout}
            />
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Link href="/login" aria-label={t("login")}>
                <UserIcon className="text-muted-foreground size-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
