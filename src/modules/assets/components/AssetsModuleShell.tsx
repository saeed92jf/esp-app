"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { AppHeader } from "@/components/layout/app-header";
import { AssetsPageContainer } from "./AssetsPageContainer";
import { cn } from "@/lib/utils";
import { 
  Gauge, 
  Layers, 
  MapPin, 
  Settings2, 
  ShieldCheck 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type AssetTab = "directory" | "categories" | "locations" | "maintenance";

export function AssetsModuleShell() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [activeTab, setActiveTab] = useState<AssetTab>("directory");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(() => [
    { 
      id: "directory" as AssetTab, 
      labelFa: "ماشین‌آلات و تجهیزات", 
      labelEn: "Machinery & Equipment", 
      icon: Gauge 
    },
    { 
      id: "categories" as AssetTab, 
      labelFa: "دسته‌بندی و مشخصات فنی", 
      labelEn: "Categories & Parameters", 
      icon: Layers 
    },
    { 
      id: "locations" as AssetTab, 
      labelFa: "موقعیت‌های فیزیکی و سالن‌ها", 
      labelEn: "Physical Plant Locations", 
      icon: MapPin 
    },
    { 
      id: "maintenance" as AssetTab, 
      labelFa: "قطعات یدکی و قرارداد انبار", 
      labelEn: "Spare Parts & Warehouse", 
      icon: ShieldCheck 
    },
  ], []);

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header (Stable Title: Industrial Assets) ── */}
      <AppHeader
        tag={isRtl ? "تجهیزات و دارایی‌های صنعتی" : "Industrial Assets & Machinery"}
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
            <div className="flex flex-col gap-1.5 px-2.5 sm:px-3">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonEl = (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3.5 w-full rounded-xl transition-all duration-150 text-sm font-medium",
                      sidebarOpen ? "px-3.5 py-2.5" : "justify-center p-2.5 sm:p-3",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span className="truncate">{label}</span>}
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
                      <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonEl;
              })}
            </div>
          </TooltipProvider>
        </aside>

        {/* ── 3. Main Content Container (Jump-Free Pure Fade Transition) ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto space-y-6">
            <AssetsPageContainer />
          </div>
        </main>
      </div>
    </div>
  );
}
