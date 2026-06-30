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
            className,
          )}
        >
          <Avatar size={size}>
            {imageUrl ? <AvatarImage src={imageUrl} alt={displayName} /> : null}

            <AvatarFallback>
              <User className="size-1/2" aria-hidden />
            </AvatarFallback>

            {isAuthenticated ? (
              <AvatarBadge
                aria-label={t("online")}
                className="bg-emerald-500"
              />
            ) : null}
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn("w-60", isRTL && "text-right")}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground truncate text-sm font-medium">
              {displayName}
            </span>

            {role && (
              <span className="text-muted-foreground truncate text-xs">
                {role}
              </span>
            )}

            {email && (
              <span className="text-muted-foreground truncate text-xs">
                {email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="size-4 shrink-0" />
              <span>{t("dashboard")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings/account" className="flex items-center gap-2">
              <UserCog className="size-4 shrink-0" />
              <span>{t("account")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="size-4 shrink-0" />
              <span>{t("settings")}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={async (e) => {
            e.preventDefault();
            await handleLogout();
          }}
          className="flex items-center gap-2"
        >
          <LogOut className="size-4 shrink-0" />
          <span>{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
