"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Binary,
  Layers,
  Database,
  LayoutDashboard,
  Atom,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function EspCodingLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("espCoding.nav");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      id: "workspace",
      label: t("workspace"),
      href: "/engineering/esp-coding",
      icon: LayoutDashboard,
      isActive: pathname === "/engineering/esp-coding",
    },
    {
      id: "products",
      label: t("products"),
      href: "/engineering/esp-coding/products",
      icon: Binary,
      isActive: pathname.startsWith("/engineering/esp-coding/products"),
    },
    {
      id: "material-coding",
      label: t("materialCoding"),
      href: "/engineering/esp-coding/material-coding",
      icon: Atom,
      isActive: pathname.startsWith("/engineering/esp-coding/material-coding"),
    },
    {
      id: "materials",
      label: t("materials"),
      href: "/engineering/esp-coding/materials",
      icon: Database,
      isActive: pathname.startsWith("/engineering/esp-coding/materials"),
    },
    {
      id: "classification",
      label: t("classification"),
      href: "/engineering/esp-coding/classification",
      icon: Layers,
      isActive: pathname.startsWith("/engineering/esp-coding/classification"),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header (Stable Module Title: ESP Coding - NO subTag) ── */}
      <AppHeader
        tag="ESP Coding"
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
      />

      <div className="flex flex-1 w-full relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── 2. Unified Collapsible Sidebar Navigation ── */}
        <aside
          className={cn(
            "flex flex-col shrink-0 sticky top-[var(--header-height)] self-start max-h-[calc(100dvh-var(--header-height)-var(--footer-height))] bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none py-6",
            "absolute md:sticky start-0 top-0 md:top-[var(--header-height)]",
            sidebarOpen
              ? "w-64 translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "max-md:-translate-x-full max-md:rtl:translate-x-full max-md:opacity-0 max-md:pointer-events-none md:translate-x-0 md:rtl:translate-x-0 rtl:md:translate-x-0 md:opacity-100 md:pointer-events-auto w-[52px] sm:w-[64px]"
          )}
        >
          <TooltipProvider delayDuration={150}>
            <nav
              className={cn(
                "flex flex-col gap-2.5 w-full ps-[5px] sm:ps-[11px] items-start transition-all duration-300",
                sidebarOpen ? "pe-3 sm:pe-4" : "pe-[5px] sm:pe-[11px]"
              )}
            >
              {navItems.map((item) => {
                const isActive = item.isActive;
                const Icon = item.icon;

                const buttonEl = (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => router.prefetch(item.href)}
                    onFocus={() => router.prefetch(item.href)}
                    onClick={() => {
                      router.push(item.href);
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      "group relative flex items-center rounded-full outline-none cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]",
                      isActive
                        ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                        : "bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60"
                    )}
                    aria-label={item.label}
                  >
                    {/* Fixed 42px circle icon - 100% fixed position, aligned with header button */}
                    <div className="size-[42px] shrink-0 flex items-center justify-center">
                      <Icon className={cn("size-5 shrink-0 transition-colors duration-150", isActive ? "text-white" : "text-foreground/60 group-hover:text-foreground")} />
                    </div>

                    {/* Smooth horizontal expansion label */}
                    <span
                      className={cn(
                        "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                        isActive ? "font-semibold text-white" : "font-medium text-foreground/75 group-hover:text-foreground",
                        sidebarOpen
                          ? "opacity-100 max-w-[170px] pe-3 ps-1"
                          : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
                      <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonEl;
              })}
            </nav>
          </TooltipProvider>
        </aside>

        {/* ── 3. Main Content Container (Rule F: Pure Opacity Fade, No Vertical Slide) ── */}
        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-150 overflow-x-hidden">
          <div className="max-w-6xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
