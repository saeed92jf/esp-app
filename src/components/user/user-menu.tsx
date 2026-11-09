"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { User, LayoutDashboard, Settings, UserCog, LogOut, ShieldCheck } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";

import { cn } from "@/lib/utils";
import { getRoleGradient, getRoleGlowShadow } from "@/lib/role-avatar";
import {
  Avatar,
  
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

  const isRTL = locale === "fa";
  const displayName = name ?? (isRTL ? "کاربر سامانه" : "User");
  const initial = displayName.charAt(0).toUpperCase();

  const getRoleBadge = (roleKey?: string) => {
    const r = (roleKey || 'user').toLowerCase();
    switch (r) {
      case 'superadmin':
        return {
          label: isRTL ? 'سوپر ادمین' : 'Super Admin',
          className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35 font-bold',
        };
      case 'admin':
        return {
          label: isRTL ? 'مدیر ارشد سامانه' : 'System Admin',
          className: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35 font-bold',
        };
      case 'dept_admin':
      case 'deptadmin':
        return {
          label: isRTL ? 'ادمین دپارتمان' : 'Department Admin',
          className: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold',
        };
      case 'office_admin':
      case 'officeadmin':
        return {
          label: isRTL ? 'ادمین اداری' : 'Office Admin',
          className: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30 font-semibold',
        };
      case 'manager':
        return {
          label: isRTL ? 'مدیر واحد' : 'Department Manager',
          className: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold',
        };
      case 'engineer':
        return {
          label: isRTL ? 'مهندس فنی' : 'Technical Engineer',
          className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 font-semibold',
        };
      case 'staff':
        return {
          label: isRTL ? 'پرسنل سازمانی' : 'Corporate Staff',
          className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold',
        };
      case 'customer':
        return {
          label: isRTL ? 'کارفرما / مشتری' : 'Client / Customer',
          className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold',
        };
      default:
        return {
          label: isRTL ? 'کاربر سامانه' : 'Standard User',
          className: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-medium',
        };
    }
  };

  async function handleLogout() {
    await onLogout?.();

    // redirect after logout
    router.replace("/");
    router.refresh(); // ensures server components update
  }

  return (
    <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("menuLabel")}
          className={cn(
            "relative flex items-center justify-center p-0.5 rounded-full group cursor-pointer outline-none ring-0",
            className,
          )}
        >
          {isAuthenticated && (
            <div className={cn("absolute inset-0 rounded-full opacity-85 group-hover:opacity-100 transition-all", getRoleGradient(role), getRoleGlowShadow(role))} />
          )}
          <div className="relative z-10 bg-background rounded-full p-[2px]">
            <Avatar size={size}>
              
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {initial}
              </AvatarFallback>
            </Avatar>
          </div>
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
            
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-foreground truncate text-lg font-semibold leading-tight">
              {displayName}
            </span>
            {email && (
              <span className="text-muted-foreground truncate text-sm" dir="ltr">
                {email}
              </span>
            )}
            {role && (
              <div className="flex items-center mt-1">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] border shadow-2xs font-semibold select-none",
                  getRoleBadge(role).className
                )}>
                  <ShieldCheck size={11} className="stroke-[2.2] shrink-0" />
                  <span>{getRoleBadge(role).label}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <DropdownMenuGroup className="px-1 space-y-1">
          <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer transition-colors focus:bg-muted">
            <Link href="/dashboard" target="_blank" className="flex items-center gap-3">
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
