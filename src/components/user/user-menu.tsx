"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { User, LayoutDashboard, Settings, UserCog, LogOut } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";

import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface UserMenuProps {
  isAuthenticated?: boolean;
  name?: string;
  role?: string;
  email?: string;
  imageUrl?: string;
  size?: "sm" | "default" | "lg";
  onLogout?: () => Promise<void> | void;
  className?: string;
}

export function UserMenu({
  isAuthenticated = false,
  name,
  role,
  email,
  imageUrl,
  size = "default",
  onLogout,
  className,
}: UserMenuProps) {
  const t = useTranslations("Account");
  const locale = useLocale();
  const router = useRouter();

  const displayName = name ?? t("guest");
  const initial = displayName.charAt(0).toUpperCase();
  const isRTL = locale === "fa";

  async function handleLogout() {
    await onLogout?.();

    // redirect after logout
    router.replace("/welcome");
    router.refresh(); // ensures server components update
  }

  return (
    <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("menuLabel")}
          className={cn(
            "focus-visible:ring-ring focus-visible:ring-offset-background rounded-full transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            isAuthenticated && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background",
            className,
          )}
        >
          <Avatar size={size}>
            {imageUrl ? <AvatarImage src={imageUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className={cn(
          "w-[340px] rounded-[1.5rem] p-3 shadow-2xl bg-background/95 backdrop-blur-xl border-muted",
          isRTL && "text-right"
        )}
      >
        <div className="flex items-center gap-4 p-4 mb-2 bg-muted/30 rounded-[1.25rem] border border-border/50">
          <Avatar className="size-16 border bg-background shrink-0">
            {imageUrl ? <AvatarImage src={imageUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-foreground truncate text-lg font-semibold leading-tight">
              {displayName}
            </span>
            {email && (
              <span className="text-muted-foreground truncate text-sm">
                {email}
              </span>
            )}
            {role && !email && (
              <span className="text-muted-foreground truncate text-sm">
                {role}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuGroup className="px-1 space-y-1">
          <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer transition-colors focus:bg-muted">
            <Link href="/dashboard" className="flex items-center gap-3">
              <LayoutDashboard className="size-5 shrink-0 text-muted-foreground" />
              <span className="font-medium text-sm">{t("dashboard")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer transition-colors focus:bg-muted">
            <Link href="/settings/account" className="flex items-center gap-3">
              <UserCog className="size-5 shrink-0 text-muted-foreground" />
              <span className="font-medium text-sm">{t("account")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer transition-colors focus:bg-muted">
            <Link href="/settings" className="flex items-center gap-3">
              <Settings className="size-5 shrink-0 text-muted-foreground" />
              <span className="font-medium text-sm">{t("settings")}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <div className="px-3 py-2">
          <div className="h-px bg-border/60 w-full rounded-full" />
        </div>

        <div className="px-1 pb-1">
          <DropdownMenuItem
            variant="destructive"
            onSelect={async (e) => {
              e.preventDefault();
              await handleLogout();
            }}
            className="flex items-center justify-center gap-2 rounded-xl p-3 mt-1 cursor-pointer transition-colors border border-transparent focus:border-destructive/30"
          >
            <LogOut className="size-5 shrink-0" />
            <span className="font-medium text-sm">{t("logout")}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
