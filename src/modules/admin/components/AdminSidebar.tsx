"use client";

import React from "react";
import { Briefcase, TableProperties, Users, ShieldAlert, Settings } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: 'home' | 'usersTable' | 'add' | 'requests' | 'settings';
  setActiveTab: (tab: 'home' | 'usersTable' | 'add' | 'requests' | 'settings') => void;
}

const NAV_ITEMS = [
  { id: 'home', icon: Briefcase, labelKey: "userInfo" },
  { id: 'usersTable', icon: TableProperties, labelKey: "usersTable" },
  { id: 'add', icon: Users, labelKey: "userConfig" },
  { id: 'requests', icon: ShieldAlert, labelKey: "sidebarReq" },
  { id: 'settings', icon: Settings, labelKey: "sidebarSettings" },
] as const;

export function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
}: AdminSidebarProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const tooltipSide = locale === "fa" ? "left" : "right";

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

      <aside
        className={cn(
          "flex flex-col shrink-0 h-full bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none",
          "absolute md:relative start-0 top-0",
          sidebarOpen
            ? "w-64 ps-3 sm:ps-6 pe-4 py-6 translate-x-0 opacity-100 shadow-xl md:shadow-none"
            : "-translate-x-full rtl:translate-x-full opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto md:w-[90px] md:ps-6 md:pe-6 md:py-6"
        )}
      >
        <TooltipProvider>
          <nav className="flex flex-col gap-2.5 w-full items-start">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = t(item.labelKey);

              const buttonElement = (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={cn(
                    "group relative flex items-center rounded-full outline-none cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                    sidebarOpen
                      ? "w-full h-[42px]"
                      : "w-[42px] h-[42px]",
                    isActive
                      ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                      : "bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60"
                  )}
                  aria-label={label}
                >
                  {/* Fixed-Position Icon Wrapper: Dead-center in 42px circle and stays pinned on expand/collapse */}
                  <div className="aspect-square h-full shrink-0 flex items-center justify-center">
                    <Icon
                      className={cn(
                        "size-5 shrink-0 transition-colors duration-150",
                        isActive ? "text-white" : "text-foreground/60 group-hover:text-foreground"
                      )}
                    />
                  </div>

                  {/* Label: Smooth horizontal expansion & collapse without shifting the icon */}
                  <span
                    className={cn(
                      "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                      isActive ? "font-semibold text-white" : "font-medium text-foreground/75 group-hover:text-foreground",
                      sidebarOpen
                        ? "opacity-100 max-w-[170px] pe-4 ps-1.5"
                        : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                    )}
                  >
                    {label}
                  </span>
                </button>
              );

              if (!sidebarOpen) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      {buttonElement}
                    </TooltipTrigger>
                    <TooltipContent side={tooltipSide} className="text-xs font-medium">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return buttonElement;
            })}
          </nav>
        </TooltipProvider>
      </aside>
    </>
  );
}
