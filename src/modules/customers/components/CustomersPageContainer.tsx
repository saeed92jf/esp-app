// src/modules/customers/components/CustomersPageContainer.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  Building2,
  Landmark,
  Factory,
  PlusCircle,
  BookUser,
  Award,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import type { Customer } from "../types/customers.types";
import { CustomersDirectoryView } from "./CustomersDirectoryView";
import { HoldingsDirectoryView } from "./HoldingsDirectoryView";
import { PlantsDirectoryView } from "./PlantsDirectoryView";
import { CreateCustomerView } from "./CreateCustomerView";
import { PhonebookDirectoryView } from "./PhonebookDirectoryView";
import { LicensorsDirectoryView } from "./LicensorsDirectoryView";

type CustomerTab = "directory" | "holdings" | "plants" | "licensors" | "phonebook" | "create";

interface NavItem {
  id: CustomerTab;
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

function isAdminRole(role?: string): boolean {
  return role === "superadmin" || role === "admin";
}

export function CustomersPageContainer({ initialTab }: { initialTab?: CustomerTab } = {}) {
  const { user } = useAuth();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const isAdmin = isAdminRole(user?.role);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");

  const isNewRoute = pathname.endsWith("/customers/new") || pathname.endsWith("/new");

  const activeTab: CustomerTab = useMemo(() => {
    if (initialTab) return initialTab;
    if (isNewRoute) return "create";
    if (tabQuery === "holdings") return "holdings";
    if (tabQuery === "plants") return "plants";
    if (tabQuery === "licensors") return "licensors";
    if (tabQuery === "phonebook" || tabQuery === "contacts") return "phonebook";
    return "directory";
  }, [initialTab, isNewRoute, tabQuery]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = useMemo(() => {
    return [
      { id: "directory", labelFa: "همه", labelEn: "All", icon: Building2, href: "/customers" },
      { id: "holdings", labelFa: "هلدینگ‌ها", labelEn: "Holdings", icon: Landmark, href: "/customers?tab=holdings" },
      { id: "plants", labelFa: "پلنت‌ها", labelEn: "Plants", icon: Factory, href: "/customers?tab=plants" },
      { id: "licensors", labelFa: "لایسنسورها", labelEn: "Licensors", icon: Award, href: "/customers?tab=licensors" },
      { id: "phonebook", labelFa: "دفترچه تلفن", labelEn: "Phonebook", icon: BookUser, href: "/customers?tab=phonebook" },
      { id: "create", labelFa: "افزودن کارفرما", labelEn: "New Client", icon: PlusCircle, href: "/customers/new" },
    ];
  }, []);

  const handleCustomerCreated = (_newCustomer: Customer) => {
    router.push("/customers");
  };

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header (Stable Title: Industries & Clients) ── */}
      <AppHeader
        tag={isRtl ? "صنایع و کارفرمایان" : "Industries & Clients"}
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
          <TooltipProvider>
            <nav
              className={cn(
                "flex flex-col gap-2.5 w-full ps-[5px] sm:ps-[11px] items-start transition-all duration-300",
                sidebarOpen ? "pe-3 sm:pe-4" : "pe-[5px] sm:pe-[11px]"
              )}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonElement = (
                  <Link
                    key={item.id}
                    href={item.href}
                    onMouseEnter={() => router.prefetch(item.href)}
                    onFocus={() => router.prefetch(item.href)}
                    onClick={() => {
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
                    aria-label={label}
                  >
                    {/* Fixed 42px circle icon */}
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
                      {label}
                    </span>
                  </Link>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
                      <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
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

        {/* ── 3. Main Content Area ── */}
        <main className="flex-1 bg-transparent w-full relative z-10 px-4 sm:px-8 py-6 max-w-7xl mx-auto">
          {activeTab === "create" ? (
            <CreateCustomerView
              onCustomerCreated={handleCustomerCreated}
              onCancel={() => router.push("/customers")}
            />
          ) : activeTab === "holdings" ? (
            <HoldingsDirectoryView />
          ) : activeTab === "plants" ? (
            <PlantsDirectoryView />
          ) : activeTab === "licensors" ? (
            <LicensorsDirectoryView />
          ) : activeTab === "phonebook" ? (
            <PhonebookDirectoryView />
          ) : (
            <CustomersDirectoryView
              isAdmin={isAdmin}
              onNavigateToCreate={() => router.push("/customers/new")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

