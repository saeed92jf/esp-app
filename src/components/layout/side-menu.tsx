"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SideMenuContent } from "@/components/layout/side-menu-content";
import { useHomeSidebar } from "@/modules/home/hooks/use-home-sidebar";
import { useAuth } from "@/modules/auth/hooks/use-auth";

export function SideMenu() {
  const locale = useLocale();
  const pathname = usePathname();
  const tMenu = useTranslations("Menu");
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const homeSidebar = useHomeSidebar();
  const isHomePage = pathname === "/" || pathname === "";

  const [open, setOpen] = useState(false);
  const side = locale === "fa" ? "right" : "left";

  // Ensure sidebar is closed if unauthenticated
  useEffect(() => {
    if (!isAuthenticated && homeSidebar.isOpen) {
      homeSidebar.close();
    }
  }, [isAuthenticated, homeSidebar]);

  // Disable side menu button before login with standard project tooltip & default mouse cursor
  if (!isAuthenticated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-default">
              <button
                type="button"
                disabled
                className={cn(
                  HEADER_ICON_BUTTON_CLASS,
                  "opacity-35 cursor-default select-none hover:bg-transparent"
                )}
                aria-label={tMenu("loginRequired")}
                aria-disabled="true"
              >
                <AnimatedHamburger isOpen={false} />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs font-medium shadow-md">
            {tMenu("loginRequired")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If on home page, render inline drawer trigger without sheet overlay
  if (isHomePage) {
    return (
      <button
        type="button"
        onClick={homeSidebar.toggle}
        className={cn(HEADER_ICON_BUTTON_CLASS, homeSidebar.isOpen && "bg-foreground/[0.08] text-foreground")}
        aria-label={homeSidebar.isOpen ? (tMenu("close") || "بستن") : tMenu("open")}
      >
        <AnimatedHamburger isOpen={homeSidebar.isOpen} />
      </button>
    );
  }

  // Fallback sheet for other pages
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(HEADER_ICON_BUTTON_CLASS, open && "bg-foreground/[0.08] text-foreground")}
        aria-label={open ? (tMenu("close") || "بستن") : tMenu("open")}
      >
        <AnimatedHamburger isOpen={open} />
      </button>

      <SheetContent
        side={side}
        belowHeader={true}
        showCloseButton={false}
        className="bottom-[calc(var(--footer-height)+10px)] data-[side=left]:bottom-[calc(var(--footer-height)+10px)] data-[side=left]:h-[calc(100dvh-var(--header-height)-var(--footer-height)-10px)] data-[side=right]:bottom-[calc(var(--footer-height)+10px)] data-[side=right]:h-[calc(100dvh-var(--header-height)-var(--footer-height)-10px)] flex w-[min(320px,calc(100vw-28px))] sm:w-85 flex-col gap-0 p-0 bg-popover rounded-none border-border/40 shadow-xl overflow-hidden"
      >
        <SideMenuContent onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
