// src/components/layout/header.tsx
"use client";

import { useTranslations } from "next-intl";
import { SignIn } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { AppHeader } from "@/components/layout/app-header";
import { DashboardAvatar } from "@/modules/dashboard/components/dashboard-avatar";
import { HelpPopover } from "@/components/layout/help-popover";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { SideMenu } from "@/components/layout/side-menu";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const t = useTranslations("Auth");
  const { user, loading } = useAuth();

  const rightActions = (
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      <ThemeToggle />
      <LocaleSwitcher />
      {loading ? (
        <Skeleton className="h-9 w-9 rounded-full" />
      ) : user ? (
        <>
          <HelpPopover 
            triggerClassName={HEADER_ICON_BUTTON_CLASS}
            iconClassName={HEADER_ICON_CLASS}
          />
          <DashboardAvatar />
        </>
      ) : (
        <TooltipProvider>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/login" className={cn(HEADER_ICON_BUTTON_CLASS, "flex")} aria-label={t("loginTooltip")}>
                  <SignIn className={HEADER_ICON_CLASS} weight="bold" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium shadow-md">
                {t("loginTooltip")}
              </TooltipContent>
            </Tooltip>

            <Button asChild className="group hidden sm:flex text-[13px] h-[32px] sm:h-[36px] px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors border border-transparent">
              <Link href="/register" className="flex items-center justify-center">
                <span className="relative flex items-center justify-center h-[20px] [perspective:800px]">
                  <span className="opacity-0 grid place-items-center h-full pointer-events-none whitespace-nowrap font-medium">
                    <span className="col-start-1 row-start-1">{t("register")}</span>
                    <span className="col-start-1 row-start-1">{t("registerTooltip")}</span>
                  </span>

                  <span className="absolute inset-0 w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] [transform-style:preserve-3d] group-hover:[transform:rotateX(90deg)]">
                    <span className="absolute inset-0 flex items-center justify-center font-medium whitespace-nowrap [transform:translateZ(10px)] [backface-visibility:hidden]">
                      {t("register")}
                    </span>

                    <span className="absolute inset-0 flex items-center justify-center font-medium whitespace-nowrap [transform:rotateX(-90deg)_translateZ(10px)] [backface-visibility:hidden]">
                      {t("registerTooltip")}
                    </span>
                  </span>
                </span>
              </Link>
            </Button>
          </div>
        </TooltipProvider>
      )}
    </div>
  );

  return (
    <AppHeader
      menuTrigger={<SideMenu />}
      logoHref="/"
      rightActions={rightActions}
    />
  );
}
