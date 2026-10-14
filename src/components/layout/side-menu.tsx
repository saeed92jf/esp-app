"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { SideMenuContent } from "@/components/layout/side-menu-content";
import { useHomeSidebar } from "@/modules/home/hooks/use-home-sidebar";

export function SideMenu() {
  const locale = useLocale();
  const pathname = usePathname();
  const tMenu = useTranslations("Menu");

  const homeSidebar = useHomeSidebar();
  const isHomePage = pathname === "/" || pathname === "";

  const [open, setOpen] = useState(false);
  const side = locale === "fa" ? "right" : "left";

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
        className="flex w-75 flex-col gap-0 p-4 sm:w-85 bg-popover rounded-none border-border/40 shadow-xl overflow-hidden"
      >
        <SideMenuContent onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
