"use client";

import { useTranslations } from "next-intl";
import { User as UserIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { UserMenu } from "../user/user-menu";
import { SideMenu } from "@/components/layout/side-menu";

export function Header() {
  const t = useTranslations("Auth");
  const { user, loading, logout } = useSimpleAuth();

  const isAuthed = !!user && !loading;

  return (
    <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-header z-header max-w-6xl items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-2">
          {isAuthed && <SideMenu />}

          <Link href="/" className="text-lg font-semibold tracking-tight">
            {t("brand")}
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <UserMenu
              isAuthenticated
              name={user.fullName}
              email={user.email}
              role={user.role}
              imageUrl={user.imageUrl}
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
