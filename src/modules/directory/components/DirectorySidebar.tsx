"use client";

import React from "react";
import {
  Users,
  Building2,
  Sparkles,
  Layers,
  Grid,
  List,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DepartmentOption {
  id: string;
  label: string;
  count: number;
}

export interface DirectorySidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedCompany: "all" | "esp" | "npc" | "dual";
  setSelectedCompany: (company: "all" | "esp" | "npc" | "dual") => void;
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
  departments: DepartmentOption[];
  stats: {
    total: number;
    espCount: number;
    npcCount: number;
    dualCount: number;
  };
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
}

export function DirectorySidebar({
  sidebarOpen,
  setSidebarOpen,
  selectedCompany,
  setSelectedCompany,
  selectedDept,
  setSelectedDept,
  departments,
  stats,
  viewMode,
  setViewMode,
}: DirectorySidebarProps) {
  const locale = useLocale();
  const t = useTranslations("Directory");
  const tooltipSide = locale === "fa" ? "left" : "right";

  const companyItems = [
    {
      id: "all" as const,
      label: t("filters.allPersonnel"),
      icon: Users,
      count: stats.total,
      color: "text-foreground",
      activeBg: "bg-primary text-primary-foreground",
    },
    {
      id: "esp" as const,
      label: t("filters.espCompany"),
      icon: Building2,
      count: stats.espCount,
      color: "text-sky-600 dark:text-sky-400",
      activeBg: "bg-sky-600 text-white",
    },
    {
      id: "npc" as const,
      label: t("filters.npcCompany"),
      icon: Building2,
      count: stats.npcCount,
      color: "text-emerald-600 dark:text-emerald-400",
      activeBg: "bg-emerald-600 text-white",
    },
    {
      id: "dual" as const,
      label: t("filters.dualCompany"),
      icon: Sparkles,
      count: stats.dualCount,
      color: "text-purple-600 dark:text-purple-400",
      activeBg: "bg-purple-600 text-white",
    },
  ];

  const handleItemClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Collapsible Sidebar */}
      <aside
        className={cn(
          "flex flex-col shrink-0 sticky top-[var(--header-height)] self-start max-h-[calc(100dvh-var(--header-height)-var(--footer-height))] bg-panel/95 dark:bg-background/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none py-6 font-sans",
          "absolute md:sticky start-0 top-0 md:top-[var(--header-height)]",
          sidebarOpen
            ? "w-64 translate-x-0 opacity-100 shadow-xl md:shadow-none"
            : "max-md:-translate-x-full max-md:rtl:translate-x-full max-md:opacity-0 max-md:pointer-events-none md:translate-x-0 md:rtl:translate-x-0 rtl:md:translate-x-0 md:opacity-100 md:pointer-events-auto w-[52px] sm:w-[64px]"
        )}
      >
        <TooltipProvider>
          <nav
            className={cn(
              "flex flex-col gap-5 w-full ps-[5px] sm:ps-[11px] items-start transition-all duration-300",
              sidebarOpen ? "pe-3 sm:pe-4" : "pe-[5px] sm:pe-[11px]"
            )}
          >
            {/* Section 1: Companies Filter */}
            <div className="w-full space-y-1.5">
              {sidebarOpen && (
                <div className="px-3 pb-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("filters.companyLabel")}
                </div>
              )}
              {companyItems.map((item) => {
                const Icon = item.icon;
                const isActive = selectedCompany === item.id;

                const btn = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedCompany(item.id);
                      handleItemClick();
                    }}
                    className={cn(
                      "group relative flex items-center rounded-xl outline-none cursor-pointer select-none transition-all duration-200 ease-out overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[40px] px-3 gap-3" : "w-[42px] h-[42px] justify-center",
                      isActive
                        ? item.activeBg
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", !isActive && item.color)} />
                    {sidebarOpen && (
                      <span className="flex-1 text-xs font-semibold text-start truncate">
                        {item.label}
                      </span>
                    )}
                    {sidebarOpen && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent
                        side={tooltipSide}
                        className="text-xs font-medium shadow-md"
                      >
                        {item.label} ({item.count})
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return btn;
              })}
            </div>

            {/* Section 2: Departments Filter */}
            <div className="w-full space-y-1.5 pt-2 border-t border-border/40">
              {sidebarOpen && (
                <div className="px-3 pb-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>{t("filters.departmentLabel")}</span>
                  {selectedDept !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedDept("all")}
                      className="text-[10px] text-primary hover:underline lowercase"
                    >
                      {t("filters.reset")}
                    </button>
                  )}
                </div>
              )}

              {/* All Departments Option */}
              {(() => {
                const isAllActive = selectedDept === "all";
                const allBtn = (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDept("all");
                      handleItemClick();
                    }}
                    className={cn(
                      "group relative flex items-center rounded-xl outline-none cursor-pointer select-none transition-all duration-200 ease-out overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[38px] px-3 gap-3" : "w-[42px] h-[42px] justify-center",
                      isAllActive
                        ? "bg-foreground text-background font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    {sidebarOpen && (
                      <span className="flex-1 text-xs font-medium text-start truncate">
                        {t("filters.allDepartments")}
                      </span>
                    )}
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>{allBtn}</TooltipTrigger>
                      <TooltipContent
                        side={tooltipSide}
                        className="text-xs font-medium shadow-md"
                      >
                        {t("filters.allDepartments")}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return allBtn;
              })()}

              {/* Individual Departments */}
              {departments.map((dept) => {
                const isActive = selectedDept === dept.id;
                const deptBtn = (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDept(dept.id);
                      handleItemClick();
                    }}
                    className={cn(
                      "group relative flex items-center rounded-xl outline-none cursor-pointer select-none transition-all duration-200 ease-out overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[36px] px-3 gap-2.5" : "w-[42px] h-[42px] justify-center",
                      isActive
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    {sidebarOpen && (
                      <span className="flex-1 text-xs font-medium text-start truncate">
                        {dept.label}
                      </span>
                    )}
                    {sidebarOpen && (
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.2 rounded",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted/60 text-muted-foreground"
                        )}
                      >
                        {dept.count}
                      </span>
                    )}
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={dept.id}>
                      <TooltipTrigger asChild>{deptBtn}</TooltipTrigger>
                      <TooltipContent
                        side={tooltipSide}
                        className="text-xs font-medium shadow-md"
                      >
                        {dept.label} ({dept.count})
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return deptBtn;
              })}
            </div>

            {/* Section 3: View Mode Switcher */}
            <div className="w-full space-y-1.5 pt-2 border-t border-border/40">
              {sidebarOpen && (
                <div className="px-3 pb-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("views.grid")} / {t("views.table")}
                </div>
              )}

              <div
                className={cn(
                  "flex items-center gap-1",
                  sidebarOpen ? "w-full p-1 rounded-xl bg-muted/40" : "flex-col"
                )}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title={t("views.grid")}
                  className={cn(
                    "flex items-center justify-center rounded-lg transition-all text-xs font-medium",
                    sidebarOpen
                      ? "flex-1 h-8 gap-2"
                      : "w-[42px] h-[42px]",
                    viewMode === "grid"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Grid className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>{t("views.grid")}</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title={t("views.table")}
                  className={cn(
                    "flex items-center justify-center rounded-lg transition-all text-xs font-medium",
                    sidebarOpen
                      ? "flex-1 h-8 gap-2"
                      : "w-[42px] h-[42px]",
                    viewMode === "table"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>{t("views.table")}</span>}
                </button>
              </div>
            </div>
          </nav>
        </TooltipProvider>
      </aside>
    </>
  );
}
