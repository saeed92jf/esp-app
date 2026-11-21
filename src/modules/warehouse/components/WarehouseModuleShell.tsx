// src/modules/warehouse/components/WarehouseModuleShell.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Package,
  MapPin,
  ArrowLeftRight,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WarehouseTab } from "../types/warehouse.types";
import { WarehouseInventoryView } from "./WarehouseInventoryView";
import { WarehouseLocationsView } from "./WarehouseLocationsView";
import { WarehouseTransactionsView } from "./WarehouseTransactionsView";
import { WarehouseReceiptsView } from "./WarehouseReceiptsView";

export interface WarehouseModuleShellProps {
  initialTab?: WarehouseTab;
}

export function WarehouseModuleShell({ initialTab }: WarehouseModuleShellProps = {}) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = useMemo<WarehouseTab>(() => {
    if (initialTab && ["inventory", "locations", "transactions", "receipts"].includes(initialTab)) {
      return initialTab;
    }
    const parts = pathname.split("/").filter(Boolean);
    const warehouseIdx = parts.indexOf("warehouse");
    if (warehouseIdx !== -1 && parts[warehouseIdx + 1]) {
      const seg = parts[warehouseIdx + 1];
      if (["inventory", "locations", "transactions", "receipts"].includes(seg)) {
        return seg as WarehouseTab;
      }
    }
    return "inventory";
  }, [initialTab, pathname]);

  const navItems = useMemo(
    () => [
      {
        id: "inventory" as WarehouseTab,
        label: t("nav.inventory"),
        description: isRtl
          ? "مدیریت موجودی قطعات، اقلام خام، پالت‌بندی و مشخصات فنی اقلام انبار"
          : "Stock levels, raw materials, pallet tracking, and technical specifications",
        icon: Package,
      },
      {
        id: "locations" as WarehouseTab,
        label: t("nav.locations"),
        description: isRtl
          ? "مدیریت سالن‌ها، زون‌های ذخیره‌سازی، قفسه‌بندی و ضریب اشغال انبار"
          : "Warehouse bays, storage zones, rack systems, and occupancy metrics",
        icon: MapPin,
      },
      {
        id: "transactions" as WarehouseTab,
        label: t("nav.transactions"),
        description: isRtl
          ? "رهگیری تراکنش‌های ورود، خروج، انتقالات داخلی و حواله‌های مصرف خط تولید"
          : "Track inbound, outbound, internal transfers, and production consumption",
        icon: ArrowLeftRight,
      },
      {
        id: "receipts" as WarehouseTab,
        label: t("nav.receipts"),
        description: isRtl
          ? "ثبت و مدیریت اسناد انبارداری، رسید کالا (MRV) و حواله‌های خروج به کارگاه (SIO)"
          : "Manage warehouse vouchers, material receipt vouchers (MRV), and store issue orders (SIO)",
        icon: FileText,
      },
    ],
    [t, isRtl]
  );

  const activeNavItem = useMemo(
    () => navItems.find((item) => item.id === activeTab) || navItems[0],
    [navItems, activeTab]
  );
  const ActiveIcon = activeNavItem.icon;

  const handleTabClick = (tabId: WarehouseTab) => {
    if (tabId === activeTab) return;
    router.push(`/warehouse/${tabId}`);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "locations":
        return <WarehouseLocationsView />;
      case "transactions":
        return <WarehouseTransactionsView />;
      case "receipts":
        return <WarehouseReceiptsView />;
      case "inventory":
      default:
        return <WarehouseInventoryView />;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header (Stable Module Title: ESP Warehouse - NO subTag) ── */}
      <AppHeader
        tag="ESP Warehouse"
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

        {/* ── 2. Unified Collapsible Sidebar Navigation (Profile Manager Style) ── */}
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
                      <Icon
                        className={cn(
                          "size-5 shrink-0 transition-colors duration-150",
                          isActive ? "text-white" : "text-foreground/60 group-hover:text-foreground"
                        )}
                      />
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

        {/* ── 3. Main Content Container (Jump-Free Pure Fade Transition & Spacious Width) ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-150">
          <div className="max-w-[1700px] w-full mx-auto space-y-6">
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
