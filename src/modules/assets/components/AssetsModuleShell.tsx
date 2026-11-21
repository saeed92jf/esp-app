"use client";

import React, { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AssetsPageContainer } from "./AssetsPageContainer";
import { AssetCategoriesView } from "./AssetCategoriesView";
import { AssetLocationsView } from "./AssetLocationsView";
import { cn } from "@/lib/utils";
import { 
  Gauge, 
  Layers, 
  MapPin 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type AssetTab = "directory" | "categories" | "locations";

export interface AssetsModuleShellProps {
  initialTab?: AssetTab;
}

export function AssetsModuleShell({ initialTab }: AssetsModuleShellProps = {}) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Assets");
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = useMemo<AssetTab>(() => {
    if (initialTab) {
      if ((initialTab as string) === "machinery") return "directory";
      if (["directory", "categories", "locations"].includes(initialTab)) {
        return initialTab;
      }
    }
    const parts = pathname.split("/").filter(Boolean);
    const assetsIdx = parts.indexOf("assets");
    if (assetsIdx !== -1 && parts[assetsIdx + 1]) {
      const seg = parts[assetsIdx + 1];
      if (seg === "machinery" || seg === "directory") return "directory";
      if (seg === "categories") return "categories";
      if (seg === "locations") return "locations";
    }
    return "directory";
  }, [initialTab, pathname]);

  const navItems = useMemo(
    () => [
      { 
        id: "directory" as AssetTab, 
        label: t("nav.machinery"), 
        description: isRtl
          ? "شناسنامه ماشین‌آلات صنعتی، مشخصات فنی، موقعیت استقرار و سوابق نگهداری"
          : "Industrial machinery registry, technical specifications, and maintenance lifecycle",
        icon: Gauge 
      },
      { 
        id: "categories" as AssetTab, 
        label: t("nav.categories"), 
        description: isRtl
          ? "گروه‌بندی تخصصی ماشین‌آلات، پارامترهای مهندسی و بازه‌های استاندارد فنی"
          : "Equipment classification, engineering parameters, and operational thresholds",
        icon: Layers 
      },
      { 
        id: "locations" as AssetTab, 
        label: t("nav.locations"), 
        description: isRtl
          ? "جانمایی و موقعیت استقرار تجهیزات در سالن‌ها، خطوط تولید و کارگاه‌ها"
          : "Physical plant zones, production lines, and workshop bays layout",
        icon: MapPin 
      },
    ],
    [t, isRtl]
  );

  const activeNavItem = useMemo(
    () => navItems.find((item) => item.id === activeTab) || navItems[0],
    [navItems, activeTab]
  );
  const ActiveIcon = activeNavItem.icon;

  const handleTabClick = (tabId: AssetTab) => {
    if (tabId === activeTab) return;
    router.push(`/assets/${tabId}`);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "categories":
        return <AssetCategoriesView />;
      case "locations":
        return <AssetLocationsView />;
      case "directory":
      default:
        return <AssetsPageContainer />;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header (Stable Module Title: ESP Asset - NO subTag) ── */}
      <AppHeader
        tag="ESP Asset"
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
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                const buttonEl = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabClick(item.id)}
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

        {/* ── 3. Main Content Container (Jump-Free Pure Fade Transition) ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Content Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ActiveIcon className="size-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {activeNavItem.label}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {activeNavItem.description}
                  </p>
                </div>
              </div>
            </div>

            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}
